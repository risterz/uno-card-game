/**
 * Motion configuration, physics springs, and animation variants.
 * Built with Motion for React.
 */

import type { Transition, Variants } from 'motion/react';

export type AnimationIntensity = 'full' | 'reduced' | 'off';

export interface MotionConfig {
  intensity: AnimationIntensity;
  soundEnabled: boolean;
}

// Detect system preference for reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Spring physics configurations
export const springs = {
  // Snappy spring for card hover and gentle selection
  cardHover: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  } satisfies Transition,
  // Bouncy spring for selected card lift
  cardSelected: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 22,
    mass: 1,
  } satisfies Transition,
  // Physical weight spring for card flight across the table
  cardFlight: {
    type: 'spring' as const,
    stiffness: 220,
    damping: 24,
    mass: 0.9,
  } satisfies Transition,
  // Punchy spring for discard pile landing impact
  landingImpact: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 18,
    mass: 0.5,
  } satisfies Transition,
  // Smooth spring for modals, dialogs, and overlays
  modal: {
    type: 'spring' as const,
    stiffness: 320,
    damping: 28,
  } satisfies Transition,
  // Big explosive spring for celebrations (UNO, Victory)
  celebration: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 16,
    mass: 1.2,
  } satisfies Transition,
  // Gentle ease for tab transitions and drawer slide
  smoothEase: {
    duration: 0.28,
    ease: [0.16, 1, 0.3, 1] as const,
  } satisfies Transition,
};

// Reusable Motion Variants
export const cardVariants: Variants = {
  idle: {
    y: 0,
    scale: 1,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
    transition: springs.cardHover,
  },
  hover: {
    y: -20,
    scale: 1.06,
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.5)',
    transition: springs.cardHover,
  },
  selected: {
    y: -30,
    scale: 1.12,
    boxShadow: '0 24px 44px rgba(0, 0, 0, 0.6), 0 0 28px rgba(56, 189, 248, 0.9)',
    transition: springs.cardSelected,
  },
  unplayable: {
    opacity: 0.72,
    filter: 'grayscale(0.25) brightness(0.9)',
    transition: { duration: 0.2 },
  },
};

// Modal backdrop and dialog variants
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const modalDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Tab content variants
export const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.16 },
  },
};
