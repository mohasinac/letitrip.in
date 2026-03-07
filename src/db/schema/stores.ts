/**
 * Stores Collection Schema
 *
 * A Store is a separate entity from the seller user (UserDocument).
 * When a user is granted the "seller" role, they can create a Store.
 * One seller owns exactly one store (1:1).
 *
 * Relationships:
 *   users (1) ——< (1) stores     — via StoreDocument.ownerId
 *   stores (1) ——< (N) products  — via ProductDocument.storeId
 */

import { slugify } from "@/utils";

// ─── Status ──────────────────────────────────────────────────────────────────

export type StoreStatus = "pending" | "active" | "suspended" | "rejected";

// ─── Document ────────────────────────────────────────────────────────────────

export interface StoreDocument {
  id: string; // Firestore doc ID — same as storeSlug
  storeSlug: string; // URL-safe unique slug, e.g. "surf-shop-by-ravi"
  ownerId: string; // User UID (references users/{uid})

  // ── Core identity ──────────────────────────────────────────────────────────
  storeName: string;
  storeDescription?: string;
  storeCategory?: string;
  storeLogoURL?: string;
  storeBannerURL?: string;

  // ── Admin-controlled status ────────────────────────────────────────────────
  status: StoreStatus;

  // ── Contact & social ───────────────────────────────────────────────────────
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };

  // ── Policies ───────────────────────────────────────────────────────────────
  returnPolicy?: string;
  shippingPolicy?: string;

  // ── Visibility & vacation ──────────────────────────────────────────────────
  isPublic: boolean;
  isVacationMode?: boolean;
  vacationMessage?: string;

  // ── Denormalized stats (updated by triggers/jobs) ──────────────────────────
  stats?: {
    totalProducts: number;
    itemsSold: number;
    totalReviews: number;
    averageRating?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// ─── Collection constant ──────────────────────────────────────────────────────

export const STORE_COLLECTION = "stores" as const;

// ─── Field name constants ─────────────────────────────────────────────────────

export const STORE_FIELDS = {
  ID: "id",
  STORE_SLUG: "storeSlug",
  OWNER_ID: "ownerId",
  STORE_NAME: "storeName",
  STORE_DESCRIPTION: "storeDescription",
  STORE_CATEGORY: "storeCategory",
  STORE_LOGO_URL: "storeLogoURL",
  STORE_BANNER_URL: "storeBannerURL",
  STATUS: "status",
  BIO: "bio",
  LOCATION: "location",
  WEBSITE: "website",
  SOCIAL_LINKS: "socialLinks",
  RETURN_POLICY: "returnPolicy",
  SHIPPING_POLICY: "shippingPolicy",
  IS_PUBLIC: "isPublic",
  IS_VACATION_MODE: "isVacationMode",
  VACATION_MESSAGE: "vacationMessage",
  STATS: "stats",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  STATUS_VALUES: {
    PENDING: "pending",
    ACTIVE: "active",
    SUSPENDED: "suspended",
    REJECTED: "rejected",
  },
} as const;

// ─── Default data ─────────────────────────────────────────────────────────────

export const DEFAULT_STORE_DATA: Partial<StoreDocument> = {
  status: "pending",
  isPublic: false,
  isVacationMode: false,
  stats: {
    totalProducts: 0,
    itemsSold: 0,
    totalReviews: 0,
  },
};

// ─── Slug generator ───────────────────────────────────────────────────────────

/**
 * Generates a URL-safe storeSlug from a store name and owner display name.
 * Format: "<store-name>-by-<seller-name>" e.g. "surf-shop-by-ravi"
 */
export function generateStoreSlug(
  storeName: string,
  ownerDisplayName: string,
): string {
  const name = slugify(storeName);
  const owner = slugify(ownerDisplayName?.split(" ")[0] ?? "seller");
  return `${name}-by-${owner}`;
}
