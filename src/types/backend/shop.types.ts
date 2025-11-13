/**
 * BACKEND SHOP TYPES
 */

import { Timestamp } from "firebase/firestore";
import { Status } from "../shared/common.types";

export interface ShopBE {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;

  // Contact
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;

  // Stats
  totalProducts: number;
  totalAuctions: number;
  totalOrders: number;
  totalSales: number;
  rating: number;
  reviewCount: number;

  // Status
  status: Status;
  isVerified: boolean;

  // Settings
  settings: {
    acceptsOrders: boolean;
    minOrderAmount: number;
    shippingCharge: number;
    freeShippingAbove: number | null;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ShopListItemBE {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating: number;
  reviewCount: number;
  totalProducts: number;
  status: Status;
  isVerified: boolean;
}

export interface CreateShopRequestBE {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface UpdateShopRequestBE {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  email?: string;
  phone?: string;
  address?: string;
  settings?: {
    acceptsOrders?: boolean;
    minOrderAmount?: number;
    shippingCharge?: number;
    freeShippingAbove?: number;
  };
}

export interface ShopStatsResponseBE {
  totalShops: number;
  activeShops: number;
  verifiedShops: number;
  totalRevenue: number;
  averageRating: number;
}
