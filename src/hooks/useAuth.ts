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

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthEvent } from "./useAuthEvent";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants";
import { NotFoundError } from "@/lib/errors";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/contexts";
import {
  resetPassword as firebaseResetPassword,
  applyEmailVerificationCode,
  getCurrentUser,
  syncFirebaseAuth,
} from "@/lib/firebase/auth-helpers";

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
  return useMutation<any, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      // 1. Server-side login: validates credentials, creates session cookie, tracks metadata
      await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      // 2. Sync client-side Firebase SDK so onAuthStateChanged fires (without creating a second session)
      await syncFirebaseAuth(credentials.email.trim(), credentials.password);

      return { success: true };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for Google OAuth login via the RTDB popup bridge.
 * Flow:
 *  1. POST /api/auth/event/init → get eventId + customToken
 *  2. Open /api/auth/google/start?eventId=... in a popup window
 *  3. Subscribe to RTDB /auth_events/{eventId} via useAuthEvent
 *  4. On success: router.refresh() picks up __session cookie, then onSuccess fires
 */
export function useGoogleLogin(options?: {
  onSuccess?: (
    data: { isNewUser: boolean; uid: string; role: string } | null,
  ) => void;
  onError?: (error: any) => void;
}) {
  const router = useRouter();
  const authEvent = useAuthEvent();
  const { refreshUser } = useSession();
  const [initiating, setInitiating] = useState(false);

  // Stable refs so the effect closure never goes stale
  const onSuccessRef = useRef(options?.onSuccess);
  const onErrorRef = useRef(options?.onError);
  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
  }, [options?.onSuccess]);
  useEffect(() => {
    onErrorRef.current = options?.onError;
  }, [options?.onError]);

  useEffect(() => {
    if (authEvent.status === "success") {
      router.refresh();
      // Hydrate SessionContext from the server session cookie before navigating.
      // Google OAuth sets cookies server-side without signing in the Firebase client
      // SDK, so we must explicitly refresh the user profile here.
      refreshUser().then(() => {
        onSuccessRef.current?.(authEvent.data);
      });
    } else if (
      authEvent.status === "failed" ||
      authEvent.status === "timeout"
    ) {
      onErrorRef.current?.(
        new Error(authEvent.error ?? "Sign-in failed. Please try again."),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authEvent.status]);

  const mutate = useCallback(async () => {
    // Open the popup to the same-origin static page synchronously inside the
    // user-gesture so browsers never block it as an unsolicited popup.
    const popup = window.open(
      `${window.location.origin}/auth.html`,
      "oauth_google",
      "width=500,height=660,left=400,top=100",
    );
    if (!popup) {
      onErrorRef.current?.(
        new Error("Popup blocked. Please allow popups for this site."),
      );
      return;
    }
    try {
      setInitiating(true);
      authEvent.reset();
      const { eventId, customToken } = await apiClient.post<{
        eventId: string;
        customToken: string;
        expiresAt: number;
      }>(API_ENDPOINTS.AUTH.EVENT_INIT, {});
      const url = `${window.location.origin}/api/auth/google/start?eventId=${encodeURIComponent(eventId)}`;
      // Write to localStorage — the storage event fires in auth.html (a different
      // same-origin window) without needing any window reference or postMessage.
      localStorage.setItem("letitrip_oauth_redirect", url);
      authEvent.subscribe(eventId, customToken);
    } catch (err) {
      popup.close();
      onErrorRef.current?.(
        err instanceof Error ? err : new Error("Failed to start sign-in."),
      );
    } finally {
      setInitiating(false);
    }
  }, [authEvent]);

  const isLoading =
    initiating ||
    authEvent.status === "subscribing" ||
    authEvent.status === "pending";

  return { mutate, isLoading };
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
  return useMutation<any, Error, RegisterData>({
    mutationFn: async (data) => {
      // Server-side registration: Admin SDK creates user, stores profile, creates session, sends verification
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: data.email.trim(),
        password: data.password,
        displayName: data.displayName?.trim() || "",
        acceptTerms: data.acceptTerms,
      });

      // Sync Firebase client SDK so onAuthStateChanged fires in SessionContext.
      // The server already created the session cookie — syncFirebaseAuth only
      // signs in the client SDK without creating a duplicate session.
      await syncFirebaseAuth(data.email.trim(), data.password);

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
  return useMutation<any, Error, VerifyEmailData>({
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
  return useMutation<any, Error, ResendVerificationData>({
    mutationFn: (data) =>
      apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Hook for forgot password using Firebase client SDK.
 * Uses client SDK's sendPasswordResetEmail to send a password reset email.
 * Includes user-enumeration protection: returns success even if user doesn't exist.
 */
export function useForgotPassword(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  return useMutation<any, Error, ForgotPasswordData>({
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
  return useMutation<any, Error, ResetPasswordData>({
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
  return useMutation<any, Error, ChangePasswordData>({
    mutationFn: async (data) => {
      const { reauthenticateWithPassword, getCurrentUser } =
        await import("@/lib/firebase/auth-helpers");

      const user = getCurrentUser();
      if (!user?.email) {
        throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
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
