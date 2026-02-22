import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockUseAuth = jest.fn();
const mockUseApiQuery = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/seller",
}));

jest.mock("@/hooks", () => ({
  useAuth: () => mockUseAuth(),
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
}));

jest.mock("lucide-react", () => ({
  Package: () => <span data-testid="icon-package" />,
  Store: () => <span data-testid="icon-store" />,
  Gavel: () => <span data-testid="icon-gavel" />,
  FileText: () => <span data-testid="icon-filetext" />,
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
  SellerStatCard: ({ label, value }: { label: string; value: number }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  SellerQuickActions: () => <div data-testid="quick-actions" />,
  SellerRecentListings: ({ products }: { products: any[] }) => (
    <div data-testid="recent-listings">{products.length} products</div>
  ),
}));

jest.mock("@/components/typography", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    SELLER_PAGE: {
      WELCOME: (name: string) => `Welcome, ${name}!`,
      SUBTITLE: "Manage your store",
      TOTAL_PRODUCTS: "Total Products",
      ACTIVE_LISTINGS: "Active Listings",
      ACTIVE_AUCTIONS: "Active Auctions",
      DRAFT_PRODUCTS: "Drafts",
      NO_PRODUCTS: "No products yet",
      NO_PRODUCTS_SUBTITLE: "Start listing today",
      ADD_PRODUCT: "Add Product",
      PRODUCTS_TITLE: "My Products",
      PRODUCTS_SUBTITLE: "Manage your listings",
      ORDERS_TITLE: "My Orders",
      ORDERS_SUBTITLE: "View your sales",
    },
  },
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    SELLER: { PRODUCTS: "/seller/products" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { stack: "space-y-4" },
    enhancedCard: { stat: { indigo: "", emerald: "", teal: "", amber: "" } },
  },
  API_ENDPOINTS: {
    PRODUCTS: { LIST: "/api/products" },
  },
}));

import SellerDashboardPage from "../page";

describe("SellerDashboardPage", () => {
  const mockSeller = {
    uid: "seller-1",
    email: "seller@example.com",
    displayName: "Jane Seller",
    role: "seller",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it("redirects to login when not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<SellerDashboardPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("renders spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<SellerDashboardPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders stat cards when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [
          { id: "p1", status: "published", isAuction: false, price: 100 },
          { id: "p2", status: "published", isAuction: true, price: 200 },
        ],
        meta: { total: 2, page: 1, limit: 200, totalPages: 1 },
      },
      isLoading: false,
      error: null,
    });
    render(<SellerDashboardPage />);
    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards.length).toBe(4);
  });

  it("renders EmptyState when seller has no products", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [],
        meta: { total: 0, page: 1, limit: 200, totalPages: 0 },
      },
      isLoading: false,
      error: null,
    });
    render(<SellerDashboardPage />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders quick actions and recent listings", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [{ id: "p1", status: "published", isAuction: false, price: 100 }],
        meta: { total: 1, page: 1, limit: 200, totalPages: 1 },
      },
      isLoading: false,
      error: null,
    });
    render(<SellerDashboardPage />);
    expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    expect(screen.getByTestId("recent-listings")).toBeInTheDocument();
  });
});
