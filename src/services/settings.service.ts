/**
 * Settings Service
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Frontend service for admin settings management.
 */

import { apiService } from "./api.service";

// Types
export interface GeneralSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  faviconUrl: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface PaymentSettings {
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret?: string;
    testMode: boolean;
  };
  payu: {
    enabled: boolean;
    merchantKey: string;
    merchantSalt?: string;
    testMode: boolean;
  };
  paypal?: {
    enabled: boolean;
    clientId: string;
    clientSecret?: string;
    testMode: boolean;
  };
  cod: {
    enabled: boolean;
    maxOrderValue: number;
    minOrderValue: number;
  };
  currency: string;
  currencySymbol: string;
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  defaultShippingCharge: number;
  expressShippingCharge: number;
  expressShippingEnabled: boolean;
  estimatedDeliveryDays: {
    standard: { min: number; max: number };
    express: { min: number; max: number };
  };
  restrictedPincodes: string[];
  shiprocket?: {
    enabled: boolean;
    email: string;
    password: string;
  };
}

export interface FeatureSettings {
  auctionsEnabled: boolean;
  buyNowEnabled: boolean;
  reviewsEnabled: boolean;
  wishlistEnabled: boolean;
  comparisonsEnabled: boolean;
  chatEnabled: boolean;
  multiVendorEnabled: boolean;
}

export interface AllSettings {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  features: FeatureSettings;
}

type SettingsCategory = "general" | "payment" | "shipping" | "features";

interface SettingsResponse<T> {
  success: boolean;
  settings: T;
  category?: string;
  message?: string;
  error?: string;
}

class SettingsService {
  private baseUrl = "/api/admin/settings";

  /**
   * Get all settings
   */
  async getAll(): Promise<AllSettings> {
    const response = await apiService.get<SettingsResponse<AllSettings>>(
      this.baseUrl
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch settings");
    }
    return response.settings;
  }

  /**
   * Get settings by category
   */
  async getCategory<T>(category: SettingsCategory): Promise<T> {
    const response = await apiService.get<SettingsResponse<T>>(
      `${this.baseUrl}?category=${category}`
    );
    if (!response.success) {
      throw new Error(response.error || `Failed to fetch ${category} settings`);
    }
    return response.settings;
  }

  /**
   * Get general settings
   */
  async getGeneral(): Promise<GeneralSettings> {
    return this.getCategory<GeneralSettings>("general");
  }

  /**
   * Get payment settings
   */
  async getPayment(): Promise<PaymentSettings> {
    return this.getCategory<PaymentSettings>("payment");
  }

  /**
   * Get shipping settings
   */
  async getShipping(): Promise<ShippingSettings> {
    return this.getCategory<ShippingSettings>("shipping");
  }

  /**
   * Get feature settings
   */
  async getFeatures(): Promise<FeatureSettings> {
    return this.getCategory<FeatureSettings>("features");
  }

  /**
   * Update settings for a category
   */
  async updateCategory<T>(
    category: SettingsCategory,
    settings: Partial<T>
  ): Promise<T> {
    const response = await apiService.put<SettingsResponse<T>>(this.baseUrl, {
      category,
      settings,
    });
    if (!response.success) {
      throw new Error(
        response.error || `Failed to update ${category} settings`
      );
    }
    return response.settings;
  }

  /**
   * Update general settings
   */
  async updateGeneral(
    settings: Partial<GeneralSettings>
  ): Promise<GeneralSettings> {
    return this.updateCategory<GeneralSettings>("general", settings);
  }

  /**
   * Update payment settings
   */
  async updatePayment(
    settings: Partial<PaymentSettings>
  ): Promise<PaymentSettings> {
    return this.updateCategory<PaymentSettings>("payment", settings);
  }

  /**
   * Update shipping settings
   */
  async updateShipping(
    settings: Partial<ShippingSettings>
  ): Promise<ShippingSettings> {
    return this.updateCategory<ShippingSettings>("shipping", settings);
  }

  /**
   * Update feature settings
   */
  async updateFeatures(
    settings: Partial<FeatureSettings>
  ): Promise<FeatureSettings> {
    return this.updateCategory<FeatureSettings>("features", settings);
  }

  /**
   * Update a single setting by path
   */
  async updateSetting(path: string, value: unknown): Promise<void> {
    const response = await apiService.patch<{
      success: boolean;
      error?: string;
    }>(this.baseUrl, { path, value });
    if (!response.success) {
      throw new Error(response.error || "Failed to update setting");
    }
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(
    enabled: boolean,
    message?: string
  ): Promise<void> {
    const updates: Partial<GeneralSettings> = { maintenanceMode: enabled };
    if (message !== undefined) {
      updates.maintenanceMessage = message;
    }
    await this.updateGeneral(updates);
  }

  /**
   * Toggle a feature
   */
  async toggleFeature(
    feature: keyof FeatureSettings,
    enabled: boolean
  ): Promise<void> {
    await this.updateSetting(`features.${feature}`, enabled);
  }

  /**
   * Update social links
   */
  async updateSocialLinks(
    links: Partial<GeneralSettings["socialLinks"]>
  ): Promise<void> {
    const current = await this.getGeneral();
    await this.updateGeneral({
      socialLinks: {
        ...current.socialLinks,
        ...links,
      },
    });
  }

  /**
   * Test Shiprocket connection
   */
  async testShiprocketConnection(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { name: string; email: string; companyId: number };
  }> {
    const response = await apiService.post<{
      success: boolean;
      message?: string;
      error?: string;
      data?: { name: string; email: string; companyId: number };
    }>("/api/admin/settings/shipping/test-shiprocket", { email, password });

    if (!response.success) {
      return {
        success: false,
        message: response.error || "Failed to test connection",
      };
    }

    return {
      success: true,
      message: response.message || "Connection successful",
      data: response.data,
    };
  }
}

export const settingsService = new SettingsService();
