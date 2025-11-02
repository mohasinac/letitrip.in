/**
 * Users Service
 * Frontend service for user-related API calls
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { User, Address } from '@/types';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  preferredCurrency?: string;
}

export class UsersService {
  /**
   * Get current user profile
   * @returns User profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE);
  }

  /**
   * Update user profile
   * @param data - Profile data to update
   * @returns Updated user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiClient.patch<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
  }

  /**
   * Get user addresses
   * @returns List of addresses
   */
  async getAddresses(): Promise<Address[]> {
    return apiClient.get<Address[]>(API_ENDPOINTS.USERS.ADDRESSES);
  }

  /**
   * Add new address
   * @param address - Address data
   * @returns Created address
   */
  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    return apiClient.post<Address>(API_ENDPOINTS.USERS.ADD_ADDRESS, address);
  }

  /**
   * Update existing address
   * @param id - Address ID
   * @param address - Updated address data
   * @returns Updated address
   */
  async updateAddress(id: string, address: Partial<Address>): Promise<Address> {
    return apiClient.patch<Address>(API_ENDPOINTS.USERS.UPDATE_ADDRESS(id), address);
  }

  /**
   * Delete address
   * @param id - Address ID
   */
  async deleteAddress(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.USERS.DELETE_ADDRESS(id));
  }

  /**
   * Set default address
   * @param id - Address ID
   * @returns Updated address
   */
  async setDefaultAddress(id: string): Promise<Address> {
    return apiClient.patch<Address>(API_ENDPOINTS.USERS.UPDATE_ADDRESS(id), {
      isDefault: true,
    });
  }
}

// Export singleton instance
export const usersService = new UsersService();
