import { apiService } from "./api.service";
import { HERO_SLIDE_ROUTES } from "@/constants/api-routes";

/**
 * Hero Slide interface
 */
export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  ctaText: string;
  ctaLink: string;
  ctaTarget?: "_blank" | "_self";
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlideFilters {
  isActive?: boolean;
  search?: string;
}

export interface HeroSlideFormData {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  ctaText: string;
  ctaLink: string;
  ctaTarget?: "_blank" | "_self";
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Hero Slides Service
 * Manages homepage hero slides/carousel with RBAC
 */
class HeroSlidesService {
  private readonly BASE_PATH = "/api/hero-slides";

  /**
   * Get all hero slides with optional filters
   * Public: Returns only active slides
   * Admin: Returns all slides with full data
   */
  async getHeroSlides(filters?: HeroSlideFilters): Promise<HeroSlide[]> {
    const params = new URLSearchParams();

    if (filters?.isActive !== undefined) {
      params.set("isActive", String(filters.isActive));
    }
    if (filters?.search) {
      params.set("search", filters.search);
    }

    const url = params.toString()
      ? `${HERO_SLIDE_ROUTES.LIST}?${params}`
      : HERO_SLIDE_ROUTES.LIST;

    const response = await apiService.get<{ slides: HeroSlide[] }>(url);
    return response.slides || [];
  }

  /**
   * Get a single hero slide by ID
   * Public: Returns only if active
   * Admin: Returns full slide data
   */
  async getHeroSlideById(id: string): Promise<HeroSlide> {
    const response = await apiService.get<{ slide: HeroSlide }>(
      HERO_SLIDE_ROUTES.BY_ID(id)
    );
    return response.slide;
  }

  /**
   * Create a new hero slide (Admin only)
   */
  async createHeroSlide(data: HeroSlideFormData): Promise<HeroSlide> {
    const response = await apiService.post<{ slide: HeroSlide }>(
      HERO_SLIDE_ROUTES.LIST,
      data
    );
    return response.slide;
  }

  /**
   * Update an existing hero slide (Admin only)
   */
  async updateHeroSlide(
    id: string,
    data: Partial<HeroSlideFormData>
  ): Promise<HeroSlide> {
    const response = await apiService.patch<{ slide: HeroSlide }>(
      HERO_SLIDE_ROUTES.BY_ID(id),
      data
    );
    return response.slide;
  }

  /**
   * Delete a hero slide (Admin only)
   */
  async deleteHeroSlide(id: string): Promise<void> {
    await apiService.delete(HERO_SLIDE_ROUTES.BY_ID(id));
  }

  /**
   * Bulk delete hero slides (Admin only)
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.post(HERO_SLIDE_ROUTES.BULK, {
      action: "delete",
      ids,
    });
  }

  /**
   * Bulk update hero slides (Admin only)
   */
  async bulkUpdate(
    ids: string[],
    updates: Partial<HeroSlideFormData>
  ): Promise<void> {
    await apiService.post(HERO_SLIDE_ROUTES.BULK, {
      action: "update",
      ids,
      updates,
    });
  }

  /**
   * Reorder hero slides (Admin only)
   */
  async reorderSlides(
    slideOrders: { id: string; order: number }[]
  ): Promise<void> {
    await apiService.post(HERO_SLIDE_ROUTES.BULK, {
      action: "reorder",
      slides: slideOrders,
    });
  }
}

export const heroSlidesService = new HeroSlidesService();
