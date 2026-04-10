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

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSession } from "@/contexts";
import { getRouteAccessConfig, ROUTES, UI_LABELS } from "@/constants";
import { UserRole } from "@/types/auth";
import { Heading, Text } from "@mohasinac/appkit/ui";
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

  // Compute authorization synchronously — all inputs are already available in state.
  // When `initialUser` is provided by the server, `loading` starts as `false` so
  // authorized users never see a spinner on any navigation.
  const { isAuthorized, redirectPath } = useMemo(() => {
    if (loading) return { isAuthorized: null, redirectPath: null };

    if (requireAuth && !user) {
      return {
        isAuthorized: false,
        redirectPath: redirectTo ?? ROUTES.AUTH.LOGIN,
      };
    }

    if (!requireAuth && !user) {
      return { isAuthorized: true, redirectPath: null };
    }

    if (user) {
      if (requireActiveAccount && user.disabled) {
        return {
          isAuthorized: false,
          redirectPath: redirectTo ?? ROUTES.ERRORS.UNAUTHORIZED,
        };
      }

      if (requireEmailVerified && !user.emailVerified) {
        return {
          isAuthorized: false,
          redirectPath: redirectTo ?? ROUTES.AUTH.VERIFY_EMAIL,
        };
      }

      if (requireRole) {
        const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
        const userRole = (user.role as UserRole) || UI_LABELS.AUTH.DEFAULT_ROLE;
        if (!roles.includes(userRole)) {
          return {
            isAuthorized: false,
            redirectPath: redirectTo ?? ROUTES.ERRORS.UNAUTHORIZED,
          };
        }
      }

      return { isAuthorized: true, redirectPath: null };
    }

    return { isAuthorized: true, redirectPath: null };
  }, [
    user,
    loading,
    requireAuth,
    requireRole,
    requireEmailVerified,
    requireActiveAccount,
    redirectTo,
  ]);

  // Side-effect: navigate away when not authorized
  useEffect(() => {
    if (isAuthorized === false && redirectPath && !showUnauthorized) {
      router.push(redirectPath);
    }
  }, [isAuthorized, redirectPath, router, showUnauthorized]);

  // Still resolving auth state
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
          <Heading
            level={1}
            className={`${THEME_CONSTANTS.typography.h3} mb-4`}
          >
            {UI_LABELS.AUTH.ACCESS_DENIED}
          </Heading>
          <Text variant="secondary" className="mb-8">
            {UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION}
          </Text>
          <Button onClick={() => router.push(ROUTES.HOME)} variant="primary">
            {UI_LABELS.ACTIONS.GO_HOME}
          </Button>
        </div>
      </div>
    );
  }

  // Not authorized — redirect is in progress, render nothing
  if (isAuthorized === false) {
    return null;
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
