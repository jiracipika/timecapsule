import type { Metadata } from 'next';
import './globals.css';
import AppTransitionShell from '@/components/app-transition-shell';

export const metadata: Metadata = {
  title: 'TimeCapsule',
  description: 'Write letters, record voice memos, and attach photos to yourself or loved ones — sealed until a date you choose.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><AppTransitionShell>{children}</AppTransitionShell></body>
    </html>
  );
}
