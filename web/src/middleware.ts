import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

/**
 * Middleware responsibilities:
 * 1. Refresh the Supabase session on every request
 * 2. Protect /dashboard/* — redirect unauthenticated → /login
 * 3. Redirect authenticated users away from /login and /signup
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Always use getUser() — validates JWT with Supabase server (secure)
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Guard: dashboard requires auth
  if (pathname.startsWith('/dashboard') && !user) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Guard: logged-in users skip auth pages or land on root
  if ((pathname === '/auth/login' || pathname === '/auth/signup' || pathname === '/') && user) {
    const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
      .split(',')
      .map(e => e.trim().toLowerCase())

    if (allowedEmails.includes(user.email?.toLowerCase() ?? '')) {
      return NextResponse.redirect(new URL('/superadmin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
