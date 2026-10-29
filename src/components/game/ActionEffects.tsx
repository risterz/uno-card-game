import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ban, RotateCcw, Plus, Sparkles, Flame, AlertCircle } from 'lucide-react';
import { GameNotification } from '../../utils/useNotificationManager';
import { springs } from '../../motion/motion-config';
import '../../styles/animations.css';

export interface ActionEffectsProps {
  notification: GameNotification | null;
  reducedMotion?: boolean;
}

export const ActionEffects: React.FC<ActionEffectsProps> = ({
  notification,
  reducedMotion = false,
}) => {
  return (
    <div className="action-effect-overlay" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ scale: 0.88, opacity: 0, y: -14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: -18 }}
            transition={reducedMotion ? { duration: 0.15 } : springs.landingImpact}
          >
            {notification.type === 'skip' && (
              <div className="action-banner-skip">
                <Ban size={18} strokeWidth={2.5} />
                <span className="banner-title">SKIPPED!</span>
                {notification.targetPlayerName && (
                  <span className="banner-subtitle">
                    {notification.targetPlayerName} loses turn
                  </span>
                )}
              </div>
            )}

            {notification.type === 'reverse' && (
              <div className="action-banner-reverse">
                <RotateCcw size={18} strokeWidth={2.5} className="reverse-arrows-spin" />
                <span className="banner-title">REVERSE!</span>
                <span className="banner-subtitle">Turn direction flipped</span>
              </div>
            )}

            {notification.type === 'draw2' && (
              <div className="action-banner-draw">
                <Plus size={18} strokeWidth={3} />
                <span className="banner-title">DRAW +2 CARDS!</span>
                {notification.targetPlayerName && (
                  <span className="banner-subtitle">
                    Penalty to {notification.targetPlayerName}
                  </span>
                )}
              </div>
            )}

            {notification.type === 'wild' && (
              <div
                className="action-banner-wild4"
                style={{
                  background:
                    'linear-gradient(135deg, #E61938 0%, #0066E5 33%, #00A852 66%, #F5A600 100%)',
                }}
              >
                <Sparkles size={18} />
                <span className="banner-title">WILD COLOR ACTIVE!</span>
                {notification.chosenColor && (
                  <span className="banner-subtitle">
                    Color: {notification.chosenColor.toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {notification.type === 'wild_draw4' && (
              <div className="action-banner-wild4">
                <Sparkles size={18} />
                <span className="banner-title">WILD DRAW +4!</span>
                {notification.targetPlayerName && (
                  <span className="banner-subtitle">
                    {notification.targetPlayerName} draws 4 and skips
                  </span>
                )}
              </div>
            )}

            {notification.type === 'uno' && (
              <div className="action-banner-uno uno-celebration-badge">
                <Flame size={18} color="#FFF1F2" />
                <span className="banner-title">UNO!</span>
                <span className="banner-subtitle">
                  {notification.playerName || 'Player'} has 1 card left!
                </span>
              </div>
            )}

            {notification.type === 'caught' && (
              <div className="action-banner-caught uno-celebration-badge">
                <AlertCircle size={18} color="#FEF2F2" />
                <span className="banner-title">UNO CAUGHT!</span>
                <span className="banner-subtitle">
                  {notification.targetPlayerName || 'Player'} drew 2 penalty cards
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionEffects;
