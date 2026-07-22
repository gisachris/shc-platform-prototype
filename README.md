# Smart Hybrid Conference (SHC) Platform

Web-based hybrid conference management platform developed as a case study for the **Rwanda Convention Bureau (RCB)** — University of Kigali, School of Computing and IT.

## Purpose

Centralizes conference operations that are often fragmented across tools:

- Online registration and digital ticketing
- Event scheduling and speaker management
- Hybrid participation via LiveKit WebRTC
- Attendee engagement (Q&A, live polls)
- Interest-based networking
- Analytics and CSV reporting for organizers
- Rwanda tourism information for delegates
- Optional AI-assisted CFP abstract review (Gemini)

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Express (TypeScript) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + bcrypt |
| Video | LiveKit |
| CFP AI | Google Gemini (optional) |

## Prerequisites

- Node.js 20+
- A Supabase project
- LiveKit Cloud (or self-hosted) credentials
- Optional: `GEMINI_API_KEY` for CFP AI review

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and fill in secrets:

```bash
cp .env.example .env
```

3. Run the SQL schema in the Supabase SQL Editor:

[`supabase/schema.sql`](supabase/schema.sql)

4. Seed reference data (requires Supabase env vars):

```bash
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## User roles

| Role | Access |
|------|--------|
| Attendee | Registration, schedule, agenda, networking, virtual sessions, tourism |
| Speaker | Speaker profile, assigned sessions, publish in LiveKit |
| Moderator | Session moderation privileges |
| Organizer / Administrator | Admin panel, check-in, CFP review, settings, reports, seed |

New public registrations are always created as **attendee**. Organizer accounts come from seed data or an existing admin.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Express + Vite) |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run seed` | Seed Supabase from reference data |
| `npm run lint` | Typecheck |
| `npm test` | Minimal API/unit tests |

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) — hosting, env vars, smoke checklist
- [docs/EVALUATION.md](docs/EVALUATION.md) — TAM/UTAUT evaluation instrument
- Research proposal: `../docs/Smart Hybrid Conference management Platform 12-07-2026.md`

## Academic note

This repository is the software deliverable for the SHC research project. Do not include fabricated version-control history as part of academic evidence.
