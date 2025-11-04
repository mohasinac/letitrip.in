/**
 * Address Service
 * Handles all address-related API operations
 */

import { apiClient } from "../client";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  type?: 'home' | 'work' | 'other';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'home' | 'work' | 'other';
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export class AddressService {
  /**
   * Get all addresses for current user
   */
  static async getAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<Address[]>('/api/addresses');
      return response;
    } catch (error) {
      console.error("AddressService.getAddresses error:", error);
      throw error;
    }
  }

  /**
   * Get address by ID
   */
  static async getAddress(addressId: string): Promise<Address> {
    try {
      const response = await apiClient.get<Address>(`/api/addresses/${addressId}`);
      return response;
    } catch (error) {
      console.error("AddressService.getAddress error:", error);
      throw error;
    }
  }

  /**
   * Create new address
   */
  static async createAddress(data: CreateAddressData): Promise<Address> {
    try {
      const response = await apiClient.post<Address>('/api/addresses', data);
      return response;
    } catch (error) {
      console.error("AddressService.createAddress error:", error);
      throw error;
    }
  }

  /**
   * Update address
   */
  static async updateAddress(addressId: string, data: UpdateAddressData): Promise<Address> {
    try {
      const response = await apiClient.put<Address>(
        `/api/addresses/${addressId}`,
        data
      );
      return response;
    } catch (error) {
      console.error("AddressService.updateAddress error:", error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  static async deleteAddress(addressId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/addresses/${addressId}`);
    } catch (error) {
      console.error("AddressService.deleteAddress error:", error);
      throw error;
    }
  }

  /**
   * Set default address
   */
  static async setDefaultAddress(addressId: string): Promise<void> {
    try {
      await apiClient.put<void>(`/api/addresses/${addressId}`, {
        isDefault: true
      });
    } catch (error) {
      console.error("AddressService.setDefaultAddress error:", error);
      throw error;
    }
  }
}

export default AddressService;
