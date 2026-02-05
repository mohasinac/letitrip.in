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
import { UserDocument, USER_COLLECTION } from "@/db/schema/users";
import { UserRole } from "@/types/auth";
import { DatabaseError } from "@/lib/errors";

export class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(USER_COLLECTION);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOneBy("email", email);
  }

  /**
   * Find user by phone number
   */
  async findByPhone(phoneNumber: string): Promise<UserDocument | null> {
    return this.findOneBy("phoneNumber", phoneNumber);
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.findBy("role", role);
  }

  /**
   * Find verified users
   */
  async findVerified(limit?: number): Promise<UserDocument[]> {
    try {
      let query = this.getCollection().where("emailVerified", "==", true);

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as UserDocument,
      );
    } catch (error) {
      throw new DatabaseError("Failed to fetch verified users", error);
    }
  }

  /**
   * Find active (non-disabled) users
   */
  async findActive(limit?: number): Promise<UserDocument[]> {
    try {
      let query = this.getCollection().where("disabled", "==", false);

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as UserDocument,
      );
    } catch (error) {
      throw new DatabaseError("Failed to fetch active users", error);
    }
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
        .where("role", "==", role)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError(`Failed to count users by role: ${role}`, error);
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
