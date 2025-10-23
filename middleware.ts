import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/seller',
  '/account',
  '/orders',
  '/checkout',
  '/profile',
  '/settings',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
];

// Seller routes (accessible by both admin and seller)
const sellerRoutes = [
  '/seller',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and public routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') ||
    pathname === '/test-roles' ||
    pathname === '/test-navigation' ||
    pathname === '/test-auth'
  ) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  let user = null;

  if (token) {
    try {
      user = verifyToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isSellerRoute = sellerRoutes.some(route => pathname.startsWith(route));

  // Handle authentication
  if (isProtectedRoute) {
    if (!user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin access
    if (isAdminRoute && user.role !== 'admin') {
      console.log(`Admin access denied for user role: ${user.role} on path: ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Check seller access (admin and seller can access)
    if (isSellerRoute && !['admin', 'seller'].includes(user.role)) {
      console.log(`Seller access denied for user role: ${user.role} on path: ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Add user info to headers for server components (optional)
  const response = NextResponse.next();
  if (user) {
    response.headers.set('x-user-id', user.userId);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-email', user.email);
  }

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
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
