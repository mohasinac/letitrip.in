import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import AdminAnalyticsPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/analytics",
}));

const mockUseApiQuery = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
}));

// Mock recharts dynamic imports
jest.mock("next/dynamic", () => (fn: any) => {
  const component = () => <div data-testid="chart-component" />;
  component.displayName = "DynamicChart";
  return component;
});

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, subtitle }: any) => (
    <div>
      <h1 data-testid="page-title">{title}</h1>
      {subtitle && <p data-testid="page-subtitle">{subtitle}</p>}
    </div>
  ),
}));

const LABELS = UI_LABELS.ADMIN_ANALYTICS;

describe("Admin Analytics Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the analytics page title", () => {
    render(<AdminAnalyticsPage />);
    expect(screen.getByTestId("page-title")).toHaveTextContent(
      LABELS.PAGE_TITLE,
    );
  });

  it("shows loading text when isLoading=true", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<AdminAnalyticsPage />);
    expect(screen.getByText(LABELS.LOADING)).toBeInTheDocument();
  });

  it("renders AdminStatsCards with revenue and orders when data is present", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: {
        data: {
          summary: {
            totalOrders: 42,
            totalRevenue: 12345,
            newOrdersThisMonth: 5,
            revenueThisMonth: 1000,
            totalProducts: 100,
            publishedProducts: 80,
          },
          ordersByMonth: [],
          topProducts: [],
        },
      },
      isLoading: false,
      error: null,
    });
    render(<AdminAnalyticsPage />);
    expect(screen.getByText(LABELS.TOTAL_ORDERS)).toBeInTheDocument();
    expect(screen.getByText(LABELS.TOTAL_REVENUE)).toBeInTheDocument();
  });

  it("does not show stats when data is null (not loading)", () => {
    mockUseApiQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: null,
    });
    render(<AdminAnalyticsPage />);
    expect(screen.queryByText(LABELS.TOTAL_ORDERS)).not.toBeInTheDocument();
  });
});
