import React from 'react';
import { useCardTheme } from '../themes/cardThemes';
import { Sparkles, Skull, Check } from 'lucide-react';
import '../styles/theme-selector.css';

interface ThemeSelectorProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ variant = 'full', className = '' }) => {
  const { currentTheme, setTheme, availableThemes } = useCardTheme();

  if (variant === 'compact') {
    return (
      <div className={`theme-selector-compact ${className}`}>
        <button
          className={`theme-toggle-btn ${currentTheme === 'classic' ? 'active' : ''}`}
          onClick={() => setTheme('classic')}
          title="Classic Tournament Deck"
        >
          <Sparkles size={14} />
          <span className="theme-toggle-label">Classic</span>
        </button>
        <button
          className={`theme-toggle-btn ${currentTheme === 'halloween' ? 'active' : ''} halloween`}
          onClick={() => setTheme('halloween')}
          title="Halloween Collector's Deck"
        >
          <Skull size={14} />
          <span className="theme-toggle-label">Halloween</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`theme-selector-full ${className}`}>
      <div className="theme-selector-header">
        <h4 className="theme-selector-title">Card Visual Skin & Theme</h4>
        <span className="theme-selector-subtitle">Instant visual skin — preserves match state and online sync</span>
      </div>
      <div className="theme-cards-grid">
        {availableThemes.map(theme => {
          const isSelected = currentTheme === theme.id;
          const isHalloween = theme.id === 'halloween';

          return (
            <div
              key={theme.id}
              className={`theme-option-card ${isSelected ? 'selected' : ''} ${isHalloween ? 'theme-card-halloween' : 'theme-card-classic'}`}
              onClick={() => setTheme(theme.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTheme(theme.id);
                }
              }}
            >
              <div className="theme-card-header">
                <div className="theme-card-badge-wrap">
                  <span className={`theme-badge ${isHalloween ? 'halloween' : 'classic'}`}>
                    {isHalloween ? <Skull size={12} /> : <Sparkles size={12} />}
                    {theme.badge}
                  </span>
                  {isSelected && (
                    <span className="theme-active-pill">
                      <Check size={12} /> Active Skin
                    </span>
                  )}
                </div>
                <h5 className="theme-name">{theme.name}</h5>
                <p className="theme-tagline">{theme.tagline}</p>
              </div>

              <div className="theme-card-body">
                <p className="theme-description">{theme.description}</p>
                <div className="theme-features-list">
                  {isHalloween ? (
                    <>
                      <span className="theme-feature-tag">54 Unique Handcrafted Vector Arts</span>
                      <span className="theme-feature-tag">Vampire Crimson • Midnight Blue</span>
                      <span className="theme-feature-tag">Witchcraft Green • Pumpkin Gold</span>
                      <span className="theme-feature-tag">Gothic Symmetrical Card Back</span>
                    </>
                  ) : (
                    <>
                      <span className="theme-feature-tag">Standard UNO Tournament Style</span>
                      <span className="theme-feature-tag">Clean Bold High-Visibility Numerals</span>
                      <span className="theme-feature-tag">Primary Vibrant Gradients</span>
                      <span className="theme-feature-tag">Classic Symmetrical Card Back</span>
                    </>
                  )}
                </div>
              </div>

              <div className="theme-card-footer">
                <button
                  type="button"
                  className={`theme-select-btn ${isSelected ? 'active' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    setTheme(theme.id);
                  }}
                >
                  {isSelected ? 'Currently Selected' : `Switch to ${theme.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
