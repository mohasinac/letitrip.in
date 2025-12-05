/**
 * @fileoverview Service Module
 * @module src/services/seller-settings.service
 * @description This file contains service functions for seller-settings operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * SellerProfileSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for SellerProfileSettings
 */
export interface SellerProfileSettings {
  /** Display Name */
  displayName: string;
  /** Email */
  email: string;
  /** Phone */
  phone: string;
  /** Business Name */
  businessName: string;
  /** Business Type */
  businessType: "individual" | "company";
  /** Gst Number */
  gstNumber: string;
  /** Pan Number */
  panNumber: string;
  /** Address */
  address: {
    /** Street */
    street: string;
    /** City */
    city: string;
    /** State */
    state: string;
    /** Pincode */
    pincode: string;
  };
}

/**
 * SellerNotificationSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for SellerNotificationSettings
 */
export interface SellerNotificationSettings {
  /** Email Notifications */
  emailNotifications: boolean;
  /** Order Alerts */
  orderAlerts: boolean;
  /** Review Alerts */
  reviewAlerts: boolean;
  /** Payout Alerts */
  payoutAlerts: boolean;
  /** Promotional Emails */
  promotionalEmails: boolean;
  /** Low Stock Alerts */
  lowStockAlerts: boolean;
  /** Daily Digest */
  dailyDigest: boolean;
}

/**
 * SellerPayoutSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for SellerPayoutSettings
 */
export interface SellerPayoutSettings {
  /** Account Holder Name */
  accountHolderName: string;
  /** Bank Name */
  bankName: string;
  /** Account Number */
  accountNumber: string;
  /** Ifsc Code */
  ifscCode: string;
  /** Upi Id */
  upiId: string;
  /** Preferred Method */
  preferredMethod: "bank" | "upi";
  /** Min Payout Amount */
  minPayoutAmount: number;
}

/**
 * SellerSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for SellerSettings
 */
export interface SellerSettings {
  /** Profile */
  profile: SellerProfileSettings;
  /** Notifications */
  notifications: SellerNotificationSettings;
  /** Payout */
  payout: SellerPayoutSettings;
}

/**
 * SellerSettingsResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for SellerSettingsResponse
 */
interface SellerSettingsResponse {
  /** Profile */
  profile: SellerProfileSettings;
  /** Notifications */
  notifications: SellerNotificationSettings;
  /** Payout */
  payout: SellerPayoutSettings;
  /** Error */
  error?: string;
}

/**
 * UpdateResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for UpdateResponse
 */
interface UpdateResponse {
  /** Success */
  success: boolean;
  /** Message */
  message?: string;
  /** Error */
  error?: string;
}

/**
 * SellerSettingsService class
 * 
 * @class
 * @description Description of SellerSettingsService class functionality
 */
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
      /** Profile */
      profile: response.profile,
      /** Notifications */
      notifications: response.notifications,
      /** Payout */
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
  async updateNotifications(
    /** Notifications */
    notifications: Partial<SellerNotificationSettings>,
  ): Promise<void> {
    const response = await apiService.put<UpdateResponse>(this.baseUrl, {
      notifications,
    });
    if (!response.success) {
      throw new Error(
        response.error || "Failed to update notification settings",
      );
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
    const response = await apiService.put<UpdateResponse>(
      this.baseUrl,
      settings,
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update settings");
    }
  }

  /**
   * Toggle a notification setting
   */
  async toggleNotification(
    /** Key */
    key: keyof SellerNotificationSettings,
    /** Enabled */
    enabled: boolean,
  ): Promise<void> {
    await this.updateNotifications({ [key]: enabled });
  }
}

export const sellerSettingsService = new SellerSettingsService();
