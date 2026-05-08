import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Auth callback handler — Supabase redirects here after:
 * - Email confirmation (signup)
 * - Magic link click
 * - OAuth (future)
 *
 * Exchanges the code for a session, then redirects to /dashboard
 * or /onboarding if the user has no shop yet.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if the user already belongs to a shop
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Guard: If the user is a Super Admin, redirect directly to /superadmin
        const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
          .split(',')
          .map(e => e.trim().toLowerCase())

        if (allowedEmails.includes(user.email?.toLowerCase() ?? '')) {
          return NextResponse.redirect(`${origin}/superadmin`)
        }

        const { data: memberships } = await supabase
          .from('memberships')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        // No shop → send to onboarding wizard
        if (!memberships || memberships.length === 0) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code is missing or exchange failed → back to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
