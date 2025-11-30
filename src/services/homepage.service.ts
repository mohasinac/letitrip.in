import { apiService } from "./api.service";
import { HOMEPAGE_ROUTES } from "@/constants/api-routes";
import { logServiceError } from "@/lib/error-logger";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  enabled: boolean;
}

interface HeroSlidesResponse {
  slides: Array<Record<string, unknown>>;
}

/**
 * Transform API response to HeroSlide format
 * Handles both snake_case (admin) and camelCase (public) responses
 */
function transformSlide(data: Record<string, unknown>): HeroSlide {
  return {
    id: data.id as string,
    image: (data.image as string) || (data.image_url as string) || "",
    title: (data.title as string) || "",
    subtitle: (data.subtitle as string) || "",
    ctaText: (data.ctaText as string) || (data.cta_text as string) || "Shop Now",
    ctaLink: (data.ctaLink as string) || (data.link_url as string) || "/",
    order: (data.order as number) ?? (data.position as number) ?? 0,
    enabled: data.enabled !== undefined ? (data.enabled as boolean) : (data.is_active as boolean) ?? true,
  };
}

class HomepageService {
  /**
   * Get hero slides for homepage carousel
   */
  async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      const response = await apiService.get<HeroSlidesResponse>(
        HOMEPAGE_ROUTES.HERO_SLIDES,
      );
      return response.slides || [];
    } catch (error) {
      logServiceError("HomepageService", "getHeroSlides", error as Error);
      return [];
    }
  }

  /**
   * Get special banner for homepage
   */
  async getBanner(): Promise<any> {
    try {
      const response = await apiService.get(HOMEPAGE_ROUTES.BANNER);
      return response;
    } catch (error) {
      logServiceError("HomepageService", "getBanner", error as Error);
      return null;
    }
  }
}

export const homepageService = new HomepageService();
export type { HeroSlide, HeroSlidesResponse };
