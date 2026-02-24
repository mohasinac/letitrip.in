import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockUseAuth = jest.fn();
const mockUseApiQuery = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/seller/analytics",
}));

jest.mock("@/hooks", () => ({
  useAuth: () => mockUseAuth(),
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  SellerAnalyticsStats: ({ summary }: { summary: any }) => (
    <div data-testid="analytics-stats">
      <span>{summary?.totalRevenue}</span>
    </div>
  ),
  SellerRevenueChart: ({ data }: { data: any[] }) => (
    <div data-testid="revenue-chart">{data.length} months</div>
  ),
  SellerTopProducts: ({ products }: { products: any[] }) => (
    <div data-testid="top-products">{products.length} products</div>
  ),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    SELLER_ANALYTICS: {
      PAGE_TITLE: "Analytics",
      PAGE_SUBTITLE: "Track your performance",
      LOADING: "Loading analytics...",
      NO_DATA: "No analytics data yet",
      NO_DATA_DESC: "Start selling to see your stats",
    },
  },
  ROUTES: {
    SELLER: { DASHBOARD: "/seller" },
    AUTH: { LOGIN: "/auth/login" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { stack: "space-y-4" },
    typography: { h3: "text-2xl font-bold" },
  },
  API_ENDPOINTS: {
    SELLER: { ANALYTICS: "/api/seller/analytics" },
  },
}));

import SellerAnalyticsPage from "../page";

describe("SellerAnalyticsPage", () => {
  const mockSeller = {
    uid: "seller-1",
    email: "seller@example.com",
    role: "seller",
  };

  const mockAnalyticsData = {
    data: {
      summary: {
        totalRevenue: 50000,
        totalOrders: 120,
        averageOrderValue: 416.67,
        conversionRate: 3.2,
      },
      revenueByMonth: [
        { month: "Jan", revenue: 10000 },
        { month: "Feb", revenue: 15000 },
      ],
      topProducts: [
        { id: "p1", title: "Top Seller", revenue: 20000, orderCount: 50 },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders spinner while auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<SellerAnalyticsPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders loading text while data is fetching", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<SellerAnalyticsPage />);
    expect(screen.getByText("Loading analytics...")).toBeInTheDocument();
  });

  it("renders analytics stats after data loads", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    });
    render(<SellerAnalyticsPage />);
    expect(screen.getByTestId("analytics-stats")).toBeInTheDocument();
  });

  it("renders revenue chart after data loads", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    });
    render(<SellerAnalyticsPage />);
    expect(screen.getByTestId("revenue-chart")).toBeInTheDocument();
    expect(screen.getByText("2 months")).toBeInTheDocument();
  });

  it("renders no-data message when summary is null", () => {
    mockUseAuth.mockReturnValue({ user: mockSeller, loading: false });
    mockUseApiQuery.mockReturnValue({
      data: { data: { summary: null, revenueByMonth: [], topProducts: [] } },
      isLoading: false,
      error: null,
    });
    render(<SellerAnalyticsPage />);
    expect(screen.getByText("No analytics data yet")).toBeInTheDocument();
  });
});
