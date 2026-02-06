/**
 * Token Collections Schema
 *
 * Firestore schema definitions for token collections
 */

import { Timestamp } from "firebase-admin/firestore";

export interface EmailVerificationTokenDocument {
  id?: string; // Document ID (optional, added by Firestore)
  userId: string;
  email: string;
  token: string;
  expiresAt: Timestamp | Date;
  createdAt: Timestamp | Date;
}

export interface PasswordResetTokenDocument {
  id?: string; // Document ID (optional, added by Firestore)
  userId: string;
  email: string;
  token: string;
  expiresAt: Timestamp | Date;
  createdAt: Timestamp | Date;
  used: boolean;
  usedAt?: Timestamp | Date;
}

export const EMAIL_VERIFICATION_COLLECTION = "emailVerificationTokens" as const;
export const PASSWORD_RESET_COLLECTION = "passwordResetTokens" as const;

/**
 * Fields that should be indexed for tokens
 * Configure in Firebase Console: Firestore Database → Indexes
 */
export const TOKEN_INDEXED_FIELDS = [
  "userId", // For user lookup
  "email", // For email lookup
  "expiresAt", // For cleanup queries
  "used", // For filtering unused tokens (password reset)
] as const;

/**
 * RELATIONSHIPS:
 *
 * emailVerificationTokens (N) ----< (1) users
 * passwordResetTokens (N) ----< (1) users
 *
 * Foreign Key Pattern (Firestore):
 * - emailVerificationTokens/{tokenId}.userId references users/{uid}
 * - passwordResetTokens/{tokenId}.userId references users/{uid}
 *
 * CASCADE BEHAVIOR:
 * - When user deleted: delete all associated tokens
 */

// ============================================
// HELPER CONSTANTS
// ============================================

/**
 * Default data for new email verification tokens
 */
export const DEFAULT_EMAIL_VERIFICATION_TOKEN_DATA: Partial<EmailVerificationTokenDocument> =
  {};

/**
 * Default data for new password reset tokens
 */
export const DEFAULT_PASSWORD_RESET_TOKEN_DATA: Partial<PasswordResetTokenDocument> =
  {
    used: false,
  };

/**
 * Fields that are publicly readable (none - tokens are private)
 */
export const TOKEN_PUBLIC_FIELDS = [] as const;

/**
 * Fields that can be updated after creation
 */
export const TOKEN_UPDATABLE_FIELDS = ["used", "usedAt"] as const;

// ============================================
// TYPE UTILITIES
// ============================================

/**
 * Type for creating email verification tokens
 */
export type EmailVerificationTokenCreateInput = Omit<
  EmailVerificationTokenDocument,
  "id" | "createdAt"
>;

/**
 * Type for creating password reset tokens
 */
export type PasswordResetTokenCreateInput = Omit<
  PasswordResetTokenDocument,
  "id" | "createdAt" | "used" | "usedAt"
>;

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Firestore query helper functions for tokens
 * Use with Firestore where() clauses
 *
 * @example
 * ```typescript
 * import { collection, query } from 'firebase-admin/firestore';
 * import { EMAIL_VERIFICATION_COLLECTION, tokenQueryHelpers } from '@/db/schema/tokens';
 *
 * const tokensRef = collection(db, EMAIL_VERIFICATION_COLLECTION);
 * const q = query(tokensRef, tokenQueryHelpers.byUserId('user123'));
 * ```
 */
export const tokenQueryHelpers = {
  byUserId: (userId: string) => ["userId", "==", userId] as const,
  byEmail: (email: string) => ["email", "==", email] as const,
  byToken: (token: string) => ["token", "==", token] as const,
  unused: () => ["used", "==", false] as const,
  expired: (now: Date) => ["expiresAt", "<", now] as const,
} as const;
