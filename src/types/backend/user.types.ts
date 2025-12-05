/**
 * @fileoverview Type Definitions
 * @module src/types/backend/user.types
 * @description This file contains TypeScript type definitions for user
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * BACKEND USER TYPES
 *
 * These types match the API response structure and Firestore documents exactly.
 * Used for data received from backend services.
 *
 * @see src/types/frontend/user.types.ts for UI-optimized types
 * @see src/types/transforms/user.transforms.ts for conversion functions
 */

import { Timestamp } from "firebase/firestore";
import { UserRole, UserStatus } from "../shared/common.types";
import { PaginationMeta, FilterOperator } from "../shared/pagination.types";

/**
 * User entity from backend/Firestore
 */
export interface UserBE {
  /** Id */
  id: string;
  /** Uid */
  uid: string; // Firebase Auth UID
  /** Email */
  email: string;
  /** Display Name */
  displayName: string | null;
  /** Photo U R L */
  photoURL: string | null;
  /** Phone Number */
  phoneNumber: string | null;
  /** Role */
  role: UserRole;
  /** Status */
  status: UserStatus;

  // Profile
  /** First Name */
  firstName: string | null;
  /** Last Name */
  lastName: string | null;
  /** Bio */
  bio: string | null;
  /** Location */
  location: string | null;

  // Verification
  /** Email Verified */
  emailVerified: boolean;
  /** Phone Verified */
  phoneVerified: boolean;

  // Shop (for sellers)
  /** Shop Id */
  shopId: string | null;
  /** Shop Name */
  shopName: string | null;
  /** Shop Slug */
  shopSlug: string | null;

  // Stats
  /** Total Orders */
  totalOrders: number;
  /** Total Spent */
  totalSpent: number;
  /** Total Sales */
  totalSales: number;
  /** Total Products */
  totalProducts: number;
  /** Total Auctions */
  totalAuctions: number;
  /** Rating */
  rating: number;
  /** Review Count */
  reviewCount: number;

  // Preferences
  /** Notifications */
  notifications: {
    /** Email */
    email: boolean;
    /** Push */
    push: boolean;
    /** Order Updates */
    orderUpdates: boolean;
    /** Auction Updates */
    auctionUpdates: boolean;
    /** Promotions */
    promotions: boolean;
  };

  // Timestamps
  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
  /** Last Login At */
  lastLoginAt: Timestamp | null;

  // Metadata
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * User list item (minimal fields for lists)
 */
export interface UserListItemBE {
  /** Id */
  id: string;
  /** Uid */
  uid: string;
  /** Email */
  email: string;
  /** Display Name */
  displayName: string | null;
  /** Photo U R L */
  photoURL: string | null;
  /** Role */
  role: UserRole;
  /** Status */
  status: UserStatus;
  /** Email Verified */
  emailVerified: boolean;
  /** Created At */
  createdAt: Timestamp;
  /** Last Login At */
  lastLoginAt: Timestamp | null;
}

/**
 * User profile update request
 */
export interface UpdateUserProfileBE {
  /** Display Name */
  displayName?: string;
  /** Photo U R L */
  photoURL?: string;
  /** Phone Number */
  phoneNumber?: string;
  /** First Name */
  firstName?: string;
  /** Last Name */
  lastName?: string;
  /** Bio */
  bio?: string;
  /** Location */
  location?: string;
}

/**
 * User preferences update
 */
export interface UpdateUserPreferencesBE {
  /** Notifications */
  notifications?: {
    /** Email */
    email?: boolean;
    /** Push */
    push?: boolean;
    /** Order Updates */
    orderUpdates?: boolean;
    /** Auction Updates */
    auctionUpdates?: boolean;
    /** Promotions */
    promotions?: boolean;
  };
}

/**
 * Admin user update (role, status)
 */
export interface AdminUpdateUserBE {
  /** Role */
  role?: UserRole;
  /** Status */
  status?: UserStatus;
  /** Email Verified */
  emailVerified?: boolean;
  /** Phone Verified */
  phoneVerified?: boolean;
}

/**
 * User filters for list queries
 */
export interface UserFiltersBE {
  /** Role */
  role?: UserRole | UserRole[];
  /** Status */
  status?: UserStatus | UserStatus[];
  /** Email Verified */
  emailVerified?: boolean;
  /** Phone Verified */
  phoneVerified?: boolean;
  /** Has Shop */
  hasShop?: boolean;
  /** Search */
  search?: string; // Search in name, email
  /** CreatedAfter */
  createdAfter?: string; // ISO date
  /** CreatedBefore */
  createdBefore?: string; // ISO date
  /** LastLoginAfter */
  lastLoginAfter?: string; // ISO date
}

/**
 * User list response
 */
export interface UserListResponseBE {
  /** Users */
  users: UserListItemBE[];
  /** Pagination */
  pagination: PaginationMeta;
}

/**
 * User detail response
 */
export interface UserDetailResponseBE {
  /** User */
  user: UserBE;
}

/**
 * User stats response
 */
export interface UserStatsResponseBE {
  /** Total Users */
  totalUsers: number;
  /** Active Users */
  activeUsers: number;
  /** New Users Today */
  newUsersToday: number;
  /** New Users This Week */
  newUsersThisWeek: number;
  /** New Users This Month */
  newUsersThisMonth: number;
  /** Users By Role */
  usersByRole: Record<UserRole, number>;
  /** Users By Status */
  usersByStatus: Record<UserStatus, number>;
}

/**
 * Bulk user operation request
 */
export interface BulkUserOperationBE {
  /** User Ids */
  userIds: string[];
  /** Operation */
  operation: "activate" | "deactivate" | "delete" | "verify-email";
}

/**
 * Bulk user operation response
 */
export interface BulkUserOperationResponseBE {
  /** Success */
  success: number;
  /** Failed */
  failed: number;
  /** Errors */
  errors: Array<{
    /** User Id */
    userId: string;
    /** Error */
    error: string;
  }>;
}

/**
 * User update request (for admin/self updates)
 */
export interface UpdateUserRequestBE {
  /** Display Name */
  displayName?: string;
  /** First Name */
  firstName?: string;
  /** Last Name */
  lastName?: string;
  /** Phone Number */
  phoneNumber?: string;
  /** Bio */
  bio?: string;
  /** Location */
  location?: string;
  /** Photo U R L */
  photoURL?: string;
}

/**
 * Ban user request
 */
export interface BanUserRequestBE {
  /** Is Banned */
  isBanned: boolean;
  /** Ban Reason */
  banReason?: string;
}

/**
 * Change role request
 */
export interface ChangeRoleRequestBE {
  /** Role */
  role: string;
  /** Notes */
  notes?: string;
}
