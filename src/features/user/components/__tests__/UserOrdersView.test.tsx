/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserOrdersView } from "../UserOrdersView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "user_1" },
    loading: false,
  })),
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useUrlTable: jest.fn(() => ({
    get: jest.fn(() => ""),
    getNumber: jest.fn(() => 1),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
    buildSieveParams: jest.fn(() => ""),
  })),
}));

jest.mock("@/services", () => ({
  orderService: { list: jest.fn() },
}));

jest.mock("@/components", () => ({
  Heading: ({ children }: any) => <h1 data-testid="heading">{children}</h1>,
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  Text: ({ children }: any) => <span>{children}</span>,
  StatusBadge: ({ status }: any) => (
    <span data-testid="status-badge" data-status={status}>
      {status}
    </span>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: {
      stack: "space-y-4",
      stackSmall: "space-y-2",
      cardPadding: "p-5",
      gap: { md: "gap-4" },
    },
    typography: { caption: "text-xs text-gray-500" },
  },
  ROUTES: { PUBLIC: { PRODUCTS: "/products" }, AUTH: { LOGIN: "/auth/login" } },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatDate: (d: any) => String(d),
}));

describe("UserOrdersView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<UserOrdersView />);
  });

  it("shows empty state when no orders", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({
      data: {
        orders: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      },
      isLoading: false,
      error: null,
    });
    render(<UserOrdersView />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders status filter tabs", () => {
    render(<UserOrdersView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders TablePagination when data is available", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({
      data: {
        orders: [
          {
            id: "ord_1",
            orderNumber: "ORD-001",
            total: 1000,
            status: "delivered",
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        totalPages: 2,
      },
      isLoading: false,
      error: null,
    });
    render(<UserOrdersView />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });
});
