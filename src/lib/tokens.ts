/**
 * Token Management Utilities
 *
 * Centralized token generation and validation
 */

import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { TOKEN_CONFIG, ERROR_MESSAGES } from "@/constants";
import {
  EMAIL_VERIFICATION_COLLECTION,
  PASSWORD_RESET_COLLECTION,
} from "@/db/schema";

export interface TokenData {
  userId: string;
  email: string;
  token: string;
  expiresAt: Timestamp | Date;
  createdAt: Timestamp | Date;
}

export interface PasswordResetTokenData extends TokenData {
  used: boolean;
  usedAt?: Timestamp | Date;
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Create an email verification token
 */
export async function createVerificationToken(
  userId: string,
  email: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + TOKEN_CONFIG.EMAIL_VERIFICATION.EXPIRY_MS,
  );

  await getAdminDb().collection(EMAIL_VERIFICATION_COLLECTION).doc(token).set({
    userId,
    email,
    token,
    expiresAt,
    createdAt: new Date(),
  });

  return token;
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(
  userId: string,
  email: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + TOKEN_CONFIG.PASSWORD_RESET.EXPIRY_MS,
  );

  await getAdminDb().collection(PASSWORD_RESET_COLLECTION).doc(token).set({
    userId,
    email,
    token,
    expiresAt,
    createdAt: new Date(),
    used: false,
  });

  return token;
}

/**
 * Verify and consume an email verification token
 */
export async function verifyEmailToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  const tokenDoc = await getAdminDb()
    .collection(EMAIL_VERIFICATION_COLLECTION)
    .doc(token)
    .get();

  if (!tokenDoc.exists) {
    return { valid: false, error: ERROR_MESSAGES.EMAIL.TOKEN_INVALID };
  }

  const tokenData = tokenDoc.data();

  if (!tokenData) {
    return { valid: false, error: ERROR_MESSAGES.EMAIL.TOKEN_INVALID };
  }

  // Check expiration
  const expiresAt =
    tokenData.expiresAt instanceof Date
      ? tokenData.expiresAt
      : tokenData.expiresAt.toDate();

  if (expiresAt < new Date()) {
    await getAdminDb()
      .collection(EMAIL_VERIFICATION_COLLECTION)
      .doc(token)
      .delete();
    return { valid: false, error: ERROR_MESSAGES.EMAIL.TOKEN_EXPIRED };
  }

  // Delete token after use
  await getAdminDb()
    .collection(EMAIL_VERIFICATION_COLLECTION)
    .doc(token)
    .delete();

  return { valid: true, userId: tokenData?.userId };
}

/**
 * Verify and get password reset token data
 */
export async function verifyPasswordResetToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  const tokenDoc = await getAdminDb()
    .collection(PASSWORD_RESET_COLLECTION)
    .doc(token)
    .get();

  if (!tokenDoc.exists) {
    return { valid: false, error: ERROR_MESSAGES.PASSWORD.TOKEN_INVALID };
  }

  const tokenData = tokenDoc.data();

  if (!tokenData) {
    return { valid: false, error: ERROR_MESSAGES.PASSWORD.TOKEN_INVALID };
  }

  // Check expiration
  const expiresAt =
    tokenData.expiresAt instanceof Date
      ? tokenData.expiresAt
      : tokenData.expiresAt.toDate();

  if (expiresAt < new Date()) {
    await getAdminDb()
      .collection(PASSWORD_RESET_COLLECTION)
      .doc(token)
      .delete();
    return { valid: false, error: ERROR_MESSAGES.PASSWORD.TOKEN_EXPIRED };
  }

  // Check if already used
  if (tokenData.used) {
    return { valid: false, error: ERROR_MESSAGES.PASSWORD.TOKEN_USED };
  }

  return { valid: true, userId: tokenData.userId };
}

/**
 * Mark a password reset token as used
 */
export async function markPasswordResetTokenAsUsed(
  token: string,
): Promise<void> {
  await getAdminDb().collection(PASSWORD_RESET_COLLECTION).doc(token).update({
    used: true,
    usedAt: new Date(),
  });
}

/**
 * Delete a token (cleanup on failure)
 */
export async function deleteToken(
  collection: "emailVerificationTokens" | "passwordResetTokens",
  token: string,
): Promise<void> {
  await getAdminDb().collection(collection).doc(token).delete();
}
