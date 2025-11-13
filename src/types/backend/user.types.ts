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
  id: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;

  // Profile
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  location: string | null;

  // Verification
  emailVerified: boolean;
  phoneVerified: boolean;

  // Shop (for sellers)
  shopId: string | null;
  shopName: string | null;
  shopSlug: string | null;

  // Stats
  totalOrders: number;
  totalSpent: number;
  totalSales: number;
  totalProducts: number;
  totalAuctions: number;
  rating: number;
  reviewCount: number;

  // Preferences
  notifications: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    auctionUpdates: boolean;
    promotions: boolean;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * User list item (minimal fields for lists)
 */
export interface UserListItemBE {
  id: string;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp | null;
}

/**
 * User profile update request
 */
export interface UpdateUserProfileBE {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
}

/**
 * User preferences update
 */
export interface UpdateUserPreferencesBE {
  notifications?: {
    email?: boolean;
    push?: boolean;
    orderUpdates?: boolean;
    auctionUpdates?: boolean;
    promotions?: boolean;
  };
}

/**
 * Admin user update (role, status)
 */
export interface AdminUpdateUserBE {
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

/**
 * User filters for list queries
 */
export interface UserFiltersBE {
  role?: UserRole | UserRole[];
  status?: UserStatus | UserStatus[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  hasShop?: boolean;
  search?: string; // Search in name, email
  createdAfter?: string; // ISO date
  createdBefore?: string; // ISO date
  lastLoginAfter?: string; // ISO date
}

/**
 * User list response
 */
export interface UserListResponseBE {
  users: UserListItemBE[];
  pagination: PaginationMeta;
}

/**
 * User detail response
 */
export interface UserDetailResponseBE {
  user: UserBE;
}

/**
 * User stats response
 */
export interface UserStatsResponseBE {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
}

/**
 * Bulk user operation request
 */
export interface BulkUserOperationBE {
  userIds: string[];
  operation: "activate" | "deactivate" | "delete" | "verify-email";
}

/**
 * Bulk user operation response
 */
export interface BulkUserOperationResponseBE {
  success: number;
  failed: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

/**
 * User update request (for admin/self updates)
 */
export interface UpdateUserRequestBE {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  photoURL?: string;
}

/**
 * Ban user request
 */
export interface BanUserRequestBE {
  isBanned: boolean;
  banReason?: string;
}

/**
 * Change role request
 */
export interface ChangeRoleRequestBE {
  role: string;
  notes?: string;
}
