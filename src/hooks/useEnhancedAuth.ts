/**
 * Enhanced Auth Hook
 * Provides convenient access to authentication state and storage methods
 */

import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";

// Authentication-specific user type with claims
interface AuthUser extends User {
  claims?: {
    permissions: string[];
    lastLogin?: string;
    sessionId?: string;
  };
}

export interface AuthHookReturn {
  // Core auth state
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  cookieConsentRequired: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: "admin" | "seller" | "user") => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;

  // Storage methods
  setStorageItem: (key: string, value: string) => boolean;
  getStorageItem: (key: string) => string | null;
  removeStorageItem: (key: string) => void;

  // Cookie consent
  handleCookieConsent: (settings: any) => void;

  // Utility methods
  hasPermission: (permission: string) => boolean;
  isRole: (role: "admin" | "seller" | "user") => boolean;
  canAccess: (resource: string) => boolean;
}

export const useEnhancedAuth = (): AuthHookReturn => {
  const auth = useAuth();

  // Helper method to check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!auth.user?.claims?.permissions) return false;
    return auth.user.claims.permissions.includes(permission);
  };

  // Helper method to check user role
  const isRole = (role: 'admin' | 'seller' | 'user'): boolean => {
    return auth.user?.role === role;
  };

  // Helper method to check resource access
  const canAccess = (resource: string): boolean => {
    if (!auth.user) return false;
    
    const userRole = String(auth.user.role);
    
    // Admin can access everything
    if (userRole === 'admin') return true;
    
    // Resource-specific access control
    const roleChecks: Record<string, string[]> = {
      "admin_panel": ['admin'],
      "seller_panel": ['admin', 'seller'],
      "user_profile": ['admin', 'seller', 'user'],
      "products_manage": ['admin', 'seller'],
      "orders_manage": ['admin'],
      "categories_manage": ['admin'],
      "users_manage": ['admin'],
    };
    
    const allowedRoles = roleChecks[resource];
    return allowedRoles ? allowedRoles.includes(userRole) : false;
  };

  return {
    ...auth,
    hasPermission,
    isRole,
    canAccess,
  };
};

// Convenience hooks for specific roles
export const useAdminAuth = () => {
  const auth = useEnhancedAuth();
  return {
    ...auth,
    isAdmin: auth.isRole("admin"),
    canManageUsers: auth.canAccess("users_manage"),
    canManageCategories: auth.canAccess("categories_manage"),
    canManageOrders: auth.canAccess("orders_manage"),
  };
};

export const useSellerAuth = () => {
  const auth = useEnhancedAuth();
  return {
    ...auth,
    isSeller: auth.isRole("seller") || auth.isRole("admin"),
    canManageProducts: auth.canAccess("products_manage"),
    canAccessSellerPanel: auth.canAccess("seller_panel"),
  };
};

export const useUserAuth = () => {
  const auth = useEnhancedAuth();
  return {
    ...auth,
    isUser: !!auth.user,
    canAccessProfile: auth.canAccess("user_profile"),
  };
};
