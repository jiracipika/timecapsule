'use client';

/**
 * Shared Motion (motion/react) primitives — the app's single animation
 * vocabulary. Import from here so springs, staggers and gesture presets stay
 * consistent across pages. Reduced motion is handled globally by
 * <MotionConfig reducedMotion="user"> in app-transition-shell.tsx.
 */

import Link from 'next/link';
import { motion, type MotionProps, type Transition, type Variants } from 'motion/react';

/** House entrance spring ("cool but subtle"). */
export const springEntrance: Transition = { type: 'spring', bounce: 0.3, duration: 0.6 };

/** Parent variant: staggers its direct motion children as they enter. */
export function staggerContainer(stagger = 0.06, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/** Child variant: gentle rise (16px) + fade, on the house spring. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: springEntrance },
};

/** One-off entrance props for standalone blocks (headings, cards, sections). */
export const fadeRise: MotionProps = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: springEntrance,
};

/** Hover lift + press springs for buttons. */
export const tactile: MotionProps = {
  whileHover: { y: -2, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 17 } },
  whileTap: { scale: 0.96, transition: { type: 'spring', stiffness: 500, damping: 25 } },
};

/** next/link with Motion gestures — motion.create keeps prefetch + href typing intact. */
export const MotionLink = motion.create(Link);

/** A real <button> with hover lift + tap press springs. */
export const TactileButton = motion.button;
