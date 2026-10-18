'use client';
import { motion } from 'motion/react';
import { MotionLink, riseIn, staggerContainer, tactile } from '@/components/motion-kit';

const FEATURES = [
  { label: 'My Capsules', href: '/capsules', icon: '📬', desc: 'View and manage your time capsules' },
  { label: 'Create Capsule', href: '/capsules/new', icon: '✏️', desc: 'Write a message to your future self' },
  { label: 'Timeline', href: '/timeline', icon: '📅', desc: 'See when your capsules unlock' },
  { label: 'Received', href: '/received', icon: '📨', desc: 'Import capsules shared with you' }
];

export default function Landing() {
  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <motion.div
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="show"
        style={{
          background: 'linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)',
          padding: '100px 24px 60px',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <motion.div variants={riseIn} style={{ fontSize: 56, marginBottom: 16, position: 'relative' }}>📬</motion.div>
        <motion.h1 variants={riseIn} style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-1px', position: 'relative', marginBottom: 8 }}>
          Timecapsule
        </motion.h1>
        <motion.p variants={riseIn} style={{ fontSize: 16, color: 'rgba(255,255,255,0.88)', position: 'relative', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.5 }}>
          Send messages to the future
        </motion.p>
        <motion.div variants={riseIn} style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative' }}>
          <MotionLink href="/capsules" className="btn btn-white" {...tactile}>
            Get Started
          </MotionLink>
        </motion.div>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px' }}>
        <motion.h2 variants={riseIn} style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 20, color: 'var(--ios-label)' }}>Features</motion.h2>
        <motion.div variants={staggerContainer(0.07, 0.05)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {FEATURES.map(f => (
            <MotionLink key={f.href} href={f.href} className="card" variants={riseIn} {...tactile} style={{ padding: 20, display: 'block' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: 'var(--ios-label3)', lineHeight: 1.4 }}>{f.desc}</div>
            </MotionLink>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}