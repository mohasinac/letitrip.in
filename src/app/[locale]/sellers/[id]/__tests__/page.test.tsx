import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import SellerDetailPage from "../page";
import { THEME_CONSTANTS } from "@/constants";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ id: "seller-123" }),
  usePathname: () => "/sellers/seller-123",
}));

let mockFetchFn: jest.Mock;

const mockSellerData = {
  user: {
    uid: "seller-123",
    displayName: "Test Seller",
    photoURL: null,
    email: "seller@test.com",
    role: "seller",
    averageRating: 4.5,
    totalReviews: 12,
    publicProfile: {
      bio: "Quality handmade goods",
      location: "Delhi, India",
    },
    createdAt: new Date().toISOString(),
  },
};

beforeEach(() => {
  mockFetchFn = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSellerData),
    }),
  );
  global.fetch = mockFetchFn as unknown as typeof fetch;
  // Page uses useApiQuery (apiClient.get) — wire it to return seller data
  mockUseApiQuery.mockImplementation(() => ({
    data: mockSellerData,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }));
});

const mockUseApiQuery: jest.Mock = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  useApiQuery: (...args: any[]) => (mockUseApiQuery as any)(...args),
  useSellerStorefront: (sellerId: string) => {
    const result = (mockUseApiQuery as any)({
      queryKey: ["sellerStorefront", sellerId],
      queryFn: jest.fn(),
    });
    return {
      seller: result.data?.user ?? null,
      loading: result.isLoading,
      profileError: result.data?.user === null ? "Seller not found" : null,
      productsData: null,
      productsLoading: false,
      reviewsData: null,
      reviewsLoading: false,
    };
  },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (n: number) => `₹${n}`,
  formatDate: (d: string) => d,
  formatMonthYear: (d: string) => d,
  truncate: (s: string, n: number) => s.slice(0, n),
}));

jest.mock("@/classes", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    SELLER_STOREFRONT: {
      LOADING: "Loading storefront...",
      NOT_FOUND: "Seller not found",
      NOT_FOUND_DESC: "This seller profile could not be found.",
      BACK: "Back to Sellers",
      MEMBER_SINCE: "Member since",
      PRODUCTS_TITLE: "Products",
      REVIEWS_TITLE: "Reviews",
      TOTAL_PRODUCTS: "Products Listed",
      TOTAL_SALES: "Items Sold",
      TOTAL_REVIEWS: "Reviews",
      NO_PRODUCTS: "No products listed",
      NO_PRODUCTS_DESC: "This seller hasn't listed any products yet.",
      NO_REVIEWS: "No reviews yet",
      NO_REVIEWS_DESC: "Be the first to review this seller's products.",
      VISIT_PROFILE: "View Full Profile",
      AUCTION_BADGE: "Auction",
      VERIFIED_PURCHASE: "Verified",
    },
    ACTIONS: { GO_HOME: "Go Home" },
  },
  ROUTES: {
    PUBLIC: { SELLERS: "/sellers", PROFILE: (id: string) => `/profile/${id}` },
    HOME: "/",
  },
  THEME_CONSTANTS: {
    rating: { filled: "text-yellow-400", empty: "text-gray-300" },
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4" },
    },
    typography: {
      h2: "text-2xl font-bold",
      h3: "text-xl font-bold",
      h4: "text-lg font-semibold",
    },
    borderRadius: { xl: "rounded-xl" },
  },
  API_ENDPOINTS: {
    PRODUCTS: { LIST: "/api/products" },
    PROFILE: {
      GET_BY_ID: (id: string) => `/api/profile/${id}`,
      GET_STOREFRONT_PRODUCTS: (id: string) => `/api/profile/${id}/products`,
      GET_SELLER_REVIEWS: (id: string) => `/api/profile/${id}/reviews`,
    },
  },
  ERROR_MESSAGES: {
    GENERIC: {
      PROFILE_PRIVATE: "Profile is private",
      INTERNAL_ERROR: "Something went wrong",
    },
  },
}));

jest.mock("@/components", () => ({
  AvatarDisplay: ({ src, name, size }: any) => (
    <div data-testid="seller-avatar" data-size={size} data-name={name}>
      {src ? <img src={src} alt={name} /> : <span>{name?.[0]}</span>}
    </div>
  ),
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  StatusBadge: ({ status }: any) => (
    <span data-testid="status-badge">{status}</span>
  ),
  Text: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  Alert: ({ children, type }: any) => (
    <div data-testid="alert" data-type={type}>
      {children}
    </div>
  ),
  SellerStorefrontView: ({ seller }: any) => (
    <div>
      <div data-testid="seller-avatar" data-name={seller?.displayName} />
      <h2>{seller?.displayName}</h2>
      <p>{seller?.publicProfile?.bio}</p>
    </div>
  ),
}));

describe("Seller Detail Page (/sellers/[id])", () => {
  afterEach(() => jest.clearAllMocks());

  it("shows loading state while fetching seller data", () => {
    // Override useApiQuery to simulate pending state
    mockUseApiQuery.mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    }));
    render(<SellerDetailPage />);
    // Page renders its own inline spinner (animate-spin class) with loading text
    expect(
      screen.getByText("Loading storefront...") ||
        document.querySelector(".animate-spin"),
    ).toBeTruthy();
  });

  it("renders seller name after successful fetch", async () => {
    render(<SellerDetailPage />);
    await waitFor(() => {
      expect(screen.getByText("Test Seller")).toBeInTheDocument();
    });
  });

  it("renders AvatarDisplay for the seller", async () => {
    render(<SellerDetailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("seller-avatar")).toBeInTheDocument();
    });
  });

  it("renders seller bio", async () => {
    render(<SellerDetailPage />);
    await waitFor(() => {
      expect(screen.getByText("Quality handmade goods")).toBeInTheDocument();
    });
  });

  it("shows not-found state when fetch returns no data", async () => {
    mockUseApiQuery.mockImplementation(() => ({
      data: { user: null },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    }));
    render(<SellerDetailPage />);
    await waitFor(() => {
      const notFound =
        screen.queryByText("Seller not found") ||
        screen.queryByTestId("empty-state");
      expect(notFound).toBeTruthy();
    });
  });

  it("calls useApiQuery with the seller id from useParams", async () => {
    render(<SellerDetailPage />);
    // The page uses apiClient.get() inside useApiQuery — not global.fetch directly.
    // Verify useApiQuery was invoked with a queryKey containing the seller ID.
    await waitFor(() => {
      expect(mockUseApiQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["seller-123"]),
        }),
      );
    });
  });
});
