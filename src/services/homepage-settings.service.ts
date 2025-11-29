import { apiService } from "./api.service";
import { HOMEPAGE_ROUTES } from "@/constants/api-routes";

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
    featuredCategories: {
      enabled: boolean;
      maxCategories: number;
      productsPerCategory: number;
    };
    featuredProducts: {
      enabled: boolean;
      maxProducts: number;
    };
    featuredAuctions: {
      enabled: boolean;
      maxAuctions: number;
    };
    featuredShops: {
      enabled: boolean;
      maxShops: number;
      productsPerShop: number;
    };
    featuredBlogs: {
      enabled: boolean;
      maxBlogs: number;
    };
    featuredReviews: {
      enabled: boolean;
      maxReviews: number;
    };
  };
  sectionOrder: string[];
  updatedAt: string;
  updatedBy?: string;
}

interface HomepageSettingsResponse {
  settings: HomepageSettings;
  isDefault: boolean;
}

class HomepageSettingsService {
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
    return response.data;
  }

  // Reset to default settings (admin only)
  async resetSettings(): Promise<HomepageSettings> {
    const response = await apiService.post<{ data: HomepageSettings }>(
      HOMEPAGE_ROUTES.SETTINGS,
      {},
    );
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
}

export const homepageSettingsService = new HomepageSettingsService();
export type { HomepageSettingsResponse };
