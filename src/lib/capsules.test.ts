import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCapsules, saveCapsule, deleteCapsule, type Capsule } from './capsules';

const STORAGE_KEY = 'timecapsule.capsules.v1';

function setupMockStorage() {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    get length() { return Object.keys(store).length; },
  };
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: mockLocalStorage },
    writable: true,
    configurable: true,
  });
  return { store, mockLocalStorage };
}

function makeCapsule(overrides: Partial<Capsule> = {}): Capsule {
  return {
    id: crypto.randomUUID(),
    title: 'Test Capsule',
    message: 'Hello from the past!',
    unlockDate: '2099-01-01',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('capsules storage', () => {
  let { store, mockLocalStorage } = setupMockStorage();

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  it('returns empty array when nothing is stored', () => {
    expect(getCapsules()).toEqual([]);
  });

  it('saves and retrieves a capsule', () => {
    const capsule = makeCapsule({ title: 'My Birthday' });
    saveCapsule(capsule);
    const stored = getCapsules();
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('My Birthday');
  });

  it('prepends new capsules to the front', () => {
    const first = makeCapsule({ id: 'c1', title: 'First' });
    const second = makeCapsule({ id: 'c2', title: 'Second' });
    saveCapsule(first);
    saveCapsule(second);
    const stored = getCapsules();
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe('c2');
    expect(stored[1].id).toBe('c1');
  });

  it('deletes a capsule by id', () => {
    const c1 = makeCapsule({ id: 'keep' });
    const c2 = makeCapsule({ id: 'delete' });
    saveCapsule(c1);
    saveCapsule(c2);
    deleteCapsule('delete');
    const stored = getCapsules();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('keep');
  });

  it('ignores deletion of non-existent id', () => {
    const c1 = makeCapsule({ id: 'c1' });
    saveCapsule(c1);
    deleteCapsule('does-not-exist');
    expect(getCapsules()).toHaveLength(1);
  });

  it('filters out corrupted entries on read', () => {
    store[STORAGE_KEY] = JSON.stringify([
      { id: 'valid', title: 't', message: 'm', unlockDate: '2099-01-01', createdAt: '2025-01-01' },
      { id: 'no-title', message: 'm' },
      'not-an-object',
      null,
    ]);
    const stored = getCapsules();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('valid');
  });
});
