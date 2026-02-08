/**
 * Users Collection Schema
 *
 * Firestore schema definition for users collection
 */

import { UserRole } from "@/types/auth";
import {
  generateUserId,
  type GenerateUserIdInput,
} from "@/utils/id-generators";

export interface AvatarMetadata {
  url: string;
  position: {
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
  };
  zoom: number; // 0.1 to 3.0
}

export interface UserDocument {
  id?: string; // Document ID (optional, added by Firestore, same as uid)
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified?: boolean;
  displayName: string | null;
  photoURL: string | null;
  avatarMetadata?: AvatarMetadata | null; // Crop/position data for avatar
  role: UserRole;
  passwordHash?: string; // Only for credentials auth
  emailVerified: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Public profile settings
  publicProfile?: {
    isPublic: boolean; // Whether profile is publicly viewable
    showEmail: boolean; // Show email on public profile
    showPhone: boolean; // Show phone on public profile
    showOrders: boolean; // Show order count/stats
    showWishlist: boolean; // Show wishlist count
    bio?: string; // Short bio for public profile
    location?: string; // User location (city, country)
    website?: string; // Personal website URL
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
    };
  };

  // User statistics (for public display)
  stats?: {
    totalOrders: number;
    auctionsWon: number;
    itemsSold: number;
    reviewsCount: number;
    rating?: number; // Average rating (0-5)
  };

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
  phoneVerified: false,
  disabled: false,
  photoURL: null,
  displayName: null,
  publicProfile: {
    isPublic: true, // Public by default
    showEmail: false, // Email private by default
    showPhone: false, // Phone private by default
    showOrders: true, // Show order stats
    showWishlist: true, // Show wishlist count
  },
  stats: {
    totalOrders: 0,
    auctionsWon: 0,
    itemsSold: 0,
    reviewsCount: 0,
  },
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
  "phoneVerified",
] as const;

/**
 * Fields that are publicly readable (exclude sensitive data)
 */
export const USER_PUBLIC_FIELDS = [
  "uid",
  "displayName",
  "photoURL",
  "avatarMetadata",
  "role",
  "createdAt",
  "publicProfile", // Includes visibility settings
  "stats", // Public statistics
  // Conditionally include based on publicProfile settings:
  // - email (if showEmail is true)
  // - phoneNumber (if showPhone is true)
] as const;

/**
 * Fields that users can update themselves
 */
export const USER_UPDATABLE_FIELDS = ["displayName", "photoURL"] as const;

/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) products
 *       (1) ----< (N) orders
 *       (1) ----< (N) emailVerificationTokens
 *       (1) ----< (N) passwordResetTokens
 *
 * Foreign Key Pattern (Firestore):
 * - products/{productId}.sellerId references users/{uid}
 * - orders/{orderId}.userId references users/{uid}
 * - emailVerificationTokens/{tokenId}.userId references users/{uid}
 * - passwordResetTokens/{tokenId}.userId references users/{uid}
 *
 * CASCADE DELETE BEHAVIOR:
 * When a user is deleted, the following related documents must be deleted:
 * 1. All emailVerificationTokens where userId = user.uid
 * 2. All passwordResetTokens where userId = user.uid
 * 3. All products where sellerId = user.uid
 * 4. All orders where userId = user.uid
 *
 * Implementation: UserRepository.delete() should:
 * - Delete user document
 * - Batch delete all related tokens (both collections)
 * - Batch delete all related products
 * - Batch delete all related orders
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

// ============================================
// ID GENERATION HELPER
// ============================================

/**
 * Generate SEO-friendly user ID
 * Pattern: user-{first-name}-{last-name}-{email-starting}
 *
 * @param input - User details
 * @returns SEO-friendly user ID
 *
 * Example: createUserId({
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "johndoe@example.com"
 * }) → "user-john-doe-johndoe"
 */
export function createUserId(input: GenerateUserIdInput): string {
  return generateUserId(input);
}
