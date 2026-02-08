/**
 * Token Helpers
 *
 * Business logic helpers for token operations
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique verification token using UUID v4
 *
 * @returns A UUID v4 string to use as a verification token
 *
 * @example
 * ```typescript
 * const token = generateVerificationToken();
 * console.log(token); // 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
 * ```
 */
export function generateVerificationToken(): string {
  return uuidv4();
}

/**
 * Generates a short 6-digit verification code
 *
 * @returns A 6-digit numeric string
 *
 * @example
 * ```typescript
 * const code = generateVerificationCode();
 * console.log(code); // '123456'
 * ```
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculates a token expiration date from the current time
 *
 * @param hoursFromNow - Number of hours until expiration (default: 24)
 * @returns A Date object representing the expiration time
 *
 * @example
 * ```typescript
 * const expiresAt = calculateTokenExpiration(2);
 * console.log(expiresAt); // Date 2 hours from now
 * ```
 */
export function calculateTokenExpiration(hoursFromNow: number = 24): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hoursFromNow);
  return expiration;
}

/**
 * Checks if a token has expired
 *
 * @param expiresAt - The expiration date (Date object or ISO string)
 * @returns True if the token has expired
 *
 * @example
 * ```typescript
 * const expired = isTokenExpired(tokenData.expiresAt);
 * if (expired) {
 *   console.log('Token has expired');
 * }
 * ```
 */
export function isTokenExpired(expiresAt: Date | string): boolean {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}

/**
 * Calculates the remaining time before a token expires
 *
 * @param expiresAt - The expiration date (Date object or ISO string)
 * @returns The number of minutes remaining (0 if expired)
 *
 * @example
 * ```typescript
 * const remaining = getTokenTimeRemaining(tokenData.expiresAt);
 * console.log(`Token expires in ${remaining} minutes`);
 * ```
 */
export function getTokenTimeRemaining(expiresAt: Date | string): number {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const remaining = expiry.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 60000));
}

/**
 * Masks a token for safe display by showing only first and last 4 characters
 *
 * @param token - The token string to mask
 * @returns The masked token string
 *
 * @example
 * ```typescript
 * const masked = maskToken('a1b2c3d4e5f6g7h8i9j0');
 * console.log(masked); // 'a1b2...i9j0'
 * ```
 */
export function maskToken(token: string): string {
  if (token.length <= 8) return token;
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Generates a unique session ID using UUID v4
 *
 * @returns A UUID v4 string to use as a session identifier
 *
 * @example
 * ```typescript
 * const sessionId = generateSessionId();
 * console.log(sessionId); // 'f1e2d3c4-b5a6-7890-abcd-ef1234567890'
 * ```
 */
export function generateSessionId(): string {
  return uuidv4();
}
