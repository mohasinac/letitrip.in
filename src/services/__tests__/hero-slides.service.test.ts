import { apiService } from "../api.service";
import type { HeroSlide, HeroSlideFormData } from "../hero-slides.service";
import { heroSlidesService } from "../hero-slides.service";

jest.mock("../api.service");

describe("HeroSlidesService", () => {
  const mockSlideApiFormat = {
    id: "slide1",
    title: "Summer Sale",
    subtitle: "Up to 50% off",
    description: "Limited time offer",
    image_url: "https://example.com/image.jpg",
    mobile_image_url: "https://example.com/mobile.jpg",
    cta_text: "Shop Now",
    link_url: "/sale",
    cta_target: "_self" as const,
    position: 1,
    is_active: true,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    background_color: "#FF5733",
    text_color: "#FFFFFF",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  };

  const mockSlide: HeroSlide = {
    id: "slide1",
    title: "Summer Sale",
    subtitle: "Up to 50% off",
    description: "Limited time offer",
    image: "https://example.com/image.jpg",
    mobileImage: "https://example.com/mobile.jpg",
    ctaText: "Shop Now",
    ctaLink: "/sale",
    ctaTarget: "_self",
    order: 1,
    isActive: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    backgroundColor: "#FF5733",
    textColor: "#FFFFFF",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getHeroSlides", () => {
    it("should fetch all hero slides", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [mockSlideApiFormat],
      });

      const result = await heroSlidesService.getHeroSlides();

      expect(apiService.get).toHaveBeenCalledWith("/hero-slides");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("slide1");
      expect(result[0].title).toBe("Summer Sale");
      expect(result[0].image).toBe("https://example.com/image.jpg");
    });

    it("should filter by active status", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [mockSlideApiFormat],
      });

      await heroSlidesService.getHeroSlides({ isActive: true });

      expect(apiService.get).toHaveBeenCalledWith("/hero-slides?isActive=true");
    });

    it("should filter by search query", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [mockSlideApiFormat],
      });

      await heroSlidesService.getHeroSlides({ search: "summer" });

      expect(apiService.get).toHaveBeenCalledWith("/hero-slides?search=summer");
    });

    it("should handle multiple filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [mockSlideApiFormat],
      });

      await heroSlidesService.getHeroSlides({
        isActive: false,
        search: "winter",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/hero-slides?isActive=false&search=winter"
      );
    });

    it("should handle empty slides array", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ slides: [] });

      const result = await heroSlidesService.getHeroSlides();

      expect(result).toEqual([]);
    });

    it("should handle missing slides property", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      const result = await heroSlidesService.getHeroSlides();

      expect(result).toEqual([]);
    });

    it("should transform snake_case to camelCase", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [mockSlideApiFormat],
      });

      const result = await heroSlidesService.getHeroSlides();

      expect(result[0]).toEqual(mockSlide);
    });

    it("should handle fallback field names", async () => {
      const apiData = {
        id: "slide2",
        title: "Test",
        image: "img.jpg", // fallback from image_url
        ctaText: "Click", // fallback from cta_text
        ctaLink: "/shop", // fallback from link_url
        order: 5, // fallback from position
        enabled: true, // fallback from is_active
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [apiData],
      });

      const result = await heroSlidesService.getHeroSlides();

      expect(result[0].image).toBe("img.jpg");
      expect(result[0].ctaText).toBe("Click");
      expect(result[0].ctaLink).toBe("/shop");
      expect(result[0].order).toBe(5);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe("getHeroSlideById", () => {
    it("should fetch single hero slide", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });

      const result = await heroSlidesService.getHeroSlideById("slide1");

      expect(apiService.get).toHaveBeenCalledWith("/hero-slides/slide1");
      expect(result).toEqual(mockSlide);
    });

    it("should transform API response", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });

      const result = await heroSlidesService.getHeroSlideById("slide1");

      expect(result.image).toBe(mockSlideApiFormat.image_url);
      expect(result.mobileImage).toBe(mockSlideApiFormat.mobile_image_url);
      expect(result.ctaText).toBe(mockSlideApiFormat.cta_text);
      expect(result.ctaLink).toBe(mockSlideApiFormat.link_url);
      expect(result.order).toBe(mockSlideApiFormat.position);
      expect(result.isActive).toBe(mockSlideApiFormat.is_active);
    });
  });

  describe("createHeroSlide", () => {
    const formData: HeroSlideFormData = {
      title: "New Slide",
      subtitle: "Subtitle",
      description: "Description",
      image: "https://example.com/new.jpg",
      mobileImage: "https://example.com/new-mobile.jpg",
      ctaText: "Buy Now",
      ctaLink: "/products",
      ctaTarget: "_blank",
      order: 2,
      isActive: true,
      startDate: "2024-06-01",
      endDate: "2024-12-31",
      backgroundColor: "#0000FF",
      textColor: "#FFFFFF",
    };

    it("should create new hero slide", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });

      const result = await heroSlidesService.createHeroSlide(formData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/hero-slides",
        expect.objectContaining({
          title: "New Slide",
          subtitle: "Subtitle",
          image_url: "https://example.com/new.jpg",
          mobile_image_url: "https://example.com/new-mobile.jpg",
          cta_text: "Buy Now",
          link_url: "/products",
          cta_target: "_blank",
          position: 2,
          is_active: true,
          start_date: "2024-06-01",
          end_date: "2024-12-31",
          background_color: "#0000FF",
          text_color: "#FFFFFF",
        })
      );
      expect(result).toEqual(mockSlide);
    });

    it("should invalidate cache after create", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      await heroSlidesService.createHeroSlide(formData);

      expect(apiService.invalidateCache).toHaveBeenCalledWith("/hero-slides");
      expect(apiService.invalidateCache).toHaveBeenCalledWith("/homepage");
    });

    it("should handle minimal form data", async () => {
      const minimalData: HeroSlideFormData = {
        title: "Simple Slide",
        image: "image.jpg",
        ctaText: "Click",
        ctaLink: "/",
        order: 0,
        isActive: false,
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });

      await heroSlidesService.createHeroSlide(minimalData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/hero-slides",
        expect.objectContaining({
          title: "Simple Slide",
          image_url: "image.jpg",
          cta_text: "Click",
          link_url: "/",
          position: 0,
          is_active: false,
        })
      );
    });
  });

  describe("updateHeroSlide", () => {
    it("should update hero slide", async () => {
      const updates: Partial<HeroSlideFormData> = {
        title: "Updated Title",
        isActive: false,
      };

      (apiService.patch as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });

      const result = await heroSlidesService.updateHeroSlide("slide1", updates);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/hero-slides/slide1",
        expect.objectContaining({
          title: "Updated Title",
          is_active: false,
        })
      );
      expect(result).toEqual(mockSlide);
    });

    it("should invalidate cache after update", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      await heroSlidesService.updateHeroSlide("slide1", { title: "New" });

      expect(apiService.invalidateCache).toHaveBeenCalledWith("/hero-slides");
      expect(apiService.invalidateCache).toHaveBeenCalledWith("/homepage");
    });

    it("should handle partial updates", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({
        slide: mockSlideApiFormat,
      });

      await heroSlidesService.updateHeroSlide("slide1", {
        backgroundColor: "#FF0000",
      });

      expect(apiService.patch).toHaveBeenCalledWith(
        "/hero-slides/slide1",
        expect.objectContaining({
          background_color: "#FF0000",
        })
      );
    });
  });

  describe("deleteHeroSlide", () => {
    it("should delete hero slide", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({});

      await heroSlidesService.deleteHeroSlide("slide1");

      expect(apiService.delete).toHaveBeenCalledWith("/hero-slides/slide1");
    });

    it("should invalidate cache after delete", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({});
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      await heroSlidesService.deleteHeroSlide("slide1");

      expect(apiService.invalidateCache).toHaveBeenCalledWith("/hero-slides");
      expect(apiService.invalidateCache).toHaveBeenCalledWith("/homepage");
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple slides", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      await heroSlidesService.bulkDelete(["slide1", "slide2", "slide3"]);

      expect(apiService.post).toHaveBeenCalledWith("/hero-slides/bulk", {
        action: "delete",
        ids: ["slide1", "slide2", "slide3"],
      });
    });

    it("should invalidate cache after bulk delete", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      await heroSlidesService.bulkDelete(["slide1"]);

      expect(apiService.invalidateCache).toHaveBeenCalledWith("/hero-slides");
      expect(apiService.invalidateCache).toHaveBeenCalledWith("/homepage");
    });
  });

  describe("bulkUpdate", () => {
    it("should update multiple slides", async () => {
      const updates: Partial<HeroSlideFormData> = {
        isActive: false,
        backgroundColor: "#000000",
      };

      (apiService.post as jest.Mock).mockResolvedValue({});

      await heroSlidesService.bulkUpdate(["slide1", "slide2"], updates);

      expect(apiService.post).toHaveBeenCalledWith("/hero-slides/bulk", {
        action: "update",
        ids: ["slide1", "slide2"],
        updates: {
          is_active: false,
          background_color: "#000000",
        },
      });
    });

    it("should invalidate cache after bulk update", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      await heroSlidesService.bulkUpdate(["slide1"], { title: "New" });

      expect(apiService.invalidateCache).toHaveBeenCalledWith("/hero-slides");
      expect(apiService.invalidateCache).toHaveBeenCalledWith("/homepage");
    });
  });

  describe("reorderSlides", () => {
    it("should reorder slides", async () => {
      const slideOrders = [
        { id: "slide1", order: 3 },
        { id: "slide2", order: 1 },
        { id: "slide3", order: 2 },
      ];

      (apiService.post as jest.Mock).mockResolvedValue({});

      await heroSlidesService.reorderSlides(slideOrders);

      expect(apiService.post).toHaveBeenCalledWith("/hero-slides/bulk", {
        action: "reorder",
        slides: [
          { id: "slide1", position: 3 },
          { id: "slide2", position: 1 },
          { id: "slide3", position: 2 },
        ],
      });
    });

    it("should invalidate cache after reorder", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      await heroSlidesService.reorderSlides([{ id: "slide1", order: 1 }]);

      expect(apiService.invalidateCache).toHaveBeenCalledWith("/hero-slides");
      expect(apiService.invalidateCache).toHaveBeenCalledWith("/homepage");
    });
  });

  describe("Transform functions", () => {
    it("should handle default values in transformation", async () => {
      const minimalApiData = {
        id: "slide1",
        title: "Test",
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [minimalApiData],
      });

      const result = await heroSlidesService.getHeroSlides();

      expect(result[0].image).toBe("");
      expect(result[0].ctaText).toBe("Shop Now");
      expect(result[0].ctaLink).toBe("/");
      expect(result[0].order).toBe(0);
      expect(result[0].isActive).toBe(true);
    });

    it("should prefer primary field names over fallbacks", async () => {
      const apiData = {
        id: "slide1",
        title: "Test",
        image_url: "primary.jpg",
        image: "fallback.jpg",
        cta_text: "Primary CTA",
        ctaText: "Fallback CTA",
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        slides: [apiData],
      });

      const result = await heroSlidesService.getHeroSlides();

      expect(result[0].image).toBe("primary.jpg");
      expect(result[0].ctaText).toBe("Primary CTA");
    });
  });
});
