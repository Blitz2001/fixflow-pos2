import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

/**
 * Middleware runs on every request matching the config below.
 *
 * Responsibilities:
 * 1. Refresh the Supabase session (updates the auth cookie).
 * 2. Protect /dashboard routes — redirect to /login if unauthenticated.
 * 3. Redirect authenticated users away from /login and /signup.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // IMPORTANT: getUser() validates the JWT with the Supabase server.
  // Never rely on getSession() alone for auth checks.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Protect /dashboard and all sub-routes ────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Redirect authenticated users away from auth pages ────────────────────
  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Session cookie was refreshed — return the updated response
  return response
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
