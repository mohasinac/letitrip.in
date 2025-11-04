/**
 * User & Authentication Shared Types
 * Used by both UI and Backend
 */

import { AuditFields, EntityId } from "./common";

/**
 * User roles
 */
export type UserRole = "admin" | "seller" | "user";

/**
 * User entity
 */
export interface User extends AuditFields {
  id: EntityId;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  addresses: Address[];
  preferredCurrency?: string;
  isOver18?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLoginAt?: string | Date;
  // User preferences
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  language?: string;
  currency?: string;
  theme?: "light" | "dark" | "system";
  notifications?: NotificationPreferences;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  orderUpdates?: boolean;
  promotions?: boolean;
  newsletter?: boolean;
}

/**
 * Address entity
 */
export interface Address {
  id: EntityId;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  label?: "home" | "work" | "other";
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Address form data
 */
export interface AddressFormData {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  label?: "home" | "work" | "other";
}

/**
 * Auth token data
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds
  tokenType: "Bearer";
}

/**
 * Auth user (minimal user data for auth context)
 */
export interface AuthUser {
  id: EntityId;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified?: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  acceptTerms: boolean;
  isOver18: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change password data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Update profile data
 */
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  preferredCurrency?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * User session data
 */
export interface UserSession {
  user: AuthUser;
  token: AuthToken;
  expiresAt: string | Date;
}
