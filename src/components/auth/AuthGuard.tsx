"use client";

import { useAuth } from "@/contexts/AuthContext";
import { forbidden, unauthorized } from "@/lib/error-redirects";
import {
  hasAllPermissions,
  hasPermission,
  Permission,
} from "@/lib/permissions";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  /**
   * @deprecated Use requiredPermissions instead for granular access control
   */
  allowedRoles?: string[];
  /**
   * Required permissions - user must have at least one permission (OR logic)
   * For AND logic (all permissions required), use requiredPermissionsAll
   */
  requiredPermissions?: Permission | Permission[];
  /**
   * Required permissions - user must have all permissions (AND logic)
   */
  requiredPermissionsAll?: Permission[];
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Custom unauthorized component
   */
  unauthorizedComponent?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
  allowedRoles,
  requiredPermissions,
  requiredPermissionsAll,
  loadingComponent,
  unauthorizedComponent,
}: AuthGuardProps) {
  // TODO: For unit tests, wrap AuthGuard in a test AuthProvider or provide a mock context for useAuth.
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  useEffect(() => {
    if (loading) {
      setIsCheckingPermissions(true);
      return;
    }

    setIsCheckingPermissions(true);

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      // Use custom redirect if provided, otherwise use unauthorized helper
      if (redirectTo !== "/login") {
        router.push(redirectTo);
      } else {
        router.push(unauthorized.notLoggedIn(pathname));
      }
      setIsCheckingPermissions(false);
      return;
    }

    // Check permission requirements (new granular system)
    if (requiredPermissions && user) {
      const hasRequiredPermission = hasPermission(user, requiredPermissions);
      if (!hasRequiredPermission) {
        router.push(forbidden.insufficientPermissions(pathname));
        setIsCheckingPermissions(false);
        return;
      }
    }

    // Check all permissions required (AND logic)
    if (requiredPermissionsAll && user) {
      const hasAllRequired = hasAllPermissions(user, requiredPermissionsAll);
      if (!hasAllRequired) {
        router.push(forbidden.insufficientPermissions(pathname));
        setIsCheckingPermissions(false);
        return;
      }
    }

    // Legacy role-based check (deprecated but kept for backwards compatibility)
    if (allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        const requiredRole = allowedRoles[0]; // Use first role as primary requirement
        router.push(forbidden.wrongRole(requiredRole, user.role, pathname));
        setIsCheckingPermissions(false);
        return;
      }
    }

    setIsAuthorized(true);
    setIsCheckingPermissions(false);
  }, [
    requireAuth,
    redirectTo,
    allowedRoles,
    requiredPermissions,
    requiredPermissionsAll,
    router,
    pathname,
    user,
    isAuthenticated,
    loading,
  ]);

  // Show loading state
  if (loading || isCheckingPermissions) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          role="status"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }
    return null;
  }

  return <>{children}</>;
}
