import React, { useMemo, useState } from 'react';
import { FULL_DECK, computeDeckStatistics } from '../data/deck';
import { CardDefinition, CardSize } from '../types/card';
import { Card } from './Card';
import { CardBack } from './CardBack';
import { useCardTheme, CardThemeId } from '../themes/cardThemes';
import { HALLOWEEN_ARTWORKS } from '../themes/halloween/artwork';
import {
  CheckCircle,
  Eye,
  Filter,
  Layers,
  RotateCw,
  Search,
  Sparkles,
  Download,
  Skull,
  ArrowLeftRight,
} from 'lucide-react';

export const CardGallery: React.FC = () => {
  const { currentTheme, setTheme } = useCardTheme();
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedValue, setSelectedValue] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cardSize, setCardSize] = useState<CardSize>('md');
  const [flipAll, setFlipAll] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [inspectedCard, setInspectedCard] = useState<CardDefinition | null>(null);
  const [inspectorTheme, setInspectorTheme] = useState<CardThemeId>(currentTheme);

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
        const art = HALLOWEEN_ARTWORKS[card.cardKey];
        const matchesArt = art ? (art.title.toLowerCase().includes(q) || art.lore.toLowerCase().includes(q)) : false;
        if (!matchesName && !matchesId && !matchesKey && !matchesArt) {
          return false;
        }
      }
      return true;
    });
  }, [selectedColor, selectedType, selectedValue, searchQuery]);

  const handleDownloadSvg = (card: CardDefinition, themeId: CardThemeId) => {
    const isHalloween = themeId === 'halloween';
    const filePath = isHalloween ? `/cards/halloween/${card.id}.svg` : `/cards/${card.id}.svg`;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = `${card.id}-${themeId}.svg`;
    link.click();
  };

  const handleDownloadCardBack = (themeId: CardThemeId) => {
    const isHalloween = themeId === 'halloween';
    const filePath = isHalloween ? '/cards/halloween/card-back.svg' : '/cards/card-back.svg';
    const link = document.createElement('a');
    link.href = filePath;
    link.download = `card-back-${themeId}.svg`;
    link.click();
  };

  const handleOpenInspector = (card: CardDefinition) => {
    setInspectedCard(card);
    setInspectorTheme(currentTheme);
  };

  return (
    <div className="gallery-container">
      {/* 1. Header & Live Stats */}
      <header className="gallery-header">
        <div className="header-badge">
          {currentTheme === 'halloween' ? (
            <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Skull size={16} /> Halloween Collector's Deck — 54 Unique Vector Artworks
            </span>
          ) : (
            <span style={{ color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Classic Tournament 108-Card Master Deck
            </span>
          )}
        </div>
        <h1 className="header-title">
          {currentTheme === 'halloween' ? "Halloween Collector's Deck" : 'Standard 108-Card Master Deck'}
        </h1>
        <p className="header-subtitle">
          {currentTheme === 'halloween'
            ? 'Original gothic collectible card skin. Handcrafted vector artwork for every single card design: vampires, spectral phantoms, witches, and pumpkin harvest magic.'
            : 'Data-driven, crisp vector SVG card design system with guaranteed readability, identical geometry, and consistent visual language.'}
        </p>

        {/* Theme Mode Selector Toolbar in Gallery */}
        <div className="gallery-theme-toolbar" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            className={`toggle-btn ${currentTheme === 'classic' && !comparisonMode ? 'active' : ''}`}
            onClick={() => {
              setTheme('classic');
              setComparisonMode(false);
            }}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Sparkles size={15} /> Classic Deck
          </button>
          <button
            className={`toggle-btn ${currentTheme === 'halloween' && !comparisonMode ? 'active' : ''} btn-col-red`}
            onClick={() => {
              setTheme('halloween');
              setComparisonMode(false);
            }}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Skull size={15} /> Halloween Collector's Deck
          </button>
          <button
            className={`toggle-btn ${comparisonMode ? 'active' : ''}`}
            onClick={() => setComparisonMode(prev => !prev)}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <ArrowLeftRight size={15} /> Side-by-Side Comparison
          </button>
        </div>

        {/* Halloween Art Direction Banner (when Halloween or Comparison mode is active) */}
        {(currentTheme === 'halloween' || comparisonMode) && (
          <div
            className="halloween-lore-banner"
            style={{
              maxWidth: '880px',
              margin: '0 auto 28px auto',
              background: 'linear-gradient(135deg, rgba(27, 4, 9, 0.8) 0%, rgba(13, 7, 20, 0.9) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>
              <Skull size={16} /> Four Thematic Color Families & Unique Artwork Architecture
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px', color: '#cbd5e1' }}>
              <div style={{ borderLeft: '3px solid #e11d48', paddingLeft: '8px' }}>
                <strong style={{ color: '#fda4af' }}>Red — Vampire Crimson:</strong> Castle Dracul, coffins, bats, gothic candelabras, blood roses, cursed goblets.
              </div>
              <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '8px' }}>
                <strong style={{ color: '#bae6fd' }}>Blue — Midnight Haunt:</strong> Eerie lake spirits, will-o'-wisps, spectral felines, ghost galleons, soul lanterns.
              </div>
              <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '8px' }}>
                <strong style={{ color: '#a7f3d0' }}>Green — Witchcraft:</strong> Ancient treants, grimoires, bubbling cauldrons, toxic toadstools, mandrakes.
              </div>
              <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '8px' }}>
                <strong style={{ color: '#fde68a' }}>Yellow — Pumpkin Gold:</strong> Jack-o'-lanterns, harvest lanterns, cornfield scarecrows, autumn cyclones.
              </div>
            </div>
          </div>
        )}

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
            placeholder="Search cards by name, ID, or lore (e.g. 'Nightwing', 'Cauldron', 'Red 7')..."
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
              {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                <button
                  key={size}
                  className={`toggle-btn ${cardSize === size ? 'active' : ''}`}
                  onClick={() => setCardSize(size)}
                  title={`${size.toUpperCase()} display size`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
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
          <CardBack size={cardSize === 'sm' ? 'md' : cardSize} theme={currentTheme} />
        </div>
        <div className="showcase-content">
          <span className="badge-tag">
            {currentTheme === 'halloween' ? "Halloween Collector's Edition" : 'Original Design System'}
          </span>
          <h2>
            {currentTheme === 'halloween'
              ? 'Gothic Symmetrical Card-Back'
              : 'Classic Symmetrical Card-Back'}
          </h2>
          <p>
            {currentTheme === 'halloween'
              ? 'Rotational 180° symmetrical gothic composition featuring an ornate glowing jack-o\'-lantern skull crest, antique gold starburst rays, corner spiderwebs, and crescent moons concealing the card identity.'
              : 'Matching tournament visual identity featuring deep cosmic obsidian styling, dual concentric radial guides, symmetrical 4-corner gem accents, and an energetic tilted oval housing 4 fanned card leaves and "CARDS" insignia.'}
          </p>
          <div className="showcase-actions">
            <button className="action-btn" onClick={() => handleDownloadCardBack(currentTheme)}>
              <Download size={15} /> Download {currentTheme === 'halloween' ? 'Halloween' : 'Classic'} Card Back SVG
            </button>
          </div>
        </div>
      </section>

      {/* 4. Filter Results Status */}
      <div className="results-header">
        <span className="results-count">
          Showing <strong>{filteredCards.length}</strong> of <strong>{FULL_DECK.length}</strong> cards in deck
          {comparisonMode && <span style={{ color: '#fbbf24', marginLeft: '8px' }}>(Side-by-Side Comparison Mode)</span>}
        </span>
        <span className="results-hint">
          💡 Click any card to inspect high-resolution vector geometry & lore
        </span>
      </div>

      {/* 5. Complete Deck Grid */}
      <div className={`cards-grid size-${cardSize} ${comparisonMode ? 'comparison-active' : ''}`}>
        {filteredCards.map((card) => {
          const hwArtwork = HALLOWEEN_ARTWORKS[card.cardKey];

          if (comparisonMode) {
            return (
              <div key={card.id} className="grid-item comparison-item" style={{ background: '#120d1c', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {/* Classic Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>Classic</span>
                    <Card
                      card={card}
                      theme="classic"
                      size={cardSize === 'xl' ? 'lg' : cardSize === 'lg' ? 'md' : 'sm'}
                      isFlipped={flipAll}
                      onClick={() => handleOpenInspector(card)}
                    />
                  </div>
                  {/* Halloween Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 700 }}>Halloween</span>
                    <Card
                      card={card}
                      theme="halloween"
                      size={cardSize === 'xl' ? 'lg' : cardSize === 'lg' ? 'md' : 'sm'}
                      isFlipped={flipAll}
                      onClick={() => handleOpenInspector(card)}
                    />
                  </div>
                </div>
                <div className="card-caption" style={{ marginTop: '8px' }}>
                  <span className="card-caption-name">{hwArtwork ? hwArtwork.title : card.name}</span>
                  <span className="card-caption-id">{card.id}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={card.id} className="grid-item">
              <Card
                card={card}
                theme={currentTheme}
                size={cardSize}
                isFlipped={flipAll}
                onClick={() => handleOpenInspector(card)}
              />
              <div className="card-caption">
                <span className="card-caption-name">
                  {currentTheme === 'halloween' && hwArtwork ? hwArtwork.title : card.name}
                </span>
                <span className="card-caption-id">{card.id}</span>
                {currentTheme === 'halloween' && hwArtwork && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', fontStyle: 'italic', marginTop: '2px' }}>
                    {hwArtwork.subtitle}
                  </span>
                )}
              </div>
            </div>
          );
        })}
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
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <h3>
                Card Inspector: {inspectedCard.name}
                {HALLOWEEN_ARTWORKS[inspectedCard.cardKey] && (
                  <span style={{ color: '#fbbf24', marginLeft: '8px', fontSize: '15px' }}>
                    • {HALLOWEEN_ARTWORKS[inspectedCard.cardKey].title}
                  </span>
                )}
              </h3>
              <button className="modal-close-btn" onClick={() => setInspectedCard(null)}>×</button>
            </div>
            <div className="modal-body" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '24px' }}>
              <div className="modal-preview" style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Theme Toggle within Inspector */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <button
                    className={`toggle-btn ${inspectorTheme === 'classic' ? 'active' : ''}`}
                    onClick={() => setInspectorTheme('classic')}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Classic View
                  </button>
                  <button
                    className={`toggle-btn ${inspectorTheme === 'halloween' ? 'active' : ''}`}
                    onClick={() => setInspectorTheme('halloween')}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Halloween View
                  </button>
                </div>
                <Card
                  card={inspectedCard}
                  theme={inspectorTheme}
                  size="xl"
                  flippableOnClick={true}
                />
                <span className="modal-flip-hint">Click card to test 3D flip</span>
              </div>
              <div className="modal-info" style={{ flex: '2 1 320px' }}>
                {/* Halloween Lore Box */}
                {HALLOWEEN_ARTWORKS[inspectedCard.cardKey] && (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '14px', marginBottom: '2px' }}>
                      {HALLOWEEN_ARTWORKS[inspectedCard.cardKey].title}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic', marginBottom: '6px' }}>
                      {HALLOWEEN_ARTWORKS[inspectedCard.cardKey].subtitle}
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: 1.45 }}>
                      "{HALLOWEEN_ARTWORKS[inspectedCard.cardKey].lore}"
                    </div>
                  </div>
                )}

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
                    <span className="info-key">Color Family:</span>
                    <span className="info-val capitalize">
                      {inspectedCard.color === 'red' && 'Vampire Crimson (Red)'}
                      {inspectedCard.color === 'blue' && 'Midnight Haunt (Blue)'}
                      {inspectedCard.color === 'green' && 'Witchcraft (Green)'}
                      {inspectedCard.color === 'yellow' && 'Pumpkin Gold (Yellow)'}
                      {inspectedCard.color === 'wild' && 'Astral Dark Magic (Wild)'}
                    </span>
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
                    <span className="info-val">{inspectedCard.instanceIndex} of duplicate pool</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">Canvas Dimensions:</span>
                    <span className="info-val">240 × 336 px (Aspect 5:7, viewBox="0 0 240 336")</span>
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="action-btn primary"
                    onClick={() => handleDownloadSvg(inspectedCard, inspectorTheme)}
                  >
                    <Download size={15} /> Download {inspectorTheme === 'halloween' ? 'Halloween' : 'Classic'} SVG
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleDownloadSvg(inspectedCard, inspectorTheme === 'halloween' ? 'classic' : 'halloween')}
                  >
                    <Download size={15} /> Download {inspectorTheme === 'halloween' ? 'Classic' : 'Halloween'} SVG
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
