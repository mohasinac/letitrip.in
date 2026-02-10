"use client";

/**
 * Authentication Hooks
 *
 * Custom hooks for authentication operations. Login and Register use the
 * server-side API approach (backend validates credentials, creates session,
 * manages Firestore metadata) then sync client-side Firebase SDK.
 * Other auth operations use Firebase client SDK directly where appropriate.
 *
 * @example
 * ```tsx
 * const { mutate: login, isLoading, error } = useLogin({
 *   onSuccess: () => router.push('/dashboard'),
 *   onError: (error) => toast.error(error.message)
 * });
 * await login({ email: 'user@example.com', password: 'password123' });
 * ```
 */

import { useApiMutation } from "./useApiMutation";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ERROR_MESSAGES } from "@/constants";
import {
  signInWithGoogle,
  signInWithApple,
  resetPassword as firebaseResetPassword,
  applyEmailVerificationCode,
  getCurrentUser,
} from "@/lib/firebase/auth-helpers";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

// ============================================================================
// Types
// ============================================================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
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

interface VerifyEmailData {
  token: string;
}

// ============================================================================
// Auth Hooks
// ============================================================================

/**
 * Hook for user login via server-side API.
 * Flow: Backend API validates credentials + creates session cookie → Client SDK syncs auth state.
 * This ensures server-side password verification, login metadata tracking, and disabled account checks.
 */
export function useLogin(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, LoginCredentials>({
    mutationFn: async (credentials) => {
      // 1. Server-side login: validates credentials, creates session cookie, tracks metadata
      await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      // 2. Sync client-side Firebase SDK so onAuthStateChanged fires
      await signInWithEmailAndPassword(
        auth,
        credentials.email.trim(),
        credentials.password,
      );

      return { success: true };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for Google OAuth login.
 * Uses Firebase client SDK for OAuth popup, session is created automatically via auth-helpers.
 */
export function useGoogleLogin(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, void>({
    mutationFn: async () => {
      await signInWithGoogle();
      return { success: true };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for Apple OAuth login.
 * Uses Firebase client SDK for OAuth popup, session is created automatically via auth-helpers.
 */
export function useAppleLogin(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, void>({
    mutationFn: async () => {
      await signInWithApple();
      return { success: true };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for user registration via server-side API.
 * Flow: Backend API creates user via Admin SDK, stores Firestore profile, creates session, sends verification email.
 * This ensures proper profile creation with DEFAULT_USER_DATA, server-side password validation, and secure session setup.
 */
export function useRegister(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, RegisterData>({
    mutationFn: async (data) => {
      // Server-side registration: Admin SDK creates user, stores profile, creates session, sends verification
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: data.email.trim(),
        password: data.password,
        displayName: data.displayName?.trim() || undefined,
      });

      return { success: true, ...response };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for email verification using Firebase action code.
 * Applies the verification code from the email link, then reloads user to confirm emailVerified flag.
 */
export function useVerifyEmail(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, VerifyEmailData>({
    mutationFn: async ({ token }) => {
      // Apply the verification action code from the email link
      await applyEmailVerificationCode(token);

      // Reload current user to update emailVerified flag
      const user = getCurrentUser();
      if (user) {
        await user.reload();
      }

      return { success: true, emailVerified: true };
    },
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
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for forgot password using Firebase client SDK.
 * Uses client SDK's sendPasswordResetEmail which actually sends the email (unlike the server API which has a TODO).
 * Includes user-enumeration protection: returns success even if user doesn't exist.
 */
export function useForgotPassword(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, ForgotPasswordData>({
    mutationFn: async (data) => {
      try {
        await firebaseResetPassword(data.email);
      } catch (error: any) {
        // User-enumeration protection: don't reveal if account exists
        if (error?.code === "auth/user-not-found") {
          return { success: true };
        }
        throw error;
      }
      return { success: true };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for resetting password with token.
 * Uses Firebase client SDK to reset password directly.
 */
export function useResetPassword(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, ResetPasswordData>({
    mutationFn: async (data) => {
      const { confirmPasswordResetWithToken } =
        await import("@/lib/firebase/auth-helpers");
      await confirmPasswordResetWithToken(data.token, data.newPassword);
      return { success: true };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for changing password (authenticated user).
 * Verifies current password client-side before calling API.
 */
export function useChangePassword(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useApiMutation<any, ChangePasswordData>({
    mutationFn: async (data) => {
      const { reauthenticateWithPassword, getCurrentUser } =
        await import("@/lib/firebase/auth-helpers");

      const user = getCurrentUser();
      if (!user?.email) {
        throw new Error(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
      }

      // Verify current password client-side first
      await reauthenticateWithPassword(user.email, data.currentPassword);

      // Then call API to update password
      return apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

// Export types
export type {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  ResendVerificationData,
  VerifyEmailData,
};
