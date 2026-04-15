# Healleo — Healthcare Optimized by You

A personal health team powered by AI. Doctor, nutritionist, trainer, and therapist — all working together, all knowing your full story.

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# Edit .env.local with VITE_HEALLEO_API_PROXY (required)
# and VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (optional)

# 3. Run locally
npm run dev                    # http://localhost:5173

# 4. Build + deploy
npm run build
# Upload the entire dist/ folder (index.html + assets/ + .htaccess)
# to Hostinger public_html/
```

## Project Structure

```
healleo/
├── src/
│   ├── main.jsx                # Vite entry — installs fetch interceptor, mounts AuthGate
│   ├── App.jsx                 # AuthGate (login / signup / unlock / forgot-password)
│   ├── supabase-adapter.js     # Cloud sync + AES-256-GCM encryption adapter
│   ├── components/             # Tab components (Dashboard, AskDoctor, LogEntry, ...)
│   │   └── ui/                 # RingProgress, MiniBar, RenderMD
│   ├── lib/                    # Pure data + helpers (ai, auth, storage, labs, drugs, ...)
│   └── styles/theme.js         # CSS variables + S style constants
├── public/
│   └── .htaccess               # Apache config — Vite copies to dist/ on build
├── deploy/
│   └── api-proxy-worker.js     # Cloudflare Worker (AI proxy)
├── db/
│   └── schema.sql              # Supabase PostgreSQL schema
├── dist/                       # Build output (gitignored)
├── index.html                  # Vite HTML entry point
├── vite.config.js
├── package.json
├── .env.local                  # Your secrets (gitignored, VITE_* prefixed)
└── README.md
```

## Configuration (.env.local)

Vite exposes env vars to the browser only when prefixed `VITE_`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_HEALLEO_API_PROXY` | Yes | Cloudflare Worker URL for AI calls |
| `VITE_SUPABASE_URL` | No | Supabase project URL for cloud sync |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anon key for cloud sync |

**Standalone mode:** Leave Supabase fields blank. Data stored in localStorage (device-only).

**Cloud mode:** Set Supabase fields. Data encrypted with AES-256-GCM in the browser, stored as ciphertext in Supabase. Cross-device sync enabled.

## Build

```bash
npm run build    # emits dist/index.html + dist/assets/index-<hash>.js + dist/.htaccess
npm run preview  # serve dist/ locally to verify before upload
```

Vite reads `.env.local`, bundles React + the Supabase adapter + all components into a single hashed JS asset, and copies `public/.htaccess` to `dist/` automatically.

## Deploy to Hostinger

1. Run `npm run build`
2. Upload the **entire contents of `dist/`** to `public_html/` — that's `index.html`, `assets/`, and `.htaccess`
3. Done — hashed filenames handle cache-busting automatically

Note: deploying only `index.html` will not work. The HTML references a hashed JS file inside `assets/` that changes every build.

## Deploy AI Proxy (one-time)

1. Go to [Cloudflare Workers](https://dash.cloudflare.com) → Create Worker
2. Paste contents of `deploy/api-proxy-worker.js`
3. Settings → Variables → Add `ANTHROPIC_API_KEY` with your key
4. Copy worker URL to `.env.local` as `VITE_HEALLEO_API_PROXY`

## Set Up Cloud Sync (optional)

1. Create project at [supabase.com](https://supabase.com)
2. SQL Editor → paste `db/schema.sql` → Run
3. Settings → API → copy Project URL and anon key to `.env.local` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
4. Rebuild: `npm run build`

## Development with Claude Code

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Start working
cd healleo/
claude

# Example prompts:
# "Add a medication interaction checker"
# "Fix the water tracking bug"
# "Build and deploy"
```

## Architecture

```
Browser (React SPA)
    ├── localStorage (standalone) or Supabase (cloud sync)
    ├── Cloudflare Worker → Anthropic API (AI features)
    ├── NPI Registry (doctor search)
    ├── PubMed/OpenFDA (medical research)
    └── AES-256-GCM encryption (client-side, server-blind)
```

## Features

- 🩺 **Dr. Healleo** — PubMed/FDA RAG, web search, full patient context
- 🍓 **Nutritionist** — Meal plans, macro targets, condition-based diet
- 🏋️ **Trainer** — Workout routines, flexibility, strength, cardio
- 💜 **Therapist** — Stress, sleep, mood, coping toolkit
- 💊 **Medications** — 100+ drug autocomplete, interaction awareness
- 🧪 **Labs** — Manual entry, PDF upload, auto-flagging, AI analysis
- 🔍 **Symptom Checker** — AI-powered with full history context
- 📋 **Doctor Visit Summary** — AI-compiled report from all data
- 📜 **Health Timeline** — Chronological events, PDF upload
- 👨‍⚕️ **Doctor Finder** — Real NPI Registry search
- 🧠 **AI Memory** — Learns from every interaction
- 📊 **Proactive Insights** — Team notices patterns before you ask
- 🔗 **Plan Sharing** — Professionals share recommendations
- 🔐 **Auth** — Signup, login, forgot password, security questions
- ☁️ **Cloud Sync** — AES-256-GCM encrypted, cross-device (optional)
