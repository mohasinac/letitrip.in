/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SellerOrdersView } from "../SellerOrdersView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useAuth: jest.fn(() => ({
    user: { uid: "seller_1", role: "seller" },
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
  sellerService: { listOrders: jest.fn() },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title }: any) => (
    <div data-testid="admin-page-header">{title}</div>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  DataTable: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <span>{columns?.length ?? 0} cols</span>
      <span>{(data ?? []).length} rows</span>
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  Text: ({ children }: any) => <span>{children}</span>,
  Spinner: () => <div data-testid="spinner" />,
  useOrderTableColumns: () => [
    { key: "id", header: "Order ID" },
    { key: "total", header: "Total" },
  ],
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      borderColor: "border-gray-200",
    },
    spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
    tab: { inactive: "border-transparent text-gray-500 hover:text-gray-700" },
  },
  ROUTES: { SELLER: { DASHBOARD: "/seller" } },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
}));

describe("SellerOrdersView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<SellerOrdersView />);
  });

  it("renders AdminPageHeader", () => {
    render(<SellerOrdersView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders order DataTable", () => {
    render(<SellerOrdersView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders status filter tabs", () => {
    render(<SellerOrdersView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
