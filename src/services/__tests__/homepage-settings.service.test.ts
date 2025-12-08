/**
 * Homepage Settings Service Tests
 *
 * Tests homepage configuration service
 */

import { apiService } from "../api.service";
import { homepageSettingsService } from "../homepage-settings.service";

jest.mock("../api.service");

describe("HomepageSettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSettings", () => {
    it("should fetch current homepage settings", async () => {
      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: true,
            title: "Christmas Sale",
            content: "<p>Get 50% off on all items!</p>",
            link: "/sale",
            backgroundColor: "#ff0000",
            textColor: "#ffffff",
          },
          heroCarousel: {
            enabled: true,
            autoPlayInterval: 5000,
          },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [
            "specialEventBanner",
            "heroCarousel",
            "valueProposition",
            "latestProducts",
            "hotAuctions",
          ],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
          updatedBy: "admin1",
        },
        isDefault: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageSettingsService.getSettings();

      expect(apiService.get).toHaveBeenCalledWith("/homepage");
      expect(result.settings.specialEventBanner.title).toBe("Christmas Sale");
      expect(result.settings.sections.latestProducts.maxProducts).toBe(12);
      expect(result.isDefault).toBe(false);
    });

    it("should fetch default homepage settings", async () => {
      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: {
            enabled: true,
            autoPlayInterval: 5000,
          },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [
            "heroCarousel",
            "valueProposition",
            "latestProducts",
            "hotAuctions",
          ],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageSettingsService.getSettings();

      expect(result.isDefault).toBe(true);
      expect(result.settings.specialEventBanner.enabled).toBe(false);
    });
  });

  describe("updateSettings", () => {
    it("should update homepage settings and invalidate cache", async () => {
      const updates = {
        specialEventBanner: {
          enabled: true,
          title: "New Year Sale",
          content: "<p>Limited time offer!</p>",
          link: "/newyear",
          backgroundColor: "#0000ff",
          textColor: "#ffffff",
        },
      };

      const mockResponse = {
        data: {
          specialEventBanner: updates.specialEventBanner,
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-02T00:00:00Z",
          updatedBy: "admin1",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);
      const invalidateCacheSpy = jest.spyOn(
        apiService,
        "invalidateCache"
      ) as jest.Mock;

      const result = await homepageSettingsService.updateSettings(
        updates,
        "admin1"
      );

      expect(apiService.patch).toHaveBeenCalledWith("/homepage", {
        settings: updates,
        userId: "admin1",
      });
      expect(invalidateCacheSpy).toHaveBeenCalledWith("/homepage");
      expect(result.specialEventBanner.title).toBe("New Year Sale");
    });

    it("should update section settings", async () => {
      const updates = {
        sections: {
          latestProducts: { enabled: true, maxProducts: 20 },
          hotAuctions: { enabled: false, maxAuctions: 8 },
        },
      };

      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 20 },
            hotAuctions: { enabled: false, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-02T00:00:00Z",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageSettingsService.updateSettings(updates);

      expect(result.sections.latestProducts.maxProducts).toBe(20);
      expect(result.sections.hotAuctions.enabled).toBe(false);
    });
  });

  describe("resetSettings", () => {
    it("should reset to default settings and invalidate cache", async () => {
      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [
            "heroCarousel",
            "valueProposition",
            "latestProducts",
            "hotAuctions",
          ],
          featuredItems: {},
          updatedAt: "2024-12-02T00:00:00Z",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);
      const invalidateCacheSpy = jest.spyOn(
        apiService,
        "invalidateCache"
      ) as jest.Mock;

      const result = await homepageSettingsService.resetSettings();

      expect(apiService.post).toHaveBeenCalledWith("/homepage", {});
      expect(invalidateCacheSpy).toHaveBeenCalledWith("/homepage");
      expect(result.specialEventBanner.enabled).toBe(false);
    });
  });

  describe("toggleSection", () => {
    it("should enable a section", async () => {
      const currentSettings = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: false, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      const updatedSettings = {
        data: {
          ...currentSettings.data,
          sections: {
            ...currentSettings.data.sections,
            latestProducts: { enabled: true, maxProducts: 12 },
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(currentSettings);
      (apiService.patch as jest.Mock).mockResolvedValue(updatedSettings);

      const result = await homepageSettingsService.toggleSection(
        "latestProducts",
        true
      );

      expect(apiService.patch).toHaveBeenCalledWith("/homepage", {
        settings: {
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
        },
        userId: undefined,
      });
      expect(result.sections.latestProducts.enabled).toBe(true);
    });

    it("should disable a section", async () => {
      const currentSettings = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      const updatedSettings = {
        data: {
          ...currentSettings.data,
          sections: {
            ...currentSettings.data.sections,
            hotAuctions: { enabled: false, maxAuctions: 8 },
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(currentSettings);
      (apiService.patch as jest.Mock).mockResolvedValue(updatedSettings);

      const result = await homepageSettingsService.toggleSection(
        "hotAuctions",
        false
      );

      expect(result.sections.hotAuctions.enabled).toBe(false);
    });

    it("should throw error for invalid section", async () => {
      const currentSettings = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(currentSettings);

      await expect(
        homepageSettingsService.toggleSection("invalidSection", true)
      ).rejects.toThrow("Section invalidSection not found");
    });
  });

  describe("updateSectionOrder", () => {
    it("should update section order", async () => {
      const newOrder = [
        "heroCarousel",
        "specialEventBanner",
        "valueProposition",
        "hotAuctions",
        "latestProducts",
      ];

      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: newOrder,
          featuredItems: {},
          updatedAt: "2024-12-02T00:00:00Z",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageSettingsService.updateSectionOrder(newOrder);

      expect(apiService.patch).toHaveBeenCalledWith("/homepage", {
        settings: { sectionOrder: newOrder },
        userId: undefined,
      });
      expect(result.sectionOrder).toEqual(newOrder);
    });
  });

  describe("updateSectionLimits", () => {
    it("should update section limits for latestProducts", async () => {
      const currentSettings = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      const updatedSettings = {
        data: {
          ...currentSettings.data,
          sections: {
            ...currentSettings.data.sections,
            latestProducts: { enabled: true, maxProducts: 20 },
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(currentSettings);
      (apiService.patch as jest.Mock).mockResolvedValue(updatedSettings);

      const result = await homepageSettingsService.updateSectionLimits(
        "latestProducts",
        { maxProducts: 20 }
      );

      expect(result.sections.latestProducts.maxProducts).toBe(20);
    });

    it("should update section limits for featuredCategories", async () => {
      const currentSettings = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      const updatedSettings = {
        data: {
          ...currentSettings.data,
          sections: {
            ...currentSettings.data.sections,
            featuredCategories: {
              enabled: true,
              maxCategories: 8,
              productsPerCategory: 6,
            },
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(currentSettings);
      (apiService.patch as jest.Mock).mockResolvedValue(updatedSettings);

      const result = await homepageSettingsService.updateSectionLimits(
        "featuredCategories",
        { maxCategories: 8, productsPerCategory: 6 }
      );

      expect(result.sections.featuredCategories.maxCategories).toBe(8);
      expect(result.sections.featuredCategories.productsPerCategory).toBe(6);
    });

    it("should throw error for invalid section", async () => {
      const currentSettings = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {},
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(currentSettings);

      await expect(
        homepageSettingsService.updateSectionLimits("invalidSection", {
          maxProducts: 20,
        })
      ).rejects.toThrow("Section invalidSection not found");
    });
  });

  describe("getFeaturedItems", () => {
    it("should fetch featured items", async () => {
      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: {
            products: [
              {
                id: "item1",
                type: "product",
                itemId: "prod1",
                name: "Featured Product 1",
                image: "/images/prod1.jpg",
                position: 1,
                section: "featuredProducts",
                active: true,
                createdAt: "2024-12-01T00:00:00Z",
              },
            ],
            shops: [
              {
                id: "item2",
                type: "shop",
                itemId: "shop1",
                name: "Featured Shop 1",
                image: "/images/shop1.jpg",
                position: 1,
                section: "featuredShops",
                active: true,
                createdAt: "2024-12-01T00:00:00Z",
              },
            ],
          },
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageSettingsService.getFeaturedItems();

      expect(result.products).toHaveLength(1);
      expect(result.shops).toHaveLength(1);
      expect(result.products[0].name).toBe("Featured Product 1");
    });

    it("should return empty object if no featured items", async () => {
      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          updatedAt: "2024-12-01T00:00:00Z",
        },
        isDefault: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageSettingsService.getFeaturedItems();

      expect(result).toEqual({});
    });
  });

  describe("updateFeaturedItems", () => {
    it("should update featured items", async () => {
      const newFeaturedItems = {
        products: [
          {
            id: "item1",
            type: "product" as const,
            itemId: "prod1",
            name: "Featured Product 1",
            image: "/images/prod1.jpg",
            position: 1,
            section: "featuredProducts",
            active: true,
            createdAt: "2024-12-01T00:00:00Z",
          },
          {
            id: "item2",
            type: "product" as const,
            itemId: "prod2",
            name: "Featured Product 2",
            image: "/images/prod2.jpg",
            position: 2,
            section: "featuredProducts",
            active: true,
            createdAt: "2024-12-01T00:00:00Z",
          },
        ],
      };

      const mockResponse = {
        data: {
          specialEventBanner: {
            enabled: false,
            title: "",
            content: "",
            link: "",
            backgroundColor: "",
            textColor: "",
          },
          heroCarousel: { enabled: true, autoPlayInterval: 5000 },
          sections: {
            valueProposition: { enabled: true },
            latestProducts: { enabled: true, maxProducts: 12 },
            hotAuctions: { enabled: true, maxAuctions: 8 },
            featuredCategories: {
              enabled: true,
              maxCategories: 6,
              productsPerCategory: 4,
            },
            featuredShops: { enabled: true, maxShops: 8, productsPerShop: 4 },
            featuredProducts: { enabled: true, maxProducts: 12 },
            featuredAuctions: { enabled: true, maxAuctions: 8 },
            recentReviews: { enabled: true, maxReviews: 10 },
            featuredBlogs: { enabled: true, maxBlogs: 6 },
          },
          sectionOrder: [],
          featuredItems: newFeaturedItems,
          updatedAt: "2024-12-02T00:00:00Z",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await homepageSettingsService.updateFeaturedItems(
        newFeaturedItems
      );

      expect(apiService.patch).toHaveBeenCalledWith("/homepage", {
        settings: { featuredItems: newFeaturedItems },
        userId: undefined,
      });
      expect(result.featuredItems?.products).toHaveLength(2);
    });
  });
});
