/**
 * User Type Definitions
 *
 * TypeScript interfaces for user data, roles, and authentication.
 */

export type UserRole = "user" | "seller" | "moderator" | "admin";

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  avatarMetadata?: {
    url: string;
    position: { x: number; y: number };
    zoom: number;
  } | null;
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
    lastSignInTime?: string;
    creationTime?: string;
    lastLoginAt?: string;
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
