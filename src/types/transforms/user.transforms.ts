/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/user.transforms
 * @description This file contains functionality related to user.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * USER TYPE TRANSFORMATIONS
 *
 * Functions to convert between Backend (BE) and Frontend (FE) user types.
 * All transformations happen in the service layer.
 */

import { Timestamp } from "firebase/firestore";
import {
  UpdateUserPreferencesBE,
  UpdateUserProfileBE,
  UserBE,
  UserListItemBE,
} from "../backend/user.types";
import {
  UserCardFE,
  UserFE,
  UserPreferencesFormFE,
  UserProfileFormFE,
} from "../frontend/user.types";

/**
 * Parse Firestore Timestamp or ISO string to Date
 */
/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return new Date(date);
}

/**
 * Format price as Indian Rupees
 */
/**
 * Formats price
 *
 * @param {number} price - The price
 *
 * @returns {string} The formatprice result
 */

/**
 * Formats price
 *
 * @param {number} price - The price
 *
 * @returns {string} The formatprice result
 */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    /** Style */
    style: "currency",
    /** Currency */
    currency: "INR",
    /** Maximum Fraction Digits */
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Round rating to nearest 0.5
 */
/**
 * Performs round rating operation
 *
 * @param {number} rating - The rating
 *
 * @returns {number} The roundrating result
 */

/**
 * Performs round rating operation
 *
 * @param {number} rating - The rating
 *
 * @returns {number} The roundrating result
 */

function roundRating(rating: number): number {
  return Math.round(rating * 2) / 2;
}

/**
 * Get user initials from name
 */
/**
 * Retrieves initials
 *
 * @param {string | null} displayName - Name of display
 * @param {string | null} firstName - Name of first
 * @param {string | null} lastName - Name of last
 *
 * @returns {string} The initials result
 */

/**
 * Retrieves initials
 *
 * @returns {string} The initials result
 */

function getInitials(
  /** Display Name */
  displayName: string | null,
  /** First Name */
  firstName: string | null,
  /** Last Name */
  lastName: string | null,
): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (displayName) {
    const parts = displayName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName[0].toUpperCase();
  }
  return "U";
}

/**
 * Get full name from user data
 */
/**
 * Retrieves full name
 *
 * @returns {string} The fullname result
 */

/**
 * Retrieves full name
 *
 * @returns {string} The fullname result
 */

function getFullName(
  /** Display Name */
  displayName: string | null,
  /** First Name */
  firstName: string | null,
  /** Last Name */
  lastName: string | null,
  /** Email */
  email: string,
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (displayName) {
    return displayName;
  }
  return email.split("@")[0];
}

/**
 * Format relative time
 */
/**
 * Formats relative time
 *
 * @param {Date | null} date - The date
 *
 * @returns {string} The formatrelativetime result
 */

/**
 * Formats relative time
 *
 * @param {Date | null} date - The date
 *
 * @returns {string} The formatrelativetime result
 */

function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${
      Math.floor(diffDays / 7) > 1 ? "s" : ""
    } ago`;
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} month${
      Math.floor(diffDays / 30) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(diffDays / 365)} year${
    Math.floor(diffDays / 365) > 1 ? "s" : ""
  } ago`;
}

/**
 * Format member since date
 */
/**
 * Formats member since
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatmembersince result
 */

/**
 * Formats member since
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatmembersince result
 */

function formatMemberSince(date: Date): string {
  return `Member since ${date.toLocaleDateString("en-US", {
    /** Month */
    month: "short",
    /** Year */
    year: "numeric",
  })}`;
}

/**
 * Calculate account age
 */
/**
 * Calculates account age
 *
 * @param {Date} createdAt - The created at
 *
 * @returns {string} The calculateaccountage result
 */

/**
 * Calculates account age
 *
 * @param {Date} createdAt - The created at
 *
 * @returns {string} The calculateaccountage result
 */

function calculateAccountAge(createdAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? "s" : ""}`;
}

/**
 * Generate user badges
 */
/**
 * Performs generate user badges operation
 *
 * @param {UserBE} user - The user
 * @param {Date} createdAt - The created at
 *
 * @returns {string} The userbadges result
 */

/**
 * Performs generate user badges operation
 *
 * @param {UserBE} user - The user
 * @param {Date} createdAt - The created at
 *
 * @returns {string} The userbadges result
 */

function generateUserBadges(user: UserBE, createdAt: Date): string[] {
  const badges: string[] = [];

  // Verification badge
  if (user.emailVerified && user.phoneVerified) {
    badges.push("Verified");
  }

  // Role badges
  if (user.role === "admin") {
    badges.push("Admin");
  }

  // Seller badges
  if (user.role === "seller") {
    if (user.rating >= 4.5 && user.reviewCount >= 50) {
      badges.push("Top Seller");
    }
    if (user.totalSales >= 100000) {
      badges.push("High Volume");
    }
  }

  // New user badge (within 30 days)
  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceCreation <= 30) {
    badges.push("New");
  }

  // Active buyer badge
  if (user.totalOrders >= 10) {
    badges.push("Active Buyer");
  }

  return badges;
}

/**
 * Transform Backend User to Frontend User
 */
/**
 * Performs to f e user operation
 *
 * @param {UserBE} userBE - The user b e
 *
 * @returns {any} The tofeuser result
 *
 * @example
 * toFEUser(userBE);
 */

/**
 * Performs to f e user operation
 *
 * @param {UserBE} userBE - The user b e
 *
 * @returns {any} The tofeuser result
 *
 * @example
 * toFEUser(userBE);
 */

export function toFEUser(userBE: UserBE): UserFE {
  const createdAt = parseDate(userBE.createdAt) || new Date();
  const updatedAt = parseDate(userBE.updatedAt) || new Date();
  const lastLoginAt = parseDate(userBE.lastLoginAt);

  const fullName = getFullName(
    userBE.displayName,
    userBE.firstName,
    userBE.lastName,
    userBE.email,
  );
  const initials = getInitials(
    userBE.displayName,
    userBE.firstName,
    userBE.lastName,
  );

  return {
    /** Id */
    id: userBE.id,
    /** Uid */
    uid: userBE.uid,
    /** Email */
    email: userBE.email,
    /** Display Name */
    displayName: userBE.displayName,
    /** Photo U R L */
    photoURL: userBE.photoURL,
    /** Phone Number */
    phoneNumber: userBE.phoneNumber,
    phone: userBE.phoneNumber, // Alias for compatibility
    /** Role */
    role: userBE.role,
    /** Status */
    status: userBE.status,

    /** First Name */
    firstName: userBE.firstName,
    /** Last Name */
    lastName: userBE.lastName,
    fullName,
    initials,
    /** Bio */
    bio: userBE.bio,
    /** Location */
    location: userBE.location,

    /** Email Verified */
    emailVerified: userBE.emailVerified,
    /** Phone Verified */
    phoneVerified: userBE.phoneVerified,
    /** Is Verified */
    isVerified: userBE.emailVerified && userBE.phoneVerified,

    /** Shop Id */
    shopId: userBE.shopId,
    /** Shop Name */
    shopName: userBE.shopName,
    /** Shop Slug */
    shopSlug: userBE.shopSlug,
    /** Has Shop */
    hasShop: userBE.shopId !== null,

    /** Total Orders */
    totalOrders: userBE.totalOrders,
    /** Total Spent */
    totalSpent: userBE.totalSpent,
    /** Total Sales */
    totalSales: userBE.totalSales,
    /** Total Products */
    totalProducts: userBE.totalProducts,
    /** Total Auctions */
    totalAuctions: userBE.totalAuctions,
    /** Rating */
    rating: userBE.rating,
    /** Review Count */
    reviewCount: userBE.reviewCount,

    /** Formatted Total Spent */
    formattedTotalSpent: formatPrice(userBE.totalSpent),
    /** Formatted Total Sales */
    formattedTotalSales: formatPrice(userBE.totalSales),
    /** Rating Stars */
    ratingStars: roundRating(userBE.rating),
    /** Rating Display */
    ratingDisplay:
      userBE.reviewCount > 0
        ? `${userBE.rating.toFixed(1)} (${userBE.reviewCount} review${
            userBE.reviewCount > 1 ? "s" : ""
          })`
        : "No reviews",

    /** Notifications */
    notifications: userBE.notifications,

    createdAt,
    updatedAt,
    lastLoginAt,

    /** Member Since */
    memberSince: formatMemberSince(createdAt),
    /** Last Login Display */
    lastLoginDisplay: formatRelativeTime(lastLoginAt),
    /** Account Age */
    accountAge: calculateAccountAge(createdAt),

    /** Is Active */
    isActive: userBE.status === "active",
    /** Is Blocked */
    isBlocked: userBE.status === "blocked",
    /** Is Suspended */
    isSuspended: userBE.status === "suspended",
    /** Is Admin */
    isAdmin: userBE.role === "admin",
    /** Is Seller */
    isSeller: userBE.role === "seller",
    /** Is User */
    isUser: userBE.role === "user",

    /** Badges */
    badges: generateUserBadges(userBE, createdAt),

    /** Metadata */
    metadata: userBE.metadata,
  };
}

/**
 * Transform Backend User List Item to Frontend User Card
 */
/**
 * Performs to f e user card operation
 *
 * @param {UserListItemBE} userBE - The user b e
 *
 * @returns {any} The tofeusercard result
 *
 * @example
 * toFEUserCard(userBE);
 */

/**
 * Performs to f e user card operation
 *
 * @param {UserListItemBE} userBE - The user b e
 *
 * @returns {any} The tofeusercard result
 *
 * @example
 * toFEUserCard(userBE);
 */

export function toFEUserCard(userBE: UserListItemBE): UserCardFE {
  const fullName = getFullName(userBE.displayName, null, null, userBE.email);
  const initials = getInitials(userBE.displayName, null, null);
  const createdAt = parseDate(userBE.createdAt) || new Date();

  return {
    /** Id */
    id: userBE.id,
    /** Uid */
    uid: userBE.uid,
    /** Email */
    email: userBE.email,
    fullName,
    initials,
    /** Photo U R L */
    photoURL: userBE.photoURL,
    /** Role */
    role: userBE.role,
    /** Status */
    status: userBE.status,
    /** Is Active */
    isActive: userBE.status === "active",
    /** Is Verified */
    isVerified: userBE.emailVerified,
    /** Rating */
    rating: 0,
    /** Rating Display */
    ratingDisplay: "No reviews",
    /** Member Since */
    memberSince: formatMemberSince(createdAt),
    /** Badges */
    badges: userBE.emailVerified ? ["Verified"] : [],
  };
}

/**
 * Transform Frontend User Profile Form to Backend Update Request
 */
/**
 * Performs to b e user profile update operation
 *
 * @param {UserProfileFormFE} formData - The form data
 *
 * @returns {any} The tobeuserprofileupdate result
 *
 * @example
 * toBEUserProfileUpdate(formData);
 */

/**
 * Performs to b e user profile update operation
 *
 * @param {UserProfileFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobeuserprofileupdate result
 *
 * @example
 * toBEUserProfileUpdate(/** Form Data */
  formData);
 */

export function toBEUserProfileUpdate(
  /** Form Data */
  formData: UserProfileFormFE,
): UpdateUserProfileBE {
  return {
    /** Display Name */
    displayName: formData.displayName || undefined,
    /** First Name */
    firstName: formData.firstName || undefined,
    /** Last Name */
    lastName: formData.lastName || undefined,
    /** Phone Number */
    phoneNumber: formData.phoneNumber || undefined,
    /** Bio */
    bio: formData.bio || undefined,
    /** Location */
    location: formData.location || undefined,
    /** Photo U R L */
    photoURL: formData.photoURL || undefined,
  };
}

/**
 * Transform Frontend User Preferences Form to Backend Update Request
 */
/**
 * Performs to b e user preferences update operation
 *
 * @param {UserPreferencesFormFE} formData - The form data
 *
 * @returns {any} The tobeuserpreferencesupdate result
 *
 * @example
 * toBEUserPreferencesUpdate(formData);
 */

/**
 * Performs to b e user preferences update operation
 *
 * @param {UserPreferencesFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobeuserpreferencesupdate result
 *
 * @example
 * toBEUserPreferencesUpdate(/** Form Data */
  formData);
 */

export function toBEUserPreferencesUpdate(
  /** Form Data */
  formData: UserPreferencesFormFE,
): UpdateUserPreferencesBE {
  return {
    /** Notifications */
    notifications: formData.notifications,
  };
}

/**
 * Batch transform Backend Users to Frontend Users
 */
/**
 * Performs to f e users operation
 *
 * @param {UserBE[]} usersBE - The users b e
 *
 * @returns {any} The tofeusers result
 *
 * @example
 * toFEUsers(usersBE);
 */

/**
 * Performs to f e users operation
 *
 * @param {UserBE[]} usersBE - The users b e
 *
 * @returns {any} The tofeusers result
 *
 * @example
 * toFEUsers(usersBE);
 */

export function toFEUsers(usersBE: UserBE[]): UserFE[] {
  return usersBE.map(toFEUser);
}

/**
 * Batch transform Backend User List Items to Frontend User Cards
 */
/**
 * Performs to f e user cards operation
 *
 * @param {UserListItemBE[]} usersBE - The users b e
 *
 * @returns {any} The tofeusercards result
 *
 * @example
 * toFEUserCards(usersBE);
 */

/**
 * Performs to f e user cards operation
 *
 * @param {UserListItemBE[]} usersBE - The users b e
 *
 * @returns {any} The tofeusercards result
 *
 * @example
 * toFEUserCards(usersBE);
 */

export function toFEUserCards(usersBE: UserListItemBE[]): UserCardFE[] {
  return usersBE.map(toFEUserCard);
}

/**
 * Transform user profile form to backend update request
 */
/**
 * Performs to b e update user request operation
 *
 * @param {UserProfileFormFE} formData - The form data
 *
 * @returns {any} The tobeupdateuserrequest result
 *
 * @example
 * toBEUpdateUserRequest(formData);
 */

/**
 * Performs to b e update user request operation
 *
 * @param {UserProfileFormFE} formData - The form data
 *
 * @returns {any} The tobeupdateuserrequest result
 *
 * @example
 * toBEUpdateUserRequest(formData);
 */

export function toBEUpdateUserRequest(formData: UserProfileFormFE) {
  return {
    /** Display Name */
    displayName: formData.displayName || undefined,
    /** First Name */
    firstName: formData.firstName || undefined,
    /** Last Name */
    lastName: formData.lastName || undefined,
    /** Phone Number */
    phoneNumber: formData.phoneNumber || undefined,
    /** Bio */
    bio: formData.bio || undefined,
    /** Location */
    location: formData.location || undefined,
    /** Photo U R L */
    photoURL: formData.photoURL || undefined,
  };
}

/**
 * Transform ban user parameters to backend request
 */
/**
 * Performs to b e ban user request operation
 *
 * @param {boolean} isBanned - Whether is banned
 * @param {string} [banReason] - The ban reason
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * toBEBanUserRequest(true, "example");
 */

/**
 * Performs to b e ban user request operation
 *
 * @param {boolean} isBanned - Whether is banned
 * @param {string} [banReason] - The ban reason
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * toBEBanUserRequest(true, "example");
 */

export function toBEBanUserRequest(isBanned: boolean, banReason?: string) {
  return {
    isBanned,
    /** Ban Reason */
    banReason: banReason || undefined,
  };
}

/**
 * Transform change role parameters to backend request
 */
/**
 * Performs to b e change role request operation
 *
 * @param {string} role - The role
 * @param {string} [notes] - The notes
 *
 * @returns {string} The tobechangerolerequest result
 *
 * @example
 * toBEChangeRoleRequest("example", "example");
 */

/**
 * Performs to b e change role request operation
 *
 * @param {string} role - The role
 * @param {string} [notes] - The notes
 *
 * @returns {string} The tobechangerolerequest result
 *
 * @example
 * toBEChangeRoleRequest("example", "example");
 */

export function toBEChangeRoleRequest(role: string, notes?: string) {
  return {
    role,
    /** Notes */
    notes: notes || undefined,
  };
}
