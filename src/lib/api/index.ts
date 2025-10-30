/**
 * API Services Export Index
 * Centralized export for all API services
 */

// Import API services
import apiClient from './client';
import { authAPI } from './auth';

// Export API client
export { default as apiClient } from './client';

// Export structured API services
export { authAPI } from './auth';

// Export types
export type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from './auth';

// Convenience object for accessing all APIs
export const API = {
  auth: authAPI,
} as const;

// Legacy API exports (for backward compatibility)
import { User } from '@/types';
import type { RegisterInput, LoginInput } from '@/lib/validations/schemas';

/**
 * Legacy Authentication API (deprecated - use authAPI instead)
 */
export const authApi = {
  register: async (data: RegisterInput): Promise<{ user: User; token: string }> => {
    return authAPI.register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as 'user' | 'seller',
      isOver18: data.isOver18,
    });
  },

  login: async (data: LoginInput): Promise<{ user: User; token: string }> => {
    return authAPI.login(data);
  },

  logout: async (): Promise<void> => {
    return authAPI.logout();
  },

  me: async (): Promise<User> => {
    const user = await authAPI.getCurrentUser();
    if (!user) throw new Error('User not found');
    return user;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return authAPI.updateProfile(data);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await authAPI.changePassword({ currentPassword, newPassword });
  },
};

/**
 * API Module Exports
 * Central export point for all API-related utilities and services
 */

// ===== NEW REFACTORED UTILITIES =====
// Export all new API infrastructure
export * from './constants';
export * from './cors';
export * from './response';
export * from './middleware';
export * from './validation';
