// src/middleware.ts
// ♻️ REPLACE
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/report',
  '/browse',
  '/chat',
  '/admin',
  '/recovery',
]

const AUTH_ROUTES = [
  '/auth',
]

const PUBLIC_OVERRIDES = [
  '/auth/reset',
]

const BANNED_ALLOWED_ROUTES = [
  '/',
  '/banned',
  '/auth',
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

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Always allow public overrides
  const isPublicOverride = PUBLIC_OVERRIDES.some(route => path.startsWith(route))
  if (isPublicOverride) return supabaseResponse

  // Not logged in → redirect to /auth
  const isProtected = PROTECTED_ROUTES.some(route => path.startsWith(route))
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Logged in → redirect away from /auth
  const isAuthRoute = AUTH_ROUTES.some(route => path.startsWith(route))
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // ── BANNED USER CHECK ──────────────────────────────────
  if (user) {
    const isBannedAllowed = BANNED_ALLOWED_ROUTES.some(route => path.startsWith(route))
    if (!isBannedAllowed) {
      const { data: profile } = await supabase
        .from('users')
        .select('is_banned')
        .eq('id', user.id)
        .single()

      if (profile?.is_banned) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/banned'
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}