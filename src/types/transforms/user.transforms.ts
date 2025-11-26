/**
 * USER TYPE TRANSFORMATIONS
 *
 * Functions to convert between Backend (BE) and Frontend (FE) user types.
 * All transformations happen in the service layer.
 */

import { Timestamp } from "firebase/firestore";
import {
  UserBE,
  UserListItemBE,
  UpdateUserProfileBE,
  UpdateUserPreferencesBE,
} from "../backend/user.types";
import {
  UserFE,
  UserCardFE,
  UserProfileFormFE,
  UserPreferencesFormFE,
} from "../frontend/user.types";
import { UserRole, UserStatus } from "../shared/common.types";

/**
 * Parse Firestore Timestamp or ISO string to Date
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
function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Round rating to nearest 0.5
 */
function roundRating(rating: number): number {
  return Math.round(rating * 2) / 2;
}

/**
 * Get user initials from name
 */
function getInitials(
  displayName: string | null,
  firstName: string | null,
  lastName: string | null
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
function getFullName(
  displayName: string | null,
  firstName: string | null,
  lastName: string | null,
  email: string
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
function formatMemberSince(date: Date): string {
  return `Member since ${date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })}`;
}

/**
 * Calculate account age
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
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
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
export function toFEUser(userBE: UserBE): UserFE {
  const createdAt = parseDate(userBE.createdAt) || new Date();
  const updatedAt = parseDate(userBE.updatedAt) || new Date();
  const lastLoginAt = parseDate(userBE.lastLoginAt);

  const fullName = getFullName(
    userBE.displayName,
    userBE.firstName,
    userBE.lastName,
    userBE.email
  );
  const initials = getInitials(
    userBE.displayName,
    userBE.firstName,
    userBE.lastName
  );

  return {
    id: userBE.id,
    uid: userBE.uid,
    email: userBE.email,
    displayName: userBE.displayName,
    photoURL: userBE.photoURL,
    phoneNumber: userBE.phoneNumber,
    role: userBE.role,
    status: userBE.status,

    firstName: userBE.firstName,
    lastName: userBE.lastName,
    fullName,
    initials,
    bio: userBE.bio,
    location: userBE.location,

    emailVerified: userBE.emailVerified,
    phoneVerified: userBE.phoneVerified,
    isVerified: userBE.emailVerified && userBE.phoneVerified,

    shopId: userBE.shopId,
    shopName: userBE.shopName,
    shopSlug: userBE.shopSlug,
    hasShop: userBE.shopId !== null,

    totalOrders: userBE.totalOrders,
    totalSpent: userBE.totalSpent,
    totalSales: userBE.totalSales,
    totalProducts: userBE.totalProducts,
    totalAuctions: userBE.totalAuctions,
    rating: userBE.rating,
    reviewCount: userBE.reviewCount,

    formattedTotalSpent: formatPrice(userBE.totalSpent),
    formattedTotalSales: formatPrice(userBE.totalSales),
    ratingStars: roundRating(userBE.rating),
    ratingDisplay:
      userBE.reviewCount > 0
        ? `${userBE.rating.toFixed(1)} (${userBE.reviewCount} review${
            userBE.reviewCount > 1 ? "s" : ""
          })`
        : "No reviews",

    notifications: userBE.notifications,

    createdAt,
    updatedAt,
    lastLoginAt,

    memberSince: formatMemberSince(createdAt),
    lastLoginDisplay: formatRelativeTime(lastLoginAt),
    accountAge: calculateAccountAge(createdAt),

    isActive: userBE.status === "active",
    isBlocked: userBE.status === "blocked",
    isSuspended: userBE.status === "suspended",
    isAdmin: userBE.role === "admin",
    isSeller: userBE.role === "seller",
    isUser: userBE.role === "user",

    badges: generateUserBadges(userBE, createdAt),

    metadata: userBE.metadata,
  };
}

/**
 * Transform Backend User List Item to Frontend User Card
 */
export function toFEUserCard(userBE: UserListItemBE): UserCardFE {
  const fullName = getFullName(userBE.displayName, null, null, userBE.email);
  const initials = getInitials(userBE.displayName, null, null);
  const createdAt = parseDate(userBE.createdAt) || new Date();

  return {
    id: userBE.id,
    uid: userBE.uid,
    email: userBE.email,
    fullName,
    initials,
    photoURL: userBE.photoURL,
    role: userBE.role,
    status: userBE.status,
    isActive: userBE.status === "active",
    isVerified: userBE.emailVerified,
    rating: 0,
    ratingDisplay: "No reviews",
    memberSince: formatMemberSince(createdAt),
    badges: userBE.emailVerified ? ["Verified"] : [],
  };
}

/**
 * Transform Frontend User Profile Form to Backend Update Request
 */
export function toBEUserProfileUpdate(
  formData: UserProfileFormFE
): UpdateUserProfileBE {
  return {
    displayName: formData.displayName || undefined,
    firstName: formData.firstName || undefined,
    lastName: formData.lastName || undefined,
    phoneNumber: formData.phoneNumber || undefined,
    bio: formData.bio || undefined,
    location: formData.location || undefined,
    photoURL: formData.photoURL || undefined,
  };
}

/**
 * Transform Frontend User Preferences Form to Backend Update Request
 */
export function toBEUserPreferencesUpdate(
  formData: UserPreferencesFormFE
): UpdateUserPreferencesBE {
  return {
    notifications: formData.notifications,
  };
}

/**
 * Batch transform Backend Users to Frontend Users
 */
export function toFEUsers(usersBE: UserBE[]): UserFE[] {
  return usersBE.map(toFEUser);
}

/**
 * Batch transform Backend User List Items to Frontend User Cards
 */
export function toFEUserCards(usersBE: UserListItemBE[]): UserCardFE[] {
  return usersBE.map(toFEUserCard);
}

/**
 * Transform user profile form to backend update request
 */
export function toBEUpdateUserRequest(formData: UserProfileFormFE) {
  return {
    displayName: formData.displayName || undefined,
    firstName: formData.firstName || undefined,
    lastName: formData.lastName || undefined,
    phoneNumber: formData.phoneNumber || undefined,
    bio: formData.bio || undefined,
    location: formData.location || undefined,
    photoURL: formData.photoURL || undefined,
  };
}

/**
 * Transform ban user parameters to backend request
 */
export function toBEBanUserRequest(isBanned: boolean, banReason?: string) {
  return {
    isBanned,
    banReason: banReason || undefined,
  };
}

/**
 * Transform change role parameters to backend request
 */
export function toBEChangeRoleRequest(role: string, notes?: string) {
  return {
    role,
    notes: notes || undefined,
  };
}
