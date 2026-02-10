/**
 * Enhanced Role-Based Authentication Hooks
 *
 * Additional hooks for role checking and access control
 */

"use client";

import { useSession } from "@/contexts";
import { UserRole } from "@/types/auth";
import { hasRouteAccess, isAdmin, isModerator, isSeller } from "@/constants";
import { hasRole as checkRoleHierarchy } from "@/helpers/auth";
import { useCallback, useMemo } from "react";

/**
 * Hook to check if user has specific role(s)
 * Supports role hierarchy - higher roles include lower role permissions
 */
export function useHasRole(role: UserRole | UserRole[]): boolean {
  const { user } = useSession();

  if (!user) return false;

  const userRole = user.role as UserRole;
  const roles = Array.isArray(role) ? role : [role];

  // Check if user role meets any of the required roles using hierarchy
  return roles.some((requiredRole) =>
    checkRoleHierarchy(userRole, requiredRole),
  );
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
  const { user } = useSession();
  return isAdmin(user);
}

/**
 * Hook to check if current user is moderator or admin
 */
export function useIsModerator(): boolean {
  const { user } = useSession();
  return isModerator(user);
}

/**
 * Hook to check if current user is seller or above
 */
export function useIsSeller(): boolean {
  const { user } = useSession();
  return isSeller(user);
}

/**
 * Hook to check if user can access a specific route
 */
export function useCanAccess(path: string): {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
} {
  const { user } = useSession();

  return hasRouteAccess(
    user
      ? {
          role: user.role,
          emailVerified: user.emailVerified,
          disabled: user.disabled,
        }
      : null,
    path,
  );
}

/**
 * Hook to get role-specific data
 * Returns useful role checks in one object
 */
export function useRoleChecks() {
  const { user } = useSession();

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user) return false;
      const userRole = user.role as UserRole;
      const roles = Array.isArray(role) ? role : [role];
      return roles.some((requiredRole) =>
        checkRoleHierarchy(userRole, requiredRole),
      );
    },
    [user],
  );

  return useMemo(
    () => ({
      isAuthenticated: !!user,
      isAdmin: isAdmin(user),
      isModerator: isModerator(user),
      isSeller: isSeller(user),
      isUser: !!user && user.role === "user",
      role: user?.role || null,
      hasRole,
    }),
    [user, hasRole],
  );
}

/**
 * Hook for ownership checking
 * Useful for protecting resources owned by specific users
 */
export function useIsOwner(
  resourceOwnerId: string | null | undefined,
): boolean {
  const { user } = useSession();

  if (!user || !resourceOwnerId) return false;

  // Admin can access everything
  if (isAdmin(user)) return true;

  // Check if user owns the resource
  return user.uid === resourceOwnerId;
}

/**
 * Hook to requireauth and throw if not authenticated
 * Useful for enforcing authentication in components
 */
export function useRequireAuth(): {
  user: NonNullable<ReturnType<typeof useSession>["user"]>;
  loading: boolean;
} {
  const { user, loading } = useSession();

  if (!loading && !user) {
    throw new Error("Authentication required");
  }

  return {
    user: user!,
    loading,
  };
}

/**
 * Hook to require specific role and throw if not authorized
 */
export function useRequireRole(role: UserRole | UserRole[]): {
  user: NonNullable<ReturnType<typeof useSession>["user"]>;
  loading: boolean;
} {
  const { user, loading } = useRequireAuth();

  if (!loading && user) {
    const roles = Array.isArray(role) ? role : [role];
    const userRole = (user.role as UserRole) || "user";

    if (!roles.includes(userRole)) {
      throw new Error("Insufficient permissions");
    }
  }

  return { user, loading };
}
