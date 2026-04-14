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
  TOKEN_FIELDS,
} from "@/db/schema";
import { DatabaseError } from "@mohasinac/appkit/errors";
import { resolveDate } from "@/utils";
import {
  encryptPiiFields,
  decryptPiiFields,
  addPiiIndices,
  piiBlindIndex,
  TOKEN_PII_FIELDS,
  TOKEN_PII_INDEX_MAP,
} from "@/lib/pii";

export class EmailVerificationTokenRepository extends BaseRepository<EmailVerificationTokenDocument> {
  constructor() {
    super(EMAIL_VERIFICATION_COLLECTION);
  }

  /** Override mapDoc to auto-decrypt PII on every token read */
  protected override mapDoc<D = EmailVerificationTokenDocument>(
    snap: import("firebase-admin/firestore").DocumentSnapshot,
  ): D {
    const raw = super.mapDoc<EmailVerificationTokenDocument>(snap);
    return decryptPiiFields(raw as unknown as Record<string, unknown>, [
      ...TOKEN_PII_FIELDS,
    ]) as unknown as D;
  }

  /** Encrypt token PII and add blind index before writing */
  override async create(
    data: Partial<EmailVerificationTokenDocument>,
  ): Promise<EmailVerificationTokenDocument> {
    let encrypted = encryptPiiFields(
      data as unknown as Record<string, unknown>,
      [...TOKEN_PII_FIELDS],
    );
    encrypted = addPiiIndices(
      data as unknown as Record<string, unknown>,
      TOKEN_PII_INDEX_MAP,
    );
    const merged = {
      ...encrypted,
      ...addPiiIndices(
        data as unknown as Record<string, unknown>,
        TOKEN_PII_INDEX_MAP,
      ),
    };
    return super.create(merged);
  }

  /**
   * Find token by token string
   */
  async findByToken(
    token: string,
  ): Promise<EmailVerificationTokenDocument | null> {
    return this.findOneBy(TOKEN_FIELDS.TOKEN, token);
  }

  /**
   * Find tokens by user ID
   */
  async findByUserId(
    userId: string,
  ): Promise<EmailVerificationTokenDocument[]> {
    return this.findBy(TOKEN_FIELDS.USER_ID, userId);
  }

  /**
   * Find tokens by email (uses blind index for query)
   */
  async findByEmail(email: string): Promise<EmailVerificationTokenDocument[]> {
    const byIndex = await this.findBy(TOKEN_FIELDS.EMAIL_INDEX, piiBlindIndex(email));
    if (byIndex.length) return byIndex;
    return this.findBy(TOKEN_FIELDS.EMAIL, email);
  }

  /**
   * Check if token is expired
   */
  isExpired(token: EmailVerificationTokenDocument): boolean {
    const expiresAt = resolveDate(token.expiresAt);
    return !expiresAt || new Date() > expiresAt;
  }

  /**
   * Delete expired tokens
   */
  async deleteExpired(): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where(TOKEN_FIELDS.EXPIRES_AT, "<", new Date())
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

  /** Override mapDoc to auto-decrypt PII on every token read */
  protected override mapDoc<D = PasswordResetTokenDocument>(
    snap: import("firebase-admin/firestore").DocumentSnapshot,
  ): D {
    const raw = super.mapDoc<PasswordResetTokenDocument>(snap);
    return decryptPiiFields(raw as unknown as Record<string, unknown>, [
      ...TOKEN_PII_FIELDS,
    ]) as unknown as D;
  }

  /** Encrypt token PII and add blind index before writing */
  override async create(
    data: Partial<PasswordResetTokenDocument>,
  ): Promise<PasswordResetTokenDocument> {
    let encrypted = encryptPiiFields(
      data as unknown as Record<string, unknown>,
      [...TOKEN_PII_FIELDS],
    );
    encrypted = {
      ...encrypted,
      ...addPiiIndices(
        data as unknown as Record<string, unknown>,
        TOKEN_PII_INDEX_MAP,
      ),
    };
    return super.create(encrypted);
  }

  /**
   * Find token by token string
   */
  async findByToken(token: string): Promise<PasswordResetTokenDocument | null> {
    return this.findOneBy(TOKEN_FIELDS.TOKEN, token);
  }

  /**
   * Find tokens by user ID
   */
  async findByUserId(userId: string): Promise<PasswordResetTokenDocument[]> {
    return this.findBy(TOKEN_FIELDS.USER_ID, userId);
  }

  /**
   * Find tokens by email (uses blind index for query)
   */
  async findByEmail(email: string): Promise<PasswordResetTokenDocument[]> {
    const byIndex = await this.findBy(TOKEN_FIELDS.EMAIL_INDEX, piiBlindIndex(email));
    if (byIndex.length) return byIndex;
    return this.findBy(TOKEN_FIELDS.EMAIL, email);
  }

  /**
   * Check if token is expired
   */
  isExpired(token: PasswordResetTokenDocument): boolean {
    const expiresAt = resolveDate(token.expiresAt);
    return !expiresAt || new Date() > expiresAt;
  }

  /**
   * Mark token as used
   */
  async markAsUsed(tokenId: string): Promise<PasswordResetTokenDocument> {
    try {
      await this.getCollection()
        .doc(tokenId)
        .update({
          [TOKEN_FIELDS.USED]: true,
          [TOKEN_FIELDS.USED_AT]: new Date(),
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
        .where(TOKEN_FIELDS.USER_ID, "==", userId)
        .where(TOKEN_FIELDS.USED, "==", false)
        .get();

      return snapshot.docs.map((doc) =>
        this.mapDoc<PasswordResetTokenDocument>(doc),
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
        .where(TOKEN_FIELDS.EXPIRES_AT, "<", new Date())
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
