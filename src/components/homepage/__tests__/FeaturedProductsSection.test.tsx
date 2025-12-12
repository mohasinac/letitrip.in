import { analyticsService } from "@/services/analytics.service";
import { homepageService } from "@/services/homepage.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { render, screen, waitFor } from "@testing-library/react";
import { FeaturedProductsSection } from "../FeaturedProductsSection";

// Mock services
jest.mock("@/services/homepage.service");
jest.mock("@/services/analytics.service");
jest.mock("@/lib/error-logger");

// Mock components
jest.mock("@/components/common/HorizontalScrollContainer", () => ({
  HorizontalScrollContainer: ({
    children,
    title,
    viewAllLink,
    viewAllText,
  }: any) => (
    <div data-testid="horizontal-scroll">
      <h2>{title}</h2>
      {viewAllLink && <a href={viewAllLink}>{viewAllText}</a>}
      {children}
    </div>
  ),
}));

jest.mock("@/components/cards/ProductCard", () => ({
  ProductCard: ({ id, name }: any) => (
    <div data-testid={`product-${id}`}>{name}</div>
  ),
}));

jest.mock("@/components/cards/ProductCardSkeleton", () => ({
  ProductCardSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

const mockProducts: ProductCardFE[] = [
  {
    id: "prod1",
    name: "Test Product 1",
    slug: "test-product-1",
    price: 1000,
    originalPrice: 1200,
    images: ["/image1.jpg"],
    rating: 4.5,
    reviewCount: 10,
    shopId: "shop1",
    shop: { id: "shop1", name: "Test Shop", slug: "test-shop" },
    stockCount: 5,
    featured: true,
    condition: "new" as const,
    description: "",
    categoryId: "cat1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod2",
    name: "Test Product 2",
    slug: "test-product-2",
    price: 2000,
    images: ["/image2.jpg"],
    rating: 4.0,
    reviewCount: 5,
    shopId: "shop1",
    shop: { id: "shop1", name: "Test Shop", slug: "test-shop" },
    stockCount: 0,
    featured: true,
    condition: "used" as const,
    description: "",
    categoryId: "cat1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("FeaturedProductsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should show skeletons while loading", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<FeaturedProductsSection limit={5} />);

      expect(screen.getByText("Featured Products")).toBeInTheDocument();
      expect(screen.getAllByTestId("skeleton")).toHaveLength(5);
    });

    it("should respect limit prop for skeleton count", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<FeaturedProductsSection limit={3} />);

      expect(screen.getAllByTestId("skeleton")).toHaveLength(3);
    });

    it("should show max 5 skeletons even if limit is higher", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<FeaturedProductsSection limit={20} />);

      expect(screen.getAllByTestId("skeleton")).toHaveLength(5);
    });

    it("should have dark mode support in skeleton section", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedProductsSection />);
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("dark:text-white");
    });
  });

  describe("Data Loading", () => {
    it("should load and display products", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );

      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("product-prod1")).toBeInTheDocument();
        expect(screen.getByTestId("product-prod2")).toBeInTheDocument();
      });
    });

    it("should call service with correct limit", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue([]);

      render(<FeaturedProductsSection limit={5} />);

      await waitFor(() => {
        expect(homepageService.getFeaturedProducts).toHaveBeenCalledWith(5);
      });
    });

    it("should use default limit of 10", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue([]);

      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(homepageService.getFeaturedProducts).toHaveBeenCalledWith(10);
      });
    });

    it("should reload when limit changes", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue([]);

      const { rerender } = render(<FeaturedProductsSection limit={5} />);

      await waitFor(() => {
        expect(homepageService.getFeaturedProducts).toHaveBeenCalledWith(5);
      });

      rerender(<FeaturedProductsSection limit={10} />);

      await waitFor(() => {
        expect(homepageService.getFeaturedProducts).toHaveBeenCalledWith(10);
      });
    });
  });

  describe("Analytics", () => {
    it("should track analytics when products are loaded", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );

      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          "homepage_featured_products_viewed",
          { count: 2 }
        );
      });
    });

    it("should not track analytics when no products", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue([]);

      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(analyticsService.trackEvent).not.toHaveBeenCalled();
      });
    });
  });

  describe("Empty State", () => {
    it("should not render when no products and not loading", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue([]);

      const { container } = render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle service errors gracefully", async () => {
      const error = new Error("Service error");
      (homepageService.getFeaturedProducts as jest.Mock).mockRejectedValue(
        error
      );

      const { container } = render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });

    it("should still hide loading state on error", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockRejectedValue(
        new Error("Error")
      );

      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
      });
    });
  });

  describe("Product Display", () => {
    beforeEach(() => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );
    });

    it("should display products in HorizontalScrollContainer", async () => {
      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("horizontal-scroll")).toBeInTheDocument();
      });
    });

    it("should show correct title", async () => {
      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(screen.getByText("Featured Products")).toBeInTheDocument();
      });
    });

    it("should have view all link", async () => {
      render(<FeaturedProductsSection />);

      await waitFor(() => {
        const link = screen.getByText("View All Featured");
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute(
          "href",
          "/products?featured=true"
        );
      });
    });

    it("should render all products", async () => {
      render(<FeaturedProductsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("product-prod1")).toBeInTheDocument();
        expect(screen.getByTestId("product-prod2")).toBeInTheDocument();
      });
    });
  });

  describe("Custom className", () => {
    it("should apply custom className in loading state", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(
        <FeaturedProductsSection className="custom-class" />
      );
      const section = container.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });

    it("should apply custom className when loaded", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );

      const { container } = render(
        <FeaturedProductsSection className="custom-class" />
      );

      await waitFor(() => {
        const section = container.querySelector("section");
        expect(section).toHaveClass("custom-class");
      });
    });

    it("should apply default padding when loaded", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );

      const { container } = render(<FeaturedProductsSection />);

      await waitFor(() => {
        const section = container.querySelector("section");
        expect(section).toHaveClass("py-8");
      });
    });
  });

  describe("Responsive Grid Layout (Loading)", () => {
    it("should have responsive grid in loading state", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedProductsSection />);
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass(
        "grid-cols-2",
        "sm:grid-cols-3",
        "md:grid-cols-4",
        "lg:grid-cols-5"
      );
    });

    it("should have gap in grid", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedProductsSection />);
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("gap-4");
    });
  });

  describe("Dark Mode", () => {
    it("should support dark mode in heading", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedProductsSection />);
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-gray-900", "dark:text-white");
    });
  });

  describe("Accessibility", () => {
    it("should use semantic section element", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedProductsSection />);
      const section = container.querySelector("section");
      expect(section?.tagName).toBe("SECTION");
    });

    it("should have proper heading hierarchy", async () => {
      (homepageService.getFeaturedProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );

      render(<FeaturedProductsSection />);

      await waitFor(() => {
        const heading = screen.getByText("Featured Products");
        expect(heading.tagName).toBe("H2");
      });
    });
  });
});
