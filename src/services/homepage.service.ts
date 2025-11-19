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
  slides: HeroSlide[];
}

class HomepageService {
  /**
   * Get hero slides for homepage carousel
   */
  async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      const response = await apiService.get<HeroSlidesResponse>(
        HOMEPAGE_ROUTES.HERO_SLIDES
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
