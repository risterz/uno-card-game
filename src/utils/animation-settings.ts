import { useState, useEffect, useCallback } from 'react';
import { AnimationIntensity, prefersReducedMotion } from '../motion/motion-config';

const STORAGE_KEY = 'uno_animation_intensity';
const CHANGE_EVENT = 'uno_animation_intensity_change';

export function getStoredAnimationIntensity(): AnimationIntensity {
  if (typeof window === 'undefined') return 'full';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'full' || saved === 'reduced' || saved === 'off') {
      return saved;
    }
  } catch (_) {}
  return prefersReducedMotion() ? 'reduced' : 'full';
}

export function setStoredAnimationIntensity(intensity: AnimationIntensity): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, intensity);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: intensity }));
  } catch (_) {}
}

export function useAnimationSettings(): [
  AnimationIntensity,
  (intensity: AnimationIntensity) => void,
  () => void,
] {
  const [intensity, setIntensityState] = useState<AnimationIntensity>(() =>
    getStoredAnimationIntensity()
  );

  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<AnimationIntensity>;
      if (custom.detail) {
        setIntensityState(custom.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === 'full' || e.newValue === 'reduced' || e.newValue === 'off') {
          setIntensityState(e.newValue);
        }
      }
    };

    window.addEventListener(CHANGE_EVENT, handleCustomChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleCustomChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setIntensity = useCallback((val: AnimationIntensity) => {
    setIntensityState(val);
    setStoredAnimationIntensity(val);
  }, []);

  const cycleIntensity = useCallback(() => {
    setIntensityState(current => {
      const next: AnimationIntensity =
        current === 'full' ? 'reduced' : current === 'reduced' ? 'off' : 'full';
      setStoredAnimationIntensity(next);
      return next;
    });
  }, []);

  return [intensity, setIntensity, cycleIntensity];
}
