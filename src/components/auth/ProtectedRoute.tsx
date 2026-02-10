/**
 * Protected Route Component
 *
 * Wraps pages/components to enforce role-based access control.
 * Automatically redirects unauthorized users to appropriate pages.
 *
 * @example
 * ```tsx
 * <ProtectedRoute requireAuth requireRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 * ```
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/contexts";
import {
  hasRouteAccess,
  getRouteAccessConfig,
  ROUTES,
  UI_LABELS,
} from "@/constants";
import { UserRole } from "@/types/auth";
import { Spinner, Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;

  // Require authentication (default: true if any role is specified)
  requireAuth?: boolean;

  // Required role(s) - if not specified, any authenticated user can access
  requireRole?: UserRole | UserRole[];

  // Require email verification
  requireEmailVerified?: boolean;

  // Require active (not disabled) account
  requireActiveAccount?: boolean;

  // Custom redirect path (overrides RBAC config)
  redirectTo?: string;

  // Show loading state while checking auth
  loadingComponent?: React.ReactNode;

  // Show unauthorized message instead of redirecting
  showUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  requireEmailVerified = false,
  requireActiveAccount = true,
  redirectTo,
  loadingComponent,
  showUnauthorized = false,
}: ProtectedRouteProps) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Wait for loading to complete
    if (loading) {
      return;
    }

    // Check if authentication is required
    if (requireAuth && !user) {
      setIsAuthorized(false);
      setRedirectPath(redirectTo || ROUTES.AUTH.LOGIN);
      return;
    }

    // If authentication not required and no user, allow access
    if (!requireAuth && !user) {
      setIsAuthorized(true);
      return;
    }

    // User is authenticated, check other requirements
    if (user) {
      // Check active account
      if (requireActiveAccount && user.disabled) {
        setIsAuthorized(false);
        setRedirectPath(redirectTo || ROUTES.ERRORS.UNAUTHORIZED);
        return;
      }

      // Check email verification
      if (requireEmailVerified && !user.emailVerified) {
        setIsAuthorized(false);
        setRedirectPath(redirectTo || ROUTES.AUTH.VERIFY_EMAIL);
        return;
      }

      // Check role if specified
      if (requireRole) {
        const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
        const userRole = (user.role as UserRole) || UI_LABELS.AUTH.DEFAULT_ROLE;

        if (!roles.includes(userRole)) {
          setIsAuthorized(false);
          setRedirectPath(redirectTo || ROUTES.ERRORS.UNAUTHORIZED);
          return;
        }
      }

      // All checks passed
      setIsAuthorized(true);
      return;
    }

    // Default to authorized if we get here
    setIsAuthorized(true);
  }, [
    user,
    loading,
    requireAuth,
    requireRole,
    requireEmailVerified,
    requireActiveAccount,
    redirectTo,
  ]);

  // Redirect if not authorized
  useEffect(() => {
    if (isAuthorized === false && redirectPath && !showUnauthorized) {
      router.push(redirectPath);
    }
  }, [isAuthorized, redirectPath, router, showUnauthorized]);

  // Show loading state
  if (loading || isAuthorized === null) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div
        className={`${THEME_CONSTANTS.layout.fullScreen} ${THEME_CONSTANTS.layout.flexCenter}`}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  // Show unauthorized message if requested
  if (isAuthorized === false && showUnauthorized) {
    return (
      <div
        className={`${THEME_CONSTANTS.layout.fullScreen} ${THEME_CONSTANTS.layout.flexCenter} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className={THEME_CONSTANTS.layout.centerText}>
          <h1
            className={`${THEME_CONSTANTS.typography.h3} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.spacing.margin.bottom.md}`}
          >
            {UI_LABELS.AUTH.ACCESS_DENIED}
          </h1>
          <p
            className={`${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.spacing.margin.bottom.xl}`}
          >
            {UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION}
          </p>
          <Button onClick={() => router.push(ROUTES.HOME)} variant="primary">
            {UI_LABELS.ACTIONS.GO_HOME}
          </Button>
        </div>
      </div>
    );
  }

  // Not authorized and should redirect (in progress)
  if (isAuthorized === false) {
    return (
      <div
        className={`${THEME_CONSTANTS.layout.fullScreen} ${THEME_CONSTANTS.layout.flexCenter}`}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 *
 * @example
 * ```tsx
 * export default withProtectedRoute(AdminDashboard, { requireRole: "admin" });
 * ```
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, "children">,
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Route-based protection using RBAC config
 * Automatically determines requirements based on current route
 *
 * @example
 * ```tsx
 * <RouteProtection>
 *   <PageContent />
 * </RouteProtection>
 * ```
 */
export function RouteProtection({
  children,
  loadingComponent,
}: {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  const pathname = usePathname();
  const config = getRouteAccessConfig(pathname);

  // No config = public route
  if (!config) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute
      requireAuth={true}
      requireRole={config.allowedRoles}
      requireEmailVerified={config.requireEmailVerified}
      requireActiveAccount={config.requireActiveAccount}
      redirectTo={config.redirectTo}
      loadingComponent={loadingComponent}
    >
      {children}
    </ProtectedRoute>
  );
}
