/**
 * Seller Settings Service
 *
 * @status IMPLEMENTED
 * @epic E006 - Shop Management
 *
 * Frontend service for seller settings management.
 */

import { apiService } from "./api.service";

// Types
export interface SellerProfileSettings {
  displayName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: "individual" | "company";
  gstNumber: string;
  panNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface SellerNotificationSettings {
  emailNotifications: boolean;
  orderAlerts: boolean;
  reviewAlerts: boolean;
  payoutAlerts: boolean;
  promotionalEmails: boolean;
  lowStockAlerts: boolean;
  dailyDigest: boolean;
}

export interface SellerPayoutSettings {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  preferredMethod: "bank" | "upi";
  minPayoutAmount: number;
}

export interface SellerSettings {
  profile: SellerProfileSettings;
  notifications: SellerNotificationSettings;
  payout: SellerPayoutSettings;
}

interface SellerSettingsResponse {
  profile: SellerProfileSettings;
  notifications: SellerNotificationSettings;
  payout: SellerPayoutSettings;
  error?: string;
}

interface UpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class SellerSettingsService {
  private baseUrl = "/api/seller/settings";

  /**
   * Get all seller settings
   */
  async getAll(): Promise<SellerSettings> {
    const response = await apiService.get<SellerSettingsResponse>(this.baseUrl);
    if (response.error) {
      throw new Error(response.error);
    }
    return {
      profile: response.profile,
      notifications: response.notifications,
      payout: response.payout,
    };
  }

  /**
   * Update profile settings
   */
  async updateProfile(profile: Partial<SellerProfileSettings>): Promise<void> {
    const response = await apiService.put<UpdateResponse>(this.baseUrl, {
      profile,
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update profile settings");
    }
  }

  /**
   * Update notification settings
   */
  async updateNotifications(notifications: Partial<SellerNotificationSettings>): Promise<void> {
    const response = await apiService.put<UpdateResponse>(this.baseUrl, {
      notifications,
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update notification settings");
    }
  }

  /**
   * Update payout settings
   */
  async updatePayout(payout: Partial<SellerPayoutSettings>): Promise<void> {
    const response = await apiService.put<UpdateResponse>(this.baseUrl, {
      payout,
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update payout settings");
    }
  }

  /**
   * Update all settings at once
   */
  async updateAll(settings: Partial<SellerSettings>): Promise<void> {
    const response = await apiService.put<UpdateResponse>(this.baseUrl, settings);
    if (!response.success) {
      throw new Error(response.error || "Failed to update settings");
    }
  }

  /**
   * Toggle a notification setting
   */
  async toggleNotification(
    key: keyof SellerNotificationSettings,
    enabled: boolean
  ): Promise<void> {
    await this.updateNotifications({ [key]: enabled });
  }
}

export const sellerSettingsService = new SellerSettingsService();
