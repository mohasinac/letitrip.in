import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_CONSTANTS } from '@/constants/app';

// Define routes that require authentication
const protectedRoutes = [
  '/profile',
  '/dashboard',
  '/admin',
  '/seller',
  '/orders',
  '/cart/checkout',
];

// Define routes that redirect authenticated users away (login/register pages)
const authRoutes = ['/login', '/register'];

// Define admin-only routes
const adminRoutes = ['/admin'];

// Define seller routes (sellers and admins allowed)
const sellerRoutes = ['/seller'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Create or update session cookie if not present
  const sessionCookie = request.cookies.get(COOKIE_CONSTANTS.SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    const sessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    response.cookies.set(COOKIE_CONSTANTS.SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60,
      path: COOKIE_CONSTANTS.PATH,
    });
  }

  // Get Firebase token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const authCookie = request.cookies.get('firebase-token');
  
  const isAuthenticated = !!(authHeader?.startsWith('Bearer ') || authCookie);

  // Check if the current path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isSellerRoute = sellerRoutes.some(route => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // For role-based routes, we'll let the client-side components handle the role checking
  // since we'd need to verify the token to get user role, which is better done client-side

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
