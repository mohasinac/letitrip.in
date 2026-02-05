/**
 * Protected Route Wrapper
 *
 * Higher-order component to protect routes.
 * Redirects to login if user is not authenticated.
 * Optionally checks for specific roles.
 */

"use client";

import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types/auth";
import { Spinner } from "@/components";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect if not authenticated
    if (!user) {
      router.push(`${redirectTo}?callbackUrl=${window.location.pathname}`);
      return;
    }

    // Check role if required
    if (requiredRole) {
      const userRole = user.role as UserRole;
      const allowedRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

      if (!allowedRoles.includes(userRole)) {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, router, requiredRole, redirectTo]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  // Check role before rendering
  if (requiredRole) {
    const userRole = user.role as UserRole;
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has required role
 */
export function useRequireRole(requiredRole: UserRole | UserRole[]) {
  const { user } = useAuth();

  if (!user) return false;

  const userRole = user.role as UserRole;
  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  return allowedRoles.includes(userRole);
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, loading } = useAuth();

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!session,
    role: (session?.user as any)?.role as UserRole | undefined,
  };
}
