export type Capsule = {
  id: string;
  title: string;
  message: string;
  unlockDate: string;
  createdAt: string;
};

const STORAGE_KEY = 'timecapsule.capsules.v1';

function isCapsule(value: unknown): value is Capsule {
  if (!value || typeof value !== 'object') return false;
  const capsule = value as Record<string, unknown>;
  return ['id', 'title', 'message', 'unlockDate', 'createdAt'].every(
    (key) => typeof capsule[key] === 'string',
  );
}

export function getCapsules(): Capsule[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter(isCapsule) : [];
  } catch {
    return [];
  }
}

export function saveCapsule(capsule: Capsule): void {
  const capsules = getCapsules();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([capsule, ...capsules]));
}

export function deleteCapsule(id: string): void {
  const capsules = getCapsules().filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

/**
 * The unlock contract: a capsule opens at LOCAL midnight of its unlockDate
 * (the bare YYYY-MM-DD is parsed as local time by design — a capsule is
 * "for" a calendar day, not an instant). Single source of truth; the page
 * files used to duplicate this comparison inline.
 */
export function isUnlocked(capsule: Capsule, now: Date = new Date()): boolean {
  return new Date(`${capsule.unlockDate}T00:00:00`) <= now;
}
