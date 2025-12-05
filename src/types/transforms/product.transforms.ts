/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/product.transforms
 * @description This file contains functionality related to product.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * PRODUCT TYPE TRANSFORMATIONS
 * Convert between Backend (BE) and Frontend (FE) product types
 */

import { ProductBE, ProductListItemBE } from "../backend/product.types";
import {
  ProductBadge,
  ProductCardFE,
  ProductFE,
  ProductFormFE,
} from "../frontend/product.types";
import { ProductStatus } from "../shared/common.types";

// ==================== HELPERS ====================

/**
 * Parse ISO timestamp or Firestore timestamp to Date
 */
/**
 * Parses date
 *
 * @param {any} timestamp - The timestamp
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {any} timestamp - The timestamp
 *
 * @returns {any} The parsedate result
 */

function parseDate(timestamp: any): Date {
  if (!timestamp) return new Date();

  // Firestore Timestamp
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }

  // ISO string
  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }

  // Already a Date
  if (timestamp instanceof Date) {
    return timestamp;
  }

  return new Date();
}

import { formatPrice } from "@/lib/price.utils";

/**
 * Calculate discount
 */
/**
 * Calculates discount
 *
 * @param {number} price - The price
 * @param {number} [compareAtPrice] - The compare at price
 *
 * @returns {number} The calculatediscount result
 */

/**
 * Calculates discount
 *
 * @returns {number} The calculatediscount result
 */

function calculateDiscount(
  /** Price */
  price: number,
  /** Compare At Price */
  compareAtPrice?: number
): {
  /** Discount */
  discount: number | null;
  /** Discount Percentage */
  discountPercentage: number | null;
} {
  if (!compareAtPrice || compareAtPrice <= price) {
    return { discount: null, discountPercentage: null };
  }

  const discount = compareAtPrice - price;
  const discountPercentage = Math.round((discount / compareAtPrice) * 100);

  return { discount, discountPercentage };
}

/**
 * Determine stock status
 */
/**
 * Retrieves stock status
 *
 * @param {number} stockCount - Number of stock
 * @param {number} [lowStockThreshold] - The low stock threshold
 *
 * @returns {boolean} True if condition is met, false otherwise
 */

/**
 * Retrieves stock status
 *
 * @returns {number} The stockstatus result
 */

function getStockStatus(
  /** Stock Count */
  stockCount: number,
  /** Low Stock Threshold */
  lowStockThreshold: number = 5
): {
  /** Is In Stock */
  isInStock: boolean;
  /** Is Low Stock */
  isLowStock: boolean;
  /** Stock Status */
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
} {
  if (stockCount === 0) {
    return { isInStock: false, isLowStock: false, stockStatus: "out-of-stock" };
  }

  if (stockCount <= lowStockThreshold) {
    return { isInStock: true, isLowStock: true, stockStatus: "low-stock" };
  }

  return { isInStock: true, isLowStock: false, stockStatus: "in-stock" };
}

/**
 * Generate product badges
 */
/**
 * Performs generate badges operation
 *
 * @returns {boolean} True if condition is met, false otherwise
 */

/**
 * Performs generate badges operation
 *
 * @returns {number} The badges result
 */

function generateBadges(product: {
  /** Created At */
  createdAt: Date;
  /** Discount Percentage */
  discountPercentage: number | null;
  /** Featured */
  featured: boolean;
  /** Stock Status */
  stockStatus: string;
  /** Sales Count */
  salesCount: number;
}): ProductBadge[] {
  const badges: ProductBadge[] = [];

  // New product (within 30 days)
  const daysSinceCreation = Math.floor(
    (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreation <= 30) {
    badges.push({ type: "new", label: "New", color: "blue" });
  }

  // Sale badge
  if (product.discountPercentage && product.discountPercentage > 0) {
    badges.push({
      /** Type */
      type: "sale",
      /** Label */
      label: `${product.discountPercentage}% OFF`,
      /** Color */
      color: "red",
    });
  }

  // Featured badge
  if (product.featured) {
    badges.push({ type: "featured", label: "Featured", color: "purple" });
  }

  // Stock badges
  if (product.stockStatus === "low-stock") {
    badges.push({ type: "low-stock", label: "Low Stock", color: "yellow" });
  } else if (product.stockStatus === "out-of-stock") {
    badges.push({ type: "out-of-stock", label: "Out of Stock", color: "red" });
  }

  // Trending (high sales velocity)
  if (product.salesCount > 100) {
    badges.push({ type: "trending", label: "Trending", color: "green" });
  }

  return badges;
}

/**
 * Round rating to nearest 0.5
 */
/**
 * Performs round rating operation
 *
 * @param {number} rating - The rating
 *
 * @returns {number} The roundrating result
 */

/**
 * Performs round rating operation
 *
 * @param {number} rating - The rating
 *
 * @returns {number} The roundrating result
 */

function roundRating(rating: number): number {
  return Math.round(rating * 2) / 2;
}

// ==================== TRANSFORMATIONS ====================

/**
 * Transform Backend Product to Frontend Product
 */
/**
 * Performs to f e product operation
 *
 * @param {ProductBE} productBE - The product b e
 *
 * @returns {any} The tofeproduct result
 *
 * @example
 * toFEProduct(productBE);
 */

/**
 * Performs to f e product operation
 *
 * @param {ProductBE} productBE - The product b e
 *
 * @returns {any} The tofeproduct result
 *
 * @example
 * toFEProduct(productBE);
 */

export function toFEProduct(productBE: ProductBE): ProductFE {
  const createdAt = parseDate(productBE.createdAt || productBE.created_at);
  const updatedAt = parseDate(productBE.updatedAt || productBE.updated_at);

  const { discount, discountPercentage } = calculateDiscount(
    productBE.price,
    productBE.compareAtPrice
  );

  const { isInStock, isLowStock, stockStatus } = getStockStatus(
    productBE.stockCount,
    productBE.lowStockThreshold
  );

  const ratingStars = roundRating(productBE.averageRating);

  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const productFE: ProductFE = {
    // Basic Info
    /** Id */
    id: productBE.id,
    /** Name */
    name: productBE.name,
    /** Slug */
    slug: productBE.slug,
    /** Sku */
    sku: productBE.sku,
    /** Description */
    description: productBE.description || "",

    // Categorization
    /** Category Id */
    categoryId: productBE.categoryId,
    /** Category Ids */
    categoryIds: productBE.categoryIds || [],
    /** Brand */
    brand: productBE.brand || "",
    /** Tags */
    tags: productBE.tags || [],

    // Pricing
    /** Price */
    price: productBE.price,
    /** Compare At Price */
    compareAtPrice: productBE.compareAtPrice || null,
    discount,
    discountPercentage,
    /** Formatted Price */
    formattedPrice: formatPrice(productBE.price),
    /** Formatted Compare At Price */
    formattedCompareAtPrice: productBE.compareAtPrice
      ? formatPrice(productBE.compareAtPrice)
      : null,

    // Inventory
    /** Stock Count */
    stockCount: productBE.stockCount,
    /** Low Stock Threshold */
    lowStockThreshold: productBE.lowStockThreshold || 5,
    isInStock,
    isLowStock,
    stockStatus,

    // Physical
    /** Weight */
    weight: productBE.weight || null,
    /** Dimensions */
    dimensions: productBE.dimensions || null,

    // Media
    /** Images */
    images: productBE.images || [],
    /** Primary Image */
    primaryImage: productBE.images?.[0] || "/placeholder-product.jpg",
    /** Videos */
    videos: productBE.videos || [],

    // Status
    /** Status */
    status: productBE.status,
    /** Condition */
    condition: productBE.condition,
    /** Featured */
    featured: productBE.featured,
    /** Is Returnable */
    isReturnable: productBE.isReturnable,
    /** Is Published */
    isPublished: productBE.status === ProductStatus.PUBLISHED,

    // Shop
    /** Shop Id */
    shopId: productBE.shopId,
    /** Seller Id */
    sellerId: productBE.sellerId,

    // Shipping
    /** Shipping Class */
    shippingClass: productBE.shippingClass,
    /** Return Window Days */
    returnWindowDays: productBE.returnWindowDays || 7,
    /** Return Policy */
    returnPolicy: productBE.returnPolicy || "",
    /** Warranty Info */
    warrantyInfo: productBE.warrantyInfo || "",

    // Details
    /** Features */
    features: productBE.features || [],
    /** Specifications */
    specifications: productBE.specifications || {},

    // SEO
    /** Meta Title */
    metaTitle: productBE.metaTitle || productBE.name,
    /** Meta Description */
    metaDescription: productBE.metaDescription || productBE.description || "",

    // Stats
    /** View Count */
    viewCount: productBE.viewCount || 0,
    /** Sales Count */
    salesCount: productBE.salesCount || 0,
    /** Favorite Count */
    favoriteCount: productBE.favoriteCount || 0,
    /** Review Count */
    reviewCount: productBE.reviewCount || 0,
    /** Average Rating */
    averageRating: productBE.averageRating || 0,
    ratingStars,
    /** Has Reviews */
    hasReviews: (productBE.reviewCount || 0) > 0,

    // Origin
    /** Country Of Origin */
    countryOfOrigin: productBE.countryOfOrigin || "India",
    /** Manufacturer */
    manufacturer: productBE.manufacturer || "",

    // Timestamps
    createdAt,
    updatedAt,

    // UI-specific
    /** Is New */
    isNew: daysSinceCreation <= 30,
    /** Is Trending */
    isTrending: (productBE.salesCount || 0) > 100,

    // Badges
    /** Badges */
    badges: [],

    // Backwards compatibility aliases
    /** Cost Price */
    costPrice: productBE.compareAtPrice || undefined,
    /** Original Price */
    originalPrice: productBE.compareAtPrice || null,
    /** Rating */
    rating: productBE.averageRating || 0,
  };

  // Generate badges after product object is created
  productFE.badges = generateBadges({
    createdAt,
    discountPercentage,
    /** Featured */
    featured: productBE.featured,
    stockStatus,
    /** Sales Count */
    salesCount: productBE.salesCount || 0,
  });

  return productFE;
}

/**
 * Transform Backend Product List Item to Frontend Product Card
 */
/**
 * Performs to f e product card operation
 *
 * @param {ProductListItemBE} productBE - The product b e
 *
 * @returns {any} The tofeproductcard result
 *
 * @example
 * toFEProductCard(productBE);
 */

/**
 * Performs to f e product card operation
 *
 * @param {ProductListItemBE} productBE - The product b e
 *
 * @returns {any} The tofeproductcard result
 *
 * @example
 * toFEProductCard(productBE);
 */

export function toFEProductCard(productBE: ProductListItemBE): ProductCardFE {
  const { discount, discountPercentage } = calculateDiscount(
    productBE.price,
    productBE.compareAtPrice
  );

  const { stockStatus } = getStockStatus(productBE.stockCount);
  const ratingStars = roundRating(productBE.averageRating);
  const createdAt = parseDate(productBE.createdAt);
  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const badges = generateBadges({
    createdAt,
    discountPercentage,
    /** Featured */
    featured: productBE.featured,
    stockStatus,
    salesCount: 0, // Not available in list item
  });

  return {
    /** Id */
    id: productBE.id,
    /** Name */
    name: productBE.name,
    /** Slug */
    slug: productBE.slug,
    /** Price */
    price: productBE.price,
    /** Compare At Price */
    compareAtPrice: productBE.compareAtPrice || null,
    /** Formatted Price */
    formattedPrice: formatPrice(productBE.price),
    discount,
    discountPercentage,
    /** Primary Image */
    primaryImage: productBE.images?.[0] || "/placeholder-product.jpg",
    /** Status */
    status: productBE.status,
    stockStatus,
    /** Average Rating */
    averageRating: productBE.averageRating,
    ratingStars,
    /** Review Count */
    reviewCount: productBE.reviewCount,
    /** Shop Id */
    shopId: productBE.shopId,
    /** Brand */
    brand: productBE.brand || undefined,
    /** Featured */
    featured: productBE.featured,
    badges,

    // Backwards compatibility aliases
    /** Images */
    images: productBE.images || [],
    /** Videos */
    videos: productBE.videos || [],
    /** Original Price */
    originalPrice: productBE.compareAtPrice || null,
    /** Rating */
    rating: productBE.averageRating,
    /** Stock Count */
    stockCount: productBE.stockCount,
    condition: "new" as any, // Default, not available in list item
    /** Sku */
    sku: productBE.sku || null,
    /** Category Id */
    categoryId: productBE.categoryId || null,
    /** Sales Count */
    salesCount: productBE.salesCount || 0,
    /** Low Stock Threshold */
    lowStockThreshold: productBE.lowStockThreshold || 10,
  };
}

/**
 * Transform Frontend Product Form to Backend Create Request
 */
/**
 * Performs to b e product create operation
 *
 * @param {ProductFormFE} formFE - The form f e
 *
 * @returns {any} The tobeproductcreate result
 *
 * @example
 * toBEProductCreate(formFE);
 */

/**
 * Performs to b e product create operation
 *
 * @param {ProductFormFE} formFE - The form f e
 *
 * @returns {any} The tobeproductcreate result
 *
 * @example
 * toBEProductCreate(formFE);
 */

export function toBEProductCreate(formFE: ProductFormFE): any {
  return {
    /** Name */
    name: formFE.name,
    /** Slug */
    slug: formFE.slug,
    /** Sku */
    sku: formFE.sku,
    /** Description */
    description: formFE.description || "",
    /** Category Id */
    categoryId: formFE.categoryId,
    /** Brand */
    brand: formFE.brand || "",
    /** Price */
    price: formFE.price,
    /** Compare At Price */
    compareAtPrice: formFE.compareAtPrice || undefined,
    /** Stock Count */
    stockCount: formFE.stockCount,
    /** Low Stock Threshold */
    lowStockThreshold: formFE.lowStockThreshold || 5,
    /** Weight */
    weight: formFE.weight || undefined,
    /** Images */
    images: formFE.images || [],
    /** Videos */
    videos: formFE.videos || [],
    /** Status */
    status: formFE.status,
    /** Condition */
    condition: formFE.condition,
    /** Shop Id */
    shopId: formFE.shopId,
    /** Shipping Class */
    shippingClass: formFE.shippingClass,
    /** Return Policy */
    returnPolicy: formFE.returnPolicy || "",
    /** Warranty Info */
    warrantyInfo: formFE.warrantyInfo || "",
    /** Features */
    features: formFE.features || [],
    /** Specifications */
    specifications: formFE.specifications || {},
    /** Meta Title */
    metaTitle: formFE.metaTitle || "",
    /** Meta Description */
    metaDescription: formFE.metaDescription || "",
    /** Featured */
    featured: formFE.featured || false,
    /** Is Returnable */
    isReturnable: true,
    /** Country Of Origin */
    countryOfOrigin: "India",
    /** Track Inventory */
    trackInventory: true,
  };
}

/**
 * Transform Frontend Product Form to Backend Update Request
 */
/**
 * Performs to b e product update operation
 *
 * @param {Partial<ProductFormFE>} formFE - The form f e
 *
 * @returns {any} The tobeproductupdate result
 *
 * @example
 * toBEProductUpdate(formFE);
 */

/**
 * Performs to b e product update operation
 *
 * @param {Partial<ProductFormFE>} formFE - The form f e
 *
 * @returns {any} The tobeproductupdate result
 *
 * @example
 * toBEProductUpdate(formFE);
 */

export function toBEProductUpdate(formFE: Partial<ProductFormFE>): any {
  const updateData: any = {};

  if (formFE.name !== undefined) updateData.name = formFE.name;
  if (formFE.slug !== undefined) updateData.slug = formFE.slug;
  if (formFE.description !== undefined)
    updateData.description = formFE.description;
  if (formFE.categoryId !== undefined)
    updateData.categoryId = formFE.categoryId;
  if (formFE.brand !== undefined) updateData.brand = formFE.brand;
  if (formFE.price !== undefined) updateData.price = formFE.price;
  if (formFE.compareAtPrice !== undefined)
    updateData.compareAtPrice = formFE.compareAtPrice;
  if (formFE.stockCount !== undefined)
    updateData.stockCount = formFE.stockCount;
  if (formFE.lowStockThreshold !== undefined)
    updateData.lowStockThreshold = formFE.lowStockThreshold;
  if (formFE.weight !== undefined) updateData.weight = formFE.weight;
  if (formFE.images !== undefined) updateData.images = formFE.images;
  if (formFE.videos !== undefined) updateData.videos = formFE.videos;
  if (formFE.status !== undefined) updateData.status = formFE.status;
  if (formFE.condition !== undefined) updateData.condition = formFE.condition;
  if (formFE.shippingClass !== undefined)
    updateData.shippingClass = formFE.shippingClass;
  if (formFE.returnPolicy !== undefined)
    updateData.returnPolicy = formFE.returnPolicy;
  if (formFE.warrantyInfo !== undefined)
    updateData.warrantyInfo = formFE.warrantyInfo;
  if (formFE.features !== undefined) updateData.features = formFE.features;
  if (formFE.specifications !== undefined)
    updateData.specifications = formFE.specifications;
  if (formFE.metaTitle !== undefined) updateData.metaTitle = formFE.metaTitle;
  if (formFE.metaDescription !== undefined)
    updateData.metaDescription = formFE.metaDescription;
  if (formFE.featured !== undefined) updateData.featured = formFE.featured;

  return updateData;
}

/**
 * Transform array of BE products to array of FE products
 */
/**
 * Performs to f e products operation
 *
 * @param {ProductBE[]} productsBE - The products b e
 *
 * @returns {any} The tofeproducts result
 *
 * @example
 * toFEProducts(productsBE);
 */

/**
 * Performs to f e products operation
 *
 * @param {ProductBE[]} productsBE - The products b e
 *
 * @returns {any} The tofeproducts result
 *
 * @example
 * toFEProducts(productsBE);
 */

export function toFEProducts(productsBE: ProductBE[]): ProductFE[] {
  return productsBE.map(toFEProduct);
}

/**
 * Transform array of BE product list items to array of FE product cards
 */
/**
 * Performs to f e product cards operation
 *
 * @param {ProductListItemBE[]} productsBE - The products b e
 *
 * @returns {any} The tofeproductcards result
 *
 * @example
 * toFEProductCards(productsBE);
 */

/**
 * Performs to f e product cards operation
 *
 * @param {ProductListItemBE[]} /** Products B E */
  productsBE - The /**  products  b  e */
  products b e
 *
 * @returns {any} The tofeproductcards result
 *
 * @example
 * toFEProductCards(/** Products B E */
  productsBE);
 */

export function toFEProductCards(
  /** Products B E */
  productsBE: ProductListItemBE[]
): ProductCardFE[] {
  return productsBE.map(toFEProductCard);
}
