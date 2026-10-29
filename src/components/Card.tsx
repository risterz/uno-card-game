import React, { useState } from 'react';
import { CardDefinition, CardSize } from '../types/card';
import { generateCardBackSvg, generateCardSvg } from '../utils/svg-card-generator';
import '../styles/cards.css';

export interface CardProps {
  card: CardDefinition;
  size?: CardSize;
  isFlipped?: boolean;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  flippableOnClick?: boolean;
  className?: string;
  onClick?: (card: CardDefinition) => void;
}

export const Card: React.FC<CardProps> = ({
  card,
  size = 'md',
  isFlipped: controlledFlipped,
  selected = false,
  disabled = false,
  interactive = true,
  flippableOnClick = false,
  className = '',
  onClick,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const cardSvgHtml = React.useMemo(() => generateCardSvg(card), [card]);
  const cardBackSvgHtml = React.useMemo(() => generateCardBackSvg(), []);

  const handleClick = () => {
    if (disabled) return;
    if (flippableOnClick && controlledFlipped === undefined) {
      setInternalFlipped(prev => !prev);
    }
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <div
      className={`card-wrapper card-size-${size} ${!interactive ? 'non-interactive' : ''} ${isFlipped ? 'flipped' : ''} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      data-color={card.color}
      data-value={card.value}
      data-id={card.id}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${card.name} ${isFlipped ? '(Back)' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="card-inner">
        {/* Front Face */}
        <div
          className="card-face card-front-face"
          dangerouslySetInnerHTML={{ __html: cardSvgHtml }}
        />
        {/* Back Face */}
        <div
          className="card-face card-back-face"
          dangerouslySetInnerHTML={{ __html: cardBackSvgHtml }}
        />
      </div>
    </div>
  );
};

export default Card;
