'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Capsule, getCapsules, isUnlocked as isCapsuleUnlocked } from '@/lib/capsules';
import { exportBackup, importBackup } from '@/lib/backup';
import {
  MotionLink,
  TactileButton,
  fadeRise,
  riseIn,
  springEntrance,
  staggerContainer,
  tactile,
} from '@/components/motion-kit';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
}

export default function MyCapsulesPage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCapsules(getCapsules());
    setHydrated(true);
  }, []);

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
        <motion.div className="page-heading" {...fadeRise}>
          <div>
            <h1 className="page-title">My capsules</h1>
            <p className="page-subtitle">Messages you have sealed for the future.</p>
          </div>
          <MotionLink href="/capsules/new" className="btn btn-primary" {...tactile}>Create capsule</MotionLink>
        </motion.div>

        <motion.div
          style={{ display: 'flex', gap: 8, margin: '0 0 20px', flexWrap: 'wrap', alignItems: 'center' }}
          {...fadeRise}
        >
          <TactileButton className="btn" onClick={handleExport} {...tactile}>Export backup</TactileButton>
          <TactileButton className="btn" onClick={() => fileInputRef.current?.click()} {...tactile}>Import backup</TactileButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
            aria-hidden="true"
            tabIndex={-1}
          />
        </motion.div>
        <AnimatePresence>
          {notice && (
            <motion.p
              key="notice"
              role="status"
              className="page-subtitle"
              style={{ marginBottom: 16 }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {notice}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!hydrated ? null : capsules.length === 0 ? (
            <motion.section
              key="empty"
              className="card empty-state"
              aria-labelledby="empty-heading"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18 } }}
              transition={springEntrance}
            >
              <span aria-hidden="true">📬</span>
              <h2 id="empty-heading">No capsules yet</h2>
              <p>Create a private note to open on a meaningful day.</p>
              <MotionLink href="/capsules/new" className="btn btn-primary" {...tactile}>Create your first capsule</MotionLink>
            </motion.section>
          ) : (
            <motion.div
              key="list"
              className="capsule-list"
              variants={staggerContainer(0.06)}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <AnimatePresence mode="popLayout">
                {capsules.map((capsule) => {
                  const isUnlocked = isCapsuleUnlocked(capsule);
                  return (
                    <MotionLink
                      key={capsule.id}
                      href={`/capsules/${capsule.id}`}
                      className="card capsule-summary"
                      layout
                      variants={riseIn}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                    >
                      <div>
                        <span className={`status ${isUnlocked ? 'status-open' : 'status-sealed'}`}>{isUnlocked ? 'Open now' : 'Sealed'}</span>
                        <h2>{capsule.title}</h2>
                        <p>{isUnlocked ? 'Your message is ready to read.' : `Opens ${formatDate(capsule.unlockDate)}.`}</p>
                      </div>
                      <span className="chevron" aria-hidden="true">›</span>
                    </MotionLink>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
