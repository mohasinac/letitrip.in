/**
 * Auth Service
 * Pure async functions for authentication API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const authService = {
  /** Log in with email + password */
  login: (data: { email: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data),

  /** Register a new user */
  register: (data: {
    email: string;
    password: string;
    displayName: string;
    acceptTerms: boolean;
  }) => apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data),

  /** Log out and destroy the session */
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}),

  /** Send a verification email */
  sendVerification: (data: { email: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data),

  /** Verify an email with a token */
  verifyEmail: (data: { token: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data),

  /** Request a password reset link */
  forgotPassword: (data: { email: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

  /** Reset password with a token */
  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),

  /** Change password for authenticated user */
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data),
};
