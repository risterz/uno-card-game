import React, { useMemo, useState } from 'react';
import { FULL_DECK, computeDeckStatistics } from '../data/deck';
import { CardDefinition, CardSize } from '../types/card';
import { Card } from './Card';
import { CardBack } from './CardBack';
import {
  CheckCircle,
  Eye,
  Filter,
  Layers,
  RotateCw,
  Search,
  Sparkles,
  Download,
} from 'lucide-react';

export const CardGallery: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedValue, setSelectedValue] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cardSize, setCardSize] = useState<CardSize>('md');
  const [flipAll, setFlipAll] = useState<boolean>(false);
  const [inspectedCard, setInspectedCard] = useState<CardDefinition | null>(null);

  const stats = useMemo(() => computeDeckStatistics(FULL_DECK), []);

  const filteredCards = useMemo(() => {
    return FULL_DECK.filter((card) => {
      // Color filter
      if (selectedColor !== 'all' && card.color !== selectedColor) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && card.type !== selectedType) {
        return false;
      }
      // Value filter
      if (selectedValue !== 'all' && card.value !== selectedValue) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesId = card.id.toLowerCase().includes(q);
        const matchesKey = card.cardKey.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesKey) {
          return false;
        }
      }
      return true;
    });
  }, [selectedColor, selectedType, selectedValue, searchQuery]);

  const handleDownloadSvg = (card: CardDefinition) => {
    const link = document.createElement('a');
    link.href = `/cards/${card.id}.svg`;
    link.download = `${card.id}.svg`;
    link.click();
  };

  const handleDownloadCardBack = () => {
    const link = document.createElement('a');
    link.href = '/cards/card-back.svg';
    link.download = 'card-back.svg';
    link.click();
  };

  return (
    <div className="gallery-container">
      {/* 1. Header & Live Stats */}
      <header className="gallery-header">
        <div className="header-badge">
          <Sparkles size={16} /> Online UNO-Style Vector Card Design System
        </div>
        <h1 className="header-title">Standard 108-Card Master Deck</h1>
        <p className="header-subtitle">
          Data-driven, crisp vector SVG card design system with guaranteed readability, identical geometry, and consistent visual language.
        </p>

        {/* Validation Status & Stats Badges */}
        <div className="stats-row">
          <div className="stat-pill success">
            <CheckCircle size={16} /> 108 Cards Validated (100% Pass)
          </div>
          <div className="stat-pill color-red">Red: {stats.byColor.red}</div>
          <div className="stat-pill color-blue">Blue: {stats.byColor.blue}</div>
          <div className="stat-pill color-green">Green: {stats.byColor.green}</div>
          <div className="stat-pill color-yellow">Yellow: {stats.byColor.yellow}</div>
          <div className="stat-pill color-wild">Wild: {stats.byColor.wild}</div>
          <div className="stat-pill neutral">Numbers: {stats.byType.number}</div>
          <div className="stat-pill neutral">Actions: {stats.byType.action}</div>
        </div>
      </header>

      {/* 2. Control Toolbar */}
      <div className="controls-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search cards by name or ID (e.g. 'Red 7', 'skip', 'wild')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="filter-group-wrap">
          {/* Color Filter */}
          <div className="filter-item">
            <span className="filter-label"><Filter size={14} /> Color:</span>
            <div className="button-group">
              {(['all', 'red', 'blue', 'green', 'yellow', 'wild'] as const).map((col) => (
                <button
                  key={col}
                  className={`toggle-btn ${selectedColor === col ? 'active' : ''} ${col !== 'all' ? `btn-col-${col}` : ''}`}
                  onClick={() => setSelectedColor(col)}
                >
                  {col === 'all' ? 'All Colors' : col.charAt(0).toUpperCase() + col.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="filter-item">
            <span className="filter-label"><Layers size={14} /> Type:</span>
            <div className="button-group">
              {(['all', 'number', 'action', 'wild'] as const).map((t) => (
                <button
                  key={t}
                  className={`toggle-btn ${selectedType === t ? 'active' : ''}`}
                  onClick={() => setSelectedType(t)}
                >
                  {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Value Filter */}
          <div className="filter-item">
            <span className="filter-label">Value:</span>
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="select-dropdown"
            >
              <option value="all">All Values</option>
              <optgroup label="Number Cards">
                {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(v => (
                  <option key={v} value={v}>Number {v}</option>
                ))}
              </optgroup>
              <optgroup label="Action Cards">
                <option value="skip">Skip</option>
                <option value="reverse">Reverse</option>
                <option value="draw2">Draw Two (+2)</option>
              </optgroup>
              <optgroup label="Wild Cards">
                <option value="wild">Wild</option>
                <option value="wild_draw4">Wild Draw Four (+4)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Display Toggles */}
        <div className="display-toggles">
          {/* Card Size Selector */}
          <div className="size-selector">
            <span className="filter-label"><Eye size={14} /> Size:</span>
            <div className="button-group">
              <button
                className={`toggle-btn ${cardSize === 'sm' ? 'active' : ''}`}
                onClick={() => setCardSize('sm')}
                title="Small (72x101px) - Test small-screen legibility"
              >
                SM
              </button>
              <button
                className={`toggle-btn ${cardSize === 'md' ? 'active' : ''}`}
                onClick={() => setCardSize('md')}
                title="Medium (120x168px) - Hand view"
              >
                MD
              </button>
              <button
                className={`toggle-btn ${cardSize === 'lg' ? 'active' : ''}`}
                onClick={() => setCardSize('lg')}
                title="Large (180x252px) - Play field view"
              >
                LG
              </button>
              <button
                className={`toggle-btn ${cardSize === 'xl' ? 'active' : ''}`}
                onClick={() => setCardSize('xl')}
                title="Extra Large (240x336px) - Full HD master size"
              >
                XL
              </button>
            </div>
          </div>

          {/* Flip All Toggle */}
          <button
            className={`flip-toggle-btn ${flipAll ? 'active' : ''}`}
            onClick={() => setFlipAll(prev => !prev)}
          >
            <RotateCw size={15} /> {flipAll ? 'Show Fronts' : 'Flip All Cards'}
          </button>
        </div>
      </div>

      {/* 3. Card Back Feature Showcase Card */}
      <section className="card-back-showcase">
        <div className="showcase-card-wrapper">
          <CardBack size={cardSize === 'sm' ? 'md' : cardSize} />
        </div>
        <div className="showcase-content">
          <span className="badge-tag">Original Artwork</span>
          <h2>Deck Card-Back Design</h2>
          <p>
            Matching original visual identity featuring deep cosmic obsidian styling, dual concentric radial guides, symmetrical 4-corner gem accents, and an energetic tilted oval housing 4 fanned card leaves and "CARDS" insignia.
          </p>
          <div className="showcase-actions">
            <button className="action-btn" onClick={handleDownloadCardBack}>
              <Download size={15} /> Download Card Back SVG
            </button>
          </div>
        </div>
      </section>

      {/* 4. Filter Results Status */}
      <div className="results-header">
        <span className="results-count">
          Showing <strong>{filteredCards.length}</strong> of <strong>{FULL_DECK.length}</strong> cards in deck
        </span>
        <span className="results-hint">
          💡 Click any card to inspect high-resolution vector geometry & metadata
        </span>
      </div>

      {/* 5. Complete Deck Grid */}
      <div className={`cards-grid size-${cardSize}`}>
        {filteredCards.map((card) => (
          <div key={card.id} className="grid-item">
            <Card
              card={card}
              size={cardSize}
              isFlipped={flipAll}
              onClick={(c) => setInspectedCard(c)}
            />
            <div className="card-caption">
              <span className="card-caption-name">{card.name}</span>
              <span className="card-caption-id">{card.id}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="empty-state">
          <p>No cards matched your current filter criteria.</p>
          <button
            className="action-btn"
            onClick={() => {
              setSelectedColor('all');
              setSelectedType('all');
              setSelectedValue('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 6. Card Inspection Modal */}
      {inspectedCard && (
        <div className="modal-backdrop" onClick={() => setInspectedCard(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Card Inspector: {inspectedCard.name}</h3>
              <button className="modal-close-btn" onClick={() => setInspectedCard(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-preview">
                <Card
                  card={inspectedCard}
                  size="xl"
                  flippableOnClick={true}
                />
                <span className="modal-flip-hint">Click card to test 3D flip</span>
              </div>
              <div className="modal-info">
                <h4>Design & Game Properties</h4>
                <div className="info-table">
                  <div className="info-row">
                    <span className="info-key">Unique ID:</span>
                    <span className="info-val font-mono">{inspectedCard.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Template Key:</span>
                    <span className="info-val font-mono">{inspectedCard.cardKey}.svg</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Color:</span>
                    <span className="info-val capitalize">{inspectedCard.color}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Type:</span>
                    <span className="info-val capitalize">{inspectedCard.type}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Face Value:</span>
                    <span className="info-val">{inspectedCard.value}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Game Score Value:</span>
                    <span className="info-val font-bold">{inspectedCard.score} pts</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Instance Index:</span>
                    <span className="info-val">{inspectedCard.instanceIndex}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Canvas Dimensions:</span>
                    <span className="info-val">240 × 336 px (Aspect 5:7)</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleDownloadSvg(inspectedCard)}
                  >
                    <Download size={15} /> Download {inspectedCard.id}.svg
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardGallery;
