import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function resolveUrl(): string {
  return (
    (typeof process !== 'undefined' && (process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    ''
  );
}

function resolveKey(): string {
  return (
    (typeof process !== 'undefined' &&
      (process.env?.SUPABASE_SERVICE_ROLE_KEY ||
        process.env?.SUPABASE_ANON_KEY ||
        process.env?.VITE_SUPABASE_ANON_KEY)) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    ''
  );
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  const url = resolveUrl();
  const key = resolveKey();
  if (!url || !key || !url.startsWith('http') || url.includes('your-project.supabase.co') || url.startsWith('postgresql://')) {
    return null;
  }
  try {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch {
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => getSupabase() !== null;
