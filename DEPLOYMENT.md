# Production Deployment Guide: UNO Game & Design System

## 🚀 Live Production Deployments

- **Frontend (Cloudflare Pages)**: [https://uno-card-game-335.pages.dev](https://uno-card-game-335.pages.dev)
- **Backend (Render Web Service)**: [https://uno-multiplayer-backend-en4e.onrender.com](https://uno-multiplayer-backend-en4e.onrender.com)
- **Health Check Endpoint**: [https://uno-multiplayer-backend-en4e.onrender.com/health](https://uno-multiplayer-backend-en4e.onrender.com/health)
- **GitHub Repository**: [https://github.com/risterz/uno-card-game](https://github.com/risterz/uno-card-game)

---

## 1. Architecture Overview

```
┌─────────────────────────────────┐           WSS / HTTPS           ┌─────────────────────────────────┐
│     Cloudflare Pages (SPA)      │ ◄─────────────────────────────► │    Render Web Service (Node)    │
│  - React 19 + TypeScript + Vite │                                 │  - Node.js + Socket.IO Server   │
│  - Static Asset Delivery        │                                 │  - Authoritative Game Engine    │
│  - 100% Offline Local Play      │                                 │  - Turn Countdown Timers        │
│  - Domain: *.pages.dev          │                                 │  - Domain: *.onrender.com       │
└─────────────────────────────────┘                                 └─────────────────────────────────┘
```

---

## 2. Part 1: Deploying the Backend on Render

Deploy the backend first so you have its production HTTPS URL ready for the frontend.

### Step 1: Create a New Web Service
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`uno-card-game`).

### Step 2: Configure Service Settings
- **Name**: `uno-multiplayer-backend` (or your preferred name)
- **Region**: Select closest to your users (e.g., `Singapore`, `Oregon`, `Frankfurt`)
- **Branch**: `master` or `main`
- **Root Directory**: Leave blank (uses repo root)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (or `npm run server`)
- **Instance Type**: `Free` (or Starter for persistent zero-sleep sockets)

### Step 3: Configure Environment Variables
Under the **Environment Variables** section, add:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | (Render sets this automatically; backend binds to `process.env.PORT`) |
| `HOST` | `0.0.0.0` | Required for containerized host binding |
| `CLIENT_URL` | `https://*.pages.dev,https://your-custom-domain.com` | Allowed frontend CORS origins (comma-separated or wildcard `*`) |

### Step 4: Health Check Path
- Under **Advanced Settings**, set **Health Check Path** to:
  ```
  /health
  ```
- Render will ping `/health` to confirm successful zero-downtime deployments.

### Step 5: Save Backend URL
Once deployed, copy your service URL (e.g., `https://uno-multiplayer-backend.onrender.com`).

---

## 3. Part 2: Deploying the Frontend on Cloudflare Pages

### Step 1: Create a Cloudflare Pages Project
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) or run via Wrangler.
2. Navigate to **Compute (Workers) > Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select the repository.

### Step 2: Build & Deployment Settings
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Root Directory**: Leave blank (`/`)

### Step 3: Environment Variables
Add the backend URL to **Environment Variables (Production & Preview)**:

| Variable Name | Value | Purpose |
|---|---|---|
| `VITE_SERVER_URL` | `https://uno-multiplayer-backend.onrender.com` | Target URL for Socket.IO multiplayer client |
| `NODE_VERSION` | `20` | Recommended Node.js runtime for build steps |

### Step 4: Deploy
Click **Save and Deploy**. Cloudflare Pages will build and host your frontend on `https://<project-name>.pages.dev`.

---

## 4. Part 3: Connect Frontend to Backend (Final CORS Step)

1. Return to your **Render Dashboard** for the backend service.
2. Update `CLIENT_URL` to include your exact Cloudflare Pages URL:
   ```
   CLIENT_URL=https://your-project.pages.dev
   ```
   *(Multiple domains can be separated with commas: `https://your-project.pages.dev,http://localhost:3000`)*
3. Render will automatically apply the change without downtime.

---

## 5. Security & Isolation Guarantee

1. **No Secrets on Client**:
   - The frontend bundle contains zero API keys, server tokens, or credentials.
   - Only public configuration `VITE_SERVER_URL` is exposed to the client.
2. **Authoritative State & Zero Hand Leaks**:
   - The server maintains the true deck, discard pile, and player hands.
   - Public state broadcasts sanitize player hands down to card counts (`cardCount`).
   - Private hands are transmitted exclusively to each player's authenticated socket ID via `getPrivateView()`.
3. **Automatic HTTPS / WSS**:
   - When loaded over HTTPS (Cloudflare Pages default), Socket.IO automatically uses secure WebSockets (`wss://`).
   - Client automatically upgrades any `http://` backend URL to `https://` in production.
4. **100% Offline Local Play**:
   - Single-player local matches run entirely in the browser engine (`src/engine/`).
   - Does not require or attempt backend connections.

---

## 6. Pre-Flight Verification Commands

Run these automated verification commands locally before publishing commits:

```bash
# 1. Run unit test suite (Rules, themes, multiplayer lifecycle, turn timers)
npm test

# 2. Validate standard 108-card deck & SVG asset compliance
npm run validate:deck

# 3. Validate Halloween Collector's Deck & vector artwork integrity
npm run validate:themes

# 4. Run TypeScript check & production asset bundling
npm run build

# 5. Verify local play complete offline independence
node scripts/verify-local-offline.cjs
```
