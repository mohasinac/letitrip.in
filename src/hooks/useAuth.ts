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

import { useApiMutation } from './useApiMutation';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { 
  signInWithEmail, 
  signInWithGoogle, 
  signInWithApple,
  registerWithEmail,
  resetPassword as firebaseResetPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from '@/lib/firebase/auth-helpers';

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
      const isEmail = credentials.emailOrPhone.includes('@');
      
      if (isEmail) {
        const result = await signInWithEmail(credentials.emailOrPhone, credentials.password);
        return { success: true, user: result.user };
      } else {
        throw new Error('Phone login not yet implemented');
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
          data.displayName || 'User'
        );
        return { success: true, user: result.user };
      } else if (data.phoneNumber) {
        throw new Error('Phone registration not yet implemented');
      } else {
        throw new Error('Email or phone number required');
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
    mutationFn: ({ token }) => apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`),
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
    mutationFn: (data) => apiClient.post('/api/auth/send-verification', data),
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
    mutationFn: (data) => apiClient.put(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
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
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data),
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
};
