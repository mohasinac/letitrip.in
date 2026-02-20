/**
 * Role-Based Access Control (RBAC) Configuration
 *
 * Centralized configuration for page/route access control based on user roles.
 * Defines which roles can access which routes and components.
 */

import { UserRole } from "@/types/auth";
import { ROUTES } from "./routes";
import { UI_LABELS } from "./ui";
import { hasRole as checkRoleHierarchy } from "@/helpers";

/**
 * Role hierarchy (higher number = more permissions)
 * Used for role comparison and permission checking
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  seller: 1,
  moderator: 2,
  admin: 3,
} as const;

/**
 * Route access configuration
 */
export interface RouteAccessConfig {
  path: string;
  allowedRoles: UserRole[];
  requireEmailVerified?: boolean;
  requireActiveAccount?: boolean;
  redirectTo?: string; // Where to redirect unauthorized users
}

/**
 * RBAC Configuration for all protected routes
 *
 * Key principles:
 * - Public routes (not listed here) are accessible to all
 * - Protected routes require authentication
 * - Admin routes require admin role
 * - Seller routes require seller or admin role
 * - Moderator routes require moderator or admin role
 */
export const RBAC_CONFIG: Record<string, RouteAccessConfig> = {
  // ============================================================================
  // User Routes - Require authentication
  // ============================================================================
  [ROUTES.USER.PROFILE]: {
    path: ROUTES.USER.PROFILE,
    allowedRoles: ["user", "seller", "moderator", "admin"],
    requireEmailVerified: false,
    requireActiveAccount: true,
    redirectTo: ROUTES.AUTH.LOGIN,
  },
  [ROUTES.USER.SETTINGS]: {
    path: ROUTES.USER.SETTINGS,
    allowedRoles: ["user", "seller", "moderator", "admin"],
    requireEmailVerified: false,
    requireActiveAccount: true,
    redirectTo: ROUTES.AUTH.LOGIN,
  },
  [ROUTES.USER.ORDERS]: {
    path: ROUTES.USER.ORDERS,
    allowedRoles: ["user", "seller", "moderator", "admin"],
    requireEmailVerified: true, // Require verified email for orders
    requireActiveAccount: true,
    redirectTo: ROUTES.AUTH.LOGIN,
  },
  [ROUTES.USER.WISHLIST]: {
    path: ROUTES.USER.WISHLIST,
    allowedRoles: ["user", "seller", "moderator", "admin"],
    requireEmailVerified: false,
    requireActiveAccount: true,
    redirectTo: ROUTES.AUTH.LOGIN,
  },
  [ROUTES.USER.NOTIFICATIONS]: {
    path: ROUTES.USER.NOTIFICATIONS,
    allowedRoles: ["user", "seller", "moderator", "admin"],
    requireEmailVerified: false,
    requireActiveAccount: true,
    redirectTo: ROUTES.AUTH.LOGIN,
  },
  [ROUTES.USER.ADDRESSES]: {
    path: ROUTES.USER.ADDRESSES,
    allowedRoles: ["user", "seller", "moderator", "admin"],
    requireEmailVerified: false,
    requireActiveAccount: true,
    redirectTo: ROUTES.AUTH.LOGIN,
  },

  // ============================================================================
  // Admin Routes - Require admin role
  // ============================================================================
  [ROUTES.ADMIN.DASHBOARD]: {
    path: ROUTES.ADMIN.DASHBOARD,
    allowedRoles: ["admin"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.USERS]: {
    path: ROUTES.ADMIN.USERS,
    allowedRoles: ["admin", "moderator"], // Moderators can view users
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.SITE]: {
    path: ROUTES.ADMIN.SITE,
    allowedRoles: ["admin"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.CAROUSEL]: {
    path: ROUTES.ADMIN.CAROUSEL,
    allowedRoles: ["admin", "moderator"], // Moderators can manage content
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.SECTIONS]: {
    path: ROUTES.ADMIN.SECTIONS,
    allowedRoles: ["admin", "moderator"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.CATEGORIES]: {
    path: ROUTES.ADMIN.CATEGORIES,
    allowedRoles: ["admin", "moderator"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.FAQS]: {
    path: ROUTES.ADMIN.FAQS,
    allowedRoles: ["admin", "moderator"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.REVIEWS]: {
    path: ROUTES.ADMIN.REVIEWS,
    allowedRoles: ["admin", "moderator"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.BIDS]: {
    path: ROUTES.ADMIN.BIDS,
    allowedRoles: ["admin", "moderator"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
  [ROUTES.ADMIN.BLOG]: {
    path: ROUTES.ADMIN.BLOG,
    allowedRoles: ["admin", "moderator"],
    requireEmailVerified: true,
    requireActiveAccount: true,
    redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
  },
};

/**
 * Get access configuration for a route
 */
export function getRouteAccessConfig(path: string): RouteAccessConfig | null {
  // Exact match
  if (RBAC_CONFIG[path]) {
    return RBAC_CONFIG[path];
  }

  // Check for prefix match (e.g., /admin/users/123 matches /admin/users)
  const matchingRoute = Object.keys(RBAC_CONFIG).find((route) =>
    path.startsWith(route),
  );

  return matchingRoute ? RBAC_CONFIG[matchingRoute] : null;
}

/**
 * Check if user has access to a route
 */
export function hasRouteAccess(
  user: {
    role: string;
    emailVerified: boolean;
    disabled?: boolean;
  } | null,
  path: string,
): { allowed: boolean; reason?: string; redirectTo?: string } {
  const config = getRouteAccessConfig(path);

  // No config = public route = allow
  if (!config) {
    return { allowed: true };
  }

  // User not authenticated
  if (!user) {
    return {
      allowed: false,
      reason: UI_LABELS.AUTH.AUTHENTICATION_REQUIRED,
      redirectTo: config.redirectTo || ROUTES.AUTH.LOGIN,
    };
  }

  // Check if account is active
  if (config.requireActiveAccount && user.disabled) {
    return {
      allowed: false,
      reason: UI_LABELS.AUTH.ACCOUNT_DISABLED,
      redirectTo: ROUTES.ERRORS.UNAUTHORIZED,
    };
  }

  // Check email verification
  if (config.requireEmailVerified && !user.emailVerified) {
    return {
      allowed: false,
      reason: UI_LABELS.AUTH.EMAIL_VERIFICATION_REQUIRED_SHORT,
      redirectTo: ROUTES.AUTH.VERIFY_EMAIL,
    };
  }

  // Check role
  const userRole = (user.role as UserRole) || UI_LABELS.AUTH.DEFAULT_ROLE;
  if (!config.allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: UI_LABELS.AUTH.INSUFFICIENT_PERMISSIONS,
      redirectTo: config.redirectTo || ROUTES.ERRORS.UNAUTHORIZED,
    };
  }

  return { allowed: true };
}

/**
 * Check if user is admin
 */
export function isAdmin(user: { role: string } | null): boolean {
  if (!user) return false;
  return user.role === "admin";
}

/**
 * Check if user is at least moderator (moderator or admin)
 * Uses role hierarchy from auth helpers
 */
export function isModerator(user: { role: string } | null): boolean {
  if (!user) return false;
  const userRole = user.role as UserRole;
  return checkRoleHierarchy(userRole, "moderator");
}

/**
 * Check if user is seller or above (seller, moderator, or admin)
 * Uses role hierarchy from auth helpers
 */
export function isSeller(user: { role: string } | null): boolean {
  if (!user) return false;
  const userRole = user.role as UserRole;
  return checkRoleHierarchy(userRole, "seller");
}

/**
 * Get all protected routes
 */
export function getProtectedRoutes(): string[] {
  return Object.keys(RBAC_CONFIG);
}

/**
 * Get routes accessible by role
 */
export function getRoutesByRole(role: UserRole): string[] {
  return Object.values(RBAC_CONFIG)
    .filter((config) => config.allowedRoles.includes(role))
    .map((config) => config.path);
}
