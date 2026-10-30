/**
 * Background Music (BGM) Manager for UNO Card Game.
 * Plays looping casual background music with HTML5 Audio & Web Audio fallback.
 */

type BgmListener = (isPlaying: boolean, volume: number, theme: string) => void;

class BgmManager {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private volume = 0.35;
  private theme: string = 'classic';
  private listeners: Set<BgmListener> = new Set();
  private userInteractionBound = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('uno_bgm_enabled');
      const savedVol = localStorage.getItem('uno_bgm_volume');
      const savedTheme = localStorage.getItem('uno_selected_card_theme');

      if (savedTheme) {
        this.theme = savedTheme;
      }

      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }

      this.initAudio();

      // If user previously enabled BGM, start on first click/touch
      if (savedEnabled === 'true') {
        this.bindFirstInteraction();
      }
    }
  }

  private getAudioSrc(theme: string): string {
    return theme === 'halloween' ? '/sounds/bgm-halloween.wav' : '/sounds/bgm-casual.wav';
  }

  private initAudio() {
    if (typeof Audio === 'undefined') return;
    try {
      this.audio = new Audio(this.getAudioSrc(this.theme));
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify();
      });
    } catch {
      // Audio not supported
    }
  }

  private bindFirstInteraction() {
    if (this.userInteractionBound || typeof window === 'undefined') return;
    this.userInteractionBound = true;

    const startOnInteraction = () => {
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('keydown', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);

      if (localStorage.getItem('uno_bgm_enabled') === 'true') {
        this.play();
      }
    };

    window.addEventListener('click', startOnInteraction, { once: true });
    window.addEventListener('keydown', startOnInteraction, { once: true });
    window.addEventListener('touchstart', startOnInteraction, { once: true });
  }

  public play() {
    if (!this.audio) {
      this.initAudio();
    }
    if (this.audio) {
      this.audio.volume = this.volume;
      this.audio.play().then(() => {
        this.isPlaying = true;
        localStorage.setItem('uno_bgm_enabled', 'true');
        this.notify();
      }).catch(() => {
        // Browser blocked autoplay until user gesture
        this.bindFirstInteraction();
      });
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    localStorage.setItem('uno_bgm_enabled', 'false');
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public setTheme(themeId: string) {
    if (this.theme === themeId) return;
    this.theme = themeId;
    const wasPlaying = this.isPlaying;
    const newSrc = this.getAudioSrc(themeId);

    if (this.audio) {
      this.audio.src = newSrc;
      this.audio.load();
      if (wasPlaying) {
        this.audio.play().catch(() => {
          this.bindFirstInteraction();
        });
      }
    }
    this.notify();
  }

  public getTheme(): string {
    return this.theme;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    localStorage.setItem('uno_bgm_volume', this.volume.toString());
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(listener: BgmListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying, this.volume, this.theme);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isPlaying, this.volume, this.theme));
  }
}

export const bgmManager = new BgmManager();
