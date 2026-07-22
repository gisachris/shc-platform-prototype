# Deployment Guide — SHC Hybrid Conference Platform

Pilot deployment for the Rwanda Convention Bureau case study.

## Prerequisites

1. Node.js 20+
2. Supabase project (PostgreSQL)
3. LiveKit Cloud project
4. Optional: Gemini API key (CFP AI review only)
5. Hosting: Render, Railway, or any Node host

## 1. Database

1. Open Supabase → SQL Editor
2. Paste and run [`supabase/schema.sql`](supabase/schema.sql)
3. Confirm tables exist: `users`, `conferences`, `sessions`, `speakers`, `attendees`, `cfp_proposals`, etc.

## 2. Environment

Copy `.env.example` → `.env` and set:

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_URL` | Yes | HTTPS API URL `https://<ref>.supabase.co` — **not** `postgresql://` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only |
| `SUPABASE_ANON_KEY` | Yes | |
| `JWT_SECRET` | Yes | Long random string |
| `LIVEKIT_URL` | Yes for hybrid video | `wss://…` |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | Yes for hybrid video | |
| `GEMINI_API_KEY` | Optional | Enables CFP AI review |
| `GEMINI_MODEL` | Optional | Default `gemini-2.0-flash` |
| `PORT` | Optional | Default `3000` |
| `APP_URL` | Recommended | Public URL (used in password-reset links) |
| `EMAILJS_*` / `VITE_EMAILJS_*` | Optional | Welcome + password-reset emails via EmailJS |

After the initial schema, also run the password-reset columns if upgrading an existing DB:

```sql
alter table users add column if not exists reset_token_hash text;
alter table users add column if not exists reset_token_expires timestamptz;
```

## Email behaviour

- **Signup**: account is always created in Supabase. A welcome email is sent only when EmailJS welcome template vars are set.
- **Password reset**: `/api/auth/forgot-password` creates a one-hour token. If EmailJS reset template works, the user gets a link (`APP_URL/?resetToken=…`). If email cannot be sent, the API returns a temporary reset link for pilot/demo use.
- **Contact form** on the landing page uses `mailto:` (opens the visitor’s email client). It is not EmailJS and does not store messages in the database.

## 3. Seed data

```bash
npm install
npm run seed
```

Seed creates hashed passwords for reference users (default password from seed data: `password123`). Change these before any external demo.

## 4. Build & run

```bash
npm run build
npm start
```

Development:

```bash
npm run dev
```

## 5. Render checklist

1. Connect GitHub repo
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Add all env vars from the table above
5. Health check: `GET /api/health`

## Smoke test (RCB pilot demo)

1. Open landing page — RCB/SHC branding, no demo personas
2. Register attendee → receive ticket ID / QR payload
3. Sign in → open schedule → save agenda sessions
4. Open session → join LiveKit room (auth required)
5. Post Q&A question and vote in poll
6. Submit CFP — AI analysis appears only if Gemini succeeds; otherwise clear unavailable/error status
7. Sign in as organizer → Admin → check in by ticket → export CSV report
8. Browse Tourism tab
9. Open Networking matches on dashboard (interest overlap)

## Security notes

- Never commit `.env`
- Prefer rotating keys that have appeared in chat logs or shared screenshots
- Attendee PII endpoints require organizer auth
