import { describe, it, expect } from 'vitest';
import { buildUnlockEvent } from './calendar';
import type { Capsule } from './capsules';

const capsule = (over: Partial<Capsule> = {}): Capsule => ({
  id: 'abc-123',
  title: 'Dear future me',
  message: 'Did you keep running?',
  unlockDate: '2027-05-14',
  createdAt: '2026-10-23T09:00:00.000Z',
  ...over,
});

describe('buildUnlockEvent', () => {
  it('builds a VCALENDAR holding a single VEVENT', () => {
    const ics = buildUnlockEvent(capsule())!;
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it('maps the unlock date to an all-day DTSTART (dashes stripped)', () => {
    const ics = buildUnlockEvent(capsule())!;
    expect(ics).toContain('DTSTART;VALUE=DATE:20270514');
  });

  it('DTEND is the exclusive next day (month wrap)', () => {
    const ics = buildUnlockEvent(capsule({ unlockDate: '2027-01-31' }))!;
    expect(ics).toContain('DTSTART;VALUE=DATE:20270131');
    expect(ics).toContain('DTEND;VALUE=DATE:20270201');
  });

  it('DTEND wraps across the year boundary', () => {
    const ics = buildUnlockEvent(capsule({ unlockDate: '2026-12-31' }))!;
    expect(ics).toContain('DTEND;VALUE=DATE:20270101');
  });

  it('DTEND handles leap days', () => {
    const ics = buildUnlockEvent(capsule({ unlockDate: '2028-02-28' }))!;
    expect(ics).toContain('DTEND;VALUE=DATE:20280229');
  });

  it('uses CRLF line endings and ends with one', () => {
    const ics = buildUnlockEvent(capsule())!;
    expect(ics).toMatch(/\r\n$/);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it('escapes RFC 5545 special characters in title and message', () => {
    const ics = buildUnlockEvent(
      capsule({
        title: 'Trip, Paris; leg two \\ finale\npart two',
        message: 'line one\nline two, with; bits',
      }),
    )!;
    expect(ics).toContain('SUMMARY:Open your time capsule: Trip\\, Paris\\; leg two \\\\ finale\\npart two');
    expect(ics).toContain('DESCRIPTION:line one\\nline two\\, with\\; bits');
  });

  it('derives a stable UID from the capsule id', () => {
    const ics = buildUnlockEvent(capsule({ id: 'abc-123' }))!;
    expect(ics).toContain('UID:abc-123@timecapsule');
    const again = buildUnlockEvent(capsule({ id: 'abc-123' }), new Date(0))!;
    expect(again).toContain('UID:abc-123@timecapsule');
  });

  it('stamps DTSTAMP in UTC basic format', () => {
    const ics = buildUnlockEvent(capsule(), new Date('2026-10-23T09:30:00Z'))!;
    expect(ics).toContain('DTSTAMP:20261023T093000Z');
  });

  it('returns null for unlock dates that are not real calendar dates', () => {
    for (const bad of ['soon', '', '2026-13-01', '2026-02-30', '2026-5-14', '14-05-2026']) {
      expect(buildUnlockEvent(capsule({ unlockDate: bad }))).toBeNull();
    }
  });

  it('accepts a real leap day', () => {
    const ics = buildUnlockEvent(capsule({ unlockDate: '2028-02-29' }));
    expect(ics).toContain('DTSTART;VALUE=DATE:20280229');
  });
});
