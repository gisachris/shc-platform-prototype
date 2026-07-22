# 🚀 Deployment Guide: SHC Hybrid Conference Platform

This guide provides step-by-step instructions to deploy the **SHC Smart Hybrid Conference Management Platform** to production using **Render** (recommended), **Railway**, or any custom Node.js Cloud container provider.

---

## 📋 Overview & Prerequisites

The application is built as a full-stack Node.js + Express application with Vite for static asset rendering, Gemini AI capabilities, LiveKit WebRTC conferencing, and Supabase PostgreSQL persistence.

### What You Need:
1. **GitHub or GitLab Account**: To host your application source code repository.
2. **Render Account**: Free/Paid account on [Render.com](https://render.com).
3. **Supabase Database (Optional but Recommended)**: Free PostgreSQL database from [Supabase.com](https://supabase.com).
4. **Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com).
5. **LiveKit Cloud Credentials (Optional)**: Free WebRTC room credentials from [LiveKit Cloud](https://livekit.io).

---

## 🚀 Step 1: Prepare Code Repository

1. **Download Source Code**: Export/download the project ZIP file or commit directly to a Git repository.
2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SHC Platform"
   git branch -M main
   git remote add origin https://github.com/your-username/shc-conference-platform.git
   git push -u origin main
   ```

---

## 🛠️ Step 2: Set Up Supabase Database (Optional)

1. Sign in to [Supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings** -> **API**.
3. Copy your **Project URL** and **anon / public key**.
4. In the SQL Editor, create the database tables:
   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     role TEXT DEFAULT 'attendee',
     company TEXT,
     job_title TEXT,
     bio TEXT,
     avatar TEXT
   );

   CREATE TABLE IF NOT EXISTS conferences (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     short_code TEXT,
     tagline TEXT,
     description TEXT,
     venue_name TEXT,
     city TEXT,
     country TEXT,
     start_date TEXT,
     end_date TEXT,
     status TEXT DEFAULT 'published'
   );

   CREATE TABLE IF NOT EXISTS speakers (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     role TEXT,
     company TEXT,
     bio TEXT,
     avatar TEXT,
     email TEXT,
     location TEXT
   );

   CREATE TABLE IF NOT EXISTS sessions (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     track TEXT,
     level TEXT,
     room TEXT,
     speaker_ids TEXT[],
     start_time TEXT,
     end_time TEXT,
     day INTEGER DEFAULT 1,
     capacity INTEGER DEFAULT 100
   );

   CREATE TABLE IF NOT EXISTS cfp_proposals (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     abstract TEXT,
     track TEXT,
     level TEXT,
     speaker_name TEXT,
     speaker_email TEXT,
     speaker_bio TEXT,
     status TEXT DEFAULT 'pending'
   );
   ```

---

## 🌐 Step 3: Deploy on Render

### 1. Create a New Web Service
1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing this codebase.

### 2. Configure Service Settings
- **Name**: `shc-conference-platform` (or your preferred name)
- **Region**: Choose the closest region (e.g., Frankfurt, Oregon, Singapore).
- **Branch**: `main`
- **Root Directory**: Leave blank (default)
- **Environment / Runtime**: `Node`
- **Build Command**:
  ```bash
  npm run build
  ```
- **Start Command**:
  ```bash
  npm run start
  ```
- **Instance Type**: Free or Starter tier.

### 3. Environment Variables Setup
Under **Advanced** -> **Environment Variables**, add the following keys:

| Key | Value / Description | Required? |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | **Yes** |
| `GEMINI_API_KEY` | Your Gemini API key from AI Studio | **Yes (For AI features)** |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Optional (Uses fallback DB if empty) |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJKV...` | Optional |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Optional |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJKV...` | Optional |
| `LIVEKIT_URL` | `wss://your-livekit-server.livekit.cloud` | Optional (For live WebRTC streams) |
| `LIVEKIT_API_KEY` | Your LiveKit API Key | Optional |
| `LIVEKIT_API_SECRET` | Your LiveKit API Secret | Optional |
| `VITE_EMAILJS_SERVICE_ID` | Your EmailJS service ID | Optional |
| `VITE_EMAILJS_PUBLIC_KEY` | Your EmailJS public key | Optional |

### 4. Deploy!
1. Click **Create Web Service**.
2. Render will run `npm run build` and output `dist/server.cjs` and client assets.
3. Once complete, your live site will be accessible at `https://shc-conference-platform.onrender.com`.

---

## 🚄 Alternative: Deploying on Railway

1. Sign in to [Railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub repo**.
3. Railway will automatically detect Node.js.
4. Go to **Variables** and paste your environment variables.
5. In **Settings** -> **Build & Deploy**:
   - Build Command: `npm run build`
   - Start Command: `npm run start`
6. Click **Generate Domain** to get your public URL.

---

## 🔄 Database Seeding After Deployment

Once deployed:
1. Log into your app as an **Organizer or Administrator** (e.g. Emmanuel or Grace).
2. Navigate to **Organizer Workspace** -> **System Settings**.
3. Click **Seed Database Tables** to automatically populate users, conferences, speakers, and sessions directly into Supabase!

---

## ❓ FAQ & Troubleshooting

- **Q: What if I don't configure Supabase environment variables?**
  - **A**: The server automatically falls back to an in-memory database store, so the platform functions seamlessly out of the box even without external database configuration!
- **Q: Where does the server listen on production?**
  - **A**: The server listens on `0.0.0.0:3000` (or `process.env.PORT` mapped by Render/Railway).
- **Q: How does client-side routing work?**
  - **A**: The backend server is configured with Express static middleware to serve `dist/index.html` for all non-API paths.
