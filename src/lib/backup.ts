import { getCapsules, isCapsule, saveCapsules, type Capsule } from './capsules';

export interface ImportResult {
  /** False when the file was not a valid backup shape — nothing was changed. */
  ok: boolean;
  added: number;
  skippedDuplicates: number;
  invalidEntries: number;
}

/** Full backup as a pretty-printed JSON string. */
export function exportBackup(): string {
  return JSON.stringify(
    {
      app: 'timecapsule',
      version: 1,
      exportedAt: new Date().toISOString(),
      capsules: getCapsules(),
    },
    null,
    2,
  );
}

/**
 * Merge a backup into the library. Never throws and never overwrites:
 * entries whose id already exists locally are skipped, invalid entries are
 * counted, and a malformed file changes nothing. Accepts both the export
 * shape ({ capsules: [...] }) and a bare array of capsules.
 */
export function importBackup(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, added: 0, skippedDuplicates: 0, invalidEntries: 0 };
  }

  const rawList = Array.isArray(parsed)
    ? parsed
    : parsed !== null && typeof parsed === 'object' && Array.isArray((parsed as { capsules?: unknown }).capsules)
      ? (parsed as { capsules: unknown[] }).capsules
      : null;
  if (!rawList) {
    return { ok: false, added: 0, skippedDuplicates: 0, invalidEntries: 0 };
  }

  const valid: Capsule[] = [];
  let invalidEntries = 0;
  for (const entry of rawList) {
    if (isCapsule(entry)) valid.push(entry);
    else invalidEntries++;
  }

  const existing = getCapsules();
  const existingIds = new Set(existing.map((c) => c.id));
  const added: Capsule[] = [];
  let skippedDuplicates = 0;
  for (const capsule of valid) {
    if (existingIds.has(capsule.id) || added.some((c) => c.id === capsule.id)) {
      skippedDuplicates++;
    } else {
      added.push(capsule);
    }
  }

  if (added.length > 0) saveCapsules([...added, ...existing]);
  return { ok: true, added: added.length, skippedDuplicates, invalidEntries };
}
