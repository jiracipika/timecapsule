'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCapsules } from '@/lib/capsules';

/**
 * Received — capsules shared with you.
 *
 * There is no backend or share format yet, so this page is honest: it
 * explains sharing is coming and offers an import path that accepts a
 * pasted capsule JSON (the export format planned for /capsules/[id]).
 * This replaces the previous fabricated "Received Item 1..6" grid.
 */
export default function ReceivedPage() {
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Accept {title, message, unlockDate} shaped JSON; imports become normal
  // local capsules with a shared marker in the title if none present.
  async function handleImport() {
    setStatus(null);
    try {
      const parsed = JSON.parse(importText) as Record<string, unknown>;
      if (
        typeof parsed.title !== 'string' ||
        typeof parsed.message !== 'string' ||
        typeof parsed.unlockDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(parsed.unlockDate)
      ) {
        setStatus({ ok: false, text: 'That JSON is missing title, message, or a YYYY-MM-DD unlockDate.' });
        return;
      }
      const { saveCapsule } = await import('@/lib/capsules');
      saveCapsule({
        id: crypto.randomUUID(),
        title: parsed.title.startsWith('From ') ? parsed.title : `From a friend: ${parsed.title}`,
        message: parsed.message,
        unlockDate: parsed.unlockDate,
        createdAt: new Date().toISOString(),
      });
      setImportText('');
      setStatus({ ok: true, text: 'Imported! It now lives in My capsules.' });
    } catch {
      setStatus({ ok: false, text: 'Could not parse that as capsule JSON.' });
    }
  }

  return (
    <main className="page-shell">
      <div className="page-content">
        <Link href="/" className="back-link">← Home</Link>
        <h1 className="page-title">Received</h1>
        <p className="page-subtitle">Capsules shared with you will land here.</p>

        <section className="card empty-state" aria-labelledby="received-heading">
          <span aria-hidden="true">📨</span>
          <h2 id="received-heading">Sharing is coming soon</h2>
          <p>
            Right now capsules live only in your browser. Soon you&apos;ll be able to
            export one as a link or file so someone else can receive it on its
            opening day.
          </p>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Have a capsule code?</h2>
          <p style={{ fontSize: 13, color: 'var(--ios-label3)', marginBottom: 12 }}>
            Paste the shared JSON below to import it into My capsules. It stays
            locked until its opening day, same as your own.
          </p>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={5}
            placeholder={'{\n  "title": "For your graduation",\n  "message": "...",\n  "unlockDate": "2027-06-15"\n}'}
            aria-label="Capsule JSON"
            style={{
              width: '100%', padding: 12, borderRadius: 10,
              border: '1px solid var(--ios-separator)', fontSize: 13,
              background: 'var(--ios-bg2)', color: 'var(--ios-label)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="button" onClick={handleImport} disabled={!importText.trim()}>
              Import capsule
            </button>
            {status && (
              <p role="status" style={{ fontSize: 13, color: status.ok ? 'var(--ios-green)' : 'var(--ios-red)', margin: 0 }}>
                {status.text}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
