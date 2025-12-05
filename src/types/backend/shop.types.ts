/**
 * @fileoverview Type Definitions
 * @module src/types/backend/shop.types
 * @description This file contains TypeScript type definitions for shop
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * BACKEND SHOP TYPES
 */

import { Timestamp } from "firebase/firestore";
import { Status } from "../shared/common.types";

/**
 * ShopBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopBE
 */
export interface ShopBE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description: string | null;
  /** Logo */
  logo: string | null;
  /** Banner */
  banner: string | null;
  /** Owner Id */
  ownerId: string;
  /** Owner Name */
  ownerName: string;
  /** Owner Email */
  ownerEmail: string;

  // Contact
  /** Email */
  email: string;
  /** Phone */
  phone: string | null;
  /** Address */
  address: string | null;
  /** City */
  city: string | null;
  /** State */
  state: string | null;
  /** Postal Code */
  postalCode: string | null;

  // Stats
  /** Total Products */
  totalProducts: number;
  /** Total Auctions */
  totalAuctions: number;
  /** Total Orders */
  totalOrders: number;
  /** Total Sales */
  totalSales: number;
  /** Rating */
  rating: number;
  /** Review Count */
  reviewCount: number;

  // Status
  /** Status */
  status: Status;
  /** Is Verified */
  isVerified: boolean;

  // Settings
  /** Settings */
  settings: {
    /** Accepts Orders */
    acceptsOrders: boolean;
    /** Min Order Amount */
    minOrderAmount: number;
    /** Shipping Charge */
    shippingCharge: number;
    /** Free Shipping Above */
    freeShippingAbove: number | null;
  };

  // Metadata
  /** Metadata */
  metadata?: Record<string, any>;

  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
}

/**
 * ShopListItemBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopListItemBE
 */
export interface ShopListItemBE {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Logo */
  logo: string | null;
  /** Rating */
  rating: number;
  /** Review Count */
  reviewCount: number;
  /** Total Products */
  totalProducts: number;
  /** Status */
  status: Status;
  /** Is Verified */
  isVerified: boolean;
}

/**
 * CreateShopRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateShopRequestBE
 */
export interface CreateShopRequestBE {
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description?: string;
  /** Logo */
  logo?: string;
  /** Banner */
  banner?: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string;
  /** Address */
  address?: string;
  /** City */
  city?: string;
  /** State */
  state?: string;
  /** Postal Code */
  postalCode?: string;
}

/**
 * UpdateShopRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for UpdateShopRequestBE
 */
export interface UpdateShopRequestBE {
  /** Name */
  name?: string;
  /** Description */
  description?: string;
  /** Logo */
  logo?: string;
  /** Banner */
  banner?: string;
  /** Email */
  email?: string;
  /** Phone */
  phone?: string;
  /** Address */
  address?: string;
  /** Settings */
  settings?: {
    /** Accepts Orders */
    acceptsOrders?: boolean;
    /** Min Order Amount */
    minOrderAmount?: number;
    /** Shipping Charge */
    shippingCharge?: number;
    /** Free Shipping Above */
    freeShippingAbove?: number;
  };
}

/**
 * ShopStatsResponseBE interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopStatsResponseBE
 */
export interface ShopStatsResponseBE {
  /** Total Shops */
  totalShops: number;
  /** Active Shops */
  activeShops: number;
  /** Verified Shops */
  verifiedShops: number;
  /** Total Revenue */
  totalRevenue: number;
  /** Average Rating */
  averageRating: number;
}

/**
 * Shop filters for list queries
 */
export interface ShopFiltersBE {
  search?: string; // Search in name, description
  /** Status */
  status?: Status | Status[];
  /** Is Verified */
  isVerified?: boolean;
  /** City */
  city?: string;
  /** State */
  state?: string;
  /** Min Rating */
  minRating?: number;
  /** Seller Id */
  sellerId?: string;
}
