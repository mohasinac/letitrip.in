/**
 * Auth Service
 * Handles all authentication-related API operations
 */

import { apiClient } from "../client";

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'seller' | 'admin';
  sellerId?: string;
  emailVerified: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'seller';
}

export interface SendOtpData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'seller';
}

export interface VerifyOtpData {
  email: string;
  otp: string;
  verificationId: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthUser> {
    try {
      const response = await apiClient.post<AuthUser>(
        '/api/auth/register',
        data
      );
      return response;
    } catch (error) {
      console.error("AuthService.register error:", error);
      throw error;
    }
  }

  /**
   * Send OTP for verification
   */
  static async sendOtp(data: SendOtpData): Promise<{ verificationId: string }> {
    try {
      const response = await apiClient.post<{ verificationId: string }>(
        '/api/auth/send-otp',
        data
      );
      return response;
    } catch (error) {
      console.error("AuthService.sendOtp error:", error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOtp(data: VerifyOtpData): Promise<AuthUser> {
    try {
      const response = await apiClient.post<AuthUser>(
        '/api/auth/verify-otp',
        data
      );
      return response;
    } catch (error) {
      console.error("AuthService.verifyOtp error:", error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await apiClient.get<AuthUser>('/api/auth/me');
      return response;
    } catch (error) {
      console.error("AuthService.getCurrentUser error:", error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.post<void>('/api/auth/change-password', data);
    } catch (error) {
      console.error("AuthService.changePassword error:", error);
      throw error;
    }
  }

  /**
   * Delete account
   */
  static async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete<void>('/api/auth/delete-account');
    } catch (error) {
      console.error("AuthService.deleteAccount error:", error);
      throw error;
    }
  }
}

export default AuthService;
