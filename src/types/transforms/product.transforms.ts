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

import { formatPrice } from "@letitrip/react-library";

/**
 * Calculate discount
 */
function calculateDiscount(
  price: number,
  compareAtPrice?: number,
): {
  discount: number | null;
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
function getStockStatus(
  stockCount: number,
  lowStockThreshold: number = 5,
): {
  isInStock: boolean;
  isLowStock: boolean;
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
function generateBadges(product: {
  createdAt: Date;
  discountPercentage: number | null;
  featured: boolean;
  stockStatus: string;
  salesCount: number;
}): ProductBadge[] {
  const badges: ProductBadge[] = [];

  // New product (within 30 days)
  const daysSinceCreation = Math.floor(
    (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceCreation <= 30) {
    badges.push({ type: "new", label: "New", color: "blue" });
  }

  // Sale badge
  if (product.discountPercentage && product.discountPercentage > 0) {
    badges.push({
      type: "sale",
      label: `${product.discountPercentage}% OFF`,
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
function roundRating(rating: number): number {
  return Math.round(rating * 2) / 2;
}

// ==================== TRANSFORMATIONS ====================

/**
 * Transform Backend Product to Frontend Product
 */
export function toFEProduct(productBE: ProductBE): ProductFE {
  const createdAt = parseDate(productBE.createdAt || productBE.created_at);
  const updatedAt = parseDate(productBE.updatedAt || productBE.updated_at);

  const { discount, discountPercentage } = calculateDiscount(
    productBE.price,
    productBE.compareAtPrice,
  );

  const { isInStock, isLowStock, stockStatus } = getStockStatus(
    productBE.stockCount,
    productBE.lowStockThreshold,
  );

  const ratingStars = roundRating(productBE.averageRating);

  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  const productFE: ProductFE = {
    // Basic Info
    id: productBE.id,
    name: productBE.name,
    slug: productBE.slug,
    sku: productBE.sku,
    description: productBE.description || "",

    // Categorization
    categoryId: productBE.categoryId,
    categoryIds: productBE.categoryIds || [],
    brand: productBE.brand || "",
    tags: productBE.tags || [],

    // Pricing
    price: productBE.price,
    compareAtPrice: productBE.compareAtPrice || null,
    discount,
    discountPercentage,
    formattedPrice: formatPrice(productBE.price),
    formattedCompareAtPrice: productBE.compareAtPrice
      ? formatPrice(productBE.compareAtPrice)
      : null,

    // Inventory
    stockCount: productBE.stockCount,
    lowStockThreshold: productBE.lowStockThreshold || 5,
    isInStock,
    isLowStock,
    stockStatus,

    // Physical
    weight: productBE.weight || null,
    dimensions: productBE.dimensions || null,

    // Media
    images: productBE.images || [],
    primaryImage: productBE.images?.[0] || "/placeholder-product.jpg",
    videos: productBE.videos || [],

    // Status
    status: productBE.status,
    condition: productBE.condition,
    featured: productBE.featured,
    isReturnable: productBE.isReturnable,
    isPublished: productBE.status === ProductStatus.PUBLISHED,

    // Shop
    shopId: productBE.shopId,
    sellerId: productBE.sellerId,

    // Shipping
    shippingClass: productBE.shippingClass,
    returnWindowDays: productBE.returnWindowDays || 7,
    returnPolicy: productBE.returnPolicy || "",
    warrantyInfo: productBE.warrantyInfo || "",

    // Details
    features: productBE.features || [],
    specifications: productBE.specifications || {},

    // SEO
    metaTitle: productBE.metaTitle || productBE.name,
    metaDescription: productBE.metaDescription || productBE.description || "",

    // Stats
    viewCount: productBE.viewCount || 0,
    salesCount: productBE.salesCount || 0,
    favoriteCount: productBE.favoriteCount || 0,
    reviewCount: productBE.reviewCount || 0,
    averageRating: productBE.averageRating || 0,
    ratingStars,
    hasReviews: (productBE.reviewCount || 0) > 0,

    // Origin
    countryOfOrigin: productBE.countryOfOrigin || "India",
    manufacturer: productBE.manufacturer || "",

    // Timestamps
    createdAt,
    updatedAt,

    // UI-specific
    isNew: daysSinceCreation <= 30,
    isTrending: (productBE.salesCount || 0) > 100,

    // Badges
    badges: [],

    // Backwards compatibility aliases
    costPrice: productBE.compareAtPrice || undefined,
    originalPrice: productBE.compareAtPrice || null,
    rating: productBE.averageRating || 0,
  };

  // Generate badges after product object is created
  productFE.badges = generateBadges({
    createdAt,
    discountPercentage,
    featured: productBE.featured,
    stockStatus,
    salesCount: productBE.salesCount || 0,
  });

  return productFE;
}

/**
 * Transform Backend Product List Item to Frontend Product Card
 */
export function toFEProductCard(productBE: ProductListItemBE): ProductCardFE {
  const { discount, discountPercentage } = calculateDiscount(
    productBE.price,
    productBE.compareAtPrice,
  );

  const { stockStatus } = getStockStatus(productBE.stockCount);
  const ratingStars = roundRating(productBE.averageRating);
  const createdAt = parseDate(productBE.createdAt);
  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  const badges = generateBadges({
    createdAt,
    discountPercentage,
    featured: productBE.featured,
    stockStatus,
    salesCount: 0, // Not available in list item
  });

  return {
    id: productBE.id,
    name: productBE.name,
    slug: productBE.slug,
    price: productBE.price,
    compareAtPrice: productBE.compareAtPrice || null,
    formattedPrice: formatPrice(productBE.price),
    discount,
    discountPercentage,
    primaryImage: productBE.images?.[0] || "/placeholder-product.jpg",
    status: productBE.status,
    stockStatus,
    averageRating: productBE.averageRating,
    ratingStars,
    reviewCount: productBE.reviewCount,
    shopId: productBE.shopId,
    brand: productBE.brand || undefined,
    featured: productBE.featured,
    badges,

    // Backwards compatibility aliases
    images: productBE.images || [],
    videos: productBE.videos || [],
    originalPrice: productBE.compareAtPrice || null,
    rating: productBE.averageRating,
    stockCount: productBE.stockCount,
    condition: "new" as any, // Default, not available in list item
    sku: productBE.sku || null,
    categoryId: productBE.categoryId || null,
    salesCount: productBE.salesCount || 0,
    lowStockThreshold: productBE.lowStockThreshold || 10,
  };
}

/**
 * Transform Frontend Product Form to Backend Create Request
 */
export function toBEProductCreate(formFE: ProductFormFE): any {
  return {
    name: formFE.name,
    slug: formFE.slug,
    sku: formFE.sku,
    description: formFE.description || "",
    categoryId: formFE.categoryId,
    brand: formFE.brand || "",
    price: formFE.price,
    compareAtPrice: formFE.compareAtPrice || undefined,
    stockCount: formFE.stockCount,
    lowStockThreshold: formFE.lowStockThreshold || 5,
    weight: formFE.weight || undefined,
    images: formFE.images || [],
    videos: formFE.videos || [],
    status: formFE.status,
    condition: formFE.condition,
    shopId: formFE.shopId,
    shippingClass: formFE.shippingClass,
    returnPolicy: formFE.returnPolicy || "",
    warrantyInfo: formFE.warrantyInfo || "",
    features: formFE.features || [],
    specifications: formFE.specifications || {},
    metaTitle: formFE.metaTitle || "",
    metaDescription: formFE.metaDescription || "",
    featured: formFE.featured || false,
    isReturnable: true,
    countryOfOrigin: "India",
    trackInventory: true,
  };
}

/**
 * Transform Frontend Product Form to Backend Update Request
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
export function toFEProducts(productsBE: ProductBE[]): ProductFE[] {
  return productsBE.map(toFEProduct);
}

/**
 * Transform array of BE product list items to array of FE product cards
 */
export function toFEProductCards(
  productsBE: ProductListItemBE[],
): ProductCardFE[] {
  return productsBE.map(toFEProductCard);
}
