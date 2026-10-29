import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Flame } from 'lucide-react';
import { springs } from '../../motion/motion-config';
import '../../styles/animations.css';

export interface UnoEventData {
  type: 'declare' | 'caught';
  playerName: string;
  targetName?: string;
}

interface UnoCelebrationProps {
  event: UnoEventData | null;
  onComplete: () => void;
  reducedMotion?: boolean;
}

export const UnoCelebration: React.FC<UnoCelebrationProps> = ({
  event,
  onComplete,
  reducedMotion = false,
}) => {
  useEffect(() => {
    if (!event) return;
    const duration = reducedMotion ? 700 : 1400;
    const timer = setTimeout(() => {
      onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [event, onComplete, reducedMotion]);

  if (!event) return null;

  return (
    <div className="uno-celebration-container" aria-live="assertive">
      <AnimatePresence mode="wait">
        {event.type === 'declare' && (
          <motion.div
            key="declare"
            className="uno-celebration-badge"
            initial={{ scale: 0.2, rotate: -15, opacity: 0 }}
            animate={{ scale: [0.2, 1.25, 1], rotate: [-15, 5, 0], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, y: -40 }}
            transition={springs.celebration}
          >
            <Flame size={44} color="#FFF1F2" />
            <div className="uno-badge-text">UNO!</div>
            <div className="uno-badge-subtitle">{event.playerName} has 1 card left!</div>
          </motion.div>
        )}

        {event.type === 'caught' && (
          <motion.div
            key="caught"
            className="uno-celebration-badge"
            style={{
              background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)',
              borderColor: '#F87171',
              boxShadow: '0 0 50px rgba(220, 38, 38, 0.9), 0 25px 60px rgba(0, 0, 0, 0.8)',
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.2, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={springs.celebration}
          >
            <AlertCircle size={48} color="#FEF2F2" />
            <div className="uno-badge-text" style={{ fontSize: '42px' }}>CAUGHT!</div>
            <div className="uno-badge-subtitle">
              {event.targetName || 'Player'} drew 2 penalty cards for forgetting UNO!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnoCelebration;
