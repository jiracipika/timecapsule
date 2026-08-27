'use client';
import Link from 'next/link';

const FEATURES = [
  { label: 'My Capsules', href: '/capsules', icon: '📬', desc: 'View and manage your time capsules' },
  { label: 'Create Capsule', href: '/capsules/new', icon: '✏️', desc: 'Write a message to your future self' },
  { label: 'Timeline', href: '/timeline', icon: '📅', desc: 'See when your capsules unlock' },
  { label: 'Received', href: '/received', icon: '📨', desc: 'Import capsules shared with you' }
];

export default function Landing() {
  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)',
        padding: '100px 24px 60px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <div style={{ fontSize: 56, marginBottom: 16, position: 'relative' }}>📬</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-1px', position: 'relative', marginBottom: 8 }}>
          Timecapsule
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.88)', position: 'relative', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.5 }}>
          Send messages to the future
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative' }}>
          <Link href="/capsules" className="btn btn-white">
            Get Started
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 20, color: 'var(--ios-label)' }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href} className="card" style={{ padding: 20, display: 'block' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: 'var(--ios-label3)', lineHeight: 1.4 }}>{f.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}