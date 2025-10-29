/**
 * Enhanced Auth Hook
 * Provides convenient access to authentication state and storage methods
 */

import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithCustomToken
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/database/config';
import { authCookies } from '@/lib/auth/cookies';
import toast from 'react-hot-toast';

export interface PhoneAuthCredentials {
  phoneNumber: string;
  otp: string;
  verificationId: string;
}

export interface AuthHookReturn {
  // Core auth state
  user: any | null;
  loading: boolean;
  error: string | null;
  cookieConsentRequired: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: "admin" | "seller" | "user") => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<any>) => Promise<void>;

  // Enhanced auth methods
  sendOTP: (phoneNumber: string) => Promise<{ verificationId: string }>;
  verifyOTP: (credentials: PhoneAuthCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;

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
  getToken: () => Promise<string | null>;
}

export const useEnhancedAuth = (): AuthHookReturn => {
  const auth = useAuth();
  const [enhancedLoading, setEnhancedLoading] = useState(false);

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

  // Send OTP for phone authentication
  const sendOTP = useCallback(async (phoneNumber: string): Promise<{ verificationId: string }> => {
    try {
      setEnhancedLoading(true);
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          recaptchaToken: 'dummy_token',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      return { verificationId: data.data.verificationId };
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
      throw error;
    } finally {
      setEnhancedLoading(false);
    }
  }, []);

  // Verify OTP for phone authentication
  const verifyOTP = useCallback(async (credentials: PhoneAuthCredentials) => {
    try {
      setEnhancedLoading(true);

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: credentials.verificationId,
          otp: credentials.otp,
          phoneNumber: credentials.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      // Sign in with custom token if provided
      if (data.data.customToken) {
        await signInWithCustomToken(firebaseAuth, data.data.customToken);
      }

      toast.success('Phone verification successful!');
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
      throw error;
    } finally {
      setEnhancedLoading(false);
    }
  }, []);

  // Google authentication
  const loginWithGoogle = useCallback(async () => {
    try {
      setEnhancedLoading(true);

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseUser = result.user;

      // Check if user exists, create if not
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // User doesn't exist, create account
        const userData = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber,
          role: 'user',
          isOver18: true,
        };

        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          throw new Error(errorData.error || 'Failed to create account');
        }
      }

      toast.success('Google login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
      throw error;
    } finally {
      setEnhancedLoading(false);
    }
  }, []);

  // Get authentication token
  const getToken = useCallback(async (): Promise<string | null> => {
    if (auth.user && auth.user.getIdToken) {
      try {
        return await auth.user.getIdToken();
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    }
    return authCookies.getAuthToken() || null;
  }, [auth.user]);

  return {
    ...auth,
    loading: auth.loading || enhancedLoading,
    sendOTP,
    verifyOTP,
    loginWithGoogle,
    hasPermission,
    isRole,
    canAccess,
    getToken,
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
