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
}
