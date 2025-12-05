/**
 * @fileoverview Service Module
 * @module src/services/settings.service
 * @description This file contains service functions for settings operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * GeneralSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for GeneralSettings
 */
export interface GeneralSettings {
  /** Site Name */
  siteName: string;
  /** Site Tagline */
  siteTagline: string;
  /** Site Description */
  siteDescription: string;
  /** Contact Email */
  contactEmail: string;
  /** Support Email */
  supportEmail: string;
  /** Contact Phone */
  contactPhone: string;
  /** Address */
  address: string;
  /** Logo Url */
  logoUrl: string;
  /** Favicon Url */
  faviconUrl: string;
  /** Social Links */
  socialLinks: {
    /** Facebook */
    facebook: string;
    /** Twitter */
    twitter: string;
    /** Instagram */
    instagram: string;
    /** Linkedin */
    linkedin: string;
    /** Youtube */
    youtube: string;
  };
  /** Maintenance Mode */
  maintenanceMode: boolean;
  /** Maintenance Message */
  maintenanceMessage: string;
}

/**
 * PaymentSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentSettings
 */
export interface PaymentSettings {
  /** Razorpay */
  razorpay: {
    /** Enabled */
    enabled: boolean;
    /** Key Id */
    keyId: string;
    /** Key Secret */
    keySecret?: string;
    /** Test Mode */
    testMode: boolean;
  };
  /** Payu */
  payu: {
    /** Enabled */
    enabled: boolean;
    /** Merchant Key */
    merchantKey: string;
    /** Merchant Salt */
    merchantSalt?: string;
    /** Test Mode */
    testMode: boolean;
  };
  /** Cod */
  cod: {
    /** Enabled */
    enabled: boolean;
    /** Max Order Value */
    maxOrderValue: number;
    /** Min Order Value */
    minOrderValue: number;
  };
  /** Currency */
  currency: string;
  /** Currency Symbol */
  currencySymbol: string;
}

/**
 * ShippingSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for ShippingSettings
 */
export interface ShippingSettings {
  /** Free Shipping Threshold */
  freeShippingThreshold: number;
  /** Default Shipping Charge */
  defaultShippingCharge: number;
  /** Express Shipping Charge */
  expressShippingCharge: number;
  /** Express Shipping Enabled */
  expressShippingEnabled: boolean;
  /** Estimated Delivery Days */
  estimatedDeliveryDays: {
    /** Standard */
    standard: { min: number; max: number };
    /** Express */
    express: { min: number; max: number };
  };
  /** Restricted Pincodes */
  restrictedPincodes: string[];
}

/**
 * FeatureSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for FeatureSettings
 */
export interface FeatureSettings {
  /** Auctions Enabled */
  auctionsEnabled: boolean;
  /** Buy Now Enabled */
  buyNowEnabled: boolean;
  /** Reviews Enabled */
  reviewsEnabled: boolean;
  /** Wishlist Enabled */
  wishlistEnabled: boolean;
  /** Comparisons Enabled */
  comparisonsEnabled: boolean;
  /** Chat Enabled */
  chatEnabled: boolean;
  /** Multi Vendor Enabled */
  multiVendorEnabled: boolean;
}

/**
 * AllSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for AllSettings
 */
export interface AllSettings {
  /** General */
  general: GeneralSettings;
  /** Payment */
  payment: PaymentSettings;
  /** Shipping */
  shipping: ShippingSettings;
  /** Features */
  features: FeatureSettings;
}

/**
 * SettingsCategory type
 * 
 * @typedef {Object} SettingsCategory
 * @description Type definition for SettingsCategory
 */
type SettingsCategory = "general" | "payment" | "shipping" | "features";

/**
 * SettingsResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for SettingsResponse
 */
interface SettingsResponse<T> {
  /** Success */
  success: boolean;
  /** Settings */
  settings: T;
  /** Category */
  category?: string;
  /** Message */
  message?: string;
  /** Error */
  error?: string;
}

/**
 * SettingsService class
 * 
 * @class
 * @description Description of SettingsService class functionality
 */
class SettingsService {
  private baseUrl = "/api/admin/settings";

  /**
   * Get all settings
   */
  async getAll(): Promise<AllSettings> {
    const response = await apiService.get<SettingsResponse<AllSettings>>(
      this.baseUrl,
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
      `${this.baseUrl}?category=${category}`,
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
    /** Category */
    category: SettingsCategory,
    /** Settings */
    settings: Partial<T>,
  ): Promise<T> {
    const response = await apiService.put<SettingsResponse<T>>(this.baseUrl, {
      category,
      settings,
    });
    if (!response.success) {
      throw new Error(
        response.error || `Failed to update ${category} settings`,
      );
    }
    return response.settings;
  }

  /**
   * Update general settings
   */
  async updateGeneral(
    /** Settings */
    settings: Partial<GeneralSettings>,
  ): Promise<GeneralSettings> {
    return this.updateCategory<GeneralSettings>("general", settings);
  }

  /**
   * Update payment settings
   */
  async updatePayment(
    /** Settings */
    settings: Partial<PaymentSettings>,
  ): Promise<PaymentSettings> {
    return this.updateCategory<PaymentSettings>("payment", settings);
  }

  /**
   * Update shipping settings
   */
  async updateShipping(
    /** Settings */
    settings: Partial<ShippingSettings>,
  ): Promise<ShippingSettings> {
    return this.updateCategory<ShippingSettings>("shipping", settings);
  }

  /**
   * Update feature settings
   */
  async updateFeatures(
    /** Settings */
    settings: Partial<FeatureSettings>,
  ): Promise<FeatureSettings> {
    return this.updateCategory<FeatureSettings>("features", settings);
  }

  /**
   * Update a single setting by path
   */
  async updateSetting(path: string, value: unknown): Promise<void> {
    const response = await apiService.patch<{
      /** Success */
      success: boolean;
      /** Error */
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
    /** Enabled */
    enabled: boolean,
    /** Message */
    message?: string,
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
    /** Feature */
    feature: keyof FeatureSettings,
    /** Enabled */
    enabled: boolean,
  ): Promise<void> {
    await this.updateSetting(`features.${feature}`, enabled);
  }

  /**
   * Update social links
   */
  async updateSocialLinks(
    /** Links */
    links: Partial<GeneralSettings["socialLinks"]>,
  ): Promise<void> {
    const current = await this.getGeneral();
    await this.updateGeneral({
      /** Social Links */
      socialLinks: {
        ...current.socialLinks,
        ...links,
      },
    });
  }
}

export const settingsService = new SettingsService();
