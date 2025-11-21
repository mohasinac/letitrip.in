import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import { homepageSettingsService } from "@/services/homepage-settings.service";
import { COMPANY_NAME, COMPANY_ALT_TEXT } from "@/constants/navigation";

// Mock next/dynamic
jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (importFn: any, options: any) => {
    const MockComponent = () => (
      <div data-testid="mock-dynamic-component">Mock Component</div>
    );
    MockComponent.displayName = "DynamicComponent";
    return MockComponent;
  },
}));

// Mock the homepage settings service
jest.mock("@/services/homepage-settings.service", () => ({
  homepageSettingsService: {
    getSettings: jest.fn(),
  },
}));

// Mock constants
jest.mock("@/constants/navigation", () => ({
  COMPANY_NAME: "Test Company",
  COMPANY_ALT_TEXT: "Test Company Alt Text",
}));

describe("Home Page", () => {
  const mockSettings = {
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
      valueProposition: {
        enabled: true,
      },
      featuredCategories: {
        enabled: true,
        maxCategories: 6,
        productsPerCategory: 5,
      },
      featuredProducts: {
        enabled: true,
        maxProducts: 8,
      },
      featuredAuctions: {
        enabled: true,
        maxAuctions: 6,
      },
      featuredShops: {
        enabled: true,
        maxShops: 4,
        productsPerShop: 5,
      },
      featuredBlogs: {
        enabled: true,
        maxBlogs: 3,
      },
      featuredReviews: {
        enabled: true,
        maxReviews: 6,
      },
    },
    sectionOrder: ["hero", "categories", "products", "auctions"],
    updatedAt: "2024-01-01T00:00:00Z",
    updatedBy: "admin",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading state initially", () => {
      // Mock the service to never resolve (simulate loading)
      (homepageSettingsService.getSettings as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<Home />);

      // Check for loading skeleton - the inner div should have animate-pulse
      const loadingContainer = screen.getByRole("main").firstElementChild;
      expect(loadingContainer).toHaveClass("animate-pulse");

      // Should have multiple skeleton divs
      const skeletonElements = screen
        .getByRole("main")
        .querySelectorAll(".h-96, .h-64");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe("Successful Loading", () => {
    beforeEach(() => {
      (homepageSettingsService.getSettings as jest.Mock).mockResolvedValue({
        settings: mockSettings,
        isDefault: false,
      });
    });

    it("renders homepage with settings", async () => {
      render(<Home />);

      // Wait for loading to complete and content to render
      await waitFor(() => {
        expect(screen.getByText("Welcome to Test Company")).toBeInTheDocument();
      });

      // Check welcome section
      expect(screen.getByText("Welcome to Test Company")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Test Company Alt Text - Your Gateway to Authentic Collectibles"
        )
      ).toBeInTheDocument();

      // Check value proposition banner (enabled)
      expect(screen.getByText("100% Authentic Products")).toBeInTheDocument();
      expect(screen.getByText("Zero Customs Charges")).toBeInTheDocument();
      expect(screen.getByText("Fast India Delivery")).toBeInTheDocument();
      expect(screen.getByText("Secure Payments")).toBeInTheDocument();

      // Check that dynamic components are rendered
      const mockComponents = screen.getAllByTestId("mock-dynamic-component");
      expect(mockComponents.length).toBeGreaterThan(0);
    });

    it("conditionally renders hero carousel when enabled", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(document.getElementById("hero-section")).toBeInTheDocument();
      });

      // Hero section should be present when enabled
      const heroSection = document.getElementById("hero-section");
      expect(heroSection).toBeInTheDocument();
    });

    it("conditionally hides hero carousel when disabled", async () => {
      const disabledSettings = {
        ...mockSettings,
        heroCarousel: { ...mockSettings.heroCarousel, enabled: false },
      };

      (homepageSettingsService.getSettings as jest.Mock).mockResolvedValue({
        settings: disabledSettings,
        isDefault: false,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Welcome to Test Company")).toBeInTheDocument();
      });

      // Hero section should not be present when disabled
      const heroSection = document.getElementById("hero-section");
      expect(heroSection).not.toBeInTheDocument();
    });

    it("conditionally renders sections based on settings", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(
          document.getElementById("featured-categories")
        ).toBeInTheDocument();
      });

      // Check that enabled sections are rendered
      expect(
        document.getElementById("featured-categories")
      ).toBeInTheDocument();
      expect(document.getElementById("featured-products")).toBeInTheDocument();
      expect(document.getElementById("featured-auctions")).toBeInTheDocument();
      expect(document.getElementById("featured-shops")).toBeInTheDocument();
    });

    it("hides sections when disabled in settings", async () => {
      const disabledSectionsSettings = {
        ...mockSettings,
        sections: {
          ...mockSettings.sections,
          featuredProducts: {
            ...mockSettings.sections.featuredProducts,
            enabled: false,
          },
          featuredAuctions: {
            ...mockSettings.sections.featuredAuctions,
            enabled: false,
          },
        },
      };

      (homepageSettingsService.getSettings as jest.Mock).mockResolvedValue({
        settings: disabledSectionsSettings,
        isDefault: false,
      });

      render(<Home />);

      await waitFor(() => {
        expect(
          document.getElementById("featured-categories")
        ).toBeInTheDocument();
      });

      // Disabled sections should not be present
      expect(
        document.getElementById("featured-products")
      ).not.toBeInTheDocument();
      expect(
        document.getElementById("featured-auctions")
      ).not.toBeInTheDocument();

      // Enabled sections should still be present
      expect(
        document.getElementById("featured-categories")
      ).toBeInTheDocument();
    });

    it("always renders certain sections regardless of settings", async () => {
      const minimalSettings = {
        ...mockSettings,
        sections: {
          ...mockSettings.sections,
          valueProposition: { enabled: false },
          featuredCategories: { enabled: false },
          featuredProducts: { enabled: false },
          featuredAuctions: { enabled: false },
          featuredShops: { enabled: false },
          featuredBlogs: { enabled: false },
          featuredReviews: { enabled: false },
        },
      };

      (homepageSettingsService.getSettings as jest.Mock).mockResolvedValue({
        settings: minimalSettings,
        isDefault: false,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Welcome to Test Company")).toBeInTheDocument();
      });

      // Always rendered sections
      expect(screen.getByText("Welcome to Test Company")).toBeInTheDocument();
      expect(document.getElementById("faq-section")).toBeInTheDocument();

      // Conditionally rendered sections should be hidden
      expect(
        document.getElementById("value-proposition")
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles API errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (homepageSettingsService.getSettings as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Welcome to Test Company")).toBeInTheDocument();
      });

      // Should still render the page with default behavior (settings = null)
      expect(screen.getByText("Welcome to Test Company")).toBeInTheDocument();

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load homepage settings:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("renders with null settings (default behavior)", async () => {
      (homepageSettingsService.getSettings as jest.Mock).mockResolvedValue({
        settings: null,
        isDefault: true,
      });

      render(<Home />);

      await waitFor(() => {
        expect(document.getElementById("hero-section")).toBeInTheDocument();
      });

      // Should render with default enabled sections
      expect(document.getElementById("hero-section")).toBeInTheDocument();
      expect(document.getElementById("value-proposition")).toBeInTheDocument();
      expect(
        document.getElementById("featured-categories")
      ).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    beforeEach(() => {
      (homepageSettingsService.getSettings as jest.Mock).mockResolvedValue({
        settings: mockSettings,
        isDefault: false,
      });
    });

    it("has correct page structure and IDs", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(document.getElementById("hero-section")).toBeInTheDocument();
      });

      // Check main container
      const mainElement = screen.getByRole("main");
      expect(mainElement).toHaveAttribute("id", "home-page");

      // Check sections have correct IDs
      expect(document.getElementById("hero-section")).toBeInTheDocument();
      expect(document.getElementById("value-proposition")).toBeInTheDocument();
      expect(document.getElementById("faq-section")).toBeInTheDocument();
    });

    it("renders FAQ section with correct props", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(document.getElementById("faq-section")).toBeInTheDocument();
      });

      // FAQ section should be present
      const faqSection = document.getElementById("faq-section");
      expect(faqSection).toBeInTheDocument();
    });
  });
});
