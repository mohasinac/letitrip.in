/**
 * Token Collections Schema
 * 
 * Firestore schema definitions for token collections
 */

import { Timestamp } from 'firebase-admin/firestore';

export interface EmailVerificationTokenDocument {
  userId: string;
  email: string;
  token: string;
  expiresAt: Timestamp | Date;
  createdAt: Timestamp | Date;
}

export interface PasswordResetTokenDocument {
  userId: string;
  email: string;
  token: string;
  expiresAt: Timestamp | Date;
  createdAt: Timestamp | Date;
  used: boolean;
  usedAt?: Timestamp | Date;
}

export const EMAIL_VERIFICATION_COLLECTION = 'emailVerificationTokens' as const;
export const PASSWORD_RESET_COLLECTION = 'passwordResetTokens' as const;

/**
 * Fields that should be indexed for tokens
 * Configure in Firebase Console: Firestore Database → Indexes
 */
export const TOKEN_INDEXED_FIELDS = [
  'userId',      // For user lookup
  'email',       // For email lookup
  'expiresAt',   // For cleanup queries
  'used',        // For filtering unused tokens (password reset)
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
 */
