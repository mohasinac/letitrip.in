"use client";

import AuthGuard from "@/components/auth/AuthGuard";

/**
 * Protected Layout
 *
 * Layout for pages that require authentication.
 *
 * Features:
 * - Requires user to be authenticated (redirects to /login if not)
 * - Uses AuthGuard to protect all child routes
 * - Full-width layout (sidebars are page-specific)
 *
 * Protected pages include:
 * - User dashboard and settings
 * - Seller dashboard and management
 * - Shopping cart
 * - Checkout
 * - Support tickets
 *
 * Note: Each page (user, seller) can implement its own sidebar
 * layout. This layout keeps it simple and flexible.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard
      requireAuth={true}
      redirectTo="/login"
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      {children}
    </AuthGuard>
  );
}
