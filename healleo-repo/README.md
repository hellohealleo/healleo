# Healleo — Healthcare Optimized by You

A personal health team powered by AI. Doctor, nutritionist, trainer, and therapist — all working together, all knowing your full story.

## Quick Start

```bash
# 1. Configure
cp .env.example .env
# Edit .env with your API proxy URL (required) and Supabase keys (optional)

# 2. Build
python3 build.py

# 3. Deploy
# Upload dist/index.html and dist/.htaccess to Hostinger public_html/
```

## Project Structure

```
healleo/
├── src/
│   ├── health-companion.jsx    # Main app (~330KB, React single-file)
│   └── supabase-adapter.js     # Cloud sync + encryption adapter
├── deploy/
│   ├── .htaccess               # Apache config for Hostinger
│   └── api-proxy-worker.js     # Cloudflare Worker (AI proxy)
├── db/
│   └── schema.sql              # Supabase PostgreSQL schema
├── dist/                       # Build output (gitignored)
│   ├── index.html              # Assembled app with config injected
│   └── .htaccess
├── build.py                    # Build script: .env + src/ → dist/
├── .env                        # Your secrets (gitignored)
├── .env.example                # Template for .env
└── README.md
```

## Configuration (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `HEALLEO_API_PROXY` | Yes | Cloudflare Worker URL for AI calls |
| `SUPABASE_URL` | No | Supabase project URL for cloud sync |
| `SUPABASE_ANON_KEY` | No | Supabase anon key for cloud sync |

**Standalone mode:** Leave Supabase fields blank. Data stored in localStorage (device-only).

**Cloud mode:** Set Supabase fields. Data encrypted with AES-256-GCM in the browser, stored as ciphertext in Supabase. Cross-device sync enabled.

## Build

```bash
# Check your config
python3 build.py --check

# Build dist/index.html
python3 build.py
```

The build script:
1. Reads `.env` for your API proxy URL and Supabase keys
2. Injects config into the adapter and HTML template
3. Combines adapter + app code into a single `index.html`
4. Copies `.htaccess` to `dist/`

No more manually editing URLs after deployment.

## Deploy to Hostinger

1. Run `python3 build.py`
2. Upload `dist/index.html` and `dist/.htaccess` to `public_html/`
3. Done

## Deploy AI Proxy (one-time)

1. Go to [Cloudflare Workers](https://dash.cloudflare.com) → Create Worker
2. Paste contents of `deploy/api-proxy-worker.js`
3. Settings → Variables → Add `ANTHROPIC_API_KEY` with your key
4. Copy worker URL to `.env` as `HEALLEO_API_PROXY`

## Set Up Cloud Sync (optional)

1. Create project at [supabase.com](https://supabase.com)
2. SQL Editor → paste `db/schema.sql` → Run
3. Settings → API → copy Project URL and anon key to `.env`
4. Rebuild: `python3 build.py`

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
