/**
 * Middleware for Firebase Authentication
 * 
 * Protects routes that require authentication by verifying Firebase ID tokens.
 * Redirects unauthenticated users to login page.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/trips',
  '/bookings',
  '/settings',
];

// Public routes that authenticated users shouldn't access
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // Get Firebase Auth token from cookies
  const sessionCookie = request.cookies.get('__session')?.value;
  const idToken = request.cookies.get('idToken')?.value;

  const isAuthenticated = !!(sessionCookie || idToken);

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
