import { createServerClient as _create } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/** Supabase server client — use in Server Components, Actions, Route Handlers */
export async function createServerClient() {
  const cookieStore = await cookies()
  return _create<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch { /* Server Component — middleware handles refresh */ }
        },
      },
    },
  )
}
