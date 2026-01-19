import {
  AUCTION_ROUTES,
  HOMEPAGE_ROUTES,
  PRODUCT_ROUTES,
} from "@/constants/api-routes";
import type { CategoryFE } from "@/types/frontend/category.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { ReviewFE } from "@/types/frontend/review.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import { logServiceError } from "@letitrip/react-library";
import { analyticsService } from "./analytics.service";
import { apiService } from "./api.service";

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

interface CategoryWithItems {
  category: CategoryFE;
  items: Array<ProductCardFE | AuctionItemFE>;
}

interface ShopWithItems {
  shop: ShopCardFE;
  items: Array<ProductCardFE | AuctionItemFE>;
}

interface AuctionItemFE {
  id: string;
  slug: string;
  name: string;
  description: string;
  startingBid: number;
  currentBid: number;
  bidCount: number;
  images: string[];
  status: "upcoming" | "live" | "ended";
  startTime: Date;
  endTime: Date;
  shopId: string;
  shopName: string;
  shopSlug: string;
}

interface BlogPostFE {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishedAt: Date;
  tags: string[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

interface HomepageData {
  heroSlides: HeroSlide[];
  banner: any;
  latestProducts: ProductCardFE[];
  hotAuctions: AuctionItemFE[];
  featuredCategories: CategoryWithItems[];
  featuredShops: ShopWithItems[];
  featuredProducts: ProductCardFE[];
  featuredAuctions: AuctionItemFE[];
  recentReviews: ReviewFE[];
  featuredBlogs: BlogPostFE[];
  faqs: FAQ[];
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
    ctaText:
      (data.ctaText as string) || (data.cta_text as string) || "Shop Now",
    ctaLink: (data.ctaLink as string) || (data.link_url as string) || "/",
    order: (data.order as number) ?? (data.position as number) ?? 0,
    enabled:
      data.enabled !== undefined
        ? (data.enabled as boolean)
        : (data.is_active as boolean) ?? true,
  };
}

class HomepageService {
  /**
   * Get comprehensive homepage data
   * Fetches all sections in one call for optimal performance
   */
  async getHomepageData(): Promise<Partial<HomepageData>> {
    try {
      const response = await apiService.get<HomepageData>("/homepage/data");
      return response;
    } catch (error) {
      logServiceError("HomepageService", "getHomepageData", error as Error);
      analyticsService.trackEvent("homepage_data_error", {
        error: (error as Error).message,
      });
      return {};
    }
  }

  /**
   * Get hero slides for homepage carousel
   */
  async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      const response = await apiService.get<HeroSlidesResponse>(
        HOMEPAGE_ROUTES.HERO_SLIDES,
      );
      const slides = (response.slides || []).map(transformSlide);

      if (slides.length === 0) {
        analyticsService.trackEvent("homepage_no_hero_slides");
      }

      return slides;
    } catch (error) {
      logServiceError("HomepageService", "getHeroSlides", error as Error);
      analyticsService.trackEvent("homepage_hero_slides_error", {
        error: (error as Error).message,
      });
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

  /**
   * Get latest products (published, in stock, sorted by latest)
   */
  async getLatestProducts(limit = 10): Promise<ProductCardFE[]> {
    try {
      const params = new URLSearchParams({
        status: "published",
        inStock: "true",
        sorts: "-created_at",
        pageSize: limit.toString(),
      });

      const response = await apiService.get<{ data: ProductCardFE[] }>(
        `${PRODUCT_ROUTES.LIST}?${params.toString()}`,
      );

      // Filter to only in-stock products client-side (safety check)
      const products = (response.data || []).filter(
        (p: any) =>
          (p.stock_count || p.stock_quantity || p.stockCount || 0) > 0,
      );

      if (products.length === 0) {
        analyticsService.trackEvent("homepage_no_latest_products");
      }

      return products;
    } catch (error) {
      logServiceError("HomepageService", "getLatestProducts", error as Error);
      analyticsService.trackEvent("homepage_latest_products_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get hot/recent auctions
   */
  async getHotAuctions(limit = 10): Promise<AuctionItemFE[]> {
    try {
      const params = new URLSearchParams({
        status: "active",
        sorts: "-bid_count,-created_at",
        pageSize: limit.toString(),
      });

      const response = await apiService.get<{ data: AuctionItemFE[] }>(
        `${AUCTION_ROUTES.LIST}?${params.toString()}`,
      );

      const auctions = response.data || [];

      if (auctions.length === 0) {
        analyticsService.trackEvent("homepage_no_hot_auctions");
      }

      return auctions;
    } catch (error) {
      logServiceError("HomepageService", "getHotAuctions", error as Error);
      analyticsService.trackEvent("homepage_hot_auctions_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get featured categories with items
   */
  async getFeaturedCategories(
    categoryLimit = 6,
    itemsPerCategory = 10,
  ): Promise<CategoryWithItems[]> {
    try {
      const params = new URLSearchParams({
        categoryLimit: categoryLimit.toString(),
        itemsPerCategory: itemsPerCategory.toString(),
      });

      const response = await apiService.get<{ data: CategoryWithItems[] }>(
        `/homepage/categories/featured?${params.toString()}`,
      );

      const categories = response.data || [];

      if (categories.length === 0) {
        analyticsService.trackEvent("homepage_no_featured_categories");
      }

      return categories;
    } catch (error) {
      logServiceError(
        "HomepageService",
        "getFeaturedCategories",
        error as Error,
      );
      analyticsService.trackEvent("homepage_featured_categories_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get featured shops with items
   */
  async getFeaturedShops(
    shopLimit = 4,
    itemsPerShop = 10,
  ): Promise<ShopWithItems[]> {
    try {
      const params = new URLSearchParams({
        shopLimit: shopLimit.toString(),
        itemsPerShop: itemsPerShop.toString(),
      });

      const response = await apiService.get<{ data: ShopWithItems[] }>(
        `/homepage/shops/featured?${params.toString()}`,
      );

      const shops = response.data || [];

      if (shops.length === 0) {
        analyticsService.trackEvent("homepage_no_featured_shops");
      }

      return shops;
    } catch (error) {
      logServiceError("HomepageService", "getFeaturedShops", error as Error);
      analyticsService.trackEvent("homepage_featured_shops_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get featured products (admin selected)
   */
  async getFeaturedProducts(limit = 10): Promise<ProductCardFE[]> {
    try {
      const params = new URLSearchParams({
        featured: "true",
        status: "published",
        inStock: "true",
        pageSize: limit.toString(),
      });

      const response = await apiService.get<{ data: ProductCardFE[] }>(
        `${PRODUCT_ROUTES.LIST}?${params.toString()}`,
      );

      // Filter to only in-stock products client-side (safety check)
      const products = (response.data || []).filter(
        (p: any) =>
          (p.stock_count || p.stock_quantity || p.stockCount || 0) > 0,
      );

      if (products.length === 0) {
        analyticsService.trackEvent("homepage_no_featured_products");
      }

      return products;
    } catch (error) {
      logServiceError("HomepageService", "getFeaturedProducts", error as Error);
      analyticsService.trackEvent("homepage_featured_products_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get featured auctions (admin selected)
   */
  async getFeaturedAuctions(limit = 10): Promise<AuctionItemFE[]> {
    try {
      const params = new URLSearchParams({
        featured: "true",
        status: "active",
        pageSize: limit.toString(),
      });

      const response = await apiService.get<{ data: AuctionItemFE[] }>(
        `${AUCTION_ROUTES.LIST}?${params.toString()}`,
      );

      const auctions = response.data || [];

      if (auctions.length === 0) {
        analyticsService.trackEvent("homepage_no_featured_auctions");
      }

      return auctions;
    } catch (error) {
      logServiceError("HomepageService", "getFeaturedAuctions", error as Error);
      analyticsService.trackEvent("homepage_featured_auctions_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get recent reviews (4+ stars)
   */
  async getRecentReviews(limit = 10): Promise<ReviewFE[]> {
    try {
      const params = new URLSearchParams({
        minRating: "4",
        limit: limit.toString(),
      });

      const response = await apiService.get<{ data: ReviewFE[] }>(
        `/homepage/reviews?${params.toString()}`,
      );

      const reviews = response.data || [];

      if (reviews.length === 0) {
        analyticsService.trackEvent("homepage_no_recent_reviews");
      }

      return reviews;
    } catch (error) {
      logServiceError("HomepageService", "getRecentReviews", error as Error);
      analyticsService.trackEvent("homepage_recent_reviews_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get featured blog posts (admin selected)
   */
  async getFeaturedBlogs(limit = 10): Promise<BlogPostFE[]> {
    try {
      const params = new URLSearchParams({
        featured: "true",
        status: "published",
        limit: limit.toString(),
      });

      const response = await apiService.get<{ data: BlogPostFE[] }>(
        `/blog?${params.toString()}`,
      );

      const blogs = response.data || [];

      if (blogs.length === 0) {
        analyticsService.trackEvent("homepage_no_featured_blogs");
      }

      return blogs;
    } catch (error) {
      logServiceError("HomepageService", "getFeaturedBlogs", error as Error);
      analyticsService.trackEvent("homepage_featured_blogs_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get all FAQs
   */
  async getFAQs(): Promise<FAQ[]> {
    try {
      const response = await apiService.get<{ data: FAQ[] }>("/homepage/faqs");

      const faqs = response.data || [];

      if (faqs.length === 0) {
        analyticsService.trackEvent("homepage_no_faqs");
      }

      return faqs;
    } catch (error) {
      logServiceError("HomepageService", "getFAQs", error as Error);
      analyticsService.trackEvent("homepage_faqs_error", {
        error: (error as Error).message,
      });
      return [];
    }
  }
}

export const homepageService = new HomepageService();
export type {
  AuctionItemFE,
  BlogPostFE,
  CategoryWithItems,
  FAQ,
  HeroSlide,
  HeroSlidesResponse,
  HomepageData,
  ShopWithItems,
};
