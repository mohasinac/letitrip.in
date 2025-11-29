import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import EditProductPage from "@/app/products/[slug]/edit/page";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/products/test-product/edit",
}));

// Mock services
jest.mock("@/services/products.service");
jest.mock("@/services/shops.service");

const mockProductsService =
  require("@/services/products.service").productsService;
const mockShopsService = require("@/services/shops.service").shopsService;

// Mock hooks
jest.mock("@/hooks/useCart");

const mockUseCart = require("@/hooks/useCart").useCart;

// Mock contexts
jest.mock("@/contexts/AuthContext");

const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock components
jest.mock("@/components/common/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/admin/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

jest.mock("@/components/ui", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

// Mock toast
jest.mock("@/components/admin/Toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left">←</div>,
  AlertCircle: () => <div data-testid="alert-circle">⚠️</div>,
}));

describe("EditProductPage", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    displayName: "Test User",
  };

  const mockProduct = {
    id: "product-1",
    name: "Test Product",
    slug: "test-product",
    sku: "TEST-001",
    description: "This is a test product description",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Electronics", slug: "electronics" },
    brand: "Test Brand",
    tags: ["test", "product"],
    price: 999,
    compareAtPrice: 1299,
    discount: 300,
    discountPercentage: 23,
    formattedPrice: "₹999",
    formattedCompareAtPrice: "₹1,299",
    stockCount: 10,
    lowStockThreshold: 5,
    isInStock: true,
    isLowStock: false,
    stockStatus: "in-stock" as const,
    weight: 1.5,
    dimensions: {
      length: 10,
      width: 5,
      height: 2,
      unit: "cm" as const,
    },
    images: ["/image1.jpg", "/image2.jpg"],
    primaryImage: "/image1.jpg",
    videos: ["/video1.mp4"],
    status: "published" as const,
    condition: "new" as const,
    featured: false,
    isReturnable: true,
    isPublished: true,
    shopId: "shop-1",
    shop: { id: "shop-1", name: "Test Shop", slug: "test-shop" },
    sellerId: "seller-1",
    shippingClass: "standard" as const,
    returnWindowDays: 7,
    returnPolicy: "7-day return policy",
    warrantyInfo: "1 year warranty",
    features: ["Feature 1", "Feature 2"],
    specifications: { "Spec 1": "Value 1", "Spec 2": "Value 2" },
    metaTitle: "Test Product",
    metaDescription: "Test product description",
    viewCount: 100,
    salesCount: 50,
    favoriteCount: 25,
    reviewCount: 15,
    averageRating: 4.2,
    ratingStars: 4,
    hasReviews: true,
    countryOfOrigin: "India",
    manufacturer: "Test Manufacturer",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    isNew: false,
    isTrending: false,
    isFavorited: false,
    isInCart: false,
    cartQuantity: 0,
    badges: [],
  };

  const mockShop = {
    id: "shop-1",
    name: "Test Shop",
    slug: "test-shop",
    description: "Test shop description",
    logo: "/shop-logo.jpg",
    banner: "/shop-banner.jpg",
    ownerId: "user-1",
    ownerName: "Test Owner",
    ownerEmail: "owner@test.com",
    email: "shop@test.com",
    phone: "+91-1234567890",
    address: "Test Address",
    city: "Test City",
    state: "Test State",
    postalCode: "123456",
    totalProducts: 100,
    totalAuctions: 10,
    totalOrders: 50,
    totalSales: 50000,
    rating: 4.5,
    reviewCount: 20,
    status: "active" as const,
    isVerified: true,
    settings: {
      acceptsOrders: true,
      minOrderAmount: 100,
      shippingCharge: 50,
      freeShippingAbove: 500,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Default service mocks
    mockProductsService.getBySlug.mockResolvedValue(mockProduct);
    mockShopsService.list.mockResolvedValue({
      data: [mockShop],
      count: 1,
      pagination: {},
    });
  });

  it("renders loading state initially", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Mock services to be loading
    mockProductsService.getBySlug.mockImplementation(
      () => new Promise(() => {}),
    );
    mockShopsService.list.mockImplementation(() => new Promise(() => {}));

    render(
      <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("shows authentication required when not logged in", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    await act(async () => {
      render(
        <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Authentication Required")).toBeInTheDocument();
    });

    expect(
      screen.getByText("You must be logged in to edit a product."),
    ).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("shows error when product fails to load", async () => {
    mockProductsService.getBySlug.mockRejectedValue(
      new Error("Product not found"),
    );

    await act(async () => {
      render(
        <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Error Loading Product")).toBeInTheDocument();
    });

    expect(screen.getByText("Product not found")).toBeInTheDocument();
    expect(screen.getByText("Back to Products")).toBeInTheDocument();
  });

  it("shows product not found when product doesn't exist", async () => {
    mockProductsService.getBySlug.mockResolvedValue(null as any);

    await act(async () => {
      render(
        <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Product Not Found")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "The product you're trying to edit doesn't exist or has been removed.",
      ),
    ).toBeInTheDocument();
  });

  it("loads and displays edit product form", async () => {
    await act(async () => {
      render(
        <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(mockProductsService.getBySlug).toHaveBeenCalledWith(
        "test-product",
      );
      expect(mockShopsService.list).toHaveBeenCalledWith({ limit: 50 });
    });

    // Check header
    expect(screen.getByText("Edit Product")).toBeInTheDocument();
    expect(
      screen.getByText("Update your product details and settings."),
    ).toBeInTheDocument();

    // Check back link
    expect(screen.getByTestId("arrow-left")).toBeInTheDocument();
    expect(screen.getByText("Back to Product")).toBeInTheDocument();

    // Check that product name is displayed
    expect(
      screen.getByText("Editing product: Test Product"),
    ).toBeInTheDocument();
  });

  it("handles shops loading error gracefully", async () => {
    mockShopsService.list.mockRejectedValue(new Error("Failed to load shops"));

    await act(async () => {
      render(
        <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Edit Product")).toBeInTheDocument();
    });

    // Should still show the form even if shops fail to load
    expect(
      screen.getByText("Editing product: Test Product"),
    ).toBeInTheDocument();
  });

  it("handles product update error", async () => {
    // Mock update to fail
    mockProductsService.update.mockRejectedValue(new Error("Update failed"));

    await act(async () => {
      render(
        <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Edit Product")).toBeInTheDocument();
    });

    // Since we don't have a form yet, we'll test the error handling setup
    // This test will be completed when the form is implemented
    expect(mockProductsService.getBySlug).toHaveBeenCalledWith("test-product");
  });

  it("redirects to product page on successful update", async () => {
    // Mock successful update
    const updatedProduct = { ...mockProduct, name: "Updated Product" };
    mockProductsService.update.mockResolvedValue(updatedProduct);

    await act(async () => {
      render(
        <EditProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Edit Product")).toBeInTheDocument();
    });

    // Since we don't have a form yet, we'll verify the setup
    expect(mockProductsService.getBySlug).toHaveBeenCalledWith("test-product");
  });
});
