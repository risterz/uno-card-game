import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CardGallery from './components/CardGallery';
import GameBoard from './components/game/GameBoard';
import { MultiplayerView } from './components/multiplayer/MultiplayerView';
import { Layers, ShieldCheck, Palette, BookOpen, Gamepad2, Users, Skull } from 'lucide-react';
import { tabContentVariants } from './motion/motion-config';
import { CardThemeProvider } from './themes/cardThemes';
import { ThemeSelector } from './components/ThemeSelector';
import { BgmButton } from './components/BgmButton';
import './styles/cards.css';
import './styles/gallery.css';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'game' | 'online' | 'gallery' | 'specs' | 'rules'>('game');

  // Auto-switch to Online tab if shareable invite link clicked
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room')) {
        setActiveTab('online');
      }
    }
  }, []);

  return (
    <div className="app-root">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-brand">
          <div className="brand-logo-badge">
            <img
              src="/nano-banana-icon.jpg"
              alt="Nano Banana Logo"
              className="brand-logo-img"
            />
          </div>
          <div className="brand-text-block">
            <span className="brand-text">
              <span className="brand-title-full">UNO Game & Design System</span>
              <span className="brand-title-short">UNO</span>
            </span>
            <span className="brand-creator" data-testid="creator-badge">
              Made by <strong>risterz</strong>
            </span>
          </div>
          <span className="brand-badge">
            <span className="live-dot" />
            Fully Playable
          </span>
        </div>

        <div className="nav-center-wrap">
          <div className="nav-tabs-wrapper">
            <div className="nav-tabs" role="tablist">
              <button
                className={`nav-tab ${activeTab === 'game' ? 'active' : ''}`}
                onClick={() => setActiveTab('game')}
                role="tab"
                aria-selected={activeTab === 'game'}
                data-testid="nav-tab-local"
              >
                <Gamepad2 size={15} className="nav-tab-icon" />
                <span className="tab-label-full">Play Local</span>
                <span className="tab-label-short">Local</span>
              </button>
              <button
                className={`nav-tab ${activeTab === 'online' ? 'active' : ''}`}
                onClick={() => setActiveTab('online')}
                role="tab"
                aria-selected={activeTab === 'online'}
                data-testid="nav-tab-online"
              >
                <Users size={15} className="nav-tab-icon" />
                <span className="tab-label-full">Online Play</span>
                <span className="tab-label-short">Online</span>
              </button>
              <button
                className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
                role="tab"
                aria-selected={activeTab === 'gallery'}
              >
                <Layers size={15} className="nav-tab-icon" />
                <span className="tab-label-full">108-Card Deck</span>
                <span className="tab-label-short">Cards</span>
              </button>
              <button
                className={`nav-tab ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
                role="tab"
                aria-selected={activeTab === 'specs'}
              >
                <Palette size={15} className="nav-tab-icon" />
                <span className="tab-label-full">Design Specs</span>
                <span className="tab-label-short">Specs</span>
              </button>
              <button
                className={`nav-tab ${activeTab === 'rules' ? 'active' : ''}`}
                onClick={() => setActiveTab('rules')}
                role="tab"
                aria-selected={activeTab === 'rules'}
              >
                <BookOpen size={15} className="nav-tab-icon" />
                <span className="tab-label-full">Rules & Engine</span>
                <span className="tab-label-short">Rules</span>
              </button>
            </div>
          </div>

          {/* Audio BGM & Quick Global Theme Controls */}
          <div className="nav-actions-wrap">
            <BgmButton />
            <div className="nav-theme-container">
              <ThemeSelector variant="compact" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'game' && (
            <motion.div
              key="game"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <GameBoard />
            </motion.div>
          )}

          {activeTab === 'online' && (
            <motion.div
              key="online"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <MultiplayerView />
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CardGallery />
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="gallery-container specs-container"
            >
              <header className="gallery-header">
                <div className="header-badge">
                  <ShieldCheck size={16} /> Design System Specifications
                </div>
                <h1 className="header-title">Card Geometry & Visual Architecture</h1>
                <p className="header-subtitle">
                  Mathematical dimensions, color harmony, typography tokens, and responsive scaling specifications for the browser-based card game.
                </p>
              </header>

              <div className="specs-grid">
                {/* Card Dimensions Card */}
                <div className="spec-card">
                  <h3>Card Dimensions & ViewBox</h3>
                  <ul>
                    <li><strong>Canvas Width:</strong> 240px</li>
                    <li><strong>Canvas Height:</strong> 336px</li>
                    <li><strong>Aspect Ratio:</strong> 5:7 (0.7142)</li>
                    <li><strong>Corner Radius:</strong> 18px outer, 14px inner</li>
                    <li><strong>SVG viewBox:</strong> <code>0 0 240 336</code></li>
                    <li><strong>Physical Border:</strong> 8px crisp outer margin with rounded corners</li>
                  </ul>
                </div>

                {/* Classic Color System Card */}
                <div className="spec-card">
                  <h3>Classic Tournament Tokens</h3>
                  <ul>
                    <li><span className="spec-swatch" style={{ background: '#E61938' }} /><strong>Red:</strong> <code>#E61938</code> (Gradients: #FF3358 to #BA0D28)</li>
                    <li><span className="spec-swatch" style={{ background: '#0066E5' }} /><strong>Blue:</strong> <code>#0066E5</code> (Gradients: #1E88FF to #0047B8)</li>
                    <li><span className="spec-swatch" style={{ background: '#00A852' }} /><strong>Green:</strong> <code>#00A852</code> (Gradients: #10C865 to #00853E)</li>
                    <li><span className="spec-swatch" style={{ background: '#F5A600' }} /><strong>Yellow:</strong> <code>#F5A600</code> (Gradients: #FFBF1A to #D98200)</li>
                    <li><span className="spec-swatch" style={{ background: '#1E1B2E' }} /><strong>Wild:</strong> <code>#1E1B2E</code> (Gradients: #2F2B48 to #13111F)</li>
                  </ul>
                </div>

                {/* Halloween Theme System Card */}
                <div className="spec-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                  <h3 style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Skull size={18} /> Halloween Collector Deck System
                  </h3>
                  <ul>
                    <li><span className="spec-swatch" style={{ background: '#E11D48' }} /><strong>Vampire Crimson (Red):</strong> Castle Dracul, coffins, bats, blood roses</li>
                    <li><span className="spec-swatch" style={{ background: '#38BDF8' }} /><strong>Midnight Haunt (Blue):</strong> Sunken spirits, will-o'-wisps, ghost ships</li>
                    <li><span className="spec-swatch" style={{ background: '#10B981' }} /><strong>Witchcraft (Green):</strong> Treants, cauldrons, potion vials, hex altars</li>
                    <li><span className="spec-swatch" style={{ background: '#F59E0B' }} /><strong>Pumpkin Gold (Yellow):</strong> Jack-o'-lanterns, lanterns, scarecrows</li>
                    <li><span className="spec-swatch" style={{ background: '#A855F7' }} /><strong>Dark Magic (Wild):</strong> Haunted grimoires and 4 elemental flames</li>
                  </ul>
                </div>

                {/* Strict Inventory Breakdown */}
                <div className="spec-card">
                  <h3>Strict 108-Card Inventory</h3>
                  <ul>
                    <li><strong>76 Number Cards:</strong> 1x 0 card + 2x (1-9) per each of the 4 colors</li>
                    <li><strong>24 Colored Action Cards:</strong> 2x Skip + 2x Reverse + 2x Draw Two per color</li>
                    <li><strong>8 Wild Cards:</strong> 4x Wild + 4x Wild Draw Four</li>
                    <li><strong>Total Inventory:</strong> Exactly 108 cards, verified by automated unit tests</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="gallery-container integration-container"
            >
              <header className="gallery-header">
                <div className="header-badge">
                  <BookOpen size={16} /> Official Rules & Game Architecture
                </div>
                <h1 className="header-title">Implemented Game Ruleset & Logic</h1>
                <p className="header-subtitle">
                  Clear documentation of game mechanics, action card behaviors, and turn flow implemented in the pure TypeScript engine.
                </p>
              </header>

              <div className="specs-grid">
                <div className="spec-card">
                  <h3>Action Cards Effects</h3>
                  <ul>
                    <li><strong>Skip:</strong> Next player loses their turn.</li>
                    <li><strong>Reverse:</strong> Direction flips between Clockwise (1) and Counter-Clockwise (-1). In a 2-player match, Reverse acts as a Skip.</li>
                    <li><strong>Draw Two (+2):</strong> Next player draws 2 cards from draw pile and loses their turn.</li>
                    <li><strong>Wild:</strong> Universal match. Player selects active table color (Red, Blue, Green, Yellow).</li>
                    <li><strong>Wild Draw Four (+4):</strong> Universal match. Player chooses active color; next player draws 4 cards and loses their turn.</li>
                  </ul>
                </div>

                <div className="spec-card">
                  <h3>Turn & Draw Pile Mechanics</h3>
                  <ul>
                    <li><strong>Playability:</strong> Matches active color, matches face symbol/number, or is Wild.</li>
                    <li><strong>Card Drawing:</strong> If drawn card is playable, player gets the choice to play it immediately or pass.</li>
                    <li><strong>Draw Pile Recycling:</strong> When draw pile is empty, all cards from the discard pile except the top card are shuffled into a fresh draw pile.</li>
                    <li><strong>UNO Declaration:</strong> Player must call UNO when holding 1 card. If caught by an opponent, player draws 2 penalty cards.</li>
                  </ul>
                </div>

                <div className="spec-card">
                  <h3>Game Modes & AI Features</h3>
                  <ul>
                    <li><strong>Solo vs AI:</strong> 1 human player competing against 1 to 3 autonomous bot players.</li>
                    <li><strong>Local Pass & Play:</strong> 2 to 4 human players sharing one screen with privacy shields between turns.</li>
                    <li><strong>AI Bot Difficulties:</strong> Easy (casual/random), Medium (color-strategic), Hard (opponent hand size counter, card saving, aggressive UNO catch).</li>
                    <li><strong>Scoring:</strong> Winner scores points equal to the sum of remaining cards in all opponents' hands (Numbers: face value, Actions: 20 pts, Wilds: 50 pts).</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Attribution */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-author-box">
            <span className="footer-title">UNO Card Game</span>
            <span className="footer-sep">•</span>
            <span className="footer-author">Made by <strong>risterz</strong></span>
          </div>
          <div className="footer-links">
            <span className="footer-tagline">Classic & Halloween Editions</span>
            <span className="footer-sep">•</span>
            <a
              href="https://github.com/risterz/uno-card-game"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-gh-link"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CardThemeProvider>
      <AppContent />
    </CardThemeProvider>
  );
};

export default App;
