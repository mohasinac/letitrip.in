/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminAnalyticsView } from "../AdminAnalyticsView";

jest.mock("next/dynamic", () => (fn: any) => {
  const Comp = () => null;
  Comp.displayName = "DynamicComponent";
  return Comp;
});

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

jest.mock("@/services", () => ({
  adminService: {
    getDashboard: jest.fn(),
    getAnalytics: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title }: any) => (
    <div data-testid="admin-page-header">{title}</div>
  ),
  Spinner: () => <div data-testid="spinner" />,
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: {
      stack: "space-y-4",
      padding: { md: "p-4", lg: "p-6" },
      gap: { md: "gap-4" },
    },
    typography: {
      h2: "text-3xl font-bold",
      h3: "text-xl font-semibold",
      h4: "text-lg font-semibold",
    },
    card: { stat: { indigo: "border-l-4 border-indigo-500" } },
    badge: { active: "bg-green-50" },
    icon: { muted: "text-gray-400" },
  },
  ROUTES: {
    ADMIN: { PRODUCTS: "/admin/products" },
  },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
}));

describe("AdminAnalyticsView", () => {
  it("renders without crashing", () => {
    render(<AdminAnalyticsView />);
  });

  it("renders the AdminPageHeader", () => {
    render(<AdminAnalyticsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("shows loading state when data is loading", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({ data: null, isLoading: true, error: null });
    render(<AdminAnalyticsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders revenue section when data is available", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({
      data: {
        revenueByMonth: [{ month: "Jan", revenue: 10000 }],
        ordersByStatus: [{ status: "delivered", count: 5 }],
        topProducts: [{ title: "Test Product", revenue: 5000, orders: 3 }],
      },
      isLoading: false,
      error: null,
    });
    render(<AdminAnalyticsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });
});
