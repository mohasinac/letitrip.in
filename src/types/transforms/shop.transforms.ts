/**
 * SHOP TYPE TRANSFORMATIONS
 */

import { Timestamp } from "firebase/firestore";
import { ShopBE, CreateShopRequestBE } from "../backend/shop.types";
import { ShopFE, ShopFormFE, ShopCardFE } from "../frontend/shop.types";
import { Status } from "../shared/common.types";
import { safeToISOString } from "@/lib/date-utils";

function parseDate(date: Timestamp | string): Date {
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function toFEShop(shopBE: ShopBE): ShopFE {
  const badges: string[] = [];
  if (shopBE.isVerified) badges.push("Verified");
  if (shopBE.rating >= 4.5) badges.push("Top Rated");
  if (shopBE.totalProducts >= 100) badges.push("Large Catalog");

  return {
    ...shopBE,
    createdAt: parseDate(shopBE.createdAt),
    updatedAt: parseDate(shopBE.updatedAt),
    formattedTotalSales: formatPrice(shopBE.totalSales),
    formattedMinOrderAmount: formatPrice(shopBE.settings.minOrderAmount),
    formattedShippingCharge: formatPrice(shopBE.settings.shippingCharge),
    ratingDisplay:
      shopBE.reviewCount > 0
        ? `${shopBE.rating.toFixed(1)} (${shopBE.reviewCount})`
        : "No reviews",
    urlPath: `/shops/${shopBE.slug}`,
    isActive: shopBE.status === Status.PUBLISHED,
    hasProducts: shopBE.totalProducts > 0,
    badges,

    // Extended fields from metadata
    website: shopBE.metadata?.website || null,
    socialLinks: shopBE.metadata?.socialLinks || undefined,
    gst: shopBE.metadata?.gst || null,
    pan: shopBE.metadata?.pan || null,
    policies: shopBE.metadata?.policies || undefined,
    bankDetails: shopBE.metadata?.bankDetails || undefined,
    upiId: shopBE.metadata?.upiId || null,

    // Backwards compatibility
    productCount: shopBE.totalProducts,
    follower_count: 0, // Not in backend yet, placeholder
    featured: shopBE.metadata?.featured || false,
    isBanned: shopBE.status === Status.ARCHIVED, // Using ARCHIVED for banned shops
    banReason: shopBE.metadata?.banReason || null,
  };
}

export function toBECreateShopRequest(
  formData: ShopFormFE,
): CreateShopRequestBE {
  return {
    name: formData.name,
    slug: formData.slug,
    description: formData.description || undefined,
    logo: formData.logo || undefined,
    banner: formData.banner || undefined,
    email: formData.email,
    phone: formData.phone || undefined,
    address: formData.address || undefined,
    city: formData.city || undefined,
    state: formData.state || undefined,
    postalCode: formData.postalCode || undefined,
  };
}

export function toFEShopCard(shopBE: ShopBE): ShopCardFE {
  const badges: string[] = [];
  if (shopBE.isVerified) badges.push("Verified");
  if (shopBE.rating >= 4.5) badges.push("Top Rated");
  if (shopBE.totalProducts >= 100) badges.push("Large Catalog");

  // Format location
  const locationParts = [shopBE.city, shopBE.state].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(", ") : null;

  return {
    id: shopBE.id,
    name: shopBE.name,
    slug: shopBE.slug,
    logo: shopBE.logo,
    rating: shopBE.rating,
    ratingDisplay:
      shopBE.reviewCount > 0
        ? `${shopBE.rating.toFixed(1)} (${shopBE.reviewCount})`
        : "No reviews",
    totalProducts: shopBE.totalProducts,
    isVerified: shopBE.isVerified,
    urlPath: `/shops/${shopBE.slug}`,
    badges,

    // Backwards compatibility (admin pages)
    email: shopBE.email,
    location: location || undefined,
    featured: shopBE.metadata?.featured || false,
    isBanned: shopBE.status === Status.ARCHIVED, // Using ARCHIVED for banned
    productCount: shopBE.totalProducts,
    reviewCount: shopBE.reviewCount,
    ownerId: shopBE.ownerId,
    description: shopBE.description || null,
    banner: shopBE.banner || null,
    createdAt: safeToISOString(shopBE.createdAt) || undefined,
  };
}

export function toFEShops(shopsBE: ShopBE[]): ShopFE[] {
  return shopsBE.map(toFEShop);
}

export function toFEShopCards(shopsBE: ShopBE[]): ShopCardFE[] {
  return shopsBE.map(toFEShopCard);
}
