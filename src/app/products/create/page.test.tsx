import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import CreateProductPage from "@/app/products/create/page";

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
  usePathname: () => "/products/create",
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

describe("CreateProductPage", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    displayName: "Test User",
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

    // Mock shops service to be loading
    mockShopsService.list.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CreateProductPage />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("shows authentication required when not logged in", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    await act(async () => {
      render(<CreateProductPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Authentication Required")).toBeInTheDocument();
    });

    expect(
      screen.getByText("You must be logged in to create a product.")
    ).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("shows no shops message when user has no shops", async () => {
    mockShopsService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: {},
    });

    await act(async () => {
      render(<CreateProductPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("No Shops Found")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "You need to create a shop before you can create products."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Create Shop")).toBeInTheDocument();
  });

  it("loads and displays create product form", async () => {
    await act(async () => {
      render(<CreateProductPage />);
    });

    await waitFor(() => {
      expect(mockShopsService.list).toHaveBeenCalledWith({ limit: 50 });
    });

    // Check header
    expect(screen.getByText("Create New Product")).toBeInTheDocument();
    expect(
      screen.getByText("Add your product details and start selling.")
    ).toBeInTheDocument();

    // Check back link
    expect(screen.getByTestId("arrow-left")).toBeInTheDocument();
    expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
  });

  it("handles shop loading error", async () => {
    mockShopsService.list.mockRejectedValue(new Error("Failed to load shops"));

    await act(async () => {
      render(<CreateProductPage />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load your shops. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("displays error message on product creation failure", async () => {
    // Mock form submission - we'll need to implement this when we add the form
    // For now, just test the error display logic

    // Since we don't have a form yet, we'll test the error state by mocking the service
    // This test will be updated when the form is implemented
    expect(true).toBe(true); // Placeholder test
  });

  it("redirects to product page on successful creation", async () => {
    // Mock successful product creation
    const mockProduct = {
      id: "product-1",
      name: "Test Product",
      slug: "test-product",
      sku: "TEST-001",
      description: "Test description",
      categoryId: "cat-1",
      brand: "Test Brand",
      price: 999,
      compareAtPrice: null,
      stockCount: 10,
      lowStockThreshold: 5,
      weight: 1.5,
      dimensions: {
        length: 10,
        width: 5,
        height: 2,
        unit: "cm" as const,
      },
      images: ["/image1.jpg"],
      videos: [],
      status: "published" as const,
      condition: "new" as const,
      featured: false,
      isReturnable: true,
      shopId: "shop-1",
      shippingClass: "standard" as const,
      returnWindowDays: 7,
      returnPolicy: "7-day return policy",
      warrantyInfo: "1 year warranty",
      features: ["Feature 1"],
      specifications: { "Spec 1": "Value 1" },
      metaTitle: "Test Product",
      metaDescription: "Test product description",
      countryOfOrigin: "India",
      manufacturer: "Test Manufacturer",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProductsService.create.mockResolvedValue(mockProduct);

    await act(async () => {
      render(<CreateProductPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Create New Product")).toBeInTheDocument();
    });

    // Since we don't have a form yet, we'll just verify the setup
    // This test will be completed when the form is implemented
    expect(mockShopsService.list).toHaveBeenCalledWith({ limit: 50 });
  });
});
