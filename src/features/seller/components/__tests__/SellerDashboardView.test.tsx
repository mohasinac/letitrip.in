/**
 * SellerDashboardView tests
 */
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

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params?.name) return `Welcome, ${params.name}!`;
    return key;
  },
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
}));

// Mock internal seller components (feature-local)
jest.mock("../SellerStatCard", () => ({
  SellerStatCard: ({ label, value }: { label: string; value: number }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

jest.mock("../SellerQuickActions", () => ({
  SellerQuickActions: () => <div data-testid="quick-actions" />,
}));

jest.mock("../SellerRecentListings", () => ({
  SellerRecentListings: ({ products }: { products: any[] }) => (
    <div data-testid="recent-listings">{products.length} products</div>
  ),
}));

jest.mock("@/components/typography", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock("@/constants", () => ({
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
}));

jest.mock("@/services", () => ({
  sellerService: {
    listProducts: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

import { SellerDashboardView } from "../SellerDashboardView";

describe("SellerDashboardView", () => {
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
    render(<SellerDashboardView />);
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("renders spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<SellerDashboardView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders 4 stat cards when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: {
        items: [
          { id: "p1", status: "published", isAuction: false, price: 100 },
          { id: "p2", status: "published", isAuction: true, price: 200 },
        ],
        total: 2,
      },
      isLoading: false,
      error: null,
    });
    render(<SellerDashboardView />);
    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards.length).toBe(4);
  });

  it("renders EmptyState when seller has no products", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    });
    render(<SellerDashboardView />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders quick actions and recent listings", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: {
        items: [
          { id: "p1", status: "published", isAuction: false, price: 100 },
        ],
        total: 1,
      },
      isLoading: false,
      error: null,
    });
    render(<SellerDashboardView />);
    expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    expect(screen.getByTestId("recent-listings")).toBeInTheDocument();
  });

  it("shows null when user is absent without loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    const { container } = render(<SellerDashboardView />);
    // redirected + nothing rendered except push call
    expect(container.firstChild).toBeNull();
  });
});
