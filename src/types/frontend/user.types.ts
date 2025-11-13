/**
 * FRONTEND USER TYPES
 *
 * These types are optimized for UI components and include computed fields,
 * formatted data, and UI-specific properties.
 *
 * @see src/types/backend/user.types.ts for API response types
 * @see src/types/transforms/user.transforms.ts for conversion functions
 */

import { UserRole, UserStatus } from "../shared/common.types";

/**
 * User entity for frontend (UI-optimized)
 */
export interface UserFE {
  id: string;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;

  // Profile
  firstName: string | null;
  lastName: string | null;
  fullName: string; // Computed: firstName + lastName or displayName
  initials: string; // Computed: First letters of name
  bio: string | null;
  location: string | null;

  // Verification
  emailVerified: boolean;
  phoneVerified: boolean;
  isVerified: boolean; // Computed: emailVerified && phoneVerified

  // Shop (for sellers)
  shopId: string | null;
  shopName: string | null;
  shopSlug: string | null;
  hasShop: boolean; // Computed: shopId !== null

  // Stats
  totalOrders: number;
  totalSpent: number;
  totalSales: number;
  totalProducts: number;
  totalAuctions: number;
  rating: number;
  reviewCount: number;

  // Formatted stats
  formattedTotalSpent: string; // "₹12,450"
  formattedTotalSales: string; // "₹45,600"
  ratingStars: number; // Rounded: 4.7 → 5
  ratingDisplay: string; // "4.7 (123 reviews)"

  // Preferences
  notifications: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    auctionUpdates: boolean;
    promotions: boolean;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;

  // Formatted dates
  memberSince: string; // "Member since Nov 2024"
  lastLoginDisplay: string; // "Last seen 2 hours ago" or "Never"
  accountAge: string; // "2 months"

  // UI States
  isActive: boolean; // status === 'active'
  isBlocked: boolean; // status === 'blocked'
  isSuspended: boolean; // status === 'suspended'
  isAdmin: boolean; // role === 'admin'
  isSeller: boolean; // role === 'seller'
  isUser: boolean; // role === 'user'

  // Badges
  badges: string[]; // ["Verified", "Top Seller", "New", etc.]

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * User card for lists (minimal fields)
 */
export interface UserCardFE {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  initials: string;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  ratingDisplay: string;
  memberSince: string;
  badges: string[];
}

/**
 * User profile form data
 */
export interface UserProfileFormFE {
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bio: string;
  location: string;
  photoURL: string | null;
}

/**
 * User preferences form data
 */
export interface UserPreferencesFormFE {
  notifications: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    auctionUpdates: boolean;
    promotions: boolean;
  };
}

/**
 * User filters for frontend
 */
export interface UserFiltersFE {
  role?: UserRole[];
  status?: UserStatus[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  hasShop?: boolean;
  search?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  sortBy?: "name" | "email" | "createdAt" | "lastLogin" | "rating";
  sortOrder?: "asc" | "desc";
}

/**
 * User stats for dashboard
 */
export interface UserStatsFE {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: {
    admin: number;
    seller: number;
    user: number;
  };
  usersByStatus: {
    active: number;
    inactive: number;
    blocked: number;
    suspended: number;
  };
  growthRate: string; // "+15% from last month"
}

/**
 * User search result
 */
export interface UserSearchResultFE {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  photoURL: string | null;
  role: UserRole;
  isVerified: boolean;
  badges: string[];
}

/**
 * Change password form data
 */
export interface ChangePasswordFormFE {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * OTP verification form data
 */
export interface OTPVerificationFormFE {
  otp: string;
}

/**
 * UI Constants
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.SELLER]: "Seller",
  [UserRole.USER]: "User",
  [UserRole.GUEST]: "Guest",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
  [UserStatus.BLOCKED]: "Blocked",
  [UserStatus.SUSPENDED]: "Suspended",
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "green",
  [UserStatus.INACTIVE]: "gray",
  [UserStatus.BLOCKED]: "red",
  [UserStatus.SUSPENDED]: "orange",
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "purple",
  [UserRole.SELLER]: "blue",
  [UserRole.USER]: "gray",
  [UserRole.GUEST]: "gray",
};
