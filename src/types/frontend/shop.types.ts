/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/shop.types
 * @description This file contains TypeScript type definitions for shop
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * FRONTEND SHOP TYPES
 */

import { Status } from "../shared/common.types";

/**
 * ShopFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopFE
 */
export interface ShopFE {
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
  /** Status */
  status: Status;
  /** Is Verified */
  isVerified: boolean;
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

  // Extended fields (optional - for admin/seller forms)
  /** Website */
  website?: string | null;
  /** Social Links */
  socialLinks?: {
    /** Facebook */
    facebook?: string | null;
    /** Instagram */
    instagram?: string | null;
    /** Twitter */
    twitter?: string | null;
  };
  /** Gst */
  gst?: string | null;
  /** Pan */
  pan?: string | null;
  /** Policies */
  policies?: {
    /** Return Policy */
    returnPolicy?: string | null;
    /** Shipping Policy */
    shippingPolicy?: string | null;
  };
  /** Bank Details */
  bankDetails?: {
    /** Account Holder Name */
    accountHolderName?: string | null;
    /** Account Number */
    accountNumber?: string | null;
    /** Ifsc Code */
    ifscCode?: string | null;
    /** Bank Name */
    bankName?: string | null;
    /** Branch Name */
    branchName?: string | null;
  };
  /** Upi Id */
  upiId?: string | null;

  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // Computed
  /** Formatted Total Sales */
  formattedTotalSales: string;
  /** Formatted Min Order Amount */
  formattedMinOrderAmount: string;
  /** Formatted Shipping Charge */
  formattedShippingCharge: string;
  /** Rating Display */
  ratingDisplay: string;
  /** Url Path */
  urlPath: string;
  /** Is Active */
  isActive: boolean;
  /** Has Products */
  hasProducts: boolean;
  /** Badges */
  badges: string[];

  // Backwards compatibility aliases
  productCount?: number; // Alias for totalProducts
  follower_count?: number; // For admin pages
  featured?: boolean; // Derived from metadata
  isBanned?: boolean; // status === 'banned'
  banReason?: string | null; // From metadata
}

/**
 * ShopCardFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopCardFE
 */
export interface ShopCardFE {
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
  /** Rating Display */
  ratingDisplay: string;
  /** Total Products */
  totalProducts: number;
  /** Is Verified */
  isVerified: boolean;
  /** Url Path */
  urlPath: string;
  /** Badges */
  badges: string[];

  // Backwards compatibility (admin pages)
  /** Email */
  email?: string;
  location?: string; // Formatted location string
  /** Featured */
  featured?: boolean;
  /** Is Banned */
  isBanned?: boolean;
  productCount?: number; // Alias for totalProducts
  /** Review Count */
  reviewCount?: number;
  /** Owner Id */
  ownerId?: string;
  description?: string | null; // Shop description for cards
  banner?: string | null; // Banner image for cards
  createdAt?: string; // Creation date for sorting
}

/**
 * ShopFormFE interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopFormFE
 */
export interface ShopFormFE {
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description: string;
  /** Logo */
  logo: string | null;
  /** Banner */
  banner: string | null;
  /** Email */
  email: string;
  /** Phone */
  phone: string;
  /** Address */
  address: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Postal Code */
  postalCode: string;

  // Extended fields (optional)
  /** Location */
  location?: string;
  /** Website */
  website?: string;
  /** Facebook */
  facebook?: string;
  /** Instagram */
  instagram?: string;
  /** Twitter */
  twitter?: string;
  /** Gst */
  gst?: string;
  /** Pan */
  pan?: string;
  /** Return Policy */
  returnPolicy?: string;
  /** Shipping Policy */
  shippingPolicy?: string;
  /** Bank Details */
  bankDetails?: {
    /** Account Holder Name */
    accountHolderName: string;
    /** Account Number */
    accountNumber: string;
    /** Ifsc Code */
    ifscCode: string;
    /** Bank Name */
    bankName: string;
    /** Branch Name */
    branchName: string;
  };
  /** Upi Id */
  upiId?: string;
}
