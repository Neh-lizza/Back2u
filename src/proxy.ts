// src/proxy.ts
// Protects routes, refreshes sessions, handles redirects

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require login
const PROTECTED_ROUTES = [
  '/dashboard',
  '/report',
  '/browse',
  '/chat',
  '/admin',
  '/recovery',
]

// Routes that logged-in users should NOT access
// NOTE: /auth/reset is intentionally excluded — a logged-in user
// clicking their reset email link must be allowed through to update their password.
const AUTH_ROUTES = [
  '/auth',
]

// Routes always accessible regardless of auth state
const PUBLIC_OVERRIDES = [
  '/auth/reset',
]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not remove
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Always allow public overrides (e.g. password reset page)
  const isPublicOverride = PUBLIC_OVERRIDES.some(route => path.startsWith(route))
  if (isPublicOverride) {
    return supabaseResponse
  }

  // If user is not logged in and tries to access protected route → redirect to /auth
  const isProtected = PROTECTED_ROUTES.some(route => path.startsWith(route))
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user IS logged in and tries to access /auth → redirect to /dashboard
  const isAuthRoute = AUTH_ROUTES.some(route => path.startsWith(route))
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}