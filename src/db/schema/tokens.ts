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
 */
export const TOKEN_INDEXED_FIELDS = [
  'userId',
  'email',
  'expiresAt',
  'used',
] as const;
