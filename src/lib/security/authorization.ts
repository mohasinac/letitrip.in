/**
 * Authorization Utilities
 */

import { UserRole } from "@/types/auth";
import { AuthorizationError } from "@/lib/errors";

/**
 * Role hierarchy (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  seller: 1,
  moderator: 2,
  admin: 3,
};

export function requireRole(user: any, roles: UserRole | UserRole[]): void {
  if (!user) {
    throw new AuthorizationError("User not authenticated");
  }

  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  const userRole = user.role || "user";

  if (!requiredRoles.includes(userRole)) {
    throw new AuthorizationError(
      "Access denied. Required role: " + requiredRoles.join(" or "),
    );
  }
}

/**
 * Check if user can modify target user's role
 * - Admin can change anyone's role (including making other admins)
 * - Moderator can only change user → seller
 */
export function canChangeRole(
  currentUserRole: UserRole,
  targetCurrentRole: UserRole,
  targetNewRole: UserRole,
): boolean {
  // Admin can do anything
  if (currentUserRole === "admin") {
    return true;
  }

  // Moderator can only change user → seller
  if (currentUserRole === "moderator") {
    return targetCurrentRole === "user" && targetNewRole === "seller";
  }

  // Others cannot change roles
  return false;
}

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}
