/**
 * User Type Definitions
 *
 * TypeScript interfaces for user data, roles, and authentication.
 */

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  disabled: boolean;
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
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
