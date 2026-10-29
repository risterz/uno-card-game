import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Settings } from 'lucide-react';
import { Player, GameSettings } from '../../engine/types';
import { springs } from '../../motion/motion-config';
import '../../styles/animations.css';

interface VictoryCelebrationProps {
  winner: Player | null;
  players: Player[];
  settings: GameSettings;
  onRestart: (newSettings?: GameSettings) => void;
  onOpenSettings: () => void;
  reducedMotion?: boolean;
}

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  winner,
  players,
  settings,
  onRestart,
  onOpenSettings,
  reducedMotion = false,
}) => {
  const isHumanWinner = winner && !winner.isAI;

  useEffect(() => {
    if (!winner || reducedMotion) return;

    if (isHumanWinner) {
      // Fire double celebratory confetti canons
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          zIndex: 99999,
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
          colors: ['#E61938', '#0066E5', '#00A852', '#F5A600'],
        });
        fire(0.2, {
          spread: 60,
          colors: ['#38BDF8', '#F43F5E', '#10B981'],
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch {
        // Safe in test or headless environments
      }
    }
  }, [winner, isHumanWinner, reducedMotion]);

  if (!winner) return null;

  // Calculate score won based on cards left in opponent hands
  const totalScore = players.reduce((sum, p) => {
    if (p.id === winner.id) return sum;
    return (
      sum +
      p.hand.reduce((cardSum, c) => {
        if (typeof c.value === 'number') return cardSum + c.value;
        if (['skip', 'reverse', 'draw2'].includes(c.value)) return cardSum + 20;
        return cardSum + 50; // wild
      }, 0)
    );
  }, 0);

  return (
    <div className="victory-celebration-container" role="dialog" aria-modal="true">
      <AnimatePresence>
        <motion.div
          className="victory-card"
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={springs.celebration}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '16px' }}>
              {isHumanWinner ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Trophy size={64} style={{ color: '#F5A600', filter: 'drop-shadow(0 0 20px rgba(245, 166, 0, 0.8))' }} />
                </div>
              ) : (
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                  {winner.avatar}
                </div>
              )}
            </div>

            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>
              {isHumanWinner ? 'VICTORY!' : `${winner.name} Wins!`}
            </h2>

            <p style={{ fontSize: '15px', color: '#CBD5E1', marginBottom: '20px' }}>
              {isHumanWinner
                ? 'Brilliant strategy! You emptied your hand first and conquered the table!'
                : `Tough match! ${winner.name} clinched the win on ${settings.aiDifficulty.toUpperCase()} bot difficulty.`}
            </p>

            {/* Score & Match Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                padding: '14px',
                background: 'rgba(15, 23, 42, 0.75)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '24px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>WINNER</div>
                <div style={{ fontSize: '15px', color: '#38BDF8', fontWeight: 800 }}>
                  {winner.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>MATCH SCORE</div>
                <div style={{ fontSize: '15px', color: '#10B981', fontWeight: 800 }}>
                  +{totalScore} pts
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>DIFFICULTY</div>
                <div style={{ fontSize: '15px', color: '#F5A600', fontWeight: 800 }}>
                  {settings.aiDifficulty.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <motion.button
                className="action-btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onRestart()}
                style={{ fontSize: '15px', padding: '10px 24px' }}
              >
                <RotateCcw size={16} /> Play Again
              </motion.button>
              <motion.button
                className="action-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenSettings}
                style={{ fontSize: '15px', padding: '10px 20px' }}
              >
                <Settings size={16} /> Match Setup
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VictoryCelebration;
