# UNO-Style Browser Card Game & 108-Card Design System

A fully playable, local browser-based UNO-style card game built on a data-driven 108-card vector SVG design system with automated rules, action cards, intelligent AI bots, pass-and-play support, and complete unit test validation.

---

## 🎮 Features Implemented

### 1. Game Engine & Official Rules
- **Turn Flow & Order:** Clockwise and counter-clockwise direction handling with wrap-around indexing.
- **Playability Validation:** Exact matches by active color, card number/symbol, or Wild card.
- **Action Cards:**
  - **Skip:** Next player loses turn.
  - **Reverse:** In 3+ players, inverts direction. In 2-player games, functions as a Skip.
  - **Draw Two (+2):** Next player draws 2 cards from draw pile and loses turn.
  - **Wild:** Universal playability. Active player selects new table color (`Red`, `Blue`, `Green`, `Yellow`).
  - **Wild Draw Four (+4):** Universal playability. Player selects active color; next player draws 4 cards and loses turn.
- **Card Drawing & Decision:** If drawn card is playable, player is offered an immediate option to play or pass.
- **Draw Pile Recycling:** When the draw pile runs out of cards, the discard pile (excluding top card) is automatically shuffled and recycled.
- **UNO Declaration & Catching:**
  - Players must shout "UNO!" when holding 1 card.
  - If a player fails to declare UNO, opponents can click "CATCH UNO!" causing the offender to draw 2 penalty cards.
- **Game Over & Scoring:** Detects winning player with 0 cards and tallies round score based on opponents' remaining cards (numbers: face value, action cards: 20 pts, wilds: 50 pts).

### 2. Game Modes & AI Opponents
- **Solo vs AI Bots:** Play against 1 to 3 autonomous bots.
- **AI Difficulties:**
  - `Easy`: Random legal plays and occasional missed UNO shouts.
  - `Medium`: Strategic color matching, hands-based Wild color choice.
  - `Hard`: Tracks opponent hand counts, saves action attacks (+2, +4, Skip) for vulnerable opponents, catches missed UNO declarations.
- **Local Pass & Play:** 2 to 4 human players sharing a single device with privacy curtain shields between turns.

### 3. Interactive UI & Audio
- Uses existing `<Card />` and `<CardBack />` vector SVG components.
- Responsive hand layout with overlapping cards, playable card indicators, and hover elevation.
- Wild color selection modal.
- Active table color glowing indicator and rotating direction wheel.
- Web Audio API procedural sound effects for card placement, action cards, UNO shouts, and game victory.
- Live in-game action history log drawer.

---

## 🗂️ Project Structure

```
uno-card-game/
├── public/
│   ├── cards/                 # Static SVG assets for direct HTML <img> loading
│   └── cards-preview/         # Template preview SVGs
├── scripts/
│   ├── generate-cards.ts      # Deterministic SVG card & back generator
│   └── validate-deck.ts       # 8-point strict consistency & inventory test suite
├── src/
│   ├── assets/
│   │   ├── card-back.svg      # Original obsidian card back asset
│   │   └── cards/             # 162 exported card SVGs + TypeScript index
│   ├── components/
│   │   ├── Card.tsx           # Reusable interactive flippable card component
│   │   ├── CardBack.tsx       # Standalone card-back component
│   │   ├── CardGallery.tsx    # Interactive deck inspector with filters & search
│   │   └── game/
│   │       └── GameBoard.tsx  # Interactive game table, opponent pods, player hand
│   ├── data/
│   │   └── deck.ts            # Canonical 108-card inventory & deck statistics
│   ├── engine/
│   │   ├── types.ts           # Game state, player, log, and settings types
│   │   ├── rules.ts           # Card playability predicates, direction, scoring
│   │   ├── game-state.ts      # State machine (play, draw, pass, uno, catch)
│   │   ├── ai.ts              # AI decision engine & opponent tracking
│   │   └── __tests__/
│   │       └── game-engine.test.ts # Vitest suite (20 tests)
│   ├── styles/
│   │   ├── cards.css          # Shared card styling, 3D flip, elevations, glow
│   │   ├── gallery.css        # Application UI & game table styles
│   │   └── game.css           # Arena table, color ring, opponent pods, modals
│   ├── types/
│   │   └── card.ts            # TypeScript interfaces & types
│   ├── utils/
│   │   └── svg-card-generator.ts # Pure mathematical vector SVG generator
│   ├── App.tsx                # Main app with tabs for Game, Gallery, Specs, Rules
│   └── main.tsx               # React application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Setup & Commands

All commands are run from `uno-card-game/`:

```bash
cd uno-card-game

# 1. Run automated unit test suite (Vitest)
npm test

# 2. Run 8-point deck inventory & geometry validation
npm run validate:deck

# 3. Start authoritative Socket.IO multiplayer backend
npm run server

# 4. Start local development frontend
npm run dev

# 5. Run full multi-browser multiplayer integration suite
node scripts/verify-multiplayer-full.cjs

# 6. Production build
npm run build
```

---

## 🌐 Real-Time Online Multiplayer

### Architecture & Security
- **Authoritative Backend (`server/`):** Node.js Socket.IO server manages canonical game state, deck dealing, turn transitions, and rules enforcement.
- **Hand Privacy & Zero Leakage:** Opponent card identities are never transmitted over the network. Clients receive sanitized public player metadata with card counts only.
- **Unpredictable Room Codes:** Cryptographically randomized 6-character room codes (e.g. `HJH28K`) avoiding ambiguous characters.
- **Shareable Invite Links:** One-click copyable invite URLs (`?room=XYZ`) automatically orient guest players into the target room.
- **Session Tokens & Auto-Reconnect:** Secure session tokens in `sessionStorage` allow players to recover active matches upon browser refresh or transient disconnects.
- **Rate-Limiting & Move Validation:** Prevents out-of-turn moves, illegal cards, malformed payloads, or event flooding.

### Environment Variables
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_SERVER_URL` | `http://localhost:4000` | Socket.IO server connection URL for frontend |
| `PORT` | `4000` | Port for the backend Node.js server |
| `CLIENT_URL` | `*` | Allowed CORS origin for production deployment |

### Deployment Guide
1. **Frontend (Static Site):**
   - Host on Render Static Site, Vercel, or Netlify.
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Set environment variable `VITE_SERVER_URL` to your production backend URL.
2. **Backend (Web Service):**
   - Host on Render Web Service, Railway, or Fly.io.
   - Build Command: `npm install`
   - Start Command: `npm run server`
   - Set `PORT` (e.g. `4000` or assigned by host) and `CLIENT_URL` to frontend production URL.

### Verified vs Unverified Functionality Matrix
| Feature | Status | Verification Method |
| :--- | :--- | :--- |
| Single-Player vs AI Bots (Easy, Medium, Hard) | ✅ Verified | Unit tests + UI manual tests |
| Local Pass-and-Play (2–4 Players) | ✅ Verified | Unit tests + DOM checks |
| 108-Card Deck Inventory & SVG Geometry | ✅ Verified | `npm run validate:deck` (8 checks) |
| Online Room Creation & Joining (2–4 Players) | ✅ Verified | `scripts/verify-multiplayer-full.cjs` |
| Authoritative Server Turn Transitions & Penalties | ✅ Verified | Multi-session Puppeteer integration test |
| Opponent Hand Zero-Leakage Security | ✅ Verified | Inspected DOM + network payload in Puppeteer |
| Session Token Disconnect & Reconnect | ✅ Verified | Automated tab reload test in Puppeteer |
| Production Build & TypeScript Strict Mode | ✅ Verified | `tsc && vite build` (zero errors) |

