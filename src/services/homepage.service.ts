import { apiService } from "./api.service";
import { HOMEPAGE_ROUTES } from "@/constants/api-routes";

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
      console.error("Error fetching hero slides:", error);
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
      console.error("Error fetching banner:", error);
      return null;
    }
  }
}

export const homepageService = new HomepageService();
export type { HeroSlide, HeroSlidesResponse };
