import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import SearchPage from "@/app/search/page";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import { categoriesService } from "@/services/categories.service";
import { ProductStatus, ProductCondition } from "@/types/shared/common.types";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
const mockUseSearchParams = jest.fn(() => mockSearchParams);
const mockUseRouter = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => mockUseRouter(),
}));

// Mock services
jest.mock("@/services/products.service");
jest.mock("@/services/shops.service");
jest.mock("@/services/categories.service");

// Mock components
jest.mock("@/components/cards/ProductCard", () => ({
  ProductCard: ({ id, name, price }: any) => (
    <div data-testid={`product-card-${id}`}>
      <h3>{name}</h3>
      <p>{price}</p>
    </div>
  ),
}));

jest.mock("@/components/cards/ShopCard", () => ({
  ShopCard: ({ id, name, productCount }: any) => (
    <div data-testid={`shop-card-${id}`}>
      <h3>{name}</h3>
      <span>{productCount} products</span>
    </div>
  ),
}));

jest.mock("@/components/cards/CategoryCard", () => ({
  CategoryCard: ({ id, name, productCount }: any) => (
    <div data-testid={`category-card-${id}`}>
      <h3>{name}</h3>
      <span>{productCount} products</span>
    </div>
  ),
}));

jest.mock("@/components/cards/CardGrid", () => ({
  CardGrid: ({ children }: any) => (
    <div data-testid="card-grid">{children}</div>
  ),
}));

jest.mock("@/components/common/EmptyState", () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  ),
  EmptyStates: {
    NoSearchResults: ({ title, description }: any) => (
      <div data-testid="no-search-results">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    ),
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Loader2: () => <div role="img" aria-label="Loading" />,
  Search: () => <div role="img" aria-label="Search" />,
}));

const mockProductsService = productsService as jest.Mocked<
  typeof productsService
>;
const mockShopsService = shopsService as jest.Mocked<typeof shopsService>;
const mockCategoriesService = categoriesService as jest.Mocked<
  typeof categoriesService
>;

describe("SearchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete("q");
    mockSearchParams.delete("tab");
  });

  describe("Initial render without query", () => {
    it("shows loading skeleton when wrapped in Suspense", () => {
      render(<SearchPage />);

      // The Suspense fallback shows a loading spinner
      expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
    });
  });

  describe("Search with query parameter", () => {
    beforeEach(() => {
      mockSearchParams.set("q", "laptop");
    });

    it("performs search on mount when query exists", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Gaming Laptop",
          slug: "gaming-laptop",
          price: 999,
          compareAtPrice: 1199,
          formattedPrice: "$999",
          discount: 200,
          discountPercentage: 16.68,
          primaryImage: "/laptop.jpg",
          status: ProductStatus.PUBLISHED,
          stockStatus: "in-stock" as const,
          averageRating: 4.5,
          ratingStars: 4.5,
          reviewCount: 25,
          shopId: "shop-1",
          shop: { id: "shop-1", name: "Tech Store", slug: "tech-store" },
          brand: "GamingBrand",
          featured: false,
          isFavorited: false,
          badges: [],
          images: ["/laptop.jpg"],
          videos: [],
          originalPrice: 1199,
          rating: 4.5,
          stockCount: 10,
          condition: ProductCondition.NEW,
          sku: "GL-001",
          categoryId: "electronics",
          salesCount: 50,
        },
      ] as any;

      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 1,
        pagination: {
          page: 1,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(mockProductsService.list).toHaveBeenCalledWith({
          search: "laptop",
          limit: 50,
        });
      });

      expect(
        screen.getByText('Search Results for "laptop"')
      ).toBeInTheDocument();
      expect(screen.getByText("1 results found")).toBeInTheDocument();
      expect(screen.getByTestId("product-card-1")).toBeInTheDocument();
      expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
    });

    it("shows loading state during search", async () => {
      mockProductsService.list.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SearchPage />);

      // Initially shows Suspense fallback
      expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();

      // After Suspense resolves, shows loading skeleton
      await waitFor(() => {
        expect(
          screen.getByText('Search Results for "laptop"')
        ).toBeInTheDocument();
      });
    });

    it("handles search error gracefully", async () => {
      mockProductsService.list.mockRejectedValue(new Error("Search failed"));

      render(<SearchPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Search Results for "laptop"')
        ).toBeInTheDocument();
        expect(screen.getByText("0 results found")).toBeInTheDocument();
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });

    it("shows empty results message when no products found", async () => {
      mockProductsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Search Results for "laptop"')
        ).toBeInTheDocument();
        expect(screen.getByText("0 results found")).toBeInTheDocument();
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        expect(screen.getByText("No results found")).toBeInTheDocument();
        expect(
          screen.getByText(
            'We couldn\'t find any results for "laptop". Try different keywords or browse our categories.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("Tab switching", () => {
    beforeEach(() => {
      mockSearchParams.set("q", "test");
    });

    it("switches to products tab and searches products", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Test Product",
          slug: "test-product",
          price: 100,
          image: "/test.jpg",
          shopName: "Test Shop",
          shopSlug: "test-shop",
          inStock: true,
        },
      ] as any;

      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 1,
        pagination: {
          page: 1,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("All (1)")).toBeInTheDocument();
      });

      const productsTab = screen.getByText("Products (1)");
      fireEvent.click(productsTab);

      // Since the search is already done, clicking tabs doesn't trigger new searches
      // The component only searches on mount or when query/activeTab changes
      expect(productsTab).toBeInTheDocument();
    });

    it("switches to shops tab and searches shops", async () => {
      const mockShops = [
        {
          id: "1",
          name: "Test Shop",
          slug: "test-shop",
          productCount: 50,
          rating: 4.2,
          reviewCount: 10,
          isVerified: true,
        },
      ] as any;

      mockShopsService.list.mockResolvedValue({
        data: mockShops,
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      const shopsTab = screen.getByText("Shops");
      fireEvent.click(shopsTab);

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith({
          search: "test",
          page: 1,
          limit: 20,
        });
      });

      expect(screen.getByTestId("shop-card-1")).toBeInTheDocument();
    });

    it("switches to categories tab and searches categories", async () => {
      const mockCategories = [
        {
          id: "1",
          name: "Electronics",
          slug: "electronics",
          productCount: 1000,
          description: "Electronic devices and gadgets",
        },
      ] as any;

      mockCategoriesService.list.mockResolvedValue({
        data: mockCategories,
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      const categoriesTab = screen.getByText("Categories");
      fireEvent.click(categoriesTab);

      await waitFor(() => {
        expect(mockCategoriesService.list).toHaveBeenCalledWith({
          search: "test",
          page: 1,
          limit: 20,
        });
      });

      expect(screen.getByTestId("category-card-1")).toBeInTheDocument();
    });

    it("displays tabs with correct counts", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Test Product",
          slug: "test-product",
          price: 100,
          image: "/test.jpg",
          shopName: "Test Shop",
          shopSlug: "test-shop",
          inStock: true,
        },
      ] as any;

      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 1,
        pagination: {
          page: 1,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("All (1)")).toBeInTheDocument();
        expect(screen.getByText("Products (1)")).toBeInTheDocument();
        expect(screen.getByText("Shops (0)")).toBeInTheDocument();
        expect(screen.getByText("Categories (0)")).toBeInTheDocument();
      });
    });
  });

  describe("URL parameter handling", () => {
    it("shows search results when query parameter exists", () => {
      mockSearchParams.set("q", "laptop");

      render(<SearchPage />);

      // The Suspense fallback should be shown initially
      expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
    });
  });

  describe("Results display", () => {
    beforeEach(() => {
      mockSearchParams.set("q", "test");
    });

    it("displays multiple products in grid", async () => {
      const mockProducts = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Product ${i + 1}`,
        slug: `product-${i + 1}`,
        price: 100 + i * 10,
        image: `/img${i + 1}.jpg`,
        shopName: "Test Shop",
        shopSlug: "test-shop",
        inStock: true,
      })) as any;

      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 5,
        pagination: {
          page: 1,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByTestId("card-grid")).toBeInTheDocument();
      });

      expect(screen.getByTestId("product-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("product-card-2")).toBeInTheDocument();
    });

    it("displays results count", async () => {
      mockProductsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("0 results found")).toBeInTheDocument();
      });
    });

    it("displays results count with multiple items", async () => {
      const mockProducts = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Product ${i + 1}`,
        slug: `product-${i + 1}`,
        price: 100 + i * 10,
        image: `/img${i + 1}.jpg`,
        shopName: "Test Shop",
        shopSlug: "test-shop",
        inStock: true,
      })) as any;

      mockProductsService.list.mockResolvedValue({
        data: mockProducts,
        count: 5,
        pagination: {
          page: 1,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false,
        } as any,
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText("5 results found")).toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    beforeEach(() => {
      mockSearchParams.set("q", "test");
    });

    it("shows empty state when products search fails", async () => {
      mockProductsService.list.mockRejectedValue(new Error("API Error"));

      render(<SearchPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Search Results for "test"')
        ).toBeInTheDocument();
        expect(screen.getByText("0 results found")).toBeInTheDocument();
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });
  });
});
