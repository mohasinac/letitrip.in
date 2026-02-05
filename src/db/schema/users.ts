/**
 * Users Collection Schema
 *
 * Firestore schema definition for users collection
 */

import { UserRole } from "@/types/auth";

export interface UserDocument {
  id?: string; // Document ID (optional, added by Firestore, same as uid)
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified?: boolean;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  passwordHash?: string; // Only for credentials auth
  emailVerified: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
    lastLoginAt?: Date;
    loginCount?: number;
  };
}

export const USER_COLLECTION = "users" as const;

/**
 * Default user data for new registrations
 */
export const DEFAULT_USER_DATA: Partial<UserDocument> = {
  role: "user",
  emailVerified: false,
  disabled: false,
  photoURL: null,
  displayName: null,
};

/**
 * Fields that should be indexed
 */
export const USER_INDEXED_FIELDS = [
  "email",
  "phoneNumber",
  "role",
  "disabled",
  "emailVerified",
] as const;

/**
 * Fields that are publicly readable (exclude sensitive data)
 */
export const USER_PUBLIC_FIELDS = [
  "uid",
  "email",
  "phoneNumber",
  "displayName",
  "photoURL",
  "role",
  "emailVerified",
  "createdAt",
] as const;

/**
 * Fields that users can update themselves
 */
export const USER_UPDATABLE_FIELDS = ["displayName", "photoURL"] as const;

/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) trips
 *       (1) ----< (N) bookings
 *       (1) ----< (N) emailVerificationTokens
 *       (1) ----< (N) passwordResetTokens
 *
 * Foreign Key Pattern (Firestore):
 * - trips/{tripId}.userId references users/{uid}
 * - bookings/{bookingId}.userId references users/{uid}
 * - emailVerificationTokens/{tokenId}.userId references users/{uid}
 * - passwordResetTokens/{tokenId}.userId references users/{uid}
 *
 * CASCADE DELETE BEHAVIOR:
 * When a user is deleted, the following related documents must be deleted:
 * 1. All emailVerificationTokens where userId = user.uid
 * 2. All passwordResetTokens where userId = user.uid
 * 3. All trips where userId = user.uid
 * 4. All bookings where userId = user.uid
 *
 * Implementation: UserRepository.delete() should:
 * - Delete user document
 * - Batch delete all related tokens (both collections)
 * - Batch delete all related trips
 * - Batch delete all related bookings
 * - Use Firestore batch writes for atomicity
 */

// ============================================
// TYPE UTILITIES
// ============================================

/**
 * Type for creating new users (omit system-generated fields)
 */
export type UserCreateInput = Omit<
  UserDocument,
  "uid" | "id" | "createdAt" | "updatedAt"
>;

/**
 * Type for updating user profiles (only user-modifiable fields)
 */
export type UserUpdateInput = Partial<
  Pick<UserDocument, "displayName" | "photoURL">
>;

/**
 * Type for admin user updates (all mutable fields)
 */
export type UserAdminUpdateInput = Partial<
  Omit<UserDocument, "uid" | "id" | "createdAt">
>;

/**
 * Type for user query filters
 */
export interface UserQueryFilter {
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  emailVerified?: boolean;
  disabled?: boolean;
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Firestore query helper functions
 * Use with Firestore where() clauses
 *
 * @example
 * ```typescript
 * import { collection, query } from 'firebase-admin/firestore';
 * import { USER_COLLECTION, userQueryHelpers } from '@/db/schema/users';
 *
 * const usersRef = collection(db, USER_COLLECTION);
 * const q = query(usersRef, userQueryHelpers.byEmail('user@example.com'));
 * ```
 */
export const userQueryHelpers = {
  byEmail: (email: string) => ["email", "==", email] as const,
  byPhone: (phone: string) => ["phoneNumber", "==", phone] as const,
  byRole: (role: UserRole) => ["role", "==", role] as const,
  verified: () => ["emailVerified", "==", true] as const,
  active: () => ["disabled", "==", false] as const,
  disabled: () => ["disabled", "==", true] as const,
} as const;
