import React, { useState, useEffect } from 'react';
import { Music, VolumeX } from 'lucide-react';
import { bgmManager } from '../utils/bgm';

export const BgmButton: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(bgmManager.getIsPlaying());

  useEffect(() => {
    const unsub = bgmManager.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  const handleToggle = () => {
    bgmManager.toggle();
  };

  return (
    <button
      className={`bgm-toggle-btn ${isPlaying ? 'playing' : 'muted'}`}
      onClick={handleToggle}
      title={isPlaying ? 'BGM: Playing (Click to mute)' : 'BGM: Muted (Click to play music)'}
      aria-label="Toggle Background Music"
      data-testid="bgm-toggle-button"
    >
      {isPlaying ? (
        <>
          <Music size={14} className="bgm-icon active" />
          <span className="bgm-waves">
            <span className="wave-bar bar-1" />
            <span className="wave-bar bar-2" />
            <span className="wave-bar bar-3" />
          </span>
          <span className="bgm-text">Music</span>
        </>
      ) : (
        <>
          <VolumeX size={14} className="bgm-icon muted" />
          <span className="bgm-text">BGM</span>
        </>
      )}
    </button>
  );
};
