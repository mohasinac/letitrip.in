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
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;

  // Categorization
  categoryId: string;
  category?: CategoryReference; // Populated for display
  categoryIds?: string[];
  brand: string;
  tags: string[];

  // Pricing
  price: number;
  compareAtPrice: number | null;
  discount: number | null; // Calculated: compareAtPrice - price
  discountPercentage: number | null; // Calculated: (discount / compareAtPrice) * 100
  formattedPrice: string; // "₹1,999"
  formattedCompareAtPrice: string | null; // "₹2,999"

  // Inventory
  stockCount: number;
  lowStockThreshold: number;
  isInStock: boolean; // stockCount > 0
  isLowStock: boolean; // stockCount <= lowStockThreshold
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";

  // Physical
  weight: number | null;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  } | null;

  // Media
  images: string[];
  primaryImage: string; // images[0] or fallback
  videos: string[];

  // Status
  status: ProductStatus;
  condition: ProductCondition;
  featured: boolean;
  isReturnable: boolean;
  isPublished: boolean; // status === 'published'

  // Shop
  shopId: string;
  shop?: ShopReference; // Populated for display
  sellerId: string;

  // Shipping
  shippingClass: ShippingClass;
  returnWindowDays: number;
  returnPolicy: string;
  warrantyInfo: string;

  // Details
  features: string[];
  specifications: Record<string, string>;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // Stats
  viewCount: number;
  salesCount: number;
  favoriteCount: number;
  reviewCount: number;
  averageRating: number;
  ratingStars: number; // Rounded to nearest 0.5
  hasReviews: boolean; // reviewCount > 0

  // Origin
  countryOfOrigin: string;
  manufacturer: string;

  // Timestamps (Date objects for easy manipulation)
  createdAt: Date;
  updatedAt: Date;

  // UI-specific fields
  isNew?: boolean; // Created within last 30 days
  isTrending?: boolean; // High sales velocity
  isFavorited?: boolean; // User has in cart
  isInCart?: boolean; // User has in cart
  cartQuantity?: number; // Quantity in cart

  // Badges (for UI display)
  badges: ProductBadge[];

  // Backwards compatibility aliases (for legacy code migration)
  costPrice?: number; // Alias for compareAtPrice
  originalPrice?: number | null; // Alias for compareAtPrice
  rating?: number; // Alias for averageRating
  shortDescription?: string; // For admin pages (use description)
  warranty?: string | null; // For admin pages
}

/**
 * Product Badge (for UI display)
 */
export interface ProductBadge {
  type: "new" | "sale" | "featured" | "low-stock" | "out-of-stock" | "trending";
  label: string;
  color: "blue" | "green" | "red" | "yellow" | "purple";
}

/**
 * Product Card FE (minimal fields for cards/lists)
 */
export interface ProductCardFE {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  formattedPrice: string;
  discount: number | null;
  discountPercentage: number | null;
  primaryImage: string;
  status: ProductStatus;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  averageRating: number;
  ratingStars: number;
  reviewCount: number;
  shopId: string;
  shop?: ShopReference;
  brand?: string; // Brand name for filtering
  featured: boolean;
  isFavorited?: boolean;
  badges: ProductBadge[];

  // Backwards compatibility aliases (for legacy code migration)
  images: string[]; // Array with primaryImage as first element
  videos?: string[]; // Video URLs for hover carousel
  originalPrice: number | null; // Alias for compareAtPrice
  rating: number; // Alias for averageRating
  stockCount: number; // Actual stock number (0 if out-of-stock)
  condition: ProductCondition; // Product condition
  sku?: string | null; // SKU for admin display
  categoryId?: string | null; // Category ID for admin display
  salesCount?: number; // Sales count for admin display
  lowStockThreshold?: number; // Low stock threshold for admin display
}

/**
 * Product Form FE (for create/edit forms)
 */
export interface ProductFormFE {
  // Step 1: Basic Info
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brand: string;

  // Step 2: Pricing & Stock
  price: number;
  compareAtPrice: number | null;
  stockCount: number;
  lowStockThreshold: number;
  weight: number | null;

  // Step 3: Product Details
  description: string;
  condition: ProductCondition;
  features: string[];
  specifications: Record<string, string>;

  // Step 4: Media
  images: string[];
  videos: string[];

  // Step 5: Shipping & Policies
  shippingClass: ShippingClass;
  returnPolicy: string;
  warrantyInfo: string;

  // Step 6: SEO & Publish
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  status: ProductStatus;

  // System (set by backend)
  shopId?: string;

  // Form state
  currentStep?: number;
  validationErrors?: Record<string, string>;
}

/**
 * Product Filters FE (for search/filter UI)
 */
export interface ProductFiltersFE {
  search?: string;
  categoryId?: string;
  categoryIds?: string[];
  shopId?: string;
  status?: ProductStatus[];
  condition?: ProductCondition | null;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  featured?: boolean;
  rating?: number; // Minimum rating
  sortBy?:
    | "relevance"
    | "price-asc"
    | "price-desc"
    | "newest"
    | "popular"
    | "rating";
  page?: number;
  limit?: number;
}

/**
 * Product Search Result FE
 */
export interface ProductSearchResultFE extends ProductCardFE {
  relevanceScore?: number;
  highlightedFields?: Record<string, string>; // For search term highlighting
}

/**
 * Quick Create Product FE (inline creation)
 */
export interface QuickCreateProductFE {
  name: string;
  price: number;
  stockCount: number;
  categoryId: string;
  status: ProductStatus;
  images: string[];
}

/**
 * Quick Edit Product FE (inline editing)
 */
export interface QuickEditProductFE {
  id: string;
  name: string;
  price: number;
  stockCount: number;
  categoryId: string;
  status: ProductStatus;
  images: string[];
}

/**
 * Product Stats FE (for analytics)
 */
export interface ProductStatsFE {
  productId: string;
  views: number;
  clicks: number;
  sales: number;
  revenue: number;
  conversionRate: number; // (sales / views) * 100
  averageOrderValue: number; // revenue / sales
  favoriteCount: number;
  reviewCount: number;
  averageRating: number;
  period: "today" | "week" | "month" | "year" | "all-time";
}

/**
 * Bulk Product Selection FE
 */
export interface BulkProductSelectionFE {
  selectedIds: string[];
  selectAll: boolean;
  excludedIds: string[]; // When selectAll is true
  totalCount: number;
}

/**
 * Product Comparison FE (for compare feature)
 */
export interface ProductComparisonFE {
  products: ProductFE[];
  comparisonFields: {
    field: keyof ProductFE;
    label: string;
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
