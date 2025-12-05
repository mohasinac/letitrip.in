/**
 * @fileoverview Service Module
 * @module src/services/homepage.service
 * @description This file contains service functions for homepage operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { apiService } from "./api.service";
import {
  HOMEPAGE_ROUTES,
  PRODUCT_ROUTES,
  AUCTION_ROUTES,
} from "@/constants/api-routes";
import { logServiceError } from "@/lib/error-logger";
import { analyticsService } from "./analytics.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import type { CategoryFE } from "@/types/frontend/category.types";
import type { ReviewFE } from "@/types/frontend/review.types";

/**
 * HeroSlide interface
 * 
 * @interface
 * @description Defines the structure and contract for HeroSlide
 */
interface HeroSlide {
  /** Id */
  id: string;
  /** Image */
  image: string;
  /** Title */
  title: string;
  /** Subtitle */
  subtitle: string;
  /** Cta Text */
  ctaText: string;
  /** Cta Link */
  ctaLink: string;
  /** Order */
  order: number;
  /** Enabled */
  enabled: boolean;
}

/**
 * HeroSlidesResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for HeroSlidesResponse
 */
interface HeroSlidesResponse {
  /** Slides */
  slides: Array<Record<string, unknown>>;
}

/**
 * CategoryWithItems interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryWithItems
 */
interface CategoryWithItems {
  /** Category */
  category: CategoryFE;
  /** Items */
  items: Array<ProductCardFE | AuctionItemFE>;
}

/**
 * ShopWithItems interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopWithItems
 */
interface ShopWithItems {
  /** Shop */
  shop: ShopCardFE;
  /** Items */
  items: Array<ProductCardFE | AuctionItemFE>;
}

/**
 * AuctionItemFE interface
 * 
 * @interface
 * @description Defines the structure and contract for AuctionItemFE
 */
interface AuctionItemFE {
  /** Id */
  id: string;
  /** Slug */
  slug: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Starting Bid */
  startingBid: number;
  /** Current Bid */
  currentBid: number;
  /** Bid Count */
  bidCount: number;
  /** Images */
  images: string[];
  /** Status */
  status: "upcoming" | "live" | "ended";
  /** Start Time */
  startTime: Date;
  /** End Time */
  endTime: Date;
  /** Shop Id */
  shopId: string;
  /** Shop Name */
  shopName: string;
  /** Shop Slug */
  shopSlug: string;
}

/**
 * BlogPostFE interface
 * 
 * @interface
 * @description Defines the structure and contract for BlogPostFE
 */
interface BlogPostFE {
  /** Id */
  id: string;
  /** Slug */
  slug: string;
  /** Title */
  title: string;
  /** Excerpt */
  excerpt: string;
  /** Content */
  content: string;
  /** Image */
  image: string;
  /** Author */
  author: string;
  /** Published At */
  publishedAt: Date;
  /** Tags */
  tags: string[];
}

/**
 * FAQ interface
 * 
 * @interface
 * @description Defines the structure and contract for FAQ
 */
interface FAQ {
  /** Id */
  id: string;
  /** Question */
  question: string;
  /** Answer */
  answer: string;
  /** Category */
  category?: string;
  /** Order */
  order: number;
}

/**
 * HomepageData interface
 * 
 * @interface
 * @description Defines the structure and contract for HomepageData
 */
interface HomepageData {
  /** Hero Slides */
  heroSlides: HeroSlide[];
  /** Banner */
  banner: any;
  /** Latest Products */
  latestProducts: ProductCardFE[];
  /** Hot Auctions */
  hotAuctions: AuctionItemFE[];
  /** Featured Categories */
  featuredCategories: CategoryWithItems[];
  /** Featured Shops */
  featuredShops: ShopWithItems[];
  /** Featured Products */
  featuredProducts: ProductCardFE[];
  /** Featured Auctions */
  featuredAuctions: AuctionItemFE[];
  /** Recent Reviews */
  recentReviews: ReviewFE[];
  /** Featured Blogs */
  featuredBlogs: BlogPostFE[];
  /** Faqs */
  faqs: FAQ[];
}

/**
 * Transform API response to HeroSlide format
 * Handles both snake_case (admin) and camelCase (public) responses
 */
/**
 * Transforms slide
 *
 * @param {Record<string, unknown>} data - Data object containing information
 *
 * @returns {any} The transformslide result
 */

/**
 * Transforms slide
 *
 * @param {Record<string, unknown>} data - Data object containing information
 *
 * @returns {any} The transformslide result
 */

function transformSlide(data: Record<string, unknown>): HeroSlide {
  return {
    /** Id */
    id: data.id as string,
    /** Image */
    image: (data.image as string) || (data.image_url as string) || "",
    /** Title */
    title: (data.title as string) || "",
    /** Subtitle */
    subtitle: (data.subtitle as string) || "",
    /** Cta Text */
    ctaText:
      (data.ctaText as string) || (data.cta_text as string) || "Shop Now",
    /** Cta Link */
    ctaLink: (data.ctaLink as string) || (data.link_url as string) || "/",
    /** Order */
    order: (data.order as number) ?? (data.position as number) ?? 0,
    /** Enabled */
    enabled:
      data.enabled !== undefined
        ? (data.enabled as boolean)
        : ((data.is_active as boolean) ?? true),
  };
}

/**
 * HomepageService class
 * 
 * @class
 * @description Description of HomepageService class functionality
 */
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
        /** Error */
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
      /**
       * Performs slides operation
       *
       * @param {any} [response.slides || []).map(transformSlide);

      if (slides.length] - The response.slides || []).map(transform slide);

      if (slides.length
       *
       * @returns {any} The slides result
       */

      /**
       * Performs slides operation
       *
       * @param {any} [response.slides || []).map(transformSlide);

      if (slides.length] - The response.slides || []).map(transform slide);

      if (slides.length
       *
       * @returns {any} The slides result
       */

      const slides = (response.slides || []).map(transformSlide);

      if (slides.length === 0) {
        analyticsService.trackEvent("homepage_no_hero_slides");
      }

      return slides;
    } catch (error) {
      logServiceError("HomepageService", "getHeroSlides", error as Error);
      analyticsService.trackEvent("homepage_hero_slides_error", {
        /** Error */
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
        /** Status */
        status: "published",
        /** In Stock */
        inStock: "true",
        /** Sorts */
        sorts: "-created_at",
        /** Page Size */
        pageSize: limit.toString(),
      });

      const response = await apiService.get<{ data: ProductCardFE[] }>(
        `${PRODUCT_ROUTES.LIST}?${params.toString()}`,
      );

      // Filter to only in-stock products client-side (safety check)
      /**
       * Performs products operation
       *
       * @param {any} response.data || []).filter(
        (p - The response.data || []).filter(
        (p
       *
       * @returns {any} The products result
       */

      /**
       * Performs products operation
       *
       * @param {any} response.data || []).filter(
        (p - The response.data || []).filter(
        (p
       *
       * @returns {any} The products result
       */

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
        /** Error */
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
        /** Status */
        status: "active",
        /** Sorts */
        sorts: "-bid_count,-created_at",
        /** Page Size */
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
        /** Error */
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
        /** Category Limit */
        categoryLimit: categoryLimit.toString(),
        /** Items Per Category */
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
        /** Error */
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
        /** Shop Limit */
        shopLimit: shopLimit.toString(),
        /** Items Per Shop */
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
        /** Error */
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
        /** Featured */
        featured: "true",
        /** Status */
        status: "published",
        /** In Stock */
        inStock: "true",
        /** Page Size */
        pageSize: limit.toString(),
      });

      const response = await apiService.get<{ data: ProductCardFE[] }>(
        `${PRODUCT_ROUTES.LIST}?${params.toString()}`,
      );

      // Filter to only in-stock products client-side (safety check)
      /**
       * Performs products operation
       *
       * @param {any} response.data || []).filter(
        (p - The response.data || []).filter(
        (p
       *
       * @returns {any} The products result
       */

      /**
       * Performs products operation
       *
       * @param {any} response.data || []).filter(
        (p - The response.data || []).filter(
        (p
       *
       * @returns {any} The products result
       */

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
        /** Error */
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
        /** Featured */
        featured: "true",
        /** Status */
        status: "active",
        /** Page Size */
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
        /** Error */
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
        /** Min Rating */
        minRating: "4",
        /** Limit */
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
        /** Error */
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
        /** Featured */
        featured: "true",
        /** Status */
        status: "published",
        /** Limit */
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
        /** Error */
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
        /** Error */
        error: (error as Error).message,
      });
      return [];
    }
  }
}

export const homepageService = new HomepageService();
export type {
  HeroSlide,
  HeroSlidesResponse,
  HomepageData,
  CategoryWithItems,
  ShopWithItems,
  AuctionItemFE,
  BlogPostFE,
  FAQ,
};
