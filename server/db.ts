/**
 * Shared Supabase database client factory.
 *
 * This file creates and caches the single Postgres client used throughout the server.
 * It connects the app to Supabase for authentication, conference data, attendee records,
 * Q&A, and all other persisted platform state.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, supabaseConfigured } from './config';

let client: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (!supabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL (HTTPS) and SUPABASE_SERVICE_ROLE_KEY, then run supabase/schema.sql and npm run seed.'
    );
  }
  if (!client) {
    client = createClient(config.supabase.url, config.supabase.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export function tryGetDb(): SupabaseClient | null {
  try {
    return getDb();
  } catch {
    return null;
  }
}
