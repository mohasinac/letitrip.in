/**
 * @fileoverview React Component
 * @module src/components/auth/AuthGuard
 * @description This file contains the AuthGuard component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { unauthorized, forbidden } from "@/lib/error-redirects";

/**
 * AuthGuardProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AuthGuardProps
 */
interface AuthGuardProps {
  /** Children */
  children: React.ReactNode;
  /** Require Auth */
  requireAuth?: boolean;
  /** Redirect To */
  redirectTo?: string;
  /** Allowed Roles */
  allowedRoles?: string[];
}

export default /**
 * Performs auth guard operation
 *
 * @param {AuthGuardProps} [{
  children,
  requireAuth = true,
  redirectTo = "/login",
  allowedRoles,
}] - The {
  children,
  requireauth = true,
  redirectto = "/login",
  allowedroles,
}
 *
 * @returns {any} The authguard result
 *
 */
function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
  allowedRoles,
}: AuthGuardProps) {
  // TODO: For unit tests, wrap AuthGuard in a test AuthProvider or provide a mock context for useAuth.
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      // Use custom redirect if provided, otherwise use unauthorized helper
      if (redirectTo !== "/login") {
        router.push(redirectTo);
      } else {
        router.push(unauthorized.notLoggedIn(pathname));
      }
      return;
    }

    if (allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        const requiredRole = allowedRoles[0]; // Use first role as primary requirement
        router.push(forbidden.wrongRole(requiredRole, user.role, pathname));
        return;
      }
    }

    setIsAuthorized(true);
  }, [
    requireAuth,
    redirectTo,
    allowedRoles,
    router,
    pathname,
    user,
    isAuthenticated,
    loading,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          role="status"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"
        ></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
