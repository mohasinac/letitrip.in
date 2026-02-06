/**
 * Authorization Utilities
 */

import { UserRole } from "@/types/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

/**
 * Role hierarchy (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  seller: 1,
  moderator: 2,
  admin: 3,
};

export function requireAuth(user: unknown): void {
  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.USER.NOT_AUTHENTICATED);
  }
}

export function requireRole(
  user: Record<string, unknown> | null | undefined,
  roles: UserRole | UserRole[],
): void {
  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.USER.NOT_AUTHENTICATED);
  }

  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  const userRole = (user.role as UserRole) || "user";

  if (!requiredRoles.includes(userRole)) {
    throw new AuthorizationError(ERROR_MESSAGES.AUTH.FORBIDDEN);
  }
}

export function requireOwnership(
  user: Record<string, unknown> | null | undefined,
  resourceOwnerId: string,
): void {
  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.USER.NOT_AUTHENTICATED);
  }
  if (user.uid !== resourceOwnerId) {
    throw new AuthorizationError(ERROR_MESSAGES.AUTH.FORBIDDEN);
  }
}

export function requireEmailVerified(
  user: Record<string, unknown> | null | undefined,
): void {
  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.USER.NOT_AUTHENTICATED);
  }
  if (!user.emailVerified) {
    throw new AuthorizationError(ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED);
  }
}

export function requireActiveAccount(
  user: Record<string, unknown> | null | undefined,
): void {
  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.USER.NOT_AUTHENTICATED);
  }
  if (user.disabled) {
    throw new AuthorizationError(ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED);
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
