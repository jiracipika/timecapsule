'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Capsule, getCapsules, deleteCapsule, isUnlocked as isCapsuleUnlocked } from '@/lib/capsules';
import { buildUnlockEvent } from '@/lib/calendar';
import { TactileButton, springEntrance, tactile } from '@/components/motion-kit';

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
}

function downloadUnlockEvent(capsule: Capsule) {
  const ics = buildUnlockEvent(capsule);
  if (!ics) return;
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  const safeName = capsule.title.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'time-capsule';
  link.download = `${safeName}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CapsuleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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

  const isUnlocked = isCapsuleUnlocked(capsule);
  return (
    <main className="page-shell">
      <div className="page-content">
        <Link href="/capsules" className="back-link">← My capsules</Link>
        {/* The emotional peak: a capsule opening. The card springs in, and on
            opening day the message itself rises gently to meet you. */}
        <motion.article
          className="card capsule-detail"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springEntrance}
        >
          <motion.span
            className={`status ${isUnlocked ? 'status-open' : 'status-sealed'}`}
            initial={isUnlocked ? { opacity: 0, scale: 0.6 } : false}
            animate={isUnlocked ? { opacity: 1, scale: 1 } : undefined}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.5, delay: 0.12 }}
          >
            {isUnlocked ? 'Opened' : 'Sealed'}
          </motion.span>
          <h1 className="page-title">{capsule.title}</h1>
          <p className="page-subtitle">{isUnlocked ? `Opened on ${formatDate(capsule.unlockDate)}` : `This capsule opens ${formatDate(capsule.unlockDate)}.`}</p>
          {isUnlocked ? (
            <motion.p
              className="capsule-message"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springEntrance, delay: 0.18 }}
            >
              {capsule.message}
            </motion.p>
          ) : (
            <div className="locked-message" aria-label="Message is locked until the selected date">🔒<span>Your message stays private until its opening day.</span></div>
          )}
        </motion.article>
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {!isUnlocked && (
            <TactileButton
              className="btn btn-secondary"
              onClick={() => downloadUnlockEvent(capsule)}
              {...tactile}
            >
              Add to calendar
            </TactileButton>
          )}
          <TactileButton
            className="btn btn-secondary"
            style={{ color: 'var(--ios-red, #FF3B30)' }}
            onClick={() => {
              if (confirm('Delete this capsule? This cannot be undone.')) {
                deleteCapsule(capsule.id);
                router.push('/capsules');
              }
            }}
            {...tactile}
          >
            Delete capsule
          </TactileButton>
        </div>
      </div>
    </main>
  );
}
