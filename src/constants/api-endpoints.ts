/**
 * API Endpoints Constants
 * Use these constants in the API client for type-safe endpoint references
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    VERIFY_EMAIL: "/api/auth/verify-email",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    REFRESH_TOKEN: "/api/auth/refresh-token",
  },

  // User endpoints
  USER: {
    PROFILE: "/api/user/profile",
    CHANGE_PASSWORD: "/api/user/change-password",
    UPDATE_PROFILE: "/api/user/profile",
    DELETE_ACCOUNT: "/api/user/account",
  },

  // Profile endpoints
  PROFILE: {
    UPDATE: "/api/profile/update",
    ADD_PHONE: "/api/profile/add-phone",
    VERIFY_PHONE: "/api/profile/verify-phone",
    UPDATE_PASSWORD: "/api/profile/update-password",
    DELETE_ACCOUNT: "/api/profile/delete-account",
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
  },
} as const;

// Type for API endpoints
export type ApiEndpoint = string | ((id: string) => string);
