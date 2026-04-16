/**
 * User Type Definitions
 *
 * TypeScript interfaces for user data, roles, and authentication.
 * These types MUST stay in sync with UserDocument in @/db/schema.
 */

import type { AvatarMetadata } from "@/db/schema/users";
import { UserRole } from "@mohasinac/appkit/features/auth";
export type { UserRole };

/**
 * Minimal Firebase Auth user shape used in client-side context.
 * Avoids importing the full Firebase User type in non-auth modules.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified?: boolean;
  displayName: string | null;
  photoURL: string | null;
  avatarMetadata?: AvatarMetadata | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  disabled: boolean;
  publicProfile?: {
    isPublic: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showOrders: boolean;
    showWishlist: boolean;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
    };
  };
  stats?: {
    totalOrders: number;
    auctionsWon: number;
    itemsSold: number;
    reviewsCount: number;
    rating?: number;
  };
  metadata?: {
    lastSignInTime?: Date;
    creationTime?: string;
    loginCount?: number;
  };
}

/**
 * Hydrated session user — combines Firebase Auth fields with Firestore profile.
 * Lives here (server-importable) so layout.tsx can pass it to SessionProvider.
 */
export interface SessionUser {
  // Firebase Auth fields
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;

  // Firestore profile fields
  role: UserRole;
  disabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Session tracking
  sessionId?: string;

  // Profile extras
  phoneVerified?: boolean;
  avatarMetadata?: AvatarMetadata | null;

  publicProfile?: {
    isPublic?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    showOrders?: boolean;
    showWishlist?: boolean;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
    };
  };

  stats?: {
    totalOrders?: number;
    auctionsWon?: number;
    itemsSold?: number;
    reviewsCount?: number;
    rating?: number;
  };

  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
    loginCount?: number;
  };
}

export interface ExtendedSession {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: UserRole;
    emailVerified: boolean;
  };
  expires: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  acceptTerms: boolean;
}

