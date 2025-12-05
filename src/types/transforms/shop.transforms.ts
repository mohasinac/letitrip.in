/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/shop.transforms
 * @description This file contains functionality related to shop.transforms
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * SHOP TYPE TRANSFORMATIONS
 */

import { Timestamp } from "firebase/firestore";
import { ShopBE, CreateShopRequestBE } from "../backend/shop.types";
import { ShopFE, ShopFormFE, ShopCardFE } from "../frontend/shop.types";
import { Status } from "../shared/common.types";
import { safeToISOString } from "@/lib/date-utils";

/**
 * Function: Parse Date
 */
/**
 * Parses date
 *
 * @param {Timestamp | string} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string} date - The date
 *
 * @returns {any} The parsedate result
 */

function parseDate(date: Timestamp | string): Date {
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

/**
 * Function: Format Price
 */
/**
 * Formats price
 *
 * @param {number} price - The price
 *
 * @returns {string} The formatprice result
 */

/**
 * Formats price
 *
 * @param {number} price - The price
 *
 * @returns {string} The formatprice result
 */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    /** Style */
    style: "currency",
    /** Currency */
    currency: "INR",
    /** Maximum Fraction Digits */
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Function: To F E Shop
 */
/**
 * Performs to f e shop operation
 *
 * @param {ShopBE} shopBE - The shop b e
 *
 * @returns {string} The tofeshop result
 *
 * @example
 * toFEShop(shopBE);
 */

/**
 * Performs to f e shop operation
 *
 * @param {ShopBE} shopBE - The shop b e
 *
 * @returns {string} The tofeshop result
 *
 * @example
 * toFEShop(shopBE);
 */

export function toFEShop(shopBE: ShopBE): ShopFE {
  const badges: string[] = [];
  if (shopBE.isVerified) badges.push("Verified");
  if (shopBE.rating >= 4.5) badges.push("Top Rated");
  if (shopBE.totalProducts >= 100) badges.push("Large Catalog");

  return {
    ...shopBE,
    /** Created At */
    createdAt: parseDate(shopBE.createdAt),
    /** Updated At */
    updatedAt: parseDate(shopBE.updatedAt),
    /** Formatted Total Sales */
    formattedTotalSales: formatPrice(shopBE.totalSales),
    /** Formatted Min Order Amount */
    formattedMinOrderAmount: formatPrice(shopBE.settings.minOrderAmount),
    /** Formatted Shipping Charge */
    formattedShippingCharge: formatPrice(shopBE.settings.shippingCharge),
    /** Rating Display */
    ratingDisplay:
      shopBE.reviewCount > 0
        ? `${shopBE.rating.toFixed(1)} (${shopBE.reviewCount})`
        : "No reviews",
    /** Url Path */
    urlPath: `/shops/${shopBE.slug}`,
    /** Is Active */
    isActive: shopBE.status === Status.PUBLISHED,
    /** Has Products */
    hasProducts: shopBE.totalProducts > 0,
    badges,

    // Extended fields from metadata
    /** Website */
    website: shopBE.metadata?.website || null,
    /** Social Links */
    socialLinks: shopBE.metadata?.socialLinks || undefined,
    /** Gst */
    gst: shopBE.metadata?.gst || null,
    /** Pan */
    pan: shopBE.metadata?.pan || null,
    /** Policies */
    policies: shopBE.metadata?.policies || undefined,
    /** Bank Details */
    bankDetails: shopBE.metadata?.bankDetails || undefined,
    /** Upi Id */
    upiId: shopBE.metadata?.upiId || null,

    // Backwards compatibility
    /** Product Count */
    productCount: shopBE.totalProducts,
    follower_count: 0, // Not in backend yet, placeholder
    /** Featured */
    featured: shopBE.metadata?.featured || false,
    isBanned: shopBE.status === Status.ARCHIVED, // Using ARCHIVED for banned shops
    /** Ban Reason */
    banReason: shopBE.metadata?.banReason || null,
  };
}

/**
 * Function: To B E Create Shop Request
 */
/**
 * Performs to b e create shop request operation
 *
 * @param {ShopFormFE} formData - The form data
 *
 * @returns {any} The tobecreateshoprequest result
 *
 * @example
 * toBECreateShopRequest(formData);
 */

/**
 * Performs to b e create shop request operation
 *
 * @param {ShopFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreateshoprequest result
 *
 * @example
 * toBECreateShopRequest(/** Form Data */
  formData);
 */

/**
 * Performs to b e create shop request operation
 *
 * @param {ShopFormFE} formData - The formdata
 *
 * @returns {CreateShopRequestBE} The tobecreateshoprequest result
 *
 * @example
 * toBECreateShopRequest(formData);
 */
export function toBECreateShopRequest(
  /** Form Data */
  formData: ShopFormFE,
): CreateShopRequestBE {
  return {
    /** Name */
    name: formData.name,
    /** Slug */
    slug: formData.slug,
    /** Description */
    description: formData.description || undefined,
    /** Logo */
    logo: formData.logo || undefined,
    /** Banner */
    banner: formData.banner || undefined,
    /** Email */
    email: formData.email,
    /** Phone */
    phone: formData.phone || undefined,
    /** Address */
    address: formData.address || undefined,
    /** City */
    city: formData.city || undefined,
    /** State */
    state: formData.state || undefined,
    /** Postal Code */
    postalCode: formData.postalCode || undefined,
  };
}

/**
 * Function: To F E Shop Card
 */
/**
 * Performs to f e shop card operation
 *
 * @param {ShopBE} shopBE - The shop b e
 *
 * @returns {string} The tofeshopcard result
 *
 * @example
 * toFEShopCard(shopBE);
 */

/**
 * Performs to f e shop card operation
 *
 * @param {ShopBE} shopBE - The shop b e
 *
 * @returns {string} The tofeshopcard result
 *
 * @example
 * toFEShopCard(shopBE);
 */

export function toFEShopCard(shopBE: ShopBE): ShopCardFE {
  const badges: string[] = [];
  if (shopBE.isVerified) badges.push("Verified");
  if (shopBE.rating >= 4.5) badges.push("Top Rated");
  if (shopBE.totalProducts >= 100) badges.push("Large Catalog");

  // Format location
  const locationParts = [shopBE.city, shopBE.state].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : null;

  return {
    /** Id */
    id: shopBE.id,
    /** Name */
    name: shopBE.name,
    /** Slug */
    slug: shopBE.slug,
    /** Logo */
    logo: shopBE.logo,
    /** Rating */
    rating: shopBE.rating,
    /** Rating Display */
    ratingDisplay:
      shopBE.reviewCount > 0
        ? `${shopBE.rating.toFixed(1)} (${shopBE.reviewCount})`
        : "No reviews",
    /** Total Products */
    totalProducts: shopBE.totalProducts,
    /** Is Verified */
    isVerified: shopBE.isVerified,
    /** Url Path */
    urlPath: `/shops/${shopBE.slug}`,
    badges,

    // Backwards compatibility (admin pages)
    /** Email */
    email: shopBE.email,
    /** Location */
    location: location || undefined,
    /** Featured */
    featured: shopBE.metadata?.featured || false,
    isBanned: shopBE.status === Status.ARCHIVED, // Using ARCHIVED for banned
    /** Product Count */
    productCount: shopBE.totalProducts,
    /** Review Count */
    reviewCount: shopBE.reviewCount,
    /** Owner Id */
    ownerId: shopBE.ownerId,
    /** Description */
    description: shopBE.description || null,
    /** Banner */
    banner: shopBE.banner || null,
    /** Created At */
    createdAt: safeToISOString(shopBE.createdAt) || undefined,
  };
}

/**
 * Function: To F E Shops
 */
/**
 * Performs to f e shops operation
 *
 * @param {ShopBE[]} shopsBE - The shops b e
 *
 * @returns {any} The tofeshops result
 *
 * @example
 * toFEShops(shopsBE);
 */

/**
 * Performs to f e shops operation
 *
 * @param {ShopBE[]} shopsBE - The shops b e
 *
 * @returns {any} The tofeshops result
 *
 * @example
 * toFEShops(shopsBE);
 */

export function toFEShops(shopsBE: ShopBE[]): ShopFE[] {
  return shopsBE.map(toFEShop);
}

/**
 * Function: To F E Shop Cards
 */
/**
 * Performs to f e shop cards operation
 *
 * @param {ShopBE[]} shopsBE - The shops b e
 *
 * @returns {any} The tofeshopcards result
 *
 * @example
 * toFEShopCards(shopsBE);
 */

/**
 * Performs to f e shop cards operation
 *
 * @param {ShopBE[]} shopsBE - The shops b e
 *
 * @returns {any} The tofeshopcards result
 *
 * @example
 * toFEShopCards(shopsBE);
 */

export function toFEShopCards(shopsBE: ShopBE[]): ShopCardFE[] {
  return shopsBE.map(toFEShopCard);
}
