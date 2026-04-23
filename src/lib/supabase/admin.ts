/**
 * Supabase Admin Client — SERVICE ROLE
 *
 * This client uses the service role key, which bypasses ALL Row Level Security
 * policies. It must NEVER be imported in client components or exposed to the
 * browser. Use only in:
 *   - API route handlers (/src/app/api/*)
 *   - Server Actions
 *   - Background scripts / webhooks
 */
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      // Disable auto-refresh and session persistence — this is a server singleton
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
