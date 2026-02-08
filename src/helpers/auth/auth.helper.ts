/**
 * Authentication Helpers
 *
 * Business logic helpers for authentication operations
 */

import { UserRole } from "@/types/auth";

/**
 * Checks if a user has the required role based on role hierarchy
 *
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role
 * @returns True if the user's role meets or exceeds the required role
 *
 * @example
 * ```typescript
 * console.log(hasRole('admin', 'moderator')); // true
 * console.log(hasRole('user', 'moderator')); // false
 * ```
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 0,
    seller: 1,
    moderator: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Checks if a user has any of the specified roles
 *
 * @param userRole - The user's current role
 * @param requiredRoles - Array of acceptable roles
 * @returns True if the user's role matches any of the required roles
 *
 * @example
 * ```typescript
 * console.log(hasAnyRole('seller', ['seller', 'admin'])); // true
 * console.log(hasAnyRole('user', ['seller', 'admin'])); // false
 * ```
 */
export function hasAnyRole(
  userRole: UserRole,
  requiredRoles: UserRole[],
): boolean {
  return requiredRoles.some((role) => hasRole(userRole, role));
}

/**
 * Determines the default role for a new user based on their email
 *
 * @param email - The user's email address
 * @returns 'admin' if email is admin@letitrip.in, otherwise 'user'
 *
 * @example
 * ```typescript
 * console.log(getDefaultRole('admin@letitrip.in')); // 'admin'
 * console.log(getDefaultRole('user@example.com')); // 'user'
 * ```
 */
export function getDefaultRole(email: string): UserRole {
  return email === "admin@letitrip.in" ? "admin" : "user";
}

/**
 * Checks if a user has permission to change another user's role
 *
 * @param currentUserRole - The role of the user attempting the change
 * @param targetCurrentRole - The current role of the user being changed
 * @param targetNewRole - The new role to assign
 * @returns True if the role change is permitted
 *
 * @example
 * ```typescript
 * console.log(canChangeRole('admin', 'user', 'moderator')); // true
 * console.log(canChangeRole('moderator', 'user', 'seller')); // true
 * console.log(canChangeRole('user', 'user', 'admin')); // false
 * ```
 */
export function canChangeRole(
  currentUserRole: UserRole,
  targetCurrentRole: UserRole,
  targetNewRole: UserRole,
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 0,
    seller: 1,
    moderator: 2,
    admin: 3,
  };

  // Admins can change any role
  if (currentUserRole === "admin") return true;

  // Moderators can only promote users to sellers
  if (currentUserRole === "moderator") {
    return targetCurrentRole === "user" && targetNewRole === "seller";
  }

  // Other roles cannot change roles
  return false;
}

/**
 * Formats an authentication provider ID into a user-friendly display name
 *
 * @param provider - The provider ID (e.g., 'password', 'google.com')
 * @returns A formatted provider display name
 *
 * @example
 * ```typescript
 * console.log(formatAuthProvider('google.com')); // 'Google'
 * console.log(formatAuthProvider('password')); // 'Email/Password'
 * ```
 */
export function formatAuthProvider(provider: string): string {
  const providerNames: Record<string, string> = {
    password: "Email/Password",
    "google.com": "Google",
    "apple.com": "Apple",
    phone: "Phone",
  };

  return providerNames[provider] || provider;
}

/**
 * Checks if a session has expired
 *
 * @param expiresAt - The session expiration date (Date object or ISO string)
 * @returns True if the session has expired
 *
 * @example
 * ```typescript
 * if (isSessionExpired(session.expiresAt)) {
 *   console.log('Session expired, please log in again');
 * }
 * ```
 */
export function isSessionExpired(expiresAt: Date | string): boolean {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}

/**
 * Calculates the remaining time before a session expires
 *
 * @param expiresAt - The session expiration date (Date object or ISO string)
 * @returns The number of minutes remaining (0 if expired)
 *
 * @example
 * ```typescript
 * const remaining = getSessionTimeRemaining(session.expiresAt);
 * console.log(`Session expires in ${remaining} minutes`);
 * ```
 */
export function getSessionTimeRemaining(expiresAt: Date | string): number {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const remaining = expiry.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 60000));
}

/**
 * Generates user initials from display name or email
 *
 * @param displayName - The user's display name (optional)
 * @param email - The user's email address (optional)
 * @returns Two-character initials in uppercase
 *
 * @example
 * ```typescript
 * console.log(generateInitials('John Doe')); // 'JD'
 * console.log(generateInitials(null, 'alice@example.com')); // 'AL'
 * console.log(generateInitials()); // 'U'
 * ```
 */
export function generateInitials(
  displayName?: string | null,
  email?: string | null,
): string {
  if (displayName) {
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }

  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return "U";
}

/**
 * Calculates a password strength score from 0 to 4
 *
 * @param password - The password to evaluate
 * @returns A score from 0 (very weak) to 4 (strong)
 *
 * @example
 * ```typescript
 * console.log(calculatePasswordScore('password')); // 0
 * console.log(calculatePasswordScore('MyP@ssw0rd123')); // 4
 * ```
 */
export function calculatePasswordScore(password: string): number {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);
  if (/^(?:password|123456|qwerty)/i.test(password)) score = 0;

  return Math.min(4, Math.max(0, score));
}
