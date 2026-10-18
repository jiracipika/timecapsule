'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'motion/react';
import { saveCapsule } from '@/lib/capsules';
import { TactileButton, fadeRise, springEntrance, tactile } from '@/components/motion-kit';

/** The card itself rises on the house spring while its fields cascade in. */
const formVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ...springEntrance, staggerChildren: 0.05, delayChildren: 0.08 } },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function CreateCapsulePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState(tomorrowDate);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!trimmedTitle || !trimmedMessage || !unlockDate) return;

    saveCapsule({
      id: crypto.randomUUID(),
      title: trimmedTitle,
      message: trimmedMessage,
      unlockDate,
      createdAt: new Date().toISOString(),
    });
    router.push('/capsules');
  }

  return (
    <main className="page-shell">
      <div className="page-content">
        <Link href="/capsules" className="back-link">← My capsules</Link>
        <motion.div {...fadeRise}>
          <h1 className="page-title">Create a capsule</h1>
          <p className="page-subtitle">Write a message now and choose the day it can be opened.</p>
        </motion.div>

        <motion.form className="card capsule-form" onSubmit={handleSubmit} variants={formVariants} initial="hidden" animate="show">
          <motion.label htmlFor="title" variants={fieldVariants}>Title</motion.label>
          <motion.input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required autoFocus variants={fieldVariants} />

          <motion.label htmlFor="message" variants={fieldVariants}>Message</motion.label>
          <motion.textarea id="message" name="message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={5000} required rows={8} variants={fieldVariants} />

          <motion.label htmlFor="unlockDate" variants={fieldVariants}>Open on</motion.label>
          <motion.input id="unlockDate" name="unlockDate" type="date" min={tomorrowDate()} value={unlockDate} onChange={(event) => setUnlockDate(event.target.value)} required variants={fieldVariants} />
          <motion.p className="field-hint" variants={fieldVariants}>Your message is stored only in this browser. It will remain locked until this date.</motion.p>

          <TactileButton className="btn btn-primary" type="submit" variants={fieldVariants} {...tactile}>Seal capsule</TactileButton>
        </motion.form>
      </div>
    </main>
  );
}
