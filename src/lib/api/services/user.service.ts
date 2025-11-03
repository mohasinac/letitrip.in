/**
 * User Service
 * Handles all user profile and account-related API operations
 */

import { apiClient } from "../client";

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type?: 'home' | 'work' | 'other';
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'seller' | 'admin';
  addresses?: Address[];
  preferences?: {
    currency?: string;
    language?: string;
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  preferences?: UserProfile['preferences'];
}

export interface CreateAddressData {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  type?: Address['type'];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>("/api/user/profile");
      return response;
    } catch (error) {
      console.error("UserService.getProfile error:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await apiClient.put<UserProfile>(
        "/api/user/profile",
        updates
      );
      return response;
    } catch (error) {
      console.error("UserService.updateProfile error:", error);
      throw error;
    }
  }

  /**
   * Upload profile avatar
   */
  static async uploadAvatar(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const response = await apiClient.upload<{ url: string }>(
        "/api/upload",
        formData
      );
      
      return response;
    } catch (error) {
      console.error("UserService.uploadAvatar error:", error);
      throw error;
    }
  }

  /**
   * Get all addresses
   */
  static async getAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<Address[]>("/api/addresses");
      return response;
    } catch (error) {
      console.error("UserService.getAddresses error:", error);
      throw error;
    }
  }

  /**
   * Create new address
   */
  static async createAddress(addressData: CreateAddressData): Promise<Address> {
    try {
      const response = await apiClient.post<Address>(
        "/api/addresses",
        addressData
      );
      return response;
    } catch (error) {
      console.error("UserService.createAddress error:", error);
      throw error;
    }
  }

  /**
   * Update address
   */
  static async updateAddress(
    addressId: string,
    updates: Partial<CreateAddressData>
  ): Promise<Address> {
    try {
      const response = await apiClient.put<Address>(
        `/api/addresses/${addressId}`,
        updates
      );
      return response;
    } catch (error) {
      console.error("UserService.updateAddress error:", error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  static async deleteAddress(addressId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/addresses/${addressId}`);
    } catch (error) {
      console.error("UserService.deleteAddress error:", error);
      throw error;
    }
  }

  /**
   * Set default address
   */
  static async setDefaultAddress(addressId: string): Promise<Address> {
    try {
      const response = await apiClient.patch<Address>(
        `/api/addresses/${addressId}/default`
      );
      return response;
    } catch (error) {
      console.error("UserService.setDefaultAddress error:", error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.post("/api/user/change-password", data);
    } catch (error) {
      console.error("UserService.changePassword error:", error);
      throw error;
    }
  }

  /**
   * Delete account
   */
  static async deleteAccount(password: string): Promise<void> {
    try {
      await apiClient.post("/api/auth/delete-account", { password });
    } catch (error) {
      console.error("UserService.deleteAccount error:", error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    totalOrders: number;
    totalSpent: number;
    totalReviews: number;
    wishlistCount: number;
  }> {
    try {
      const response = await apiClient.get("/api/user/stats");
      return response;
    } catch (error) {
      console.error("UserService.getUserStats error:", error);
      throw error;
    }
  }
}

export default UserService;
