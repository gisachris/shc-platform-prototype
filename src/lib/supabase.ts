import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  // Search environment variables
  const url = 
    (typeof process !== 'undefined' && (process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL);

  const key = 
    (typeof process !== 'undefined' && (process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY);

  if (url && key && url.startsWith('http') && !url.includes('your-project.supabase.co')) {
    try {
      supabaseClient = createClient(url, key);
      console.log('Supabase client initialized successfully.');
      return supabaseClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export const isSupabaseConfigured = (): boolean => {
  return getSupabase() !== null;
};

/**
 * SQL DDL Schema string for Supabase database table creation.
 * Users can run this in their Supabase SQL Editor when provisioning their project.
 */
export const SUPABASE_SQL_SCHEMA = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id text primary key,
  email text unique not null,
  full_name text not null,
  role text not null default 'attendee',
  avatar text,
  company text,
  job_title text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Conferences Table
create table if not exists conferences (
  id text primary key,
  title text not null,
  theme text,
  venue_name text,
  city text,
  country text,
  start_date text,
  end_date text,
  status text default 'upcoming'
);

-- Speakers Table
create table if not exists speakers (
  id text primary key,
  name text not null,
  title text,
  organization text,
  bio text,
  avatar text,
  email text,
  featured boolean default false
);

-- Sessions Table
create table if not exists sessions (
  id text primary key,
  title text not null,
  abstract text,
  track text,
  level text,
  room_name text,
  speaker_ids text[],
  start_time text,
  end_time text,
  day_number integer default 1,
  capacity integer default 100,
  is_live boolean default false,
  stream_url text,
  livekit_room text
);

-- CFP Proposals Table
create table if not exists cfp_proposals (
  id text primary key,
  title text not null,
  abstract text not null,
  track text,
  level text,
  speaker_name text not null,
  speaker_email text not null,
  speaker_bio text,
  status text default 'submitted',
  score numeric default 0,
  review_comments text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Q&A Questions Table
create table if not exists qa_questions (
  id text primary key,
  session_id text not null,
  user_name text not null,
  user_avatar text,
  question_text text not null,
  upvotes integer default 0,
  upvoted_by_me boolean default false,
  is_answered boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
`;
