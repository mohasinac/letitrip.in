/**
 * User Repository
 *
 * Repository for user-related database operations.
 * Provides type-safe methods for user CRUD operations.
 *
 * @example
 * ```ts
 * const userRepo = new UserRepository();
 * const user = await userRepo.findByEmail('user@example.com');
 * ```
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { FieldValue } from "firebase-admin/firestore";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";
import {
  UserDocument,
  USER_COLLECTION,
  createUserId,
  USER_FIELDS,
} from "@/db/schema";
import { UserRole } from "@/types/auth";
import { DatabaseError } from "@/lib/errors";
import {
  encryptPiiFields,
  decryptPiiFields,
  addPiiIndices,
  piiBlindIndex,
  USER_PII_FIELDS,
  USER_PII_INDEX_MAP,
  encryptPayoutDetails,
  decryptPayoutDetails,
  encryptShippingConfig,
  decryptShippingConfig,
} from "@/lib/pii";

export class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(USER_COLLECTION);
  }

  // ─── PII lifecycle: encrypt before write, decrypt after read ──────────────

  /**
   * Decrypt PII fields on a UserDocument after reading from Firestore.
   */
  private decryptUser(doc: UserDocument): UserDocument {
    const decrypted = decryptPiiFields(
      doc as unknown as Record<string, unknown>,
      [...USER_PII_FIELDS],
    ) as unknown as UserDocument;
    if (decrypted.payoutDetails) {
      decrypted.payoutDetails = decryptPayoutDetails(
        decrypted.payoutDetails as unknown as Record<string, unknown>,
      ) as unknown as typeof decrypted.payoutDetails;
    }
    if (decrypted.shippingConfig) {
      decrypted.shippingConfig = decryptShippingConfig(
        decrypted.shippingConfig as unknown as Record<string, unknown>,
      ) as unknown as typeof decrypted.shippingConfig;
    }
    return decrypted;
  }

  /**
   * Encrypt PII fields on user data before writing to Firestore.
   * Also adds blind indices for queryable fields.
   */
  private encryptUserData<T extends Record<string, unknown>>(data: T): T {
    let encrypted = encryptPiiFields(data, [...USER_PII_FIELDS]);
    encrypted = addPiiIndices(data, USER_PII_INDEX_MAP) as unknown as T;
    // Re-apply encryption (addPiiIndices reads original plaintext from `data`)
    encrypted = {
      ...encryptPiiFields(data, [...USER_PII_FIELDS]),
      ...encrypted,
    };
    if (encrypted.payoutDetails) {
      (encrypted as Record<string, unknown>).payoutDetails =
        encryptPayoutDetails(
          encrypted.payoutDetails as Record<string, unknown>,
        );
    }
    if (encrypted.shippingConfig) {
      (encrypted as Record<string, unknown>).shippingConfig =
        encryptShippingConfig(
          encrypted.shippingConfig as Record<string, unknown>,
        );
    }
    return encrypted;
  }

  /** Override mapDoc to auto-decrypt PII on every Firestore read */
  protected override mapDoc<D = UserDocument>(
    snap: import("firebase-admin/firestore").DocumentSnapshot,
  ): D {
    const raw = super.mapDoc<UserDocument>(snap);
    return this.decryptUser(raw) as unknown as D;
  }

  /**
   * Create new user with SEO-friendly ID
   * Generates ID from first name, last name, and email
   */
  async create(
    input: Omit<UserDocument, "id" | "createdAt" | "updatedAt">,
  ): Promise<UserDocument> {
    // Extract names for ID generation
    const firstName = input.displayName?.split(" ")[0] || "user";
    const lastName =
      input.displayName?.split(" ").slice(1).join(" ") || "account";
    const email = input.email || "noemail@example.com";

    // Generate user ID
    const id = createUserId({
      firstName,
      lastName,
      email,
    });

    const userData: Omit<UserDocument, "id"> = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Encrypt PII and add blind indices before persisting
    const encrypted = this.encryptUserData(
      userData as unknown as Record<string, unknown>,
    );

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(encrypted));

    return { id, ...userData }; // return plaintext to caller
  }

  /**
   * Find user by email (uses blind index for query, decrypts on read)
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOneBy(USER_FIELDS.EMAIL_INDEX, piiBlindIndex(email));
  }

  /**
   * Find user by phone number (uses blind index for query, decrypts on read)
   */
  async findByPhone(phoneNumber: string): Promise<UserDocument | null> {
    return this.findOneBy(USER_FIELDS.PHONE_INDEX, piiBlindIndex(phoneNumber));
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.findBy(USER_FIELDS.ROLE, role);
  }

  /**
   * Find verified users
   */
  async findVerified(limit?: number): Promise<UserDocument[]> {
    try {
      let query = this.getCollection().where(
        USER_FIELDS.EMAIL_VERIFIED,
        "==",
        true,
      );

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => this.mapDoc<UserDocument>(doc));
    } catch (error) {
      throw new DatabaseError("Failed to fetch verified users", error);
    }
  }

  /**
   * Find active (non-disabled) users
   */
  async findActive(limit?: number): Promise<UserDocument[]> {
    try {
      let query = this.getCollection().where(USER_FIELDS.DISABLED, "==", false);

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => this.mapDoc<UserDocument>(doc));
    } catch (error) {
      throw new DatabaseError("Failed to fetch active users", error);
    }
  }

  /**
   * Override base update to encrypt PII fields before any user write.
   */
  override async update(
    uid: string,
    data: Partial<UserDocument>,
  ): Promise<UserDocument> {
    const encrypted = this.encryptUserData(
      data as unknown as Record<string, unknown>,
    );
    return super.update(uid, encrypted as Partial<UserDocument>);
  }

  /**
   * Update user email verification status
   */
  async markEmailAsVerified(uid: string): Promise<UserDocument> {
    return this.update(uid, { emailVerified: true } as Partial<UserDocument>);
  }

  /**
   * Disable user account
   */
  async disable(uid: string): Promise<UserDocument> {
    return this.update(uid, { disabled: true } as Partial<UserDocument>);
  }

  /**
   * Enable user account
   */
  async enable(uid: string): Promise<UserDocument> {
    return this.update(uid, { disabled: false } as Partial<UserDocument>);
  }

  /**
   * Update user role
   */
  async updateRole(uid: string, role: UserRole): Promise<UserDocument> {
    return this.update(uid, { role } as Partial<UserDocument>);
  }

  /**
   * Update user profile (displayName, photoURL)
   */
  async updateProfile(
    uid: string,
    data: { displayName?: string; photoURL?: string },
  ): Promise<UserDocument> {
    return this.update(uid, data as Partial<UserDocument>);
  }

  /**
   * Update user profile with email/phone verification reset
   * Resets emailVerified when email changes
   * Resets phoneVerified when phoneNumber changes
   */
  async updateProfileWithVerificationReset(
    uid: string,
    data: {
      displayName?: string;
      email?: string;
      phoneNumber?: string;
      photoURL?: string;
      avatarMetadata?: any;
    },
  ): Promise<UserDocument> {
    // Get current user data to check if email/phone changed
    const currentUser = await this.findById(uid);
    if (!currentUser) {
      throw new DatabaseError(`User not found: ${uid}`);
    }

    const updateData: Partial<UserDocument> = { ...data };

    // Reset emailVerified if email changed
    if (data.email && data.email !== currentUser.email) {
      updateData.emailVerified = false;
    }

    // Reset phoneVerified if phoneNumber changed
    if (data.phoneNumber && data.phoneNumber !== currentUser.phoneNumber) {
      updateData.phoneVerified = false;
    }

    // Encrypt + blind-index is handled by this.update() override
    return this.update(uid, updateData as Partial<UserDocument>);
  }

  /**
   * Check if email is already registered
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Get user count by role
   */
  async countByRole(role: UserRole): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where(USER_FIELDS.ROLE, "==", role)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError(`Failed to count users by role: ${role}`, error);
    }
  }

  /**
   * Count active (non-disabled) users
   */
  async countActive(): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where(USER_FIELDS.DISABLED, "==", false)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError("Failed to count active users", error);
    }
  }

  /**
   * Count disabled users
   */
  async countDisabled(): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where(USER_FIELDS.DISABLED, "==", true)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError("Failed to count disabled users", error);
    }
  }

  /**
   * Count users created since a given date
   */
  async countNewSince(since: Date): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where(USER_FIELDS.CREATED_AT, ">=", since)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError("Failed to count new users", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Login metadata
  // ---------------------------------------------------------------------------

  /**
   * Update login metadata after a successful sign-in.
   * Uses FieldValue for atomic server-side lastSignInTime and loginCount increment.
   */
  async updateLoginMetadata(uid: string): Promise<void> {
    try {
      await this.getCollection()
        .doc(uid)
        .update({
          [USER_FIELDS.META.LAST_SIGN_IN_TIME]: FieldValue.serverTimestamp(),
          [USER_FIELDS.META.LOGIN_COUNT]: FieldValue.increment(1),
          [USER_FIELDS.UPDATED_AT]: FieldValue.serverTimestamp(),
        });
    } catch (error) {
      throw new DatabaseError("Failed to update login metadata", error);
    }
  }

  // ---------------------------------------------------------------------------
  // Sieve-powered list query
  // ---------------------------------------------------------------------------

  static readonly SIEVE_FIELDS = {
    uid: { canFilter: true, canSort: false },
    emailIndex: { canFilter: true, canSort: false },
    displayNameIndex: { canFilter: true, canSort: false },
    displayName: { canFilter: false, canSort: false }, // encrypted — cannot Sieve filter
    role: { canFilter: true, canSort: true },
    emailVerified: { canFilter: true, canSort: false },
    disabled: { canFilter: true, canSort: true },
    storeStatus: { canFilter: true, canSort: false },
    createdAt: { canFilter: true, canSort: true },
    updatedAt: { canFilter: true, canSort: true },
  };

  /**
   * Paginated, Firestore-native user list (admin use).
   */
  async list(model: SieveModel): Promise<FirebaseSieveResult<UserDocument>> {
    return this.sieveQuery<UserDocument>(model, UserRepository.SIEVE_FIELDS, {
      defaultPageSize: 100,
      maxPageSize: 500,
    });
  }

  // ---------------------------------------------------------------------------
  // Store / Storefront queries
  // ---------------------------------------------------------------------------

  /**
   * Find a seller by their store slug.
   * Used by /api/stores/[storeSlug] to resolve the seller.
   */
  async findByStoreSlug(storeSlug: string): Promise<UserDocument | null> {
    return this.findOneBy(USER_FIELDS.STORE_SLUG, storeSlug);
  }

  /**
   * Update store approval status (admin-only action).
   */
  async updateStoreApproval(
    uid: string,
    storeStatus: "pending" | "approved" | "rejected",
  ): Promise<UserDocument> {
    return this.update(uid, {
      storeStatus,
    } as Partial<UserDocument>);
  }

  /**
   * Paginated list of all users with role = 'seller' (public store directory).
   * Only returns approved stores (storeStatus = 'approved').
   */
  async listSellers(
    model: SieveModel,
  ): Promise<FirebaseSieveResult<UserDocument>> {
    return this.sieveQuery<UserDocument>(model, UserRepository.SIEVE_FIELDS, {
      baseQuery: this.getCollection()
        .where(USER_FIELDS.ROLE, "==", "seller")
        .where(USER_FIELDS.STORE_STATUS, "==", "approved"),
      defaultPageSize: 24,
      maxPageSize: 100,
    });
  }

  /**
   * Paginated list of sellers for admin — no approval filter, includes all statuses.
   */
  async listSellersForAdmin(
    model: SieveModel,
  ): Promise<FirebaseSieveResult<UserDocument>> {
    return this.sieveQuery<UserDocument>(model, UserRepository.SIEVE_FIELDS, {
      baseQuery: this.getCollection().where(USER_FIELDS.ROLE, "==", "seller"),
      defaultPageSize: 24,
      maxPageSize: 100,
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
