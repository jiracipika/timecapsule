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
