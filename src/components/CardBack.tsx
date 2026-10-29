import React from 'react';
import { CardSize } from '../types/card';
import { generateCardBackSvg } from '../utils/svg-card-generator';
import '../styles/cards.css';

export interface CardBackProps {
  size?: CardSize;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const CardBack: React.FC<CardBackProps> = ({
  size = 'md',
  className = '',
  onClick,
  interactive = true,
}) => {
  const cardBackSvgHtml = React.useMemo(() => generateCardBackSvg(), []);

  return (
    <div
      className={`card-wrapper card-size-${size} ${interactive ? '' : 'disabled'} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="Card Back"
    >
      <div className="card-face" dangerouslySetInnerHTML={{ __html: cardBackSvgHtml }} />
    </div>
  );
};

export default CardBack;
