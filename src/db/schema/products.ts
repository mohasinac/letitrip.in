/**
 * Products Collection Schema
 *
 * Firebase Firestore collection for product listings in multi-seller e-commerce platform
 */

import type { UserRole } from "@/types/auth";
import {
  generateProductId,
  generateAuctionId,
  type GenerateProductIdInput,
  type GenerateAuctionIdInput,
} from "@/utils";

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface ProductDocument {
  id: string;
  title: string;
  description: string;
  slug?: string; // SEO-friendly URL slug (e.g. "vintage-camera-1700000000000")
  seoTitle?: string; // User-override SEO title (max 60 chars)
  seoDescription?: string; // User-override SEO description (max 160 chars)
  seoKeywords?: string[]; // User-override SEO keywords (max 10)
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  currency: string;
  stockQuantity: number;
  availableQuantity: number;

  // Media fields (max 1 video, max 10 images)
  mainImage: string; // 1:1 aspect ratio for grid display
  images: string[]; // Additional images with crop metadata
  video?: {
    url: string;
    thumbnailUrl: string; // User-selected thumbnail
    duration: number; // in seconds
    trimStart?: number; // trim start time in seconds
    trimEnd?: number; // trim end time in seconds
  };

  status: ProductStatus;
  sellerId: string; // User who created the product
  sellerName: string;
  sellerEmail: string;
  featured: boolean;
  tags: string[];
  specifications?: ProductSpecification[];
  features?: string[];
  shippingInfo?: string;
  returnPolicy?: string;

  // Auction fields (optional - for auction items)
  isAuction?: boolean;
  auctionEndDate?: Date;
  startingBid?: number;
  currentBid?: number;
  bidCount?: number;

  // Advertisement fields
  isPromoted?: boolean;
  promotionEndDate?: Date;

  // Shipping options
  pickupAddressId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus =
  | "draft"
  | "published"
  | "out_of_stock"
  | "discontinued"
  | "sold";

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export const PRODUCT_COLLECTION = "products" as const;

// ============================================
// 2. INDEXED FIELDS (Must match firestore.indexes.json)
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * SYNC REQUIRED: Update firestore.indexes.json when changing these
 * Deploy: firebase deploy --only firestore:indexes
 */
export const PRODUCT_INDEXED_FIELDS = [
  "sellerId", // For fetching seller's products
  "status", // For filtering by status
  "category", // For category-based searches
  "featured", // For featured product queries
  "isAuction", // For auction filtering
  "isPromoted", // For promoted/advertisement filtering
  "createdAt", // For sorting by creation date
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) products
 * products (1) ----< (N) orders
 * products (1) ----< (N) reviews
 * products (1) ----< (N) bids (for auction items)
 *
 * Foreign Keys:
 * - products/{id}.sellerId references users/{uid}
 * - orders/{id}.productId references products/{id}
 * - reviews/{id}.productId references products/{id}
 * - bids/{id}.productId references products/{id}
 *
 * CASCADE BEHAVIOR:
 * When product is deleted:
 * 1. Find all related orders (productId == productId)
 * 2. Find all related reviews (productId == productId)
 * 3. Find all related bids (productId == productId)
 * 4. Option A: Prevent deletion if active orders exist
 * 5. Option B: Mark product as discontinued, keep order history
 * 6. Reviews are kept for seller reputation
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default product data for new listings
 */
export const DEFAULT_PRODUCT_DATA: Partial<ProductDocument> = {
  status: "draft",
  currency: "INR",
  featured: false,
  images: [],
  tags: [],
  availableQuantity: 0,
  isAuction: false,
  isPromoted: false,
  bidCount: 0,
};

/**
 * Fields that are publicly readable
 */
export const PRODUCT_PUBLIC_FIELDS = [
  "id",
  "title",
  "description",
  "category",
  "subcategory",
  "brand",
  "price",
  "currency",
  "stockQuantity",
  "availableQuantity",
  "images",
  "status",
  "sellerName",
  "featured",
  "tags",
  "specifications",
  "features",
  "shippingInfo",
  "returnPolicy",
  "isAuction",
  "auctionEndDate",
  "startingBid",
  "currentBid",
  "bidCount",
  "isPromoted",
  "slug",
  "seoTitle",
  "seoDescription",
  "seoKeywords",
  "createdAt",
] as const;

/**
 * Fields that sellers can update
 */
export const PRODUCT_UPDATABLE_FIELDS = [
  "title",
  "description",
  "category",
  "subcategory",
  "brand",
  "price",
  "stockQuantity",
  "images",
  "status",
  "tags",
  "specifications",
  "features",
  "shippingInfo",
  "returnPolicy",
  "pickupAddressId",
  "seoTitle",
  "seoDescription",
  "seoKeywords",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new products (omit system-generated fields)
 */
export type ProductCreateInput = Omit<
  ProductDocument,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "availableQuantity"
  | "bidCount"
  | "currentBid"
>;

/**
 * Type for updating products (only seller-modifiable fields)
 */
export type ProductUpdateInput = Partial<
  Pick<ProductDocument, (typeof PRODUCT_UPDATABLE_FIELDS)[number]>
>;

/**
 * Type for admin product updates (all mutable fields)
 */
export type ProductAdminUpdateInput = Partial<
  Omit<ProductDocument, "id" | "createdAt">
>;

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const productQueryHelpers = {
  bySeller: (sellerId: string) => ["sellerId", "==", sellerId] as const,
  byStatus: (status: ProductStatus) => ["status", "==", status] as const,
  byCategory: (category: string) => ["category", "==", category] as const,
  featured: () => ["featured", "==", true] as const,
  published: () => ["status", "==", "published"] as const,
  available: () => ["availableQuantity", ">", 0] as const,
  auctions: () => ["isAuction", "==", true] as const,
  promoted: () => ["isPromoted", "==", true] as const,
  activeAuction: (date: Date) => ["auctionEndDate", ">=", date] as const,
} as const;

// ============================================
// 7. ID GENERATION HELPERS
// ============================================

/**
 * Generate SEO-friendly product ID
 * Pattern: product-{name}-{category}-{condition}-{seller-name}-{count}
 *
 * @param input - Product details
 * @returns SEO-friendly product ID
 *
 * Example: createProductId({
 *   name: "iPhone 15 Pro",
 *   category: "Smartphones",
 *   condition: "new",
 *   sellerName: "TechStore",
 *   count: 1
 * }) → "product-iphone-15-pro-smartphones-new-techstore-1"
 */
export function createProductId(
  input: Omit<GenerateProductIdInput, "count"> & { count?: number },
): string {
  return generateProductId(input as GenerateProductIdInput);
}

/**
 * Generate SEO-friendly auction ID
 * Pattern: auction-{name}-{category}-{condition}-{seller-name}-{count}
 *
 * @param input - Auction details
 * @returns SEO-friendly auction ID
 *
 * Example: createAuctionId({
 *   name: "Vintage Watch",
 *   category: "Watches",
 *   condition: "used",
 *   sellerName: "Collectibles",
 *   count: 1
 * }) → "auction-vintage-watch-watches-used-collectibles-1"
 */
export function createAuctionId(
  input: Omit<GenerateAuctionIdInput, "count"> & { count?: number },
): string {
  return generateAuctionId(input as GenerateAuctionIdInput);
}
