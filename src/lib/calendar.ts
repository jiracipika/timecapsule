import type { Capsule } from './capsules';

/** RFC 5545 TEXT escaping: backslash, semicolon, comma, and newlines. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function nextCalendarDay(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const ymd = `${next.getUTCFullYear()}`.padStart(4, '0') +
    `${next.getUTCMonth() + 1}`.padStart(2, '0') +
    `${next.getUTCDate()}`.padStart(2, '0');
  return ymd;
}

/**
 * An all-day calendar event for the capsule's opening day — the capsule
 * unlock contract is local midnight of the bare YYYY-MM-DD, which maps
 * exactly to an all-day VALUE=DATE event. Returns null when the capsule's
 * unlockDate is not a real calendar date (e.g. via a hand-edited backup).
 */
export function buildUnlockEvent(
  capsule: Capsule,
  now: Date = new Date(),
): string | null {
  if (!isCalendarDate(capsule.unlockDate)) return null;
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const uid = capsule.id.replace(/[^\x20-\x7E]/g, '-');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//timecapsule//unlock-reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}@timecapsule`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${capsule.unlockDate.replace(/-/g, '')}`,
    `DTEND;VALUE=DATE:${nextCalendarDay(capsule.unlockDate)}`,
    `SUMMARY:${escapeIcsText(`Open your time capsule: ${capsule.title}`)}`,
    `DESCRIPTION:${escapeIcsText(capsule.message)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}
