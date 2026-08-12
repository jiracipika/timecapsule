import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CapsuleStatus = 'locked' | 'unlocked';

export interface Capsule {
  id: string;
  title: string;
  message: string;
  unlockDate: string;
  createdAt: string;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'timecapsule.capsules.v1';

export async function getCapsules(): Promise<Capsule[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCapsule(capsule: Capsule): Promise<void> {
  const capsules = await getCapsules();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([capsule, ...capsules]));
}

export async function deleteCapsule(id: string): Promise<void> {
  const capsules = (await getCapsules()).filter(c => c.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCapsuleStatus(capsule: Capsule): CapsuleStatus {
  return new Date(capsule.unlockDate).getTime() <= Date.now() ? 'unlocked' : 'locked';
}

export function getDaysUntil(unlockDate: string): number {
  const ms = new Date(unlockDate).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
