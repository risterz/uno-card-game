import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile } from 'lucide-react';

export const QUICK_EMOTES = ['😂', '🔥', '💀', 'GG', '🎉', '👍', '😱', '👋'] as const;

interface EmoteBarProps {
  onSendEmote: (emote: string) => void;
  disabled?: boolean;
}

export const EmoteBar: React.FC<EmoteBarProps> = ({ onSendEmote, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);

  const handleEmoteClick = (emote: string) => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastSentTime < 400) return; // Gentle debounce
    setLastSentTime(now);
    onSendEmote(emote);
  };

  return (
    <div className="emote-bar-container" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        className="game-btn emote-toggle-btn"
        onClick={() => setIsOpen(prev => !prev)}
        title="Send Quick Emote Reaction (😂, 🔥, 💀, GG)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          borderColor: isOpen ? '#F5A600' : 'rgba(255, 255, 255, 0.15)',
          background: isOpen ? 'rgba(245, 166, 0, 0.18)' : 'rgba(30, 41, 59, 0.7)',
        }}
      >
        <Smile size={14} style={{ color: '#F5A600' }} />
        <span style={{ fontSize: '11px', fontWeight: 600 }}>Emote</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="emote-picker-popover"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '8px',
              display: 'flex',
              gap: '6px',
              padding: '6px 8px',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 12px rgba(245, 166, 0, 0.25)',
              zIndex: 100,
            }}
          >
            {QUICK_EMOTES.map(em => (
              <button
                key={em}
                className="emote-reaction-btn"
                onClick={() => {
                  handleEmoteClick(em);
                }}
                title={`React with ${em}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '4px 8px',
                  fontSize: em === 'GG' ? '12px' : '17px',
                  fontWeight: em === 'GG' ? 800 : 'normal',
                  color: em === 'GG' ? '#FBBF24' : undefined,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease, background 0.1s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.25)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                {em}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
