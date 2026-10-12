import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in browser (Client Components).
 * Uses the public anon key — subject to RLS policies.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createBrowserClient(url, key)
}
