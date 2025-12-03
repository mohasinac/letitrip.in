import { apiService } from "./api.service";
import { HOMEPAGE_ROUTES } from "@/constants/api-routes";

export interface FeaturedItem {
  id: string;
  type: "product" | "auction" | "shop" | "category";
  itemId: string;
  name: string;
  image?: string;
  position: number;
  section: string;
  active: boolean;
  createdAt: string;
}

export interface HomepageSettings {
  specialEventBanner: {
    enabled: boolean;
    title: string;
    content: string; // Rich text HTML
    link?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  heroCarousel: {
    enabled: boolean;
    autoPlayInterval: number;
  };
  sections: {
    valueProposition: {
      enabled: boolean;
    };
    latestProducts: {
      enabled: boolean;
      maxProducts: number;
    };
    hotAuctions: {
      enabled: boolean;
      maxAuctions: number;
    };
    featuredCategories: {
      enabled: boolean;
      maxCategories: number;
      productsPerCategory: number;
    };
    featuredShops: {
      enabled: boolean;
      maxShops: number;
      productsPerShop: number;
    };
    featuredProducts: {
      enabled: boolean;
      maxProducts: number;
    };
    featuredAuctions: {
      enabled: boolean;
      maxAuctions: number;
    };
    recentReviews: {
      enabled: boolean;
      maxReviews: number;
    };
    featuredBlogs: {
      enabled: boolean;
      maxBlogs: number;
    };
  };
  sectionOrder: string[];
  featuredItems?: Record<string, FeaturedItem[]>;
  updatedAt: string;
  updatedBy?: string;
}

interface HomepageSettingsResponse {
  settings: HomepageSettings;
  isDefault: boolean;
}

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
      data: HomepageSettings;
      isDefault: boolean;
    }>(HOMEPAGE_ROUTES.SETTINGS);
    return {
      settings: response.data,
      isDefault: response.isDefault,
    };
  }

  // Update homepage settings (admin only)
  async updateSettings(
    settings: Partial<HomepageSettings>,
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
    sectionKey: string,
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
    section: string,
    limits: {
      maxCategories?: number;
      productsPerCategory?: number;
      maxProducts?: number;
      maxAuctions?: number;
      maxShops?: number;
      productsPerShop?: number;
      maxBlogs?: number;
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
    featuredItems: Record<string, FeaturedItem[]>,
  ): Promise<HomepageSettings> {
    return this.updateSettings({ featuredItems });
  }
}

export const homepageSettingsService = new HomepageSettingsService();
export type { HomepageSettingsResponse };
