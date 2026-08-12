'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveCapsule } from '@/lib/capsules';

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
        <h1 className="page-title">Create a capsule</h1>
        <p className="page-subtitle">Write a message now and choose the day it can be opened.</p>

        <form className="card capsule-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required autoFocus />

          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={5000} required rows={8} />

          <label htmlFor="unlockDate">Open on</label>
          <input id="unlockDate" name="unlockDate" type="date" min={tomorrowDate()} value={unlockDate} onChange={(event) => setUnlockDate(event.target.value)} required />
          <p className="field-hint">Your message is stored only in this browser. It will remain locked until this date.</p>

          <button className="btn btn-primary" type="submit">Seal capsule</button>
        </form>
      </div>
    </main>
  );
}
