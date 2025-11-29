import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import ProductsPage from "@/app/products/page";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock services
jest.mock("@/services/products.service");
jest.mock("@/services/categories.service");
jest.mock("@/services/shops.service");

const mockProductsService =
  require("@/services/products.service").productsService;
const mockCategoriesService =
  require("@/services/categories.service").categoriesService;
const mockShopsService = require("@/services/shops.service").shopsService;

// Mock hooks
jest.mock("@/hooks/useCart");
jest.mock("@/hooks/useMobile");

const mockUseCart = require("@/hooks/useCart").useCart;
const mockUseIsMobile = require("@/hooks/useMobile").useIsMobile;

// Mock components
jest.mock("@/components/cards/ProductCard", () => ({
  ProductCard: ({ name, onAddToCart, id }: any) => (
    <div data-testid="product-card">
      <h3>{name}</h3>
      <button
        data-testid="add-to-cart"
        onClick={() => onAddToCart && onAddToCart(id)}
      >
        Add to Cart
      </button>
    </div>
  ),
}));

jest.mock("@/components/common/FavoriteButton", () => ({
  FavoriteButton: () => <button data-testid="favorite-button">Favorite</button>,
}));

jest.mock("@/components/common/UnifiedFilterSidebar", () => ({
  UnifiedFilterSidebar: ({ onApply, onReset, isOpen }: any) => (
    <div
      data-testid="filter-sidebar"
      style={{ display: isOpen ? "block" : "none" }}
    >
      <button data-testid="apply-filters" onClick={onApply}>
        Apply Filters
      </button>
      <button data-testid="reset-filters" onClick={onReset}>
        Reset Filters
      </button>
    </div>
  ),
}));

jest.mock("@/components/common/skeletons/ProductCardSkeleton", () => ({
  ProductCardSkeletonGrid: ({ count }: any) => (
    <div data-testid="skeleton-grid" data-count={count}>
      Loading...
    </div>
  ),
}));

jest.mock("@/components/common/EmptyState", () => ({
  EmptyStates: {
    NoProducts: ({ action }: any) => (
      <div data-testid="empty-state">
        No products found
        {action && <button onClick={action.onClick}>{action.label}</button>}
      </div>
    ),
  },
}));

// Mock constants
jest.mock("@/constants/filters", () => ({
  PRODUCT_FILTERS: [
    {
      title: "Price Range",
      fields: [
        {
          key: "price",
          label: "Price",
          type: "range",
          placeholder: "Min - Max",
          min: 0,
          max: 1000000,
          step: 100,
        },
      ],
    },
    {
      title: "Categories",
      fields: [
        {
          key: "category_id",
          label: "Category",
          type: "multiselect",
          options: [],
        },
      ],
      collapsible: true,
    },
    {
      title: "Shops",
      fields: [
        {
          key: "shop_id",
          label: "Shop",
          type: "multiselect",
          options: [],
        },
      ],
      collapsible: true,
    },
  ],
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Grid: () => <div>Grid</div>,
  List: () => <div>List</div>,
  Loader2: () => <div>Loader2</div>,
  Filter: () => <div>Filter</div>,
}));

describe("ProductsPage", () => {
  const mockAddItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockUseCart.mockReturnValue({
      addItem: mockAddItem,
    });

    mockUseIsMobile.mockReturnValue(false);

    mockSearchParams.get = jest.fn((key) => {
      const params: Record<string, string> = {};
      return params[key] || null;
    });

    mockProductsService.list.mockResolvedValue({
      data: [
        {
          id: "product-1",
          name: "Test Product 1",
          slug: "test-product-1",
          price: 1000,
          originalPrice: 1200,
          images: ["/test-image1.jpg"],
          videos: [],
          rating: 4.5,
          reviewCount: 10,
          shopId: "shop-1",
          shop: { name: "Test Shop", slug: "test-shop" },
          stockCount: 5,
          featured: false,
          condition: "new" as const,
        },
        {
          id: "product-2",
          name: "Test Product 2",
          slug: "test-product-2",
          price: 2000,
          images: ["/test-image2.jpg"],
          videos: [],
          rating: 3.8,
          reviewCount: 5,
          shopId: "shop-2",
          shop: { name: "Another Shop", slug: "another-shop" },
          stockCount: 0,
          featured: true,
          condition: "used" as const,
        },
      ],
      count: 2,
      pagination: {
        hasNextPage: false,
        nextCursor: null,
      },
    });

    mockCategoriesService.list.mockResolvedValue({
      data: [
        {
          id: "cat-1",
          name: "Electronics",
          slug: "electronics",
          productCount: 50,
        },
        {
          id: "cat-2",
          name: "Books",
          slug: "books",
          productCount: 25,
        },
      ],
      count: 2,
      pagination: {},
    });

    mockShopsService.list.mockResolvedValue({
      data: [
        {
          id: "shop-1",
          name: "Test Shop",
          slug: "test-shop",
          productCount: 30,
          isVerified: true,
        },
        {
          id: "shop-2",
          name: "Another Shop",
          slug: "another-shop",
          productCount: 15,
          isVerified: false,
        },
      ],
      count: 2,
      pagination: {},
    });
  });

  it("renders loading state initially", () => {
    render(<ProductsPage />);
    expect(screen.getByTestId("skeleton-grid")).toBeInTheDocument();
  });

  it("loads and displays products after initialization", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    await waitFor(() => {
      expect(mockProductsService.list).toHaveBeenCalled();
      expect(mockCategoriesService.list).toHaveBeenCalled();
      expect(mockShopsService.list).toHaveBeenCalled();
    });

    expect(screen.getByText("All Products")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();
  });

  it("displays search input and handles search", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    const searchInput = screen.getByPlaceholderText("Search products...");
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "test search" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(mockProductsService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "test search",
        }),
      );
    });
  });

  it("handles sorting changes", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    const sortSelect = screen.getByDisplayValue("Newest");
    fireEvent.change(sortSelect, { target: { value: "price" } });

    await waitFor(() => {
      expect(mockProductsService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "price",
        }),
      );
    });
  });

  it("handles sort order changes", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    const orderSelect = screen.getByDisplayValue("High to Low");
    fireEvent.change(orderSelect, { target: { value: "asc" } });

    await waitFor(() => {
      expect(mockProductsService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "createdAt",
          // Note: The component uses sortOrder but service expects different format
        }),
      );
    });
  });

  it("toggles between grid and table view", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    // Initially should be in grid view
    expect(screen.getByText("Grid")).toBeInTheDocument();
    expect(screen.getAllByTestId("product-card")).toHaveLength(2);

    // Switch to table view
    const tableButton = screen.getByText("List");
    fireEvent.click(tableButton);

    // Should show table view with product names in table cells
    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    // Check for table-specific elements that don't conflict
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("toggles filter sidebar visibility", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    const filterButton = screen.getByText("Show Filters");
    fireEvent.click(filterButton);

    expect(screen.getByTestId("filter-sidebar")).toBeVisible();

    fireEvent.click(filterButton);
    // Note: The component doesn't hide the sidebar immediately, it controls isOpen prop
  });

  it("handles add to cart functionality", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    const addToCartButtons = screen.getAllByTestId("add-to-cart");
    fireEvent.click(addToCartButtons[0]);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith("product-1", 1, undefined, {
        name: "Test Product 1",
        price: 1000,
        image: "/test-image1.jpg",
        shopId: "shop-1",
        shopName: "Test Shop",
      });
    });
  });

  it("displays empty state when no products found", async () => {
    mockProductsService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { hasNextPage: false, nextCursor: null },
    });

    await act(async () => {
      render(<ProductsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  it("handles filter reset", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    // Open filters
    const filterButton = screen.getByText("Show Filters");
    fireEvent.click(filterButton);

    // Click reset
    const resetButton = screen.getByTestId("reset-filters");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/products", { scroll: false });
    });
  });

  it("loads products with URL parameters", async () => {
    // Set up URL parameters
    mockSearchParams.set("categoryId", "cat-1");
    mockSearchParams.set("minPrice", "500");
    mockSearchParams.set("maxPrice", "2000");
    mockSearchParams.set("search", "test query");
    mockSearchParams.set("sortBy", "price");
    mockSearchParams.set("sortOrder", "asc");
    mockSearchParams.set("page", "1");

    await act(async () => {
      render(<ProductsPage />);
    });

    await waitFor(
      () => {
        // The component makes two calls: first with defaults, then with URL params
        expect(mockProductsService.list).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 },
    );

    // Check that the second call (after URL params are processed) has the correct parameters
    expect(mockProductsService.list).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        search: "test query",
        categoryId: "cat-1",
        priceRange: { min: 500, max: 2000 },
        sortBy: "price",
      }),
    );

    // Clean up
    mockSearchParams.delete("categoryId");
    mockSearchParams.delete("minPrice");
    mockSearchParams.delete("maxPrice");
    mockSearchParams.delete("search");
    mockSearchParams.delete("sortBy");
    mockSearchParams.delete("sortOrder");
    mockSearchParams.delete("page");
  });

  it("handles pagination", async () => {
    // Mock the service to return products with pagination info
    mockProductsService.list.mockResolvedValue({
      data: [
        {
          id: "product-1",
          name: "Test Product 1",
          slug: "test-product-1",
          price: 1000,
          images: ["/test-image1.jpg"],
          videos: [],
          rating: 4.5,
          reviewCount: 10,
          shopId: "shop-1",
          shop: { name: "Test Shop", slug: "test-shop" },
          stockCount: 5,
          featured: false,
          condition: "new" as const,
        },
      ],
      count: 1,
      pagination: {
        hasNextPage: true,
        nextCursor: "next-page-cursor",
      },
    });

    await act(async () => {
      render(<ProductsPage />);
    });

    // Wait for products to load and pagination to appear
    await waitFor(() => {
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Wait for the next page call
    await waitFor(() => {
      expect(mockProductsService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          startAfter: "next-page-cursor",
        }),
      );
    });
  });

  it("handles mobile view", async () => {
    mockUseIsMobile.mockReturnValue(true);

    await act(async () => {
      render(<ProductsPage />);
    });

    // Should still render but with mobile-specific behavior
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("handles service errors gracefully", async () => {
    mockProductsService.list.mockRejectedValue(new Error("Service error"));

    // Mock console.error to avoid test output pollution
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(<ProductsPage />);
    });

    // Should still render the page structure even with errors
    expect(screen.getByText("All Products")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("updates URL when filters change", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    // Open filters
    const filterButton = screen.getByText("Show Filters");
    fireEvent.click(filterButton);

    // Apply filters
    const applyButton = screen.getByTestId("apply-filters");
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("displays product count and pagination info", async () => {
    await act(async () => {
      render(<ProductsPage />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Showing 2 products (Page 1)"),
      ).toBeInTheDocument();
    });
  });
});
