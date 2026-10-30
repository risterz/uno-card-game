# 🃏 UNO Online & Local Card Game — Made by risterz

> A full-featured, responsive, multiplayer & single-player UNO-style card game built with React 19, TypeScript, Vite, Tailwind/CSS, and Node.js + Socket.IO. Features the original tournament deck, the exclusive **Halloween Collector's Deck** with 54 unique vector illustrations, real-time multiplayer with 20s turn timers, relaxing custom BGM, and smart AI bots.

---

## 🌐 Live Production Links

| Service | Target URL | Status |
|---|---|---|
| 🚀 **Live Play (Cloudflare Pages)** | **[https://uno-card-game-335.pages.dev](https://uno-card-game-335.pages.dev)** | `Production Active` |
| 🛰️ **Multiplayer Backend (Render)** | **[https://uno-multiplayer-backend-en4e.onrender.com](https://uno-multiplayer-backend-en4e.onrender.com)** | `Online (Node.js/Socket.IO)` |
| 🩺 **Backend Health Endpoint** | **[https://uno-multiplayer-backend-en4e.onrender.com/health](https://uno-multiplayer-backend-en4e.onrender.com/health)** | `HTTP 200 OK` |
| 🐙 **GitHub Repository** | **[https://github.com/risterz/uno-card-game](https://github.com/risterz/uno-card-game)** | `Public / Open Source` |

---

## ✨ Highlights & Features

### 1. 🎃 Two Complete Card Themes (Classic + Halloween)
- **Classic Tournament Deck:** Authentic colors (`#E61938`, `#0066E5`, `#00A852`, `#F5A600`), 108 cards, uniform 240×336 viewBox geometry.
- **Halloween Collector's Deck:** 54 completely unique hand-crafted vector artworks across 4 dark fantasy families:
  - 🩸 **Vampire Crimson (Red):** Castle Dracul, gothic coffins, crimson bats, blood roses.
  - 👻 **Midnight Haunt (Blue):** Sunken phantom galleons, will-o'-wisps, spectral feline spirits, ghost fountains.
  - 🧙‍♀️ **Witchcraft (Green):** Haunted treants, bubbling cauldrons, potion vials, dark grimoires.
  - 🎃 **Pumpkin Gold (Yellow):** Carved jack-o'-lanterns, harvest scarecrows, autumn lanterns.
  - 🔮 **Dark Magic (Wild):** Ancient forbidden tomes with four elemental magical flames.
- **Instant Live Theme Switcher:** Change themes dynamically mid-game without reloading.

### 2. ⚡ Real-Time Online Multiplayer (Render Backend)
- **Authoritative Server Architecture:** Game rules, card validation, deck shuffling, and draw piles run on the Node.js backend to prevent tampering.
- **Private Hand Security:** Players only receive their own card definitions over WebSockets. Opponents only receive obfuscated hand counts.
- **Room Code Lobby System:** Create or join private 6-character room codes (`ABC123`) or share one-click invite URLs (`?room=XYZ`).
- **Session Reconnection:** Automatic session recovery preserves your player slot and hand if you disconnect or refresh.

### 3. ⏱️ 20-Second Round Turn Timer (Online Mode)
- **Strictly Online Only:** Displayed exclusively during active multiplayer matches. Local Solo and Pass & Play remain comfortably untimed.
- **Real-Time Synchronized Countdown:** Server emits timer sync; the client renders a glowing circular timer pill with pulse animations when time is low.
- **Automatic Turn Timeout:** If a player is idle for 20 seconds, the server draws a card and advances turn automatically to keep matches fast-paced.

### 4. 🎵 Relaxing Casual BGM & Sound FX
- **Custom Casual BGM Track:** 104 BPM, cozy Cmaj7-Am7-Fmaj7-G7 chord progression featuring warm marimba plucks, Rhodes electric piano pads, gentle upright bass, and soft lo-fi shakers ([bgm-casual.wav](public/sounds/bgm-casual.wav)).
- **Interactive Audio Controller:** Top navbar button with animated soundwave visualizer and volume memory (`localStorage`).
- **Web Audio Sound Effects:** Dedicated sound effects for drawing cards, playing cards, action attacks (+2/+4/Skip/Reverse), shouting UNO, catching opponents, and victory fanfare.

### 5. 🤖 Smart AI Bots & Local Modes
- **Solo vs AI:** Play against 1 to 3 autonomous bot players with 3 distinct intelligence levels:
  - `Easy`: Relaxed casual play, occasional missed UNO shouts.
  - `Medium`: Color-matching strategy, optimal Wild color selection.
  - `Hard`: Hand-size counting, targeted action attacks against leading players, aggressive UNO catching.
- **Local Pass & Play:** 2 to 4 human players sharing one screen with animated privacy curtains between turns.

### 6. 📱 100% Mobile & Touch Responsive
- Optimized for mobile viewports (down to 360px width) with touch ergonomics, fanned card overlapping, smooth horizontal scroll gestures, and compact header controls.

### 7. 💥 Custom House Rules & Modifiers (New!)
- **💥 Draw Stacking (+2 / +4):** Stack a Draw Two on a Draw Two, or Wild Draw Four on Wild Draw Four. The penalty accumulates (+2, +4, +6...) and passes to the next player until someone cannot stack and draws the entire sum.
- **🔄 7-0 Rule:** Playing any **7** lets you swap your hand with any chosen opponent. Playing any **0** rotates all players' hands in the active game direction.
- **⚡ Jump-In Rule:** If you hold a card that matches the top discard in BOTH color and value, play it immediately out of turn to hijack the round.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────┐          HTTPS / WSS          ┌─────────────────────────────────────────┐
│     Cloudflare Pages (Frontend SPA)     │ ◄───────────────────────────► │        Render Web Service (Node)        │
│  - React 19 + TypeScript 5              │                               │  - Node.js + Express + Socket.IO        │
│  - Vite Build System                    │                               │  - Authoritative Game Engine            │
│  - Motion (Framer Motion v12)           │                               │  - 20-Second Round Turn Timers          │
│  - Web Audio API Sound Engine           │                               │  - Room Manager & Private State Sync    │
│  - 100% Offline Local Play Support      │                               │  - Zero Client Secret Exposure          │
└─────────────────────────────────────────┘                               └─────────────────────────────────────────┘
```

| Area | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Bundler & Tooling** | [Vite 8](https://vite.dev/), [Rolldown](https://rolldown.rs/) |
| **Animation & Motion** | [Motion (React)](https://motion.dev/) |
| **Audio** | HTML5 Audio + Web Audio API Procedural Synthesizer Fallback |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) (ESM + TSX) |
| **Realtime Networking** | [Socket.IO 4](https://socket.io/) (WSS / Long-Polling fallback) |
| **Hosting & CI/CD** | [Cloudflare Pages](https://pages.cloudflare.com/), [Render](https://render.com/), [GitHub Actions](https://github.com/features/actions) |

---

## 🗂️ Project Directory Map

```
uno-card-game/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI & Cloudflare deploy workflow
├── public/
│   ├── _redirects              # Cloudflare Pages SPA client-side routing fallback
│   ├── nano-banana-icon.jpg    # Mascot logo & favicon
│   └── sounds/                 # Pre-rendered 16-bit PCM sound effects & casual BGM
├── scripts/
│   ├── generate-cards.ts       # Classic 108-card SVG generator
│   ├── generate-halloween-cards.ts # Halloween 108-card SVG generator
│   ├── generate-bgm.cjs        # Casual BGM synthesizer script
│   ├── validate-deck.ts        # 8-point strict deck inventory validator
│   ├── validate-card-themes.ts # 8-point theme uniqueness validator
│   └── verify-live-deployment.cjs # End-to-end multi-client live tester
├── server/
│   ├── index.ts                # Authoritative Socket.IO server & HTTP health endpoint
│   ├── room-manager.ts         # Room lifecycle, timers, session tokens, private view filter
│   └── __tests__/              # Server test suite (timer, CORS security, multiplayer)
├── src/
│   ├── assets/cards/           # 162 Classic SVGs + 163 Halloween SVGs
│   ├── components/
│   │   ├── game/GameBoard.tsx  # Local game board, arena felt, opponent pods
│   │   ├── multiplayer/        # Multiplayer view, room lobby, live arena
│   │   ├── BgmButton.tsx       # BGM audio button & waveform visualizer
│   │   └── Card.tsx            # Interactive 3D vector card component
│   ├── engine/                 # Pure TypeScript UNO rules, AI decision tree, scoring
│   ├── themes/                 # Theme definitions & registry (Classic, Halloween)
│   ├── utils/                  # Audio manager, BGM engine, animation tokens
│   └── App.tsx                 # Root layout, navigation tabs, creator branding, footer
└── DEPLOYMENT.md               # Detailed production deployment documentation
```

---

## 📋 Standard 108-Card Inventory

Both the **Classic** and **Halloween** decks adhere strictly to the tournament inventory:

| Card Type | Breakdown per Color | Total Cards |
|---|---|---|
| **0 Number Card** | 1 per color (Red, Blue, Green, Yellow) | **4** |
| **1–9 Number Cards** | 2 of each number per color | **72** |
| **Skip Action** | 2 per color | **8** |
| **Reverse Action** | 2 per color | **8** |
| **Draw Two (+2)** | 2 per color | **8** |
| **Wild** | Universal color change | **4** |
| **Wild Draw Four (+4)** | Universal color change + 4 card penalty | **4** |
| **Total Master Inventory** | **Exactly 108 Cards** | **108** |

---

## 🚀 Quickstart & Development

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- npm v10 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development
Runs the Vite frontend on `http://localhost:3000` and the multiplayer backend on `http://localhost:4000`:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Multiplayer Backend
npm run server:dev
```

### 3. Run Automated Tests
```bash
# Run all unit and integration tests (56 tests)
npm test

# Run 8-point classic deck integrity check
npm run validate:deck

# Run 8-point Halloween theme uniqueness check
npm run validate:themes
```

### 4. Build for Production
```bash
npm run build
```

---

## 🚢 Deployment Guide

### Deploy Backend to Render
1. Create a new **Web Service** on [Render](https://dashboard.render.com/) pointing to this repository.
2. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `HOST`: `0.0.0.0`
   - `CLIENT_URL`: `https://uno-card-game-335.pages.dev,https://*.pages.dev,http://localhost:3000`

### Deploy Frontend to Cloudflare Pages
1. Deploy via Wrangler CLI:
   ```bash
   $env:VITE_SERVER_URL="https://uno-multiplayer-backend-en4e.onrender.com"
   npm run build
   npx wrangler pages deploy dist --project-name uno-card-game
   ```
2. Or connect the repository in the **Cloudflare Dashboard** under **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** with build command `npm run build` and output folder `dist`.

---

## 👨‍💻 Author & Credits

- **Creator & Developer:** **risterz**
- **Repository:** [https://github.com/risterz/uno-card-game](https://github.com/risterz/uno-card-game)
- **Live Game:** [https://uno-card-game-335.pages.dev](https://uno-card-game-335.pages.dev)
- **License:** MIT License — Open for personal and educational use.
