/**
 * SHC Platform server configuration helper.
 *
 * This file loads environment variables and validates the runtime setup required by the
 * app: JWT secrets, Supabase URLs, LiveKit credentials, and Gemini configuration.
 * It is connected to nearly every backend module because route handlers, auth utilities,
 * and the main Express server all read its config values before starting work.
 */

import 'dotenv/config';

function required(name: string, optional = false): string {
  const value = process.env[name]?.trim() || '';
  if (!value && !optional) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-jwt-secret'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  livekit: {
    url: process.env.LIVEKIT_URL || '',
    apiKey: process.env.LIVEKIT_API_KEY || '',
    apiSecret: process.env.LIVEKIT_API_SECRET || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  },
};

export function assertRuntimeConfig() {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }
  if (config.supabase.url && config.supabase.url.startsWith('postgresql://')) {
    throw new Error(
      'SUPABASE_URL must be the HTTPS API URL (https://<ref>.supabase.co), not a postgres:// connection string'
    );
  }
}

export function livekitConfigured(): boolean {
  return Boolean(config.livekit.url && config.livekit.apiKey && config.livekit.apiSecret);
}

export function supabaseConfigured(): boolean {
  return Boolean(
    config.supabase.url &&
      config.supabase.serviceKey &&
      config.supabase.url.startsWith('http') &&
      !config.supabase.url.includes('your-project')
  );
}
