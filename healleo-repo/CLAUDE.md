# CLAUDE.md — Healleo Project Context

## What Is Healleo

Healleo (healleo.com) is an AI-powered personal health concierge app. Four AI professionals — a doctor, nutritionist, trainer, and therapist — work as a team, sharing context about the user's complete health picture. The app tracks wellness data, analyzes lab results, checks symptoms, manages medications, and proactively surfaces insights. Users own their data, which is encrypted client-side before storage.

Tagline: "Healthcare Optimized by You"

## Tech Stack

- **Frontend**: Single-file React app (`src/health-companion.jsx`, ~330KB)
- **Runtime**: Browser-only via CDN React + Babel (no build toolchain, no npm/webpack)
- **AI**: Anthropic Claude Sonnet via Cloudflare Worker proxy
- **Auth**: Dual-mode — localStorage (standalone) or Supabase Auth (cloud sync)
- **Storage**: Dual-mode — localStorage or Supabase with AES-256-GCM client-side encryption
- **Hosting**: Hostinger (static files) + Cloudflare Worker (AI proxy)
- **Build**: `python3 build.py` reads `.env`, injects config, assembles `dist/index.html`

## Build & Deploy

```bash
python3 build.py          # Builds dist/index.html from src/ + .env
python3 build.py --check  # Verify .env configuration
```

Upload `dist/index.html` and `dist/.htaccess` to Hostinger `public_html/`.

Config lives in `.env` (gitignored). `.env.example` has the template. Required: `HEALLEO_API_PROXY`. Optional: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## File Structure

```
src/health-companion.jsx   — The entire app (React, single file)
src/supabase-adapter.js    — Cloud sync: auth, encryption, CRUD, migration
deploy/.htaccess           — Apache config for Hostinger
deploy/api-proxy-worker.js — Cloudflare Worker for AI API calls
db/schema.sql              — Supabase PostgreSQL schema + RLS
build.py                   — Assembles src/ + .env → dist/index.html
```

## Architecture Decisions

- **Single-file app**: All React components live in one JSX file. This was intentional for simplicity — no bundler, no npm, transpiled client-side via Babel CDN. Trade-off: large file, but zero build complexity.
- **Dual-mode storage**: `SUPABASE_MODE` constant auto-detects at load. If `healleoAuth.isConfigured()` returns true (URL + key set), cloud mode activates. Otherwise, falls back to localStorage. Both paths use the same `loadData()`/`saveData()` functions.
- **Client-side encryption**: Health data encrypted with AES-256-GCM in the browser before hitting Supabase. Encryption key derived from user's password via PBKDF2 (100K iterations). Server never sees plaintext. After page refresh, user must re-enter password to re-derive key ("unlock" screen).
- **AI proxy**: Browser can't call Anthropic directly (CORS). Cloudflare Worker at `HEALLEO_API_PROXY` adds the API key server-side and forwards requests.

## Design System

### Colors (warm light theme matching logo)
- `--bg: #f7f7ef` (cream, matched to logo background)
- `--card: #ffffff`
- `--text: #2a2833`
- `--accent: #8a7a4a` (gold/olive — primary)
- `--accent2: #9a8494` (mauve — therapist)
- `--accent3: #6a98b0` (teal — doctor)
- `--accent4: #c4867a` (coral — trainer)
- `--success: #5a8a52`, `--danger: #b85454`

### Typography
- Display: 'DM Sans' (headings)
- Body: 'DM Sans' (everything else)
- Mono: 'DM Mono' (data, badges)

### Font Sizes (global S object)
Footer 11, Tabs 13, SmallBtn 13, Chips 14, Labels 14, Inputs 14, h3 15, Buttons 15, h2 21

### Units — US Imperial
- Weight: pounds (lbs), default 150
- Height: inches, displayed as ft'in" via `fmtHeight()` helper, default 70 (5'10")
- Water: ounces (oz), buttons +8oz/+16oz/+32oz, goal = weight × 0.5
- Calorie formulas: weight(lbs) × 11 (lose), ×14 (maintain), ×16 (build)
- Protein formulas: weight(lbs) × 0.55 (maintain), ×0.82 (build muscle)

## The Four Professionals

All share the same personality DNA: empathetic, authoritative, self-effacing, dry humor. "People you'd want as friends." They root for the user but tell the truth.

### 🩺 Dr. Healleo (tab: "ask")
- PubMed + OpenFDA RAG pipeline with web search
- Full patient context injected into every prompt
- Citations with clickable PMID links
- Chat key: `chatHistory`, memory prefix: n/a

### 🍓 Nutritionist (tab: "nutritionist")
- Chat + 4 plan types (Weekly Meal, Condition Diet, Macro Targets, Shopping List)
- References labs, meds, conditions
- Chat key: `nutritionChat`, memory prefix: "🍓 Nutrition"

### 🏋️ Trainer (tab: "trainer")
- Chat + 4 plan types (Weekly Workout, Flexibility, Strength, Cardio)
- Accounts for medical conditions, medication side effects
- Chat key: `trainerChat`, memory prefix: "🏋️ Fitness"

### 💜 Therapist (tab: "therapist")
- Chat + 4 plan types (Stress Management, Sleep, Mood, Coping Toolkit)
- Crisis protocol: directs to 988 Suicide & Crisis Lifeline
- Chat key: `therapistChat`, memory prefix: "💜 Wellness"

## Key Features & Implementation Notes

### Plan Sharing Between Professionals
- "🔗 Share with team" link under assistant messages >100 chars
- Shared plans injected into receiving professional's system prompt as "SHARED PLANS FROM YOUR COLLEAGUES"
- State key: `sharedPlans` array. Each entry: `{id, from, to, content, summary, sharedAt, read}`
- Prevents duplicates via content comparison

### Proactive Team Insight Engine
- Rule-based pattern detection (no AI calls), runs on dashboard load
- `generateTeamInsights(state)` analyzes logs/labs/symptoms/meds/timeline
- Max 5 cards on dashboard, sorted by priority
- Cards are dismissible (✕ button), auto-resurface after 7 days if condition persists
- State key: `dismissedCards` array with `{key, at}` timestamps
- Cross-agent insights: e.g., low calories + low mood → nutritionist card shared with therapist

### Medications Management (tab: "meds")
- Built-in `DRUG_DATABASE` constant with 100+ common medications (brand + generic + strengths)
- Instant client-side autocomplete, matches brand or generic name
- Structured records: name, dose, frequency, prescriber, startDate, notes, active/discontinued
- Legacy string migration from `profile.medications` on first render
- All professionals see structured medication data in patient context

### Labs (tab: "labs")
- Manual entry: 10 categories, 80+ tests, auto-flagging against reference ranges
- Paste-to-parse: paste lab text → AI extracts structured values
- PDF upload: sends base64 to Claude document API for extraction
- AI analysis button per lab report
- Trends tracked across multiple reports

### Auth System
- **Standalone mode**: PBKDF2-SHA256 hashing, session tokens in localStorage, per-user data isolation
- **Supabase mode**: Supabase Auth (JWT), AES-256-GCM encryption, unlock screen after refresh
- Forgot Password: 3-step (email → security question → reset) in standalone; email-based in Supabase
- Account deletion wipes all data + audit log entry
- Password change in Supabase mode re-encrypts all data with new key

### Dashboard
- Greeting with time of day + user name
- "Your team noticed" — proactive insight cards (dismissible)
- Quick-access tiles (Doctor, Labs, Symptoms, Summary, Timeline)
- Team grid (4 professionals)
- Ring charts (Water, Calories, Protein, Sleep)
- Flagged labs alert (dismissible)
- AI Memory latest insight (dismissible)
- Mood tracker (7-day)

### Other Features
- 🔍 Symptom Checker: body area + free text, severity/duration, AI analysis with full history
- 📋 Doctor Visit Summary: AI-compiled report from all data for doctor visits
- 📜 Health Timeline: chronological events, auto-populated + manual + PDF upload
- 👨‍⚕️ Doctor Finder: real NPI Registry API (npiregistry.cms.hhs.gov)
- ✏️ Daily Logging: manual + natural language input
- 📅 Backfill History: plain text routines → AI generates 30 days of data
- 🍎 Apple Health Import: client-side XML parsing for steps/sleep/water/calories
- 📸 Camera Supplement Scanning: photo → Claude vision → auto-logs
- 🧠 AI Memory: Learning Notes extracted from responses, injected into future prompts
- 🔗 Onboarding: 6-step flow introducing the team concept with personalized first messages

## State Shape (DEFAULT_STATE)

```javascript
{
  profile: { name, age, weight, height, sex, goals[], conditions[], dietType, medications, allergies, bloodType, familyHistory },
  onboarded: false,
  logs: [{ date, water, calories, protein, carbs, fat, fiber, steps, sleep, mood, notes, meals[], exercise[], supplements[] }],
  chatHistory: [],        // Dr. Healleo
  nutritionChat: [],      // Nutritionist
  trainerChat: [],        // Trainer
  therapistChat: [],      // Therapist
  symptomSessions: [],
  labResults: [],
  healthTimeline: [],
  aiMemory: [],
  savedDoctors: [],
  medications: [],        // Structured: {id, name, dose, frequency, prescriber, startDate, notes, active, addedAt}
  sharedPlans: [],        // {id, from, to, content, summary, sharedAt, read}
  dismissedCards: [],     // {key, at} — auto-expire after 7 days
}
```

## Coding Conventions

- All components are function components with hooks (useState, useEffect, useRef)
- State updates use an `update(fn)` pattern: `update(s => { s.field = value; })` — deep clones via JSON.parse/stringify
- Styles are inline objects referencing CSS variables (no CSS files)
- The global `S` object holds shared style constants (near bottom of file)
- `globalCSS` string holds CSS custom properties and keyframes (near top)
- `today()` helper returns YYYY-MM-DD string
- `RenderMD` component handles markdown→React for AI responses (supports headers, lists, blockquotes, bold, PubMed links)
- AI API calls go to `https://api.anthropic.com/v1/messages` — the fetch interceptor rewrites this to `HEALLEO_API_PROXY` at runtime

## External APIs

| API | Used By | Domain | Auth |
|-----|---------|--------|------|
| Anthropic Claude | All AI features | api.anthropic.com (via proxy) | API key in Cloudflare Worker |
| NPI Registry | Doctor search | npiregistry.cms.hhs.gov | None (free) |
| PubMed (NCBI) | Dr. Healleo RAG | eutils.ncbi.nlm.nih.gov | None (free) |
| OpenFDA | Dr. Healleo RAG | api.fda.gov | None (free) |

## Logo

The Healleo logo is embedded as a base64 JPEG constant (`HEALLEO_LOGO`) at the top of health-companion.jsx. It's a molecular/neural network design in muted purples, pinks, corals, and teal on a cream (#f7f7ef) background with gold/olive text.

## Deployment

- **Staging**: staging.healleo.com (Hostinger)
- **Production**: healleo.com (Hostinger, same setup)
- **AI Proxy**: heallo-api.gentle-limit-a5ab.workers.dev (Cloudflare Worker)

## HIPAA Readiness

Current architecture is HIPAA-ready but not HIPAA-compliant:
- ✅ AES-256-GCM encryption at rest (client-side, server-blind)
- ✅ HTTPS in transit
- ✅ Row-Level Security in Supabase
- ✅ Audit logging
- ✅ Data export and deletion functions
- ⚠️ No BAA with Supabase (needs Enterprise $599/mo or self-hosted)
- ⚠️ AI calls go through Cloudflare Worker → Anthropic API (needs AWS Bedrock for BAA)

Phase 2 path: Add Express API server, route AI through AWS Bedrock (BAA included, same pricing), upgrade Supabase or self-host for storage BAA.

## Target Architecture (Migration from Single-File)

Migrating from single-file React (src/health-companion.jsx, ~330KB, Babel CDN) to Vite + component files.

### Key Principles
- src/config/icons.jsx: Single Icon component that renders emoji now, SVG later. Every icon reference in the app uses <Icon name="doctor" /> instead of hardcoded emoji.
- src/config/theme.js: All colors, fonts, sizes in one file. Components import from here.
- src/professionals/: Each professional's config (prompt, greeting, starters, plan types) in its own file. ProfessionalChat.jsx is the shared chat component.
- src/services/: Pure logic (no UI) — storage, auth, AI, encryption, insights.
- src/features/: One file per tab. Self-contained components.
- src/components/ui/: Shared primitives (Button, Card, Input, RingProgress, RenderMD).

### Migration Order
1. Set up Vite, verify the app builds and runs
2. Extract services/ (storage, auth, AI, encryption)
3. Extract config/ (theme, icons, constants)
4. Extract features one at a time
5. Extract shared UI components

### Deployment Note
Vite builds to dist/. The output replaces the old build.py process. The .env vars (HEALLEO_API_PROXY, SUPABASE_URL, SUPABASE_ANON_KEY) should be injected via Vite's env handling (VITE_ prefix).

## Pending / Backlog

1. Medication interaction checker (dedicated feature using FDA data)
2. Appointment scheduling/reminders
3. Export health data as PDF
4. Push notifications for meds/logging (needs service worker)
5. Dark mode toggle
6. AI-scheduled insights (server-side AI replacing rule-based engine)
7. Medication autocomplete expansion via NLM RxTerms API through proxy
8. Backend Phase 2 — Express API server for AWS Bedrock (HIPAA BAA)
