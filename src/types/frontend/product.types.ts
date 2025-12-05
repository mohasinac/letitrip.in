/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/product.types
 * @description This file contains TypeScript type definitions for product
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * PRODUCT FRONTEND TYPES
 * Used in React components, hooks, and UI
 * Optimized for display and user interaction
 */

import {
  ProductStatus,
  ProductCondition,
  ShippingClass,
  CategoryReference,
  ShopReference,
} from "../shared/common.types";

// ==================== PRODUCT FE ====================

/**
 * Product Frontend Type (optimized for UI)
 */
export interface ProductFE {
  // Basic Info
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Sku */
  sku: string;
  /** Description */
  description: string;

  // Categorization
  /** Category Id */
  categoryId: string;
  /** Category */
  category?: CategoryReference; // Populated for display
  /** Category Ids */
  categoryIds?: string[];
  /** Brand */
  brand: string;
  /** Tags */
  tags: string[];

  // Pricing
  /** Price */
  price: number;
  /** Compare At Price */
  compareAtPrice: number | null;
  /** Discount */
  discount: number | null; // Calculated: compareAtPrice - price
  /** DiscountPercentage */
  discountPercentage: number | null; // Calculated: (discount / compareAtPrice) * 100
  /** FormattedPrice */
  formattedPrice: string; // "₹1,999"
  /** FormattedCompareAtPrice */
  formattedCompareAtPrice: string | null; // "₹2,999"

  // Inventory
  /** Stock Count */
  stockCount: number;
  /** Low Stock Threshold */
  lowStockThreshold: number;
  /** IsInStock */
  isInStock: boolean; // stockCount > 0
  /** IsLowStock */
  isLowStock: boolean; // stockCount <= lowStockThreshold
  /** Stock Status */
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";

  // Physical
  /** Weight */
  weight: number | null;
  /** Dimensions */
  dimensions: {
    /** Length */
    length: number;
    /** Width */
    width: number;
    /** Height */
    height: number;
    /** Unit */
    unit: "cm" | "in";
  } | null;

  // Media
  /** Images */
  images: string[];
  /** PrimaryImage */
  primaryImage: string; // images[0] or fallback
  /** Videos */
  videos: string[];

  // Status
  /** Status */
  status: ProductStatus;
  /** Condition */
  condition: ProductCondition;
  /** Featured */
  featured: boolean;
  /** Is Returnable */
  isReturnable: boolean;
  /** IsPublished */
  isPublished: boolean; // status === 'published'

  // Shop
  /** Shop Id */
  shopId: string;
  /** Shop */
  shop?: ShopReference; // Populated for display
  /** Seller Id */
  sellerId: string;

  // Shipping
  /** Shipping Class */
  shippingClass: ShippingClass;
  /** Return Window Days */
  returnWindowDays: number;
  /** Return Policy */
  returnPolicy: string;
  /** Warranty Info */
  warrantyInfo: string;

  // Details
  /** Features */
  features: string[];
  /** Specifications */
  specifications: Record<string, string>;

  // SEO
  /** Meta Title */
  metaTitle: string;
  /** Meta Description */
  metaDescription: string;

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
  /** RatingStars */
  ratingStars: number; // Rounded to nearest 0.5
  /** HasReviews */
  hasReviews: boolean; // reviewCount > 0

  // Origin
  /** Country Of Origin */
  countryOfOrigin: string;
  /** Manufacturer */
  manufacturer: string;

  // Timestamps (Date objects for easy manipulation)
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // UI-specific fields
  /** IsNew */
  isNew?: boolean; // Created within last 30 days
  /** IsTrending */
  isTrending?: boolean; // High sales velocity
  /** IsFavorited */
  isFavorited?: boolean; // User has in cart
  /** IsInCart */
  isInCart?: boolean; // User has in cart
  /** CartQuantity */
  cartQuantity?: number; // Quantity in cart

  // Badges (for UI display)
  /** Badges */
  badges: ProductBadge[];

  // Backwards compatibility aliases (for legacy code migration)
  /** CostPrice */
  costPrice?: number; // Alias for compareAtPrice
  /** OriginalPrice */
  originalPrice?: number | null; // Alias for compareAtPrice
  /** Rating */
  rating?: number; // Alias for averageRating
  /** ShortDescription */
  shortDescription?: string; // For admin pages (use description)
  /** Warranty */
  warranty?: string | null; // For admin pages
}

/**
 * Product Badge (for UI display)
 */
export interface ProductBadge {
  /** Type */
  type: "new" | "sale" | "featured" | "low-stock" | "out-of-stock" | "trending";
  /** Label */
  label: string;
  /** Color */
  color: "blue" | "green" | "red" | "yellow" | "purple";
}

/**
 * Product Card FE (minimal fields for cards/lists)
 */
export interface ProductCardFE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Price */
  price: number;
  /** Compare At Price */
  compareAtPrice: number | null;
  /** Formatted Price */
  formattedPrice: string;
  /** Discount */
  discount: number | null;
  /** Discount Percentage */
  discountPercentage: number | null;
  /** Primary Image */
  primaryImage: string;
  /** Status */
  status: ProductStatus;
  /** Stock Status */
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  /** Average Rating */
  averageRating: number;
  /** Rating Stars */
  ratingStars: number;
  /** Review Count */
  reviewCount: number;
  /** Shop Id */
  shopId: string;
  /** Shop */
  shop?: ShopReference;
  /** Brand */
  brand?: string; // Brand name for filtering
  /** Featured */
  featured: boolean;
  /** Is Favorited */
  isFavorited?: boolean;
  /** Badges */
  badges: ProductBadge[];

  // Backwards compatibility aliases (for legacy code migration)
  /** Images */
  images: string[]; // Array with primaryImage as first element
  /** Videos */
  videos?: string[]; // Video URLs for hover carousel
  /** OriginalPrice */
  originalPrice: number | null; // Alias for compareAtPrice
  /** Rating */
  rating: number; // Alias for averageRating
  /** StockCount */
  stockCount: number; // Actual stock number (0 if out-of-stock)
  /** InStock */
  inStock?: boolean; // Derived: stockCount > 0 (for backwards compatibility)
  /** Condition */
  condition: ProductCondition; // Product condition
  /** Sku */
  sku?: string | null; // SKU for admin display
  /** CategoryId */
  categoryId?: string | null; // Category ID for admin display
  /** SalesCount */
  salesCount?: number; // Sales count for admin display
  /** LowStockThreshold */
  lowStockThreshold?: number; // Low stock threshold for admin display

  // Legacy shop properties (use shop.name and shop.slug instead)
  /** Shop Name */
  shopName?: string;
  /** Shop Slug */
  shopSlug?: string;
}

/**
 * Product Form FE (for create/edit forms)
 */
export interface ProductFormFE {
  // Step 1: Basic Info
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Sku */
  sku: string;
  /** Category Id */
  categoryId: string;
  /** Brand */
  brand: string;

  // Step 2: Pricing & Stock
  /** Price */
  price: number;
  /** Compare At Price */
  compareAtPrice: number | null;
  /** Stock Count */
  stockCount: number;
  /** Low Stock Threshold */
  lowStockThreshold: number;
  /** Weight */
  weight: number | null;

  // Step 3: Product Details
  /** Description */
  description: string;
  /** Condition */
  condition: ProductCondition;
  /** Features */
  features: string[];
  /** Specifications */
  specifications: Record<string, string>;

  // Step 4: Media
  /** Images */
  images: string[];
  /** Videos */
  videos: string[];

  // Step 5: Shipping & Policies
  /** Shipping Class */
  shippingClass: ShippingClass;
  /** Return Policy */
  returnPolicy: string;
  /** Warranty Info */
  warrantyInfo: string;

  // Step 6: SEO & Publish
  /** Meta Title */
  metaTitle: string;
  /** Meta Description */
  metaDescription: string;
  /** Featured */
  featured: boolean;
  /** Status */
  status: ProductStatus;

  // System (set by backend)
  /** Shop Id */
  shopId?: string;

  // Form state
  /** Current Step */
  currentStep?: number;
  /** Validation Errors */
  validationErrors?: Record<string, string>;
}

/**
 * Product Filters FE (for search/filter UI)
 */
export interface ProductFiltersFE {
  /** Search */
  search?: string;
  /** Category Id */
  categoryId?: string;
  /** Category Ids */
  categoryIds?: string[];
  /** Shop Id */
  shopId?: string;
  /** Status */
  status?: ProductStatus[];
  /** Condition */
  condition?: ProductCondition | null;
  /** Price Range */
  priceRange?: {
    /** Min */
    min: number;
    /** Max */
    max: number;
  };
  /** In Stock */
  inStock?: boolean;
  /** Featured */
  featured?: boolean;
  /** Rating */
  rating?: number; // Minimum rating
  /** Sort By */
  sortBy?:
    | "relevance"
    | "price-asc"
    | "price-desc"
    | "newest"
    | "popular"
    | "rating";
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
}

/**
 * Product Search Result FE
 */
export interface ProductSearchResultFE extends ProductCardFE {
  /** Relevance Score */
  relevanceScore?: number;
  /** HighlightedFields */
  highlightedFields?: Record<string, string>; // For search term highlighting
}

/**
 * Quick Create Product FE (inline creation)
 */
export interface QuickCreateProductFE {
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
  images: string[];
}

/**
 * Quick Edit Product FE (inline editing)
 */
export interface QuickEditProductFE {
  /** Id */
  id: string;
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
  images: string[];
}

/**
 * Product Stats FE (for analytics)
 */
export interface ProductStatsFE {
  /** Product Id */
  productId: string;
  /** Views */
  views: number;
  /** Clicks */
  clicks: number;
  /** Sales */
  sales: number;
  /** Revenue */
  revenue: number;
  /** ConversionRate */
  conversionRate: number; // (sales / views) * 100
  /** AverageOrderValue */
  averageOrderValue: number; // revenue / sales
  /** Favorite Count */
  favoriteCount: number;
  /** Review Count */
  reviewCount: number;
  /** Average Rating */
  averageRating: number;
  /** Period */
  period: "today" | "week" | "month" | "year" | "all-time";
}

/**
 * Bulk Product Selection FE
 */
export interface BulkProductSelectionFE {
  /** Selected Ids */
  selectedIds: string[];
  /** Select All */
  selectAll: boolean;
  /** ExcludedIds */
  excludedIds: string[]; // When selectAll is true
  /** Total Count */
  totalCount: number;
}

/**
 * Product Comparison FE (for compare feature)
 */
export interface ProductComparisonFE {
  /** Products */
  products: ProductFE[];
  /** Comparison Fields */
  comparisonFields: {
    /** Field */
    field: keyof ProductFE;
    /** Label */
    label: string;
    /** Type */
    type: "text" | "number" | "boolean" | "rating";
  }[];
}

// ==================== ENUMS & CONSTANTS ====================

/**
 * Product Sort Options (for UI dropdowns)
 */
export const PRODUCT_SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
] as const;

/**
 * Product Status Options (for UI)
 */
export const PRODUCT_STATUS_OPTIONS = [
  { value: ProductStatus.DRAFT, label: "Draft", color: "gray" },
  { value: ProductStatus.PUBLISHED, label: "Published", color: "green" },
  { value: ProductStatus.ARCHIVED, label: "Archived", color: "yellow" },
  { value: ProductStatus.OUT_OF_STOCK, label: "Out of Stock", color: "red" },
] as const;

/**
 * Product Condition Options (for UI)
 */
export const PRODUCT_CONDITION_OPTIONS = [
  { value: ProductCondition.NEW, label: "New" },
  { value: ProductCondition.REFURBISHED, label: "Refurbished" },
  { value: ProductCondition.USED, label: "Used" },
] as const;

/**
 * Shipping Class Options (for UI)
 */
export const SHIPPING_CLASS_OPTIONS = [
  { value: ShippingClass.STANDARD, label: "Standard (5-7 days)" },
  { value: ShippingClass.EXPRESS, label: "Express (2-3 days)" },
  { value: ShippingClass.OVERNIGHT, label: "Overnight (1 day)" },
] as const;
