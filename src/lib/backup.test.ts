import { beforeEach, describe, expect, it } from 'vitest';
import { getCapsules, saveCapsule, type Capsule } from './capsules';
import { exportBackup, importBackup } from './backup';

function makeCapsule(overrides: Partial<Capsule> = {}): Capsule {
  return {
    id: crypto.randomUUID(),
    title: 'Backup test',
    message: 'Body',
    unlockDate: '2099-01-01',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Same stub pattern as capsules.test.ts — don't rely on the jsdom global.
function setupMockStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
        clear: () => void store.clear(),
      },
    },
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  setupMockStorage();
});

describe('exportBackup', () => {
  it('round-trips: importing your own export changes nothing', () => {
    const a = makeCapsule({ title: 'A' });
    const b = makeCapsule({ title: 'B' });
    saveCapsule(a);
    saveCapsule(b);
    const result = importBackup(exportBackup());
    expect(result).toMatchObject({ ok: true, added: 0, skippedDuplicates: 2, invalidEntries: 0 });
    expect(getCapsules().map((c) => c.id)).toEqual([b.id, a.id]);
  });

  it('produces JSON with the export envelope', () => {
    const parsed = JSON.parse(exportBackup()) as { app: string; version: number; capsules: unknown[] };
    expect(parsed.app).toBe('timecapsule');
    expect(typeof parsed.version).toBe('number');
    expect(Array.isArray(parsed.capsules)).toBe(true);
  });
});

describe('importBackup', () => {
  it('adds new capsules above existing ones, preserving file order', () => {
    saveCapsule(makeCapsule({ id: 'existing' }));
    const file = JSON.stringify({ capsules: [makeCapsule({ id: 'f1' }), makeCapsule({ id: 'f2' })] });
    const result = importBackup(file);
    expect(result).toMatchObject({ ok: true, added: 2 });
    expect(getCapsules().map((c) => c.id)).toEqual(['f1', 'f2', 'existing']);
  });

  it('never overwrites: an id already stored is skipped, local data untouched', () => {
    saveCapsule(makeCapsule({ id: 'dup', title: 'Local version' }));
    const file = JSON.stringify([
      { id: 'dup', title: 'File version', message: 'm', unlockDate: '2099-01-01', createdAt: '2026-01-01' },
    ]);
    const result = importBackup(file);
    expect(result).toMatchObject({ ok: true, added: 0, skippedDuplicates: 1 });
    expect(getCapsules()[0].title).toBe('Local version');
  });

  it('imports a duplicated-in-file id exactly once', () => {
    const cap = makeCapsule({ id: 'once' });
    const result = importBackup(JSON.stringify([cap, cap]));
    expect(result).toMatchObject({ added: 1, skippedDuplicates: 1 });
    expect(getCapsules()).toHaveLength(1);
  });

  it('counts invalid entries and keeps the valid ones', () => {
    const good = makeCapsule({ id: 'good' });
    const file = JSON.stringify([good, { id: 'no-title', message: 'm' }, 'junk', 42, null]);
    const result = importBackup(file);
    expect(result).toMatchObject({ ok: true, added: 1, invalidEntries: 4 });
    expect(getCapsules().map((c) => c.id)).toEqual(['good']);
  });

  it('never throws: garbage input changes nothing', () => {
    for (const garbage of ['not json {', 'null', '"string"', '42', '{}', '']) {
      const result = importBackup(garbage);
      expect(result.ok).toBe(false);
      expect(result.added).toBe(0);
    }
    expect(getCapsules()).toHaveLength(0);
  });
});
