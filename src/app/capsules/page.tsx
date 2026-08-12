'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Capsule, getCapsules } from '@/lib/capsules';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
}

export default function MyCapsulesPage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);

  useEffect(() => setCapsules(getCapsules()), []);

  return (
    <main className="page-shell">
      <div className="page-content">
        <Link href="/" className="back-link">← Home</Link>
        <div className="page-heading">
          <div>
            <h1 className="page-title">My capsules</h1>
            <p className="page-subtitle">Messages you have sealed for the future.</p>
          </div>
          <Link href="/capsules/new" className="btn btn-primary">Create capsule</Link>
        </div>

        {capsules.length === 0 ? (
          <section className="card empty-state" aria-labelledby="empty-heading">
            <span aria-hidden="true">📬</span>
            <h2 id="empty-heading">No capsules yet</h2>
            <p>Create a private note to open on a meaningful day.</p>
            <Link href="/capsules/new" className="btn btn-primary">Create your first capsule</Link>
          </section>
        ) : (
          <div className="capsule-list">
            {capsules.map((capsule) => {
              const isUnlocked = new Date(`${capsule.unlockDate}T00:00:00`) <= new Date();
              return (
                <Link key={capsule.id} href={`/capsules/${capsule.id}`} className="card capsule-summary">
                  <div>
                    <span className={`status ${isUnlocked ? 'status-open' : 'status-sealed'}`}>{isUnlocked ? 'Open now' : 'Sealed'}</span>
                    <h2>{capsule.title}</h2>
                    <p>{isUnlocked ? 'Your message is ready to read.' : `Opens ${formatDate(capsule.unlockDate)}.`}</p>
                  </div>
                  <span className="chevron" aria-hidden="true">›</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
