/**
 * Authentication Helpers
 *
 * Business logic helpers for authentication operations
 */

import { UserRole } from "@/types/auth";

/**
 * Check if user has required role
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
 * Check if user has any of the required roles
 */
export function hasAnyRole(
  userRole: UserRole,
  requiredRoles: UserRole[],
): boolean {
  return requiredRoles.some((role) => hasRole(userRole, role));
}

/**
 * Get default role based on email
 */
export function getDefaultRole(email: string): UserRole {
  return email === "admin@letitrip.in" ? "admin" : "user";
}

/**
 * Check if user can change another user's role
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
 * Format auth provider display name
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
 * Check if session is expired
 */
export function isSessionExpired(expiresAt: Date | string): boolean {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}

/**
 * Calculate session time remaining (in minutes)
 */
export function getSessionTimeRemaining(expiresAt: Date | string): number {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const remaining = expiry.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 60000));
}

/**
 * Generate initials from display name or email
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
 * Calculate password strength score
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
