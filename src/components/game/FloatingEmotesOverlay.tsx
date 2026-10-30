import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface FloatingEmote {
  id: string;
  targetId: string;
  emote: string;
  timestamp: number;
}

interface FloatingEmoteBadgeProps {
  emotes: FloatingEmote[];
  targetId: string;
}

export const FloatingEmoteBadge: React.FC<FloatingEmoteBadgeProps> = ({ emotes, targetId }) => {
  const current = emotes.filter(e => e.targetId === targetId);
  if (current.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '-18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <AnimatePresence>
        {current.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12, scale: 0.6 }}
            animate={{ opacity: 1, y: -24, scale: 1.3 }}
            exit={{ opacity: 0, y: -45, scale: 0.8 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1.5px solid rgba(251, 191, 36, 0.5)',
              borderRadius: '9999px',
              padding: '3px 10px',
              fontSize: item.emote === 'GG' ? '14px' : '22px',
              fontWeight: 800,
              color: '#FBBF24',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(245, 166, 0, 0.4)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {item.emote}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
