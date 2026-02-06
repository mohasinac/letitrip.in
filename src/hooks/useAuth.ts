"use client";

/**
 * Authentication Hooks
 *
 * Custom hooks for authentication operations using the centralized API client.
 * These hooks provide a clean interface for auth-related API calls with
 * proper loading/error states and callbacks.
 *
 * @example
 * ```tsx
 * const { mutate, isLoading } = useLogin({
 *   onSuccess: () => router.push('/dashboard'),
 *   onError: (error) => toast.error(error.message)
 * });
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import { useApiMutation } from "./useApiMutation";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { UI_LABELS } from "@/constants";
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  registerWithEmail,
  resetPassword as firebaseResetPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "@/lib/firebase/auth-helpers";
import { db, auth } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { USER_COLLECTION } from "@/db/schema/users";
import { UserProfile } from "@/types/auth";

// ============================================================================
// Types
// ============================================================================

interface LoginCredentials {
  emailOrPhone: string;
  password: string;
}

interface RegisterData {
  email?: string;
  phoneNumber?: string;
  password: string;
  displayName?: string;
  acceptTerms: boolean;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

interface ResendVerificationData {
  email: string;
}

// ============================================================================
// Auth Hooks
// ============================================================================

/**
 * Hook for user login with Firebase Auth
 */
export function useLogin(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, LoginCredentials>({
    mutationFn: async (credentials) => {
      const isEmail = credentials.emailOrPhone.includes("@");

      if (isEmail) {
        const result = await signInWithEmail(
          credentials.emailOrPhone,
          credentials.password,
        );
        return { success: true, user: result.user };
      } else {
        throw new Error(UI_LABELS.AUTH.PHONE_LOGIN_NOT_IMPLEMENTED);
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for user registration with Firebase Auth
 */
export function useRegister(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, RegisterData>({
    mutationFn: async (data) => {
      if (data.email) {
        const result = await registerWithEmail(
          data.email,
          data.password,
          data.displayName || UI_LABELS.AUTH.DEFAULT_DISPLAY_NAME,
        );
        return { success: true, user: result.user };
      } else if (data.phoneNumber) {
        throw new Error(UI_LABELS.AUTH.PHONE_REGISTER_NOT_IMPLEMENTED);
      } else {
        throw new Error(UI_LABELS.AUTH.EMAIL_OR_PHONE_REQUIRED);
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for email verification
 */
export function useVerifyEmail(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, { token: string }>({
    mutationFn: ({ token }) =>
      apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for resending verification email
 */
export function useResendVerification(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, ResendVerificationData>({
    mutationFn: (data) => apiClient.post("/api/auth/send-verification", data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for forgot password with Firebase Auth
 */
export function useForgotPassword(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, ForgotPasswordData>({
    mutationFn: async (data) => {
      await firebaseResetPassword(data.email);
      return { success: true };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for resetting password with token
 */
export function useResetPassword(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, ResetPasswordData>({
    mutationFn: (data) =>
      apiClient.put(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for changing password (authenticated user)
 */
export function useChangePassword(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, ChangePasswordData>({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

// ============================================================================
// Main useAuth Hook (Authentication State)
// ============================================================================

/**
 * Hook for accessing current authentication state
 * Returns the current user with Firestore data (including role) and loading state.
 * Call `refreshUser()` to re-fetch Firestore data without waiting for an auth state change.
 */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch & merge Firestore user data
  const fetchUserData = async (authUser: any): Promise<UserProfile> => {
    try {
      const userDocRef = doc(db, USER_COLLECTION, authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        return {
          ...authUser,
          ...firestoreData,
          uid: authUser.uid,
        };
      }
      return authUser;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return authUser;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const mergedUser = await fetchUserData(authUser);
        setUser(mergedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array ensures this only runs once

  /**
   * Manually re-fetch the current user's Firestore data.
   * Useful after profile updates (avatar, display name, etc.)
   * to reflect changes without waiting for an auth state change.
   */
  const refreshUser = useCallback(async () => {
    const currentAuth = auth.currentUser;
    if (currentAuth) {
      const mergedUser = await fetchUserData(currentAuth);
      setUser(mergedUser);
    }
  }, []);

  return { user, loading, refreshUser };
}

// Export types
export type {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  ResendVerificationData,
};
