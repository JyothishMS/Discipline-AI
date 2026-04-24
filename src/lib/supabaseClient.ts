import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Check your environment variables.');
}

const globalForSupabase = globalThis as typeof globalThis & {
  __supabaseClient?: SupabaseClient | null;
};

export const supabase = supabaseUrl && supabaseKey
  ? (globalForSupabase.__supabaseClient ??
      (globalForSupabase.__supabaseClient = createClient(supabaseUrl, supabaseKey)))
  : null;
