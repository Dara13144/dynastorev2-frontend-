import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://itvnbmgjrqawgqqrwwds.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_EFykqWB-Tvd4W3vdvZCk1g_ycajcyVt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_AUTH_ENDPOINTS = {
  authorize: import.meta.env.VITE_SUPABASE_AUTH_AUTHORIZE_URL || 'https://itvnbmgjrqawgqqrwwds.supabase.co/auth/v1/oauth/authorize',
  token: import.meta.env.VITE_SUPABASE_AUTH_TOKEN_URL || 'https://itvnbmgjrqawgqqrwwds.supabase.co/auth/v1/oauth/token',
  jwks: import.meta.env.VITE_SUPABASE_JWKS_URL || 'https://itvnbmgjrqawgqqrwwds.supabase.co/auth/v1/.well-known/jwks.json',
  openidConfig: import.meta.env.VITE_SUPABASE_OPENID_CONFIG_URL || 'https://itvnbmgjrqawgqqrwwds.supabase.co/auth/v1/.well-known/openid-configuration',
};
