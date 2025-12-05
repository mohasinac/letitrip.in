/**
 * @fileoverview Type Definitions
 * @module src/types/backend/product.types
 * @description This file contains TypeScript type definitions for product
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Sku */
  sku: string;
  /** Description */
  description?: string;

  // Categorization
  /** Category Id */
  categoryId: string;
  categoryIds?: string[]; // Multi-category support
  /** Brand */
  brand?: string;
  /** Tags */
  tags?: string[];

  // Pricing
  /** Price */
  price: number;
  /** Compare At Price */
  compareAtPrice?: number;
  /** Cost */
  cost?: number;
  /** Tax Rate */
  taxRate?: number;

  // Inventory
  /** Stock Count */
  stockCount: number;
  /** Low Stock Threshold */
  lowStockThreshold?: number;
  /** Track Inventory */
  trackInventory: boolean;

  // Physical
  /** Weight */
  weight?: number;
  /** Dimensions */
  dimensions?: {
    /** Length */
    length: number;
    /** Width */
    width: number;
    /** Height */
    height: number;
    /** Unit */
    unit: "cm" | "in";
  };

  // Media
  /** Images */
  images: string[];
  /** Videos */
  videos?: string[];

  // Status
  /** Status */
  status: ProductStatus;
  /** Condition */
  condition: ProductCondition;
  /** Featured */
  featured: boolean;
  /** Is Returnable */
  isReturnable: boolean;

  // Shop
  /** Shop Id */
  shopId: string;
  /** Seller Id */
  sellerId: string;

  // Shipping
  /** Shipping Class */
  shippingClass: ShippingClass;
  /** Return Window Days */
  returnWindowDays?: number;
  /** Return Policy */
  returnPolicy?: string;
  /** Warranty Info */
  warrantyInfo?: string;

  // Details
  /** Features */
  features?: string[];
  /** Specifications */
  specifications?: Record<string, string>;

  // SEO
  /** Meta Title */
  metaTitle?: string;
  /** Meta Description */
  metaDescription?: string;
  /** Meta Keywords */
  metaKeywords?: string[];

  // Stats
  /** View Count */
  viewCount: number;
  /** Sales Count */
  salesCount: number;
  /** Favorite Count */
  favoriteCount: number;
  /** Review Count */
  reviewCount: number;
  /** Average Rating */
  averageRating: number;

  // Origin
  /** Country Of Origin */
  countryOfOrigin?: string;
  /** Manufacturer */
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
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Price */
  price: number;
  /** Compare At Price */
  compareAtPrice?: number;
  /** Images */
  images: string[];
  /** Videos */
  videos?: string[];
  /** Status */
  status: ProductStatus;
  /** Stock Count */
  stockCount: number;
  /** Average Rating */
  averageRating: number;
  /** Review Count */
  reviewCount: number;
  /** Shop Id */
  shopId: string;
  brand?: string; // Brand name for filtering
  /** Featured */
  featured: boolean;
  /** Created At */
  createdAt: ISOTimestamp;
  // Admin list view needs these
  /** Sku */
  sku?: string;
  /** Category Id */
  categoryId?: string;
  /** Sales Count */
  salesCount?: number;
  /** Low Stock Threshold */
  lowStockThreshold?: number;
}

/**
 * Create Product Request BE
 */
export interface CreateProductRequestBE {
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Sku */
  sku: string;
  /** Description */
  description?: string;
  /** Category Id */
  categoryId: string;
  /** Price */
  price: number;
  /** Compare At Price */
  compareAtPrice?: number;
  /** Stock Count */
  stockCount: number;
  /** Low Stock Threshold */
  lowStockThreshold?: number;
  /** Weight */
  weight?: number;
  /** Images */
  images?: string[];
  /** Videos */
  videos?: string[];
  /** Status */
  status: ProductStatus;
  /** Condition */
  condition: ProductCondition;
  /** Shop Id */
  shopId: string;
  /** Shipping Class */
  shippingClass: ShippingClass;
  /** Return Policy */
  returnPolicy?: string;
  /** Warranty Info */
  warrantyInfo?: string;
  /** Features */
  features?: string[];
  /** Specifications */
  specifications?: Record<string, string>;
  /** Meta Title */
  metaTitle?: string;
  /** Meta Description */
  metaDescription?: string;
  /** Featured */
  featured?: boolean;
  /** Is Returnable */
  isReturnable?: boolean;
  /** Country Of Origin */
  countryOfOrigin?: string;
  /** Track Inventory */
  trackInventory?: boolean;
}

/**
 * Update Product Request BE
 */
export interface UpdateProductRequestBE {
  /** Name */
  name?: string;
  /** Slug */
  slug?: string;
  /** Description */
  description?: string;
  /** Category Id */
  categoryId?: string;
  /** Price */
  price?: number;
  /** Compare At Price */
  compareAtPrice?: number;
  /** Stock Count */
  stockCount?: number;
  /** Low Stock Threshold */
  lowStockThreshold?: number;
  /** Weight */
  weight?: number;
  /** Images */
  images?: string[];
  /** Videos */
  videos?: string[];
  /** Status */
  status?: ProductStatus;
  /** Condition */
  condition?: ProductCondition;
  /** Shipping Class */
  shippingClass?: ShippingClass;
  /** Return Policy */
  returnPolicy?: string;
  /** Warranty Info */
  warrantyInfo?: string;
  /** Features */
  features?: string[];
  /** Specifications */
  specifications?: Record<string, string>;
  /** Meta Title */
  metaTitle?: string;
  /** Meta Description */
  metaDescription?: string;
  /** Featured */
  featured?: boolean;
  /** Is Returnable */
  isReturnable?: boolean;
}

/**
 * Product Filters BE (query params)
 */
export interface ProductFiltersBE {
  /** Category Id */
  categoryId?: string;
  /** Category Ids */
  categoryIds?: string[];
  /** Shop Id */
  shopId?: string;
  /** Seller Id */
  sellerId?: string;
  /** Status */
  status?: ProductStatus | ProductStatus[];
  /** Condition */
  condition?: ProductCondition;
  /** Featured */
  featured?: boolean;
  /** In Stock */
  inStock?: boolean;
  /** Price Min */
  priceMin?: number;
  /** Price Max */
  priceMax?: number;
  /** Search */
  search?: string;
  /** Sort By */
  sortBy?: "name" | "price" | "createdAt" | "salesCount" | "averageRating";
  /** Sort Order */
  sortOrder?: "asc" | "desc";
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
}

/**
 * Quick Create Product BE (minimal fields)
 */
export interface QuickCreateProductBE {
  /** Name */
  name: string;
  /** Price */
  price: number;
  /** Stock Count */
  stockCount: number;
  /** Category Id */
  categoryId: string;
  /** Status */
  status: ProductStatus;
  /** Images */
  images?: string[];
}

/**
 * Quick Update Product BE (inline edit fields)
 */
export interface QuickUpdateProductBE {
  /** Name */
  name?: string;
  /** Price */
  price?: number;
  /** Stock Count */
  stockCount?: number;
  /** Category Id */
  categoryId?: string;
  /** Status */
  status?: ProductStatus;
  /** Images */
  images?: string[];
}

/**
 * Bulk Product Operation BE
 */
export interface BulkProductOperationBE {
  /** Ids */
  ids: string[];
  /** Action */
  action: "publish" | "archive" | "delete" | "updateStatus" | "updatePrice";
  /** Data */
  data?: {
    /** Status */
    status?: ProductStatus;
    /** Price Adjustment */
    priceAdjustment?: number;
    /** Price Adjustment Type */
    priceAdjustmentType?: "fixed" | "percentage";
  };
}
