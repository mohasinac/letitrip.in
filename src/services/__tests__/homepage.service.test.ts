import type { ProductCardFE } from "@/types/frontend/product.types";
import type { ReviewFE } from "@/types/frontend/review.types";
import { analyticsService } from "../analytics.service";
import { apiService } from "../api.service";
import type { HomepageData } from "../homepage.service";
import { homepageService } from "../homepage.service";

// Mock dependencies
jest.mock("../api.service");
jest.mock("../analytics.service");
jest.mock("@/lib/error-logger");

describe("HomepageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getHomepageData", () => {
    it("should fetch comprehensive homepage data successfully", async () => {
      const mockData: Partial<HomepageData> = {
        heroSlides: [
          {
            id: "slide1",
            image: "hero1.jpg",
            title: "Welcome",
            subtitle: "Shop Now",
            ctaText: "Browse",
            ctaLink: "/products",
            order: 1,
            enabled: true,
          },
        ],
        latestProducts: [],
        hotAuctions: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockData);

      const result = await homepageService.getHomepageData();

      expect(apiService.get).toHaveBeenCalledWith("/homepage/data");
      expect(result).toEqual(mockData);
    });

    it("should return empty object on error", async () => {
      const error = new Error("API Error");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await homepageService.getHomepageData();

      expect(result).toEqual({});
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_data_error",
        { error: "API Error" }
      );
    });

    it("should handle network errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await homepageService.getHomepageData();

      expect(result).toEqual({});
    });
  });

  describe("getHeroSlides", () => {
    it("should fetch and transform hero slides successfully", async () => {
      const mockResponse = {
        slides: [
          {
            id: "slide1",
            image: "hero1.jpg",
            title: "Welcome",
            subtitle: "Shop Now",
            ctaText: "Browse",
            link_url: "/products",
            position: 1,
            is_active: true,
          },
          {
            id: "slide2",
            image_url: "hero2.jpg",
            title: "Sale",
            subtitle: "50% Off",
            cta_text: "Shop",
            ctaLink: "/sale",
            order: 2,
            enabled: true,
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageService.getHeroSlides();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "slide1",
        image: "hero1.jpg",
        title: "Welcome",
        subtitle: "Shop Now",
        ctaText: "Browse",
        ctaLink: "/products",
        order: 1,
        enabled: true,
      });
      expect(result[1]).toEqual({
        id: "slide2",
        image: "hero2.jpg",
        title: "Sale",
        subtitle: "50% Off",
        ctaText: "Shop",
        ctaLink: "/sale",
        order: 2,
        enabled: true,
      });
    });

    it("should handle empty slides array", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ slides: [] });

      const result = await homepageService.getHeroSlides();

      expect(result).toEqual([]);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_hero_slides"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getHeroSlides();

      expect(result).toEqual([]);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_hero_slides_error",
        { error: "API Error" }
      );
    });

    it("should transform snake_case to camelCase fields", async () => {
      const mockResponse = {
        slides: [
          {
            id: "slide1",
            image_url: "test.jpg",
            title: "Test",
            subtitle: "Sub",
            cta_text: "Click",
            link_url: "/link",
            position: 0,
            is_active: false,
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageService.getHeroSlides();

      expect(result[0].image).toBe("test.jpg");
      expect(result[0].ctaText).toBe("Click");
      expect(result[0].ctaLink).toBe("/link");
      expect(result[0].order).toBe(0);
      expect(result[0].enabled).toBe(false);
    });
  });

  describe("getBanner", () => {
    it("should fetch banner successfully", async () => {
      const mockBanner = { id: "banner1", image: "banner.jpg" };
      (apiService.get as jest.Mock).mockResolvedValue(mockBanner);

      const result = await homepageService.getBanner();

      expect(apiService.get).toHaveBeenCalledWith("/homepage/banner");
      expect(result).toEqual(mockBanner);
    });

    it("should return null on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getBanner();

      expect(result).toBeNull();
    });
  });

  describe("getLatestProducts", () => {
    it("should fetch latest in-stock products", async () => {
      const mockProducts: ProductCardFE[] = [
        {
          id: "prod1",
          name: "Product 1",
          slug: "product-1",
          price: 100,
          stockCount: 5,
          status: "published",
        } as ProductCardFE,
        {
          id: "prod2",
          name: "Product 2",
          slug: "product-2",
          price: 200,
          stock_quantity: 10,
          status: "published",
        } as any,
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockProducts });

      const result = await homepageService.getLatestProducts(10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/products")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=published")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("inStock=true")
      );
      expect(result).toEqual(mockProducts);
    });

    it("should filter out products with no stock", async () => {
      const mockProducts = [
        { id: "prod1", stockCount: 5 },
        { id: "prod2", stock_quantity: 0 },
        { id: "prod3", stock_count: 0 },
        { id: "prod4" }, // No stock field
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockProducts });

      const result = await homepageService.getLatestProducts();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("prod1");
    });

    it("should track event when no products found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getLatestProducts();

      expect(result).toEqual([]);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_latest_products"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getLatestProducts();

      expect(result).toEqual([]);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_latest_products_error",
        { error: "API Error" }
      );
    });

    it("should use default limit of 10", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      await homepageService.getLatestProducts();

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("pageSize=10")
      );
    });

    it("should use custom limit", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      await homepageService.getLatestProducts(20);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("pageSize=20")
      );
    });
  });

  describe("getHotAuctions", () => {
    it("should fetch hot auctions sorted by bid count", async () => {
      const mockAuctions = [
        { id: "auc1", status: "active", bidCount: 50 },
        { id: "auc2", status: "active", bidCount: 30 },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockAuctions });

      const result = await homepageService.getHotAuctions(10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/auctions")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=active")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("sorts=-bid_count")
      );
      expect(result).toEqual(mockAuctions);
    });

    it("should track event when no auctions found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getHotAuctions();

      expect(result).toEqual([]);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_hot_auctions"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getHotAuctions();

      expect(result).toEqual([]);
    });
  });

  describe("getFeaturedCategories", () => {
    it("should fetch featured categories with items", async () => {
      const mockCategories = [
        { category: { id: "cat1", name: "Electronics" }, items: [] },
        { category: { id: "cat2", name: "Fashion" }, items: [] },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockCategories });

      const result = await homepageService.getFeaturedCategories(6, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/homepage/categories/featured")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("categoryLimit=6")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("itemsPerCategory=10")
      );
      expect(result).toEqual(mockCategories);
    });

    it("should track event when no categories found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getFeaturedCategories();

      expect(result).toEqual([]);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_featured_categories"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getFeaturedCategories();

      expect(result).toEqual([]);
    });
  });

  describe("getFeaturedShops", () => {
    it("should fetch featured shops with items", async () => {
      const mockShops = [
        { shop: { id: "shop1", name: "Shop 1" }, items: [] },
        { shop: { id: "shop2", name: "Shop 2" }, items: [] },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockShops });

      const result = await homepageService.getFeaturedShops(4, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/homepage/shops/featured")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shopLimit=4")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("itemsPerShop=10")
      );
      expect(result).toEqual(mockShops);
    });

    it("should track event when no shops found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getFeaturedShops();

      expect(result).toEqual([]);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_featured_shops"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getFeaturedShops();

      expect(result).toEqual([]);
    });
  });

  describe("getFeaturedProducts", () => {
    it("should fetch admin-selected featured products", async () => {
      const mockProducts = [
        { id: "prod1", stockCount: 5, featured: true },
        { id: "prod2", stock_quantity: 10, featured: true },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockProducts });

      const result = await homepageService.getFeaturedProducts(10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured=true")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=published")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("inStock=true")
      );
      expect(result).toEqual(mockProducts);
    });

    it("should filter out products with no stock", async () => {
      const mockProducts = [
        { id: "prod1", stockCount: 5 },
        { id: "prod2", stock_quantity: 0 },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockProducts });

      const result = await homepageService.getFeaturedProducts();

      expect(result).toHaveLength(1);
    });

    it("should track event when no products found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getFeaturedProducts();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_featured_products"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getFeaturedProducts();

      expect(result).toEqual([]);
    });
  });

  describe("getFeaturedAuctions", () => {
    it("should fetch admin-selected featured auctions", async () => {
      const mockAuctions = [
        { id: "auc1", featured: true, status: "active" },
        { id: "auc2", featured: true, status: "active" },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockAuctions });

      const result = await homepageService.getFeaturedAuctions(10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured=true")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=active")
      );
      expect(result).toEqual(mockAuctions);
    });

    it("should track event when no auctions found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getFeaturedAuctions();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_featured_auctions"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getFeaturedAuctions();

      expect(result).toEqual([]);
    });
  });

  describe("getRecentReviews", () => {
    it("should fetch recent 4+ star reviews", async () => {
      const mockReviews: ReviewFE[] = [
        {
          id: "rev1",
          rating: 5,
          comment: "Great!",
          userName: "John",
        } as ReviewFE,
        {
          id: "rev2",
          rating: 4,
          comment: "Good",
          userName: "Jane",
        } as ReviewFE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockReviews });

      const result = await homepageService.getRecentReviews(10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/homepage/reviews")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("minRating=4")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=10")
      );
      expect(result).toEqual(mockReviews);
    });

    it("should track event when no reviews found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getRecentReviews();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_recent_reviews"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getRecentReviews();

      expect(result).toEqual([]);
    });
  });

  describe("getFeaturedBlogs", () => {
    it("should fetch featured blog posts", async () => {
      const mockBlogs = [
        { id: "blog1", slug: "post-1", title: "Post 1", featured: true },
        { id: "blog2", slug: "post-2", title: "Post 2", featured: true },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockBlogs });

      const result = await homepageService.getFeaturedBlogs(10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/blog")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured=true")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=published")
      );
      expect(result).toEqual(mockBlogs);
    });

    it("should track event when no blogs found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getFeaturedBlogs();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_featured_blogs"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getFeaturedBlogs();

      expect(result).toEqual([]);
    });
  });

  describe("getFAQs", () => {
    it("should fetch all FAQs", async () => {
      const mockFAQs = [
        { id: "faq1", question: "Q1?", answer: "A1", order: 1 },
        { id: "faq2", question: "Q2?", answer: "A2", order: 2 },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ data: mockFAQs });

      const result = await homepageService.getFAQs();

      expect(apiService.get).toHaveBeenCalledWith("/homepage/faqs");
      expect(result).toEqual(mockFAQs);
    });

    it("should track event when no FAQs found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await homepageService.getFAQs();

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        "homepage_no_faqs"
      );
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await homepageService.getFAQs();

      expect(result).toEqual([]);
    });

    it("should handle empty response data", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ data: null });

      const result = await homepageService.getFAQs();

      expect(result).toEqual([]);
    });
  });
});
