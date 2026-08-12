'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Capsule, getCapsules } from '@/lib/capsules';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
}

export default function CapsuleDetailPage() {
  const params = useParams<{ id: string }>();
  const [capsule, setCapsule] = useState<Capsule | null | undefined>(undefined);

  useEffect(() => {
    setCapsule(getCapsules().find((item) => item.id === params.id) ?? null);
  }, [params.id]);

  if (capsule === undefined) return null;

  if (!capsule) {
    return (
      <main className="page-shell"><div className="page-content">
        <Link href="/capsules" className="back-link">← My capsules</Link>
        <section className="card empty-state"><h1 className="page-title">Capsule not found</h1><p>This capsule is not available in this browser.</p></section>
      </div></main>
    );
  }

  const isUnlocked = new Date(`${capsule.unlockDate}T00:00:00`) <= new Date();
  return (
    <main className="page-shell">
      <div className="page-content">
        <Link href="/capsules" className="back-link">← My capsules</Link>
        <article className="card capsule-detail">
          <span className={`status ${isUnlocked ? 'status-open' : 'status-sealed'}`}>{isUnlocked ? 'Opened' : 'Sealed'}</span>
          <h1 className="page-title">{capsule.title}</h1>
          <p className="page-subtitle">{isUnlocked ? `Opened on ${formatDate(capsule.unlockDate)}` : `This capsule opens ${formatDate(capsule.unlockDate)}.`}</p>
          {isUnlocked ? <p className="capsule-message">{capsule.message}</p> : <div className="locked-message" aria-label="Message is locked until the selected date">🔒<span>Your message stays private until its opening day.</span></div>}
        </article>
      </div>
    </main>
  );
}
