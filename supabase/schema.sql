-- SHC Platform schema for Supabase PostgreSQL
-- Run in Supabase SQL Editor before npm run seed

create extension if not exists "pgcrypto";

create table if not exists users (
  id text primary key,
  email text unique not null,
  full_name text not null,
  role text not null default 'attendee',
  company text default '',
  job_title text default '',
  bio text default '',
  avatar text default '',
  ticket_tier text,
  ticket_id text,
  assigned_session_ids text[] default '{}',
  password_hash text not null,
  interests text[] default '{}',
  created_at timestamptz default timezone('utc'::text, now())
);

create table if not exists conferences (
  id text primary key,
  title text not null,
  short_code text,
  tagline text,
  description text,
  start_date text,
  end_date text,
  venue_name text,
  city text default 'Kigali',
  country text default 'Rwanda',
  host_org text,
  status text default 'published',
  banner_image text,
  logo_image text,
  capacity integer default 1000,
  registered_count integer default 0,
  is_virtual_allowed boolean default true,
  is_hybrid_allowed boolean default true,
  has_tourism_guide boolean default true
);

create table if not exists speakers (
  id text primary key,
  name text not null,
  role text default '',
  company text default '',
  bio text default '',
  avatar text default '',
  email text default '',
  location text default 'Kigali, Rwanda',
  socials jsonb default '{}',
  topics text[] default '{}',
  rating numeric default 5.0,
  featured_session_id text
);

create table if not exists sessions (
  id text primary key,
  conference_id text references conferences(id) on delete set null,
  title text not null,
  description text default '',
  track text,
  level text,
  room text,
  speaker_ids text[] default '{}',
  start_time text,
  end_time text,
  start_minutes integer default 0,
  end_minutes integer default 0,
  day integer default 1,
  capacity integer default 100,
  registered_count integer default 0,
  tags text[] default '{}',
  is_live boolean default false,
  is_featured boolean default false,
  slides_url text,
  video_url text,
  prerequisites text
);

create table if not exists attendees (
  id text primary key,
  conference_id text references conferences(id) on delete set null,
  user_id text references users(id) on delete set null,
  ticket_id text unique not null,
  ticket_tier text default 'general',
  full_name text not null,
  email text not null,
  company text default '',
  job_title text default '',
  interests text[] default '{}',
  dietary_preference text default 'None',
  tshirt_size text default 'L',
  is_networking_opt_in boolean default true,
  is_checked_in boolean default false,
  registered_at timestamptz default timezone('utc'::text, now()),
  qr_code_data text not null,
  avatar text default '',
  bio text default '',
  attendance_mode text default 'hybrid'
);

create table if not exists cfp_proposals (
  id text primary key,
  conference_id text references conferences(id) on delete set null,
  speaker_name text not null,
  speaker_email text default '',
  speaker_company text default '',
  speaker_bio text default '',
  title text not null,
  abstract text not null,
  target_track text,
  level text,
  status text default 'pending',
  submitted_at timestamptz default timezone('utc'::text, now()),
  ai_analysis jsonb,
  ai_status text default 'none'
);

create table if not exists qa_questions (
  id text primary key,
  session_id text not null,
  author_name text not null,
  author_company text default '',
  author_user_id text,
  text text not null,
  upvotes integer default 0,
  upvoted_by text[] default '{}',
  is_answered boolean default false,
  created_at timestamptz default timezone('utc'::text, now())
);

create table if not exists polls (
  id text primary key,
  session_id text not null,
  question text not null,
  options jsonb not null default '[]',
  is_active boolean default true
);

create table if not exists tourism_items (
  id text primary key,
  title text not null,
  category text not null,
  description text default '',
  location text default '',
  distance_from_venue text default '',
  image text default '',
  rating numeric,
  contact_number text,
  website text,
  price_range text,
  highlights text[] default '{}'
);

create table if not exists notifications (
  id text primary key,
  title text not null,
  message text not null,
  type text default 'info',
  timestamp text,
  read boolean default false,
  link_tab text
);

create table if not exists audit_logs (
  id text primary key,
  action text not null,
  actor text not null,
  target text not null,
  timestamp text not null,
  category text default 'system',
  details text
);

create table if not exists direct_messages (
  id text primary key,
  sender_id text not null,
  sender_name text not null,
  sender_avatar text default '',
  receiver_id text not null,
  text text not null,
  timestamp text not null,
  created_at timestamptz default timezone('utc'::text, now())
);

create table if not exists system_settings (
  id text primary key default 'default',
  auto_approve_registration boolean default true,
  livekit_server_url text default '',
  smtp_configured boolean default false,
  emergency_hotline text default '+250 788 000 000',
  allow_public_cfp boolean default true,
  default_timezone text default 'CAT (Central Africa Time / Kigali GMT+2)'
);

create table if not exists saved_agenda (
  user_id text not null references users(id) on delete cascade,
  session_id text not null,
  primary key (user_id, session_id)
);

insert into system_settings (id) values ('default')
on conflict (id) do nothing;

create index if not exists idx_attendees_conference on attendees(conference_id);
create index if not exists idx_sessions_conference on sessions(conference_id);
create index if not exists idx_qa_session on qa_questions(session_id);
create index if not exists idx_messages_receiver on direct_messages(receiver_id);

-- Password reset (safe to re-run on existing projects)
alter table users add column if not exists reset_token_hash text;
alter table users add column if not exists reset_token_expires timestamptz;
