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
 * Transform camelCase form data to snake_case for API
 */
function toApiFormat(
  data: Partial<HeroSlideFormData>,
): Record<string, unknown> {
  const apiData: Record<string, unknown> = {};

  if (data.title !== undefined) apiData.title = data.title;
  if (data.subtitle !== undefined) apiData.subtitle = data.subtitle;
  if (data.description !== undefined) apiData.description = data.description;
  if (data.image !== undefined) apiData.image_url = data.image;
  if (data.mobileImage !== undefined)
    apiData.mobile_image_url = data.mobileImage;
  if (data.ctaText !== undefined) apiData.cta_text = data.ctaText;
  if (data.ctaLink !== undefined) apiData.link_url = data.ctaLink;
  if (data.ctaTarget !== undefined) apiData.cta_target = data.ctaTarget;
  if (data.order !== undefined) apiData.position = data.order;
  if (data.isActive !== undefined) apiData.is_active = data.isActive;
  if (data.startDate !== undefined) apiData.start_date = data.startDate;
  if (data.endDate !== undefined) apiData.end_date = data.endDate;
  if (data.backgroundColor !== undefined)
    apiData.background_color = data.backgroundColor;
  if (data.textColor !== undefined) apiData.text_color = data.textColor;

  return apiData;
}

/**
 * Transform snake_case API response to camelCase
 */
function fromApiFormat(data: Record<string, unknown>): HeroSlide {
  return {
    id: data.id as string,
    title: data.title as string,
    subtitle: (data.subtitle as string) || undefined,
    description: (data.description as string) || undefined,
    image: (data.image_url as string) || (data.image as string) || "",
    mobileImage: (data.mobile_image_url as string) || undefined,
    ctaText:
      (data.cta_text as string) || (data.ctaText as string) || "Shop Now",
    ctaLink: (data.link_url as string) || (data.ctaLink as string) || "/",
    ctaTarget: (data.cta_target as "_blank" | "_self") || undefined,
    order: (data.position as number) ?? (data.order as number) ?? 0,
    isActive:
      data.is_active !== undefined
        ? (data.is_active as boolean)
        : ((data.enabled as boolean) ?? true),
    startDate: (data.start_date as string) || undefined,
    endDate: (data.end_date as string) || undefined,
    backgroundColor: (data.background_color as string) || undefined,
    textColor: (data.text_color as string) || undefined,
    createdAt: (data.created_at as string) || (data.createdAt as string) || "",
    updatedAt: (data.updated_at as string) || (data.updatedAt as string) || "",
  };
}

/**
 * Hero Slides Service
 * Manages homepage hero slides/carousel with RBAC
 */
class HeroSlidesService {
  private readonly BASE_PATH = "/api/hero-slides";

  /**
   * Invalidate cache for hero slides and homepage
   * Called after any mutation to ensure fresh data
   */
  private invalidateCache(): void {
    apiService.invalidateCache("/hero-slides");
    apiService.invalidateCache("/homepage");
  }

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

    const response = await apiService.get<{
      slides: Record<string, unknown>[];
    }>(url);
    return (response.slides || []).map(fromApiFormat);
  }

  /**
   * Get a single hero slide by ID
   * Public: Returns only if active
   * Admin: Returns full slide data
   */
  async getHeroSlideById(id: string): Promise<HeroSlide> {
    const response = await apiService.get<{ slide: Record<string, unknown> }>(
      HERO_SLIDE_ROUTES.BY_ID(id),
    );
    return fromApiFormat(response.slide);
  }

  /**
   * Create a new hero slide (Admin only)
   */
  async createHeroSlide(data: HeroSlideFormData): Promise<HeroSlide> {
    const response = await apiService.post<{ slide: Record<string, unknown> }>(
      HERO_SLIDE_ROUTES.LIST,
      toApiFormat(data),
    );
    this.invalidateCache();
    return fromApiFormat(response.slide);
  }

  /**
   * Update an existing hero slide (Admin only)
   */
  async updateHeroSlide(
    id: string,
    data: Partial<HeroSlideFormData>,
  ): Promise<HeroSlide> {
    const response = await apiService.patch<{ slide: Record<string, unknown> }>(
      HERO_SLIDE_ROUTES.BY_ID(id),
      toApiFormat(data),
    );
    this.invalidateCache();
    return fromApiFormat(response.slide);
  }

  /**
   * Delete a hero slide (Admin only)
   */
  async deleteHeroSlide(id: string): Promise<void> {
    await apiService.delete(HERO_SLIDE_ROUTES.BY_ID(id));
    this.invalidateCache();
  }

  /**
   * Bulk delete hero slides (Admin only)
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.post(HERO_SLIDE_ROUTES.BULK, {
      action: "delete",
      ids,
    });
    this.invalidateCache();
  }

  /**
   * Bulk update hero slides (Admin only)
   */
  async bulkUpdate(
    ids: string[],
    updates: Partial<HeroSlideFormData>,
  ): Promise<void> {
    await apiService.post(HERO_SLIDE_ROUTES.BULK, {
      action: "update",
      ids,
      updates: toApiFormat(updates),
    });
    this.invalidateCache();
  }

  /**
   * Reorder hero slides (Admin only)
   */
  async reorderSlides(
    slideOrders: { id: string; order: number }[],
  ): Promise<void> {
    await apiService.post(HERO_SLIDE_ROUTES.BULK, {
      action: "reorder",
      slides: slideOrders.map((s) => ({ id: s.id, position: s.order })),
    });
    this.invalidateCache();
  }
}

export const heroSlidesService = new HeroSlidesService();
