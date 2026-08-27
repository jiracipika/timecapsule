'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCapsules, type Capsule } from '@/lib/capsules';

interface Entry {
  id: string;
  title: string;
  unlockDate: string;
  isUnlocked: boolean;
}

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function describeUnlock(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < -1) return `Unlocked ${-days} days ago`;
  if (days === -1) return 'Unlocked yesterday';
  if (days === 0) return 'Unlocks today';
  if (days === 1) return 'Unlocks tomorrow';
  if (days < 30) return `Unlocks in ${days} days`;
  if (days < 365) return `Unlocks in ${Math.round(days / 30)} month${Math.round(days / 30) !== 1 ? 's' : ''}`;
  const years = Math.round(days / 365);
  return `Unlocks in ${years} year${years !== 1 ? 's' : ''}`;
}

export default function TimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const all: Capsule[] = getCapsules();
    // Soonest unlocks first; unlocked capsules sink to the end.
    const sorted = [...all]
      .sort((a, b) => a.unlockDate.localeCompare(b.unlockDate))
      .map((c) => ({
        id: c.id,
        title: c.title,
        unlockDate: c.unlockDate,
        isUnlocked: new Date(`${c.unlockDate}T00:00:00`) <= new Date(),
      }));
    setEntries(sorted);
    setHydrated(true);
  }, []);

  const locked = entries.filter((e) => !e.isUnlocked).length;

  return (
    <main className="page-shell">
      <div className="page-content">
        <Link href="/" className="back-link">← Home</Link>
        <h1 className="page-title">Timeline</h1>
        <p className="page-subtitle">
          {hydrated && entries.length > 0
            ? `${locked} sealed · ${entries.length - locked} open, soonest first.`
            : 'When your capsules unlock, soonest first.'}
        </p>

        {entries.length === 0 && hydrated ? (
          <section className="card empty-state" aria-labelledby="timeline-empty-heading">
            <span aria-hidden="true">📅</span>
            <h2 id="timeline-empty-heading">Nothing scheduled yet</h2>
            <p>Create a capsule and its opening day will appear here.</p>
            <Link href="/capsules/new" className="btn btn-primary">Create your first capsule</Link>
          </section>
        ) : (
          <ol aria-label="Capsule timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/capsules/${entry.id}`}
                  className="card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 16, marginBottom: 8, textDecoration: 'none',
                    opacity: entry.isUnlocked ? 0.85 : 1,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                      background: entry.isUnlocked ? 'rgba(52,199,89,0.15)' : 'var(--ios-fill)',
                    }}
                  >
                    {entry.isUnlocked ? '💌' : '🔒'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ios-label)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.title}
                    </div>
                    <div style={{ fontSize: 13, color: entry.isUnlocked ? 'var(--ios-green)' : 'var(--ios-label3)', marginTop: 2 }}>
                      {describeUnlock(entry.unlockDate)}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ios-label4)', whiteSpace: 'nowrap' }}>
                    {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${entry.unlockDate}T00:00:00`))}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
