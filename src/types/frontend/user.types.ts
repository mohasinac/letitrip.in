/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/user.types
 * @description This file contains TypeScript type definitions for user
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
  /** Phone Number */
  phoneNumber: string | null;
  /** Phone */
  phone?: string | null; // Alias for phoneNumber
  /** Role */
  role: UserRole;
  /** Status */
  status: UserStatus;

  // Profile
  /** First Name */
  firstName: string | null;
  /** Last Name */
  lastName: string | null;
  /** FullName */
  fullName: string; // Computed: firstName + lastName or displayName
  /** Initials */
  initials: string; // Computed: First letters of name
  /** Bio */
  bio: string | null;
  /** Location */
  location: string | null;

  // Verification
  /** Email Verified */
  emailVerified: boolean;
  /** Phone Verified */
  phoneVerified: boolean;
  /** IsVerified */
  isVerified: boolean; // Computed: emailVerified && phoneVerified

  // Shop (for sellers)
  /** Shop Id */
  shopId: string | null;
  /** Shop Name */
  shopName: string | null;
  /** Shop Slug */
  shopSlug: string | null;
  /** HasShop */
  hasShop: boolean; // Computed: shopId !== null

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

  // Formatted stats
  /** FormattedTotalSpent */
  formattedTotalSpent: string; // "₹12,450"
  /** FormattedTotalSales */
  formattedTotalSales: string; // "₹45,600"
  /** RatingStars */
  ratingStars: number; // Rounded: 4.7 → 5
  /** RatingDisplay */
  ratingDisplay: string; // "4.7 (123 reviews)"

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
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;
  /** Last Login At */
  lastLoginAt: Date | null;

  // Formatted dates
  /** MemberSince */
  memberSince: string; // "Member since Nov 2024"
  /** LastLoginDisplay */
  lastLoginDisplay: string; // "Last seen 2 hours ago" or "Never"
  /** AccountAge */
  accountAge: string; // "2 months"

  // UI States
  /** IsActive */
  isActive: boolean; // status === 'active'
  /** IsBlocked */
  isBlocked: boolean; // status === 'blocked'
  /** IsSuspended */
  isSuspended: boolean; // status === 'suspended'
  /** IsAdmin */
  isAdmin: boolean; // role === 'admin'
  /** IsSeller */
  isSeller: boolean; // role === 'seller'
  /** IsUser */
  isUser: boolean; // role === 'user'

  // Badges
  /** Badges */
  badges: string[]; // ["Verified", "Top Seller", "New", etc.]

  // Metadata
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * User card for lists (minimal fields)
 */
export interface UserCardFE {
  /** Id */
  id: string;
  /** Uid */
  uid: string;
  /** Email */
  email: string;
  /** Full Name */
  fullName: string;
  /** Initials */
  initials: string;
  /** Photo U R L */
  photoURL: string | null;
  /** Role */
  role: UserRole;
  /** Status */
  status: UserStatus;
  /** Is Active */
  isActive: boolean;
  /** Is Verified */
  isVerified: boolean;
  /** Rating */
  rating: number;
  /** Rating Display */
  ratingDisplay: string;
  /** Member Since */
  memberSince: string;
  /** Badges */
  badges: string[];
}

/**
 * User profile form data
 */
export interface UserProfileFormFE {
  /** Display Name */
  displayName: string;
  /** First Name */
  firstName: string;
  /** Last Name */
  lastName: string;
  /** Phone Number */
  phoneNumber: string;
  /** Bio */
  bio: string;
  /** Location */
  location: string;
  /** Photo U R L */
  photoURL: string | null;
}

/**
 * User preferences form data
 */
export interface UserPreferencesFormFE {
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
}

/**
 * User filters for frontend
 */
export interface UserFiltersFE {
  /** Role */
  role?: UserRole[];
  /** Status */
  status?: UserStatus[];
  /** Email Verified */
  emailVerified?: boolean;
  /** Phone Verified */
  phoneVerified?: boolean;
  /** Has Shop */
  hasShop?: boolean;
  /** Search */
  search?: string;
  /** Date Range */
  dateRange?: {
    /** From */
    from: Date | null;
    /** To */
    to: Date | null;
  };
  /** Sort By */
  sortBy?: "name" | "email" | "createdAt" | "lastLogin" | "rating";
  /** Sort Order */
  sortOrder?: "asc" | "desc";
}

/**
 * User stats for dashboard
 */
export interface UserStatsFE {
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
  usersByRole: {
    /** Admin */
    admin: number;
    /** Seller */
    seller: number;
    /** User */
    user: number;
  };
  /** Users By Status */
  usersByStatus: {
    /** Active */
    active: number;
    /** Inactive */
    inactive: number;
    /** Blocked */
    blocked: number;
    /** Suspended */
    suspended: number;
  };
  /** GrowthRate */
  growthRate: string; // "+15% from last month"
}

/**
 * User search result
 */
export interface UserSearchResultFE {
  /** Id */
  id: string;
  /** Uid */
  uid: string;
  /** Email */
  email: string;
  /** Full Name */
  fullName: string;
  /** Photo U R L */
  photoURL: string | null;
  /** Role */
  role: UserRole;
  /** Is Verified */
  isVerified: boolean;
  /** Badges */
  badges: string[];
}

/**
 * Change password form data
 */
export interface ChangePasswordFormFE {
  /** Current Password */
  currentPassword: string;
  /** New Password */
  newPassword: string;
  /** Confirm Password */
  confirmPassword: string;
}

/**
 * OTP verification form data
 */
export interface OTPVerificationFormFE {
  /** Otp */
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

/**
 * User Status Labels
 * @constant
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
  [UserStatus.BLOCKED]: "Blocked",
  [UserStatus.SUSPENDED]: "Suspended",
};

/**
 * User Status Colors
 * @constant
 */
export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "green",
  [UserStatus.INACTIVE]: "gray",
  [UserStatus.BLOCKED]: "red",
  [UserStatus.SUSPENDED]: "orange",
};

/**
 * User Role Colors
 * @constant
 */
export const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "purple",
  [UserRole.SELLER]: "blue",
  [UserRole.USER]: "gray",
  [UserRole.GUEST]: "gray",
};
