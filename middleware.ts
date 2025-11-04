import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/app/(backend)/api/_lib/auth/session";

// Define routes that require authentication
const protectedRoutes = [
  "/profile",
  "/dashboard",
  "/admin",
  "/seller",
  "/orders",
  "/cart/checkout",
];

// Define public routes that don't require authentication (even if under protected paths)
const publicRoutes = ["/profile/track-order"];

// Define routes that redirect authenticated users away (login/register pages)
const authRoutes = ["/login", "/register"];

// Define admin-only routes
const adminRoutes = ["/admin"];

// Define seller routes (sellers and admins allowed)
const sellerRoutes = ["/seller"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Get session from HTTP-only cookie
  const session = getSessionFromRequest(request);
  const isAuthenticated = !!session;

  // Check if the current path requires authentication
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isSellerRoute = sellerRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Redirect unauthenticated users away from protected routes (unless it's a public route)
  if (isProtectedRoute && !isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Check admin access
  if (isAdminRoute && isAuthenticated && session.role !== 'admin') {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check seller access
  if (isSellerRoute && isAuthenticated && !['seller', 'admin'].includes(session.role)) {
    return NextResponse.redirect(new URL("/", request.url));
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
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
