'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Capsule, getCapsules, isUnlocked as isCapsuleUnlocked } from '@/lib/capsules';
import { exportBackup, importBackup } from '@/lib/backup';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
}

export default function MyCapsulesPage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setCapsules(getCapsules()), []);

  const handleExport = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timecapsule-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = importBackup(await file.text());
    setCapsules(getCapsules());
    if (!result.ok) {
      setNotice("That file didn't look like a Timecapsule backup — nothing was changed.");
    } else {
      const parts = [`Imported ${result.added}.`];
      if (result.skippedDuplicates > 0) parts.push(`Skipped ${result.skippedDuplicates} already here.`);
      if (result.invalidEntries > 0) parts.push(`Ignored ${result.invalidEntries} invalid entries.`);
      setNotice(parts.join(' '));
    }
    window.setTimeout(() => setNotice(null), 6000);
  };

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

        <div style={{ display: 'flex', gap: 8, margin: '0 0 20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={handleExport}>Export backup</button>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>Import backup</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
        {notice && <p role="status" className="page-subtitle" style={{ marginBottom: 16 }}>{notice}</p>}

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
              const isUnlocked = isCapsuleUnlocked(capsule);
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
