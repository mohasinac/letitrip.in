/**
 * FRONTEND SHOP TYPES
 */

import { Status } from "../shared/common.types";

export interface ShopFE {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  totalProducts: number;
  totalAuctions: number;
  totalOrders: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  status: Status;
  isVerified: boolean;
  settings: {
    acceptsOrders: boolean;
    minOrderAmount: number;
    shippingCharge: number;
    freeShippingAbove: number | null;
  };

  // Extended fields (optional - for admin/seller forms)
  website?: string | null;
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  };
  gst?: string | null;
  pan?: string | null;
  policies?: {
    returnPolicy?: string | null;
    shippingPolicy?: string | null;
  };
  bankDetails?: {
    accountHolderName?: string | null;
    accountNumber?: string | null;
    ifscCode?: string | null;
    bankName?: string | null;
    branchName?: string | null;
  };
  upiId?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Computed
  formattedTotalSales: string;
  formattedMinOrderAmount: string;
  formattedShippingCharge: string;
  ratingDisplay: string;
  urlPath: string;
  isActive: boolean;
  hasProducts: boolean;
  badges: string[];

  // Backwards compatibility aliases
  productCount?: number; // Alias for totalProducts
  follower_count?: number; // For admin pages
  isFeatured?: boolean; // Derived from metadata
  showOnHomepage?: boolean; // Derived from metadata
  isBanned?: boolean; // status === 'banned'
  banReason?: string | null; // From metadata
}

export interface ShopCardFE {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating: number;
  ratingDisplay: string;
  totalProducts: number;
  isVerified: boolean;
  urlPath: string;
  badges: string[];

  // Backwards compatibility (admin pages)
  email?: string;
  location?: string; // Formatted location string
  isFeatured?: boolean;
  isBanned?: boolean;
  showOnHomepage?: boolean;
  productCount?: number; // Alias for totalProducts
  reviewCount?: number;
  ownerId?: string;
  description?: string | null; // Shop description for cards
  banner?: string | null; // Banner image for cards
  createdAt?: string; // Creation date for sorting
}

export interface ShopFormFE {
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;

  // Extended fields (optional)
  location?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  gst?: string;
  pan?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
  };
  upiId?: string;
}
