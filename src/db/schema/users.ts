/**
 * Users Collection Schema
 *
 * Firestore schema definition for users collection
 */

import { UserRole } from "@/types/auth";
import { generateUserId, type GenerateUserIdInput } from "@/utils";
import { piiBlindIndex } from "@/lib/pii";

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

  // Store identity (set when a user is granted seller role)
  storeId?: string; // Reference to stores/{storeId} — populated after store setup
  storeSlug?: string; // Convenience copy of storeSlug for URL routing (mirrors StoreDocument.storeSlug)
  storeStatus?: "pending" | "approved" | "rejected"; // Admin-controlled approval state

  // Public profile settings (user-level — NOT store data)
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
    // Store-specific fields (populated when role = 'seller')
    // Denormalized here for convenience; canonical source is StoreDocument.
    storeName?: string;
    storeDescription?: string;
    storeCategory?: string;
    storeLogoURL?: string;
    storeBannerURL?: string;
    storeReturnPolicy?: string;
    storeShippingPolicy?: string;
    isVacationMode?: boolean;
    vacationMessage?: string;
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
    lastSignInTime?: Date;
    creationTime?: string;
    loginCount?: number;
  };

  /**
   * Seller shipping configuration — private, never sent to client
   * Set via /api/seller/shipping (GET/PATCH)
   */
  shippingConfig?: SellerShippingConfig;
  /**
   * Seller payout payment details — private, never sent to client in full
   * Set via /api/seller/payout-settings (GET/PATCH)
   */
  payoutDetails?: SellerPayoutDetails;
}

// ─── Seller Shipping Config ──────────────────────────────────────────────────

export type SellerShippingMethod = "custom" | "shiprocket";

export interface SellerPickupAddress {
  /** Short nickname used as Shiprocket location identifier */
  locationName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  /** True after Shiprocket OTP verification completes */
  isVerified: boolean;
  /** Shiprocket internal pickup address ID (populated after verification) */
  shiprocketAddressId?: number;
}

export interface SellerShippingConfig {
  method: SellerShippingMethod;
  /** Fixed shipping charge added to order total for custom method */
  customShippingPrice?: number;
  /** Primary carrier name used for custom shipping (e.g. 'DTDC', 'India Post') */
  customCarrierName?: string;
  // ── Shiprocket fields ──
  /** Email used to authenticate with the seller's Shiprocket account */
  shiprocketEmail?: string;
  /**
   * Shiprocket JWT — server-only, never returned to client.
   * Refreshed when expired (10-day TTL on Shiprocket tokens).
   */
  shiprocketToken?: string;
  shiprocketTokenExpiry?: Date;
  /** Verified pickup address registered in Shiprocket */
  pickupAddress?: SellerPickupAddress;
  /** True when minimum setup is complete (method chosen + relevant config saved) */
  isConfigured: boolean;
}

// ─── Seller Payout Details ─────────────────────────────────────────────────

export type SellerPayoutMethod = "upi" | "bank_transfer";

export interface SellerBankAccount {
  accountHolderName: string;
  /** Full account number — stored server-side only, never returned to client in full */
  accountNumber: string;
  /** Last 4 digits shown to client for confirmation */
  accountNumberMasked: string;
  ifscCode: string;
  bankName: string;
  accountType: "savings" | "current";
}

export interface SellerPayoutDetails {
  method: SellerPayoutMethod;
  upiId?: string;
  bankAccount?: SellerBankAccount;
  /** True once at least one valid payment detail is saved */
  isConfigured: boolean;
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
  "emailIndex", // PII blind index for email lookups
  "phoneNumber",
  "phoneIndex", // PII blind index for phone lookups
  "role",
  "disabled",
  "emailVerified",
  "phoneVerified",
  "storeSlug", // Indexed for /stores/[storeSlug] lookups
  "storeStatus", // Indexed for admin store approval queries
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
  "storeSlug", // Public — used to build /stores/<storeSlug> URLs
  "publicProfile", // Includes visibility settings + storeName/storeDescription
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
  byEmail: (email: string) =>
    ["emailIndex", "==", piiBlindIndex(email)] as const,
  byPhone: (phone: string) =>
    ["phoneIndex", "==", piiBlindIndex(phone)] as const,
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
