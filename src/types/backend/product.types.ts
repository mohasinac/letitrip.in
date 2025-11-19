/**
 * PRODUCT BACKEND TYPES
 * Matches API response structure exactly
 * Used in service layer for API communication
 */

import {
  BaseEntity,
  ProductStatus,
  ProductCondition,
  ShippingClass,
  FirebaseTimestamp,
  ISOTimestamp,
} from "../shared/common.types";

// ==================== PRODUCT BE ====================

/**
 * Product Backend Type (matches Firestore/API response)
 */
export interface ProductBE extends BaseEntity {
  // Basic Info
  name: string;
  slug: string;
  sku: string;
  description?: string;

  // Categorization
  categoryId: string;
  categoryIds?: string[]; // Multi-category support
  brand?: string;
  tags?: string[];

  // Pricing
  price: number;
  compareAtPrice?: number;
  cost?: number;
  taxRate?: number;

  // Inventory
  stockCount: number;
  lowStockThreshold?: number;
  trackInventory: boolean;

  // Physical
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };

  // Media
  images: string[];
  videos?: string[];

  // Status
  status: ProductStatus;
  condition: ProductCondition;
  featured: boolean;
  isReturnable: boolean;

  // Shop
  shopId: string;
  sellerId: string;

  // Shipping
  shippingClass: ShippingClass;
  returnWindowDays?: number;
  returnPolicy?: string;
  warrantyInfo?: string;

  // Details
  features?: string[];
  specifications?: Record<string, string>;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // Stats
  viewCount: number;
  salesCount: number;
  favoriteCount: number;
  reviewCount: number;
  averageRating: number;

  // Origin
  countryOfOrigin?: string;
  manufacturer?: string;

  // Note: createdAt and updatedAt inherited from BaseEntity (FirebaseTimestamp)
  // Additional legacy timestamp fields if needed by API
  created_at?: FirebaseTimestamp;
  updated_at?: FirebaseTimestamp;
}

/**
 * Product List Item BE (minimal fields for lists)
 */
export interface ProductListItemBE {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  videos?: string[];
  status: ProductStatus;
  stockCount: number;
  averageRating: number;
  reviewCount: number;
  shopId: string;
  brand?: string; // Brand name for filtering
  featured: boolean;
  createdAt: ISOTimestamp;
  // Admin list view needs these
  sku?: string;
  categoryId?: string;
  salesCount?: number;
  lowStockThreshold?: number;
}

/**
 * Create Product Request BE
 */
export interface CreateProductRequestBE {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  stockCount: number;
  lowStockThreshold?: number;
  weight?: number;
  images?: string[];
  videos?: string[];
  status: ProductStatus;
  condition: ProductCondition;
  shopId: string;
  shippingClass: ShippingClass;
  returnPolicy?: string;
  warrantyInfo?: string;
  features?: string[];
  specifications?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  isReturnable?: boolean;
  countryOfOrigin?: string;
  trackInventory?: boolean;
}

/**
 * Update Product Request BE
 */
export interface UpdateProductRequestBE {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  compareAtPrice?: number;
  stockCount?: number;
  lowStockThreshold?: number;
  weight?: number;
  images?: string[];
  videos?: string[];
  status?: ProductStatus;
  condition?: ProductCondition;
  shippingClass?: ShippingClass;
  returnPolicy?: string;
  warrantyInfo?: string;
  features?: string[];
  specifications?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  isReturnable?: boolean;
}

/**
 * Product Filters BE (query params)
 */
export interface ProductFiltersBE {
  categoryId?: string;
  categoryIds?: string[];
  shopId?: string;
  sellerId?: string;
  status?: ProductStatus | ProductStatus[];
  condition?: ProductCondition;
  featured?: boolean;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "salesCount" | "averageRating";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Quick Create Product BE (minimal fields)
 */
export interface QuickCreateProductBE {
  name: string;
  price: number;
  stockCount: number;
  categoryId: string;
  status: ProductStatus;
  images?: string[];
}

/**
 * Quick Update Product BE (inline edit fields)
 */
export interface QuickUpdateProductBE {
  name?: string;
  price?: number;
  stockCount?: number;
  categoryId?: string;
  status?: ProductStatus;
  images?: string[];
}

/**
 * Bulk Product Operation BE
 */
export interface BulkProductOperationBE {
  ids: string[];
  action: "publish" | "archive" | "delete" | "updateStatus" | "updatePrice";
  data?: {
    status?: ProductStatus;
    priceAdjustment?: number;
    priceAdjustmentType?: "fixed" | "percentage";
  };
}
