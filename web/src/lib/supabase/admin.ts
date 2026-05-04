import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Supabase Admin client — uses SERVICE_ROLE key to bypass RLS.
 * ONLY use in Super Admin server actions & route handlers.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local for Super Admin features.'
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
