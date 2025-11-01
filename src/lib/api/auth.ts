/**
 * Authentication API Service
 */

import apiClient from "./client";
import type { User } from "@/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: "user" | "seller";
  isOver18?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class AuthAPI {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    // Set token in client
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      credentials,
    );

    // Set token in client
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Always clear token even if request fails
      apiClient.clearToken();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>("/api/auth/me");
      return response;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string } | null> {
    try {
      const response = await apiClient.post<{ token: string }>("/auth/refresh");

      if (response.token) {
        apiClient.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/verify-email", {
      token,
    });
    return response;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/forgot-password", {
      email,
    });
    return response;
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/reset-password", {
      token,
      newPassword,
    });
    return response;
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/change-password", data);
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>("/auth/profile", updates);
    return response;
  }

  /**
   * Delete user account
   */
  async deleteAccount(
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    // Use POST for account deletion since DELETE might not accept body
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/delete-account", {
      password,
    });

    // Clear token after account deletion
    apiClient.clearToken();

    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }

  /**
   * Get stored auth token
   */
  getAuthToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * Manually set auth token
   */
  setAuthToken(token: string): void {
    apiClient.setToken(token);
  }

  /**
   * Clear auth token
   */
  clearAuthToken(): void {
    apiClient.clearToken();
  }
}

export const authAPI = new AuthAPI();
