import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (typeof window !== 'undefined') {
  throw new Error('supabase-admin.ts é exclusivo do backend.');
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Env vars do admin Supabase ausentes. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.'
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __supabaseAdminClient__: SupabaseClient | undefined;
}

export const supabaseAdmin: SupabaseClient =
  globalThis.__supabaseAdminClient__ ??
  createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

if (!globalThis.__supabaseAdminClient__) {
  globalThis.__supabaseAdminClient__ = supabaseAdmin;
}
