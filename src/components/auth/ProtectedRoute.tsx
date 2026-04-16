"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSession } from "@/contexts";
import { ROUTES, UI_LABELS } from "@/constants";
import {
  ProtectedRoute as AppkitProtectedRoute,
  type ProtectedRouteProps as AppkitProtectedRouteProps,
} from "@mohasinac/appkit/features/auth";
import { getRouteAccessConfig } from "@/constants/rbac";

/**
 * ProtectedRoute — Thin letitrip adapter
 *
 * Wraps appkit ProtectedRoute and injects consumer routes, labels, and session context.
 */

export type ProtectedRouteProps = Omit<
  AppkitProtectedRouteProps,
  "user" | "loading" | "onNavigate" | "routes" | "uiLabels"
> & {
  // Consumer can still override if needed
  routes?: AppkitProtectedRouteProps["routes"];
  uiLabels?: AppkitProtectedRouteProps["uiLabels"];
};

export function ProtectedRoute({
  children,
  routes: customRoutes,
  uiLabels: customLabels,
  ...props
}: ProtectedRouteProps) {
  const { user, loading } = useSession();
  const router = useRouter();

  const routes = {
    loginPath: ROUTES.AUTH.LOGIN,
    unauthorizedPath: ROUTES.ERRORS.UNAUTHORIZED,
    emailVerifyPath: ROUTES.AUTH.VERIFY_EMAIL,
    defaultRedirectPath: ROUTES.HOME,
    ...customRoutes,
  };

  const uiLabels = {
    accessDenied: UI_LABELS.AUTH.ACCESS_DENIED,
    unauthorizedDescription: UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION,
    goHome: UI_LABELS.ACTIONS.GO_HOME,
    ...customLabels,
  };

  return (
    <AppkitProtectedRoute
      user={user}
      loading={loading}
      onNavigate={(path) => router.push(path)}
      routes={routes}
      uiLabels={uiLabels}
      {...props}
    >
      {children}
    </AppkitProtectedRoute>
  );
}
   /**
   * withProtectedRoute — HOC to wrap a component with authentication requirements
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
      loadingComponent={loadingComponent}
    >
      {children}
    </ProtectedRoute>
  );
}

