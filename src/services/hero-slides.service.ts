import { apiService } from "./api.service";

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
 * Manages homepage hero slides/carousel (Admin CRUD operations)
 */
class HeroSlidesService {
  private readonly BASE_PATH = "/admin/hero-slides";

  /**
   * Get all hero slides with optional filters
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
      ? `${this.BASE_PATH}?${params}`
      : this.BASE_PATH;

    const response = await apiService.get<{ slides: HeroSlide[] }>(url);
    return response.slides || [];
  }

  /**
   * Get a single hero slide by ID
   */
  async getHeroSlideById(id: string): Promise<HeroSlide> {
    const response = await apiService.get<{ slide: HeroSlide }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.slide;
  }

  /**
   * Create a new hero slide
   */
  async createHeroSlide(data: HeroSlideFormData): Promise<HeroSlide> {
    const response = await apiService.post<{ slide: HeroSlide }>(
      this.BASE_PATH,
      data
    );
    return response.slide;
  }

  /**
   * Update an existing hero slide
   */
  async updateHeroSlide(
    id: string,
    data: Partial<HeroSlideFormData>
  ): Promise<HeroSlide> {
    const response = await apiService.patch<{ slide: HeroSlide }>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.slide;
  }

  /**
   * Delete a hero slide
   */
  async deleteHeroSlide(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Bulk delete hero slides
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/bulk`, {
      action: "delete",
      ids,
    });
  }

  /**
   * Bulk update hero slides (activate/deactivate)
   */
  async bulkUpdate(
    ids: string[],
    updates: Partial<HeroSlideFormData>
  ): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/bulk`, {
      action: "update",
      ids,
      updates,
    });
  }

  /**
   * Reorder hero slides
   */
  async reorderSlides(
    slideOrders: { id: string; order: number }[]
  ): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/reorder`, {
      slides: slideOrders,
    });
  }
}

export const heroSlidesService = new HeroSlidesService();
