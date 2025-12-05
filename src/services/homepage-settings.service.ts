/**
 * @fileoverview Service Module
 * @module src/services/homepage-settings.service
 * @description This file contains service functions for homepage-settings operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { apiService } from "./api.service";
import { HOMEPAGE_ROUTES } from "@/constants/api-routes";

/**
 * FeaturedItem interface
 * 
 * @interface
 * @description Defines the structure and contract for FeaturedItem
 */
export interface FeaturedItem {
  /** Id */
  id: string;
  /** Type */
  type: "product" | "auction" | "shop" | "category";
  /** Item Id */
  itemId: string;
  /** Name */
  name: string;
  /** Image */
  image?: string;
  /** Position */
  position: number;
  /** Section */
  section: string;
  /** Active */
  active: boolean;
  /** Created At */
  createdAt: string;
}

/**
 * HomepageSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for HomepageSettings
 */
export interface HomepageSettings {
  /** Special Event Banner */
  specialEventBanner: {
    /** Enabled */
    enabled: boolean;
    /** Title */
    title: string;
    content: string; // Rich text HTML
    /** Link */
    link?: string;
    /** Background Color */
    backgroundColor?: string;
    /** Text Color */
    textColor?: string;
  };
  /** Hero Carousel */
  heroCarousel: {
    /** Enabled */
    enabled: boolean;
    /** Auto Play Interval */
    autoPlayInterval: number;
  };
  /** Sections */
  sections: {
    /** Value Proposition */
    valueProposition: {
      /** Enabled */
      enabled: boolean;
    };
    /** Latest Products */
    latestProducts: {
      /** Enabled */
      enabled: boolean;
      /** Max Products */
      maxProducts: number;
    };
    /** Hot Auctions */
    hotAuctions: {
      /** Enabled */
      enabled: boolean;
      /** Max Auctions */
      maxAuctions: number;
    };
    /** Featured Categories */
    featuredCategories: {
      /** Enabled */
      enabled: boolean;
      /** Max Categories */
      maxCategories: number;
      /** Products Per Category */
      productsPerCategory: number;
    };
    /** Featured Shops */
    featuredShops: {
      /** Enabled */
      enabled: boolean;
      /** Max Shops */
      maxShops: number;
      /** Products Per Shop */
      productsPerShop: number;
    };
    /** Featured Products */
    featuredProducts: {
      /** Enabled */
      enabled: boolean;
      /** Max Products */
      maxProducts: number;
    };
    /** Featured Auctions */
    featuredAuctions: {
      /** Enabled */
      enabled: boolean;
      /** Max Auctions */
      maxAuctions: number;
    };
    /** Recent Reviews */
    recentReviews: {
      /** Enabled */
      enabled: boolean;
      /** Max Reviews */
      maxReviews: number;
    };
    /** Featured Blogs */
    featuredBlogs: {
      /** Enabled */
      enabled: boolean;
      /** Max Blogs */
      maxBlogs: number;
    };
  };
  /** Section Order */
  sectionOrder: string[];
  /** Featured Items */
  featuredItems?: Record<string, FeaturedItem[]>;
  /** Updated At */
  updatedAt: string;
  /** Updated By */
  updatedBy?: string;
}

/**
 * HomepageSettingsResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for HomepageSettingsResponse
 */
interface HomepageSettingsResponse {
  /** Settings */
  settings: HomepageSettings;
  /** Is Default */
  isDefault: boolean;
}

/**
 * HomepageSettingsService class
 * 
 * @class
 * @description Description of HomepageSettingsService class functionality
 */
class HomepageSettingsService {
  /**
   * Invalidate cache for homepage settings
   * Called after any mutation to ensure fresh data
   */
  private invalidateCache(): void {
    apiService.invalidateCache("/homepage");
  }

  // Get current homepage settings
  async getSettings(): Promise<HomepageSettingsResponse> {
    const response = await apiService.get<{
      /** Data */
      data: HomepageSettings;
      /** Is Default */
      isDefault: boolean;
    }>(HOMEPAGE_ROUTES.SETTINGS);
    return {
      /** Settings */
      settings: response.data,
      /** Is Default */
      isDefault: response.isDefault,
    };
  }

  // Update homepage settings (admin only)
  async updateSettings(
    /** Settings */
    settings: Partial<HomepageSettings>,
    /** User Id */
    userId?: string,
  ): Promise<HomepageSettings> {
    const response = await apiService.patch<{ data: HomepageSettings }>(
      HOMEPAGE_ROUTES.SETTINGS,
      { settings, userId },
    );
    this.invalidateCache();
    return response.data;
  }

  // Reset to default settings (admin only)
  async resetSettings(): Promise<HomepageSettings> {
    const response = await apiService.post<{ data: HomepageSettings }>(
      HOMEPAGE_ROUTES.SETTINGS,
      {},
    );
    this.invalidateCache();
    return response.data;
  }

  // Toggle a section on/off (admin only)
  async toggleSection(
    /** Section Key */
    sectionKey: string,
    /** Enabled */
    enabled: boolean,
  ): Promise<HomepageSettings> {
    const current = await this.getSettings();
    const sections = { ...current.settings.sections };

    if (sections[sectionKey as keyof typeof sections]) {
      (sections[sectionKey as keyof typeof sections] as any).enabled = enabled;
      return this.updateSettings({ sections });
    }

    throw new Error(`Section ${sectionKey} not found`);
  }

  // Update section order (admin only)
  async updateSectionOrder(sectionOrder: string[]): Promise<HomepageSettings> {
    return this.updateSettings({ sectionOrder });
  }

  // Update section limits (admin only)
  async updateSectionLimits(
    /** Section */
    section: string,
    /** Limits */
    limits: {
      /** Max Categories */
      maxCategories?: number;
      /** Products Per Category */
      productsPerCategory?: number;
      /** Max Products */
      maxProducts?: number;
      /** Max Auctions */
      maxAuctions?: number;
      /** Max Shops */
      maxShops?: number;
      /** Products Per Shop */
      productsPerShop?: number;
      /** Max Blogs */
      maxBlogs?: number;
      /** Max Reviews */
      maxReviews?: number;
    },
  ): Promise<HomepageSettings> {
    const current = await this.getSettings();
    const sections = { ...current.settings.sections };

    if (sections[section as keyof typeof sections]) {
      sections[section as keyof typeof sections] = {
        ...sections[section as keyof typeof sections],
        ...limits,
      } as any;

      return this.updateSettings({ sections });
    }

    throw new Error(`Section ${section} not found`);
  }

  // Get featured items (admin only)
  async getFeaturedItems(): Promise<Record<string, FeaturedItem[]>> {
    const response = await this.getSettings();
    return response.settings.featuredItems || {};
  }

  // Update featured items (admin only)
  async updateFeaturedItems(
    /** Featured Items */
    featuredItems: Record<string, FeaturedItem[]>,
  ): Promise<HomepageSettings> {
    return this.updateSettings({ featuredItems });
  }
}

export const homepageSettingsService = new HomepageSettingsService();
export type { HomepageSettingsResponse };
