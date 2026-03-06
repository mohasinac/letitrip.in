/**
 * Shared User types for admin user management components.
 */

import type { UserRole } from "@/types/auth";

export interface AdminUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  metadata?: {
    loginCount?: number;
  };
}

export type UserTab = "all" | "active" | "banned" | "admins";
