/**
 * Token Helpers
 *
 * Business logic helpers for token operations
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate verification token
 */
export function generateVerificationToken(): string {
  return uuidv4();
}

/**
 * Generate short verification code (6 digits)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate token expiration date
 */
export function calculateTokenExpiration(hoursFromNow: number = 24): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hoursFromNow);
  return expiration;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: Date | string): boolean {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}

/**
 * Get token time remaining (in minutes)
 */
export function getTokenTimeRemaining(expiresAt: Date | string): number {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const remaining = expiry.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 60000));
}

/**
 * Mask token for display (show first 4 and last 4 characters)
 */
export function maskToken(token: string): string {
  if (token.length <= 8) return token;
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return uuidv4();
}
