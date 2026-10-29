/**
 * Audio sound manager for UNO card game.
 * Uses high-fidelity pre-rendered audio files with instant HTML5 Audio / Web Audio API playback,
 * and seamless synthesizer fallback.
 */

export type SoundEffect =
  | 'card'
  | 'draw'
  | 'action'
  | 'wild'
  | 'uno'
  | 'catch'
  | 'win'
  | 'start';

const SOUND_FILES: Record<SoundEffect, string> = {
  card: '/sounds/card.wav',
  draw: '/sounds/draw.wav',
  action: '/sounds/action.wav',
  wild: '/sounds/wild.wav',
  uno: '/sounds/uno.wav',
  catch: '/sounds/catch.wav',
  win: '/sounds/win.wav',
  start: '/sounds/start.wav',
};

const SOUND_VOLUMES: Record<SoundEffect, number> = {
  card: 0.65,
  draw: 0.55,
  action: 0.75,
  wild: 0.85,
  uno: 0.95,
  catch: 0.90,
  win: 1.0,
  start: 0.70,
};

// Cached HTMLAudioElement pool for instant low-latency triggering
const audioPool: Partial<Record<SoundEffect, HTMLAudioElement[]>> = {};
const POOL_SIZE = 3;

/**
 * Initializes and preloads audio elements.
 */
export function preloadSounds(): void {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;

  try {
    for (const [key, path] of Object.entries(SOUND_FILES) as [SoundEffect, string][]) {
      audioPool[key] = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = SOUND_VOLUMES[key];
        audioPool[key]!.push(audio);
      }
    }
  } catch {
    // Non-blocking in environments without audio support
  }
}

/**
 * Plays a game sound effect.
 */
export function playSound(type: SoundEffect, enabled = true): void {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const pool = audioPool[type];
    if (pool && pool.length > 0) {
      // Find an audio element that is currently paused or ended, or pick oldest
      let audio = pool.find(a => a.paused || a.ended);
      if (!audio) {
        audio = pool[0];
        audio.currentTime = 0;
      } else {
        audio.currentTime = 0;
      }
      audio.volume = SOUND_VOLUMES[type];
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackSynth(type);
        });
      }
      return;
    }

    // Direct instance if pool not initialized
    const directAudio = new Audio(SOUND_FILES[type]);
    directAudio.volume = SOUND_VOLUMES[type];
    directAudio.play().catch(() => {
      fallbackSynth(type);
    });
  } catch {
    fallbackSynth(type);
  }
}

/**
 * Web Audio API procedural synthesis fallback.
 */
function fallbackSynth(type: SoundEffect): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'card') {
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'draw') {
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'action') {
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'wild') {
      osc.frequency.setValueAtTime(587, now);
      osc.frequency.exponentialRampToValueAtTime(1174, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'uno') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'catch') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'win') {
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.15);
      osc.frequency.setValueAtTime(783, now + 0.3);
      osc.frequency.setValueAtTime(1046, now + 0.45);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
    } else if (type === 'start') {
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.exponentialRampToValueAtTime(783, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // Audio unavailable
  }
}
