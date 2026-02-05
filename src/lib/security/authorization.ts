/**
 * Authorization Utilities
 * 
 * Helper functions for checking user permissions and roles.
 * Use these in API routes and middleware for access control.
 * 
 * @example
 * ```ts
 * import { requireAuth, requireRole, can } from '@/lib/security';
 * 
 * export async function GET(request: Request) {
 *   const user = await requireAuth(request);
 *   await requireRole(user, 'admin');
 *   // ... handle request
 * }
 * ```
 */

import { auth } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import { userRepository } from '@/repositories';

/**
 * Get current user session or throw error
 */
export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    throw new AuthenticationError('Authentication required');
  }

  return session.user;
}

/**
 * Check if user has required role
 */
export async function requireRole(userId: string, requiredRole: UserRole | UserRole[]) {
  const user = await userRepository.findByIdOrFail(userId);

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(user.role)) {
    throw new AuthorizationError(`Requires one of: ${roles.join(', ')}`);
  }

  return user;
}

/**
 * Check if user is admin
 */
export async function requireAdmin(userId: string) {
  return requireRole(userId, 'admin');
}

/**
 * Check if user owns the resource
 */
export function requireOwnership(userId: string, resourceOwnerId: string) {
  if (userId !== resourceOwnerId) {
    throw new AuthorizationError('You do not own this resource');
  }
}

/**
 * Check if user can perform action (ownership OR admin)
 */
export async function canModifyResource(userId: string, resourceOwnerId: string): Promise<boolean> {
  try {
    // Check if user is admin
    const user = await userRepository.findByIdOrFail(userId);
    if (user.role === 'admin') {
      return true;
    }

    // Check if user owns the resource
    return userId === resourceOwnerId;
  } catch {
    return false;
  }
}

/**
 * Require user to own resource OR be admin
 */
export async function requireOwnershipOrAdmin(userId: string, resourceOwnerId: string) {
  const allowed = await canModifyResource(userId, resourceOwnerId);
  
  if (!allowed) {
    throw new AuthorizationError('Insufficient permissions');
  }
}

/**
 * Check if user account is active
 */
export async function requireActiveAccount(userId: string) {
  const user = await userRepository.findByIdOrFail(userId);

  if (user.disabled) {
    throw new AuthorizationError('Account is disabled');
  }

  return user;
}

/**
 * Check if user email is verified
 */
export async function requireVerifiedEmail(userId: string) {
  const user = await userRepository.findByIdOrFail(userId);

  if (!user.emailVerified) {
    throw new AuthorizationError('Email verification required');
  }

  return user;
}

/**
 * Permission checker
 */
export interface PermissionCheck {
  userId: string;
  resourceOwnerId?: string;
  requiredRole?: UserRole | UserRole[];
  requireVerified?: boolean;
  requireActive?: boolean;
}

/**
 * Check multiple permissions at once
 */
export async function checkPermissions(check: PermissionCheck) {
  const user = await userRepository.findByIdOrFail(check.userId);

  // Check if account is active
  if (check.requireActive && user.disabled) {
    throw new AuthorizationError('Account is disabled');
  }

  // Check if email is verified
  if (check.requireVerified && !user.emailVerified) {
    throw new AuthorizationError('Email verification required');
  }

  // Check role
  if (check.requiredRole) {
    const roles = Array.isArray(check.requiredRole) ? check.requiredRole : [check.requiredRole];
    if (!roles.includes(user.role)) {
      throw new AuthorizationError(`Requires one of: ${roles.join(', ')}`);
    }
  }

  // Check ownership
  if (check.resourceOwnerId) {
    const canModify = await canModifyResource(check.userId, check.resourceOwnerId);
    if (!canModify) {
      throw new AuthorizationError('Insufficient permissions');
    }
  }

  return user;
}

/**
 * Role hierarchy
 */
const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  moderator: 5,
  admin: 10,
};

/**
 * Check if user role is higher than or equal to required role
 */
export async function hasRoleLevel(userId: string, minRole: UserRole): Promise<boolean> {
  try {
    const user = await userRepository.findByIdOrFail(userId);
    return roleHierarchy[user.role] >= roleHierarchy[minRole];
  } catch {
    return false;
  }
}
