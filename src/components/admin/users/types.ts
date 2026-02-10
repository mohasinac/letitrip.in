/**
 * Shared User types for admin user management components.
 */

export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "user" | "seller" | "moderator" | "admin";
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  metadata?: {
    loginCount?: number;
  };
}

export type UserTab = "all" | "active" | "banned" | "admins";
