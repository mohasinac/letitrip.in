/**
 * Token Repository
 *
 * Repository for email verification and password reset tokens.
 * Handles token CRUD operations and expiration checks.
 *
 * @example
 * ```ts
 * const tokenRepo = new TokenRepository();
 * const token = await tokenRepo.findEmailVerificationToken('token123');
 * ```
 */

import { BaseRepository } from "./base.repository";
import {
  EmailVerificationTokenDocument,
  PasswordResetTokenDocument,
  EMAIL_VERIFICATION_COLLECTION,
  PASSWORD_RESET_COLLECTION,
} from "@/db/schema/tokens";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { Timestamp } from "firebase-admin/firestore";

export class EmailVerificationTokenRepository extends BaseRepository<EmailVerificationTokenDocument> {
  constructor() {
    super(EMAIL_VERIFICATION_COLLECTION);
  }

  /**
   * Find token by token string
   */
  async findByToken(
    token: string,
  ): Promise<EmailVerificationTokenDocument | null> {
    return this.findOneBy("token", token);
  }

  /**
   * Find tokens by user ID
   */
  async findByUserId(
    userId: string,
  ): Promise<EmailVerificationTokenDocument[]> {
    return this.findBy("userId", userId);
  }

  /**
   * Find tokens by email
   */
  async findByEmail(email: string): Promise<EmailVerificationTokenDocument[]> {
    return this.findBy("email", email);
  }

  /**
   * Check if token is expired
   */
  isExpired(token: EmailVerificationTokenDocument): boolean {
    const expiresAt =
      token.expiresAt instanceof Timestamp
        ? token.expiresAt.toDate()
        : token.expiresAt;

    return new Date() > expiresAt;
  }

  /**
   * Delete expired tokens
   */
  async deleteExpired(): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where("expiresAt", "<", new Date())
        .get();

      const batch = this.db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return snapshot.size;
    } catch (error) {
      throw new DatabaseError("Failed to delete expired tokens", error);
    }
  }

  /**
   * Delete all tokens for a user
   */
  async deleteAllForUser(userId: string): Promise<void> {
    try {
      const tokens = await this.findByUserId(userId);
      const batch = this.db.batch();

      tokens.forEach((token) => {
        if (token.id) {
          batch.delete(this.getCollection().doc(token.id));
        }
      });

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete tokens for user: ${userId}`,
        error,
      );
    }
  }
}

export class PasswordResetTokenRepository extends BaseRepository<PasswordResetTokenDocument> {
  constructor() {
    super(PASSWORD_RESET_COLLECTION);
  }

  /**
   * Find token by token string
   */
  async findByToken(token: string): Promise<PasswordResetTokenDocument | null> {
    return this.findOneBy("token", token);
  }

  /**
   * Find tokens by user ID
   */
  async findByUserId(userId: string): Promise<PasswordResetTokenDocument[]> {
    return this.findBy("userId", userId);
  }

  /**
   * Find tokens by email
   */
  async findByEmail(email: string): Promise<PasswordResetTokenDocument[]> {
    return this.findBy("email", email);
  }

  /**
   * Check if token is expired
   */
  isExpired(token: PasswordResetTokenDocument): boolean {
    const expiresAt =
      token.expiresAt instanceof Timestamp
        ? token.expiresAt.toDate()
        : token.expiresAt;

    return new Date() > expiresAt;
  }

  /**
   * Mark token as used
   */
  async markAsUsed(tokenId: string): Promise<PasswordResetTokenDocument> {
    try {
      await this.getCollection().doc(tokenId).update({
        used: true,
        usedAt: new Date(),
        updatedAt: new Date(),
      });

      return this.findByIdOrFail(tokenId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to mark token as used: ${tokenId}`,
        error,
      );
    }
  }

  /**
   * Find unused tokens for user
   */
  async findUnusedForUser(
    userId: string,
  ): Promise<PasswordResetTokenDocument[]> {
    try {
      const snapshot = await this.getCollection()
        .where("userId", "==", userId)
        .where("used", "==", false)
        .get();

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as unknown as PasswordResetTokenDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to find unused tokens for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * Delete expired tokens
   */
  async deleteExpired(): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where("expiresAt", "<", new Date())
        .get();

      const batch = this.db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return snapshot.size;
    } catch (error) {
      throw new DatabaseError("Failed to delete expired tokens", error);
    }
  }

  /**
   * Delete all tokens for a user
   */
  async deleteAllForUser(userId: string): Promise<void> {
    try {
      const tokens = await this.findByUserId(userId);
      const batch = this.db.batch();

      tokens.forEach((token) => {
        if (token.id) {
          batch.delete(this.getCollection().doc(token.id));
        }
      });

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete tokens for user: ${userId}`,
        error,
      );
    }
  }
}

// Export singleton instances
export const emailVerificationTokenRepository =
  new EmailVerificationTokenRepository();
export const passwordResetTokenRepository = new PasswordResetTokenRepository();

// Generic token repository type
export const tokenRepository = {
  email: emailVerificationTokenRepository,
  password: passwordResetTokenRepository,
};
