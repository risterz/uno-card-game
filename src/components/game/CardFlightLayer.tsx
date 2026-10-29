import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardDefinition } from '../../types/card';
import { Card } from '../Card';
import { CardBack } from '../CardBack';
import { springs } from '../../motion/motion-config';
import '../../styles/animations.css';

export interface FlightItem {
  id: string;
  type: 'play' | 'draw';
  card?: CardDefinition;
  fromRect: { x: number; y: number; width: number; height: number };
  toRect: { x: number; y: number; width: number; height: number };
  startRotation?: number;
  endRotation?: number;
  faceDown?: boolean;
  onComplete: () => void;
}

interface CardFlightLayerProps {
  flights: FlightItem[];
  reducedMotion?: boolean;
}

export const CardFlightLayer: React.FC<CardFlightLayerProps> = ({
  flights,
  reducedMotion = false,
}) => {
  return (
    <div className="card-flight-overlay" aria-hidden="true">
      <AnimatePresence>
        {flights.map((flight) => {
          const { id, card, fromRect, toRect, startRotation = 0, endRotation = 0, faceDown = false, onComplete } = flight;

          // If reduced motion or off, complete immediately or short fade
          if (reducedMotion) {
            return (
              <motion.div
                key={id}
                className="flying-card-element"
                initial={{ opacity: 0.8, x: toRect.x, y: toRect.y }}
                animate={{ opacity: 1, x: toRect.x, y: toRect.y }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onAnimationComplete={onComplete}
                style={{
                  width: `${toRect.width}px`,
                  height: `${toRect.height}px`,
                }}
              >
                {faceDown || !card ? (
                  <CardBack size="md" interactive={false} />
                ) : (
                  <Card card={card} size="md" interactive={false} />
                )}
              </motion.div>
            );
          }

          return (
            <motion.div
              key={id}
              className="flying-card-element"
              initial={{
                x: fromRect.x,
                y: fromRect.y,
                width: fromRect.width,
                height: fromRect.height,
                rotate: startRotation,
                scale: 1,
                opacity: 0.95,
              }}
              animate={{
                x: toRect.x,
                y: toRect.y,
                width: toRect.width,
                height: toRect.height,
                rotate: endRotation,
                scale: 1,
                opacity: 1,
              }}
              exit={{ opacity: 0 }}
              transition={springs.cardFlight}
              onAnimationComplete={onComplete}
            >
              {faceDown || !card ? (
                <CardBack size="responsive" interactive={false} />
              ) : (
                <Card card={card} size="responsive" interactive={false} />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CardFlightLayer;
