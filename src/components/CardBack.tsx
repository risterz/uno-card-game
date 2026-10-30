import React from 'react';
import { CardSize } from '../types/card';
import { CardThemeId, getCardTheme, useCardTheme } from '../themes/cardThemes';
import '../styles/cards.css';

export interface CardBackProps {
  size?: CardSize;
  theme?: CardThemeId;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const CardBack: React.FC<CardBackProps> = ({
  size = 'md',
  theme,
  className = '',
  onClick,
  interactive = true,
}) => {
  const { currentTheme: globalTheme } = useCardTheme();
  const activeThemeId = theme || globalTheme;
  const activeTheme = getCardTheme(activeThemeId);

  const cardBackSvgHtml = React.useMemo(() => activeTheme.generateCardBackSvg(), [activeTheme]);

  return (
    <div
      className={`card-wrapper card-size-${size} theme-${activeThemeId} ${interactive ? '' : 'disabled'} ${className}`}
      data-theme={activeThemeId}
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
