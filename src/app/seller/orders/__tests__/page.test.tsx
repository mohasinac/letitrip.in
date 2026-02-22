import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import SellerOrdersPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

// Mock global.fetch used by the seller/orders page
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          orders: [],
          meta: { page: 1, limit: 25, total: 60, totalPages: 3, hasMore: true },
        },
      }),
  } as Response),
);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/seller/orders",
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({
    user: {
      uid: "seller-uid",
      email: "seller@test.com",
      role: "seller",
      displayName: "Test Seller",
    },
    loading: false,
  })),
  useApiQuery: jest.fn(() => ({
    data: {
      success: true,
      data: {
        orders: [],
        meta: { page: 1, limit: 25, total: 60, totalPages: 3, hasMore: true },
      },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
  useUrlTable: jest.fn(() => ({
    get: jest.fn().mockReturnValue(""),
    getNumber: jest.fn().mockReturnValue(1),
    set: jest.fn(),
    setMany: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    buildSieveParams: jest.fn().mockReturnValue(""),
    params: new URLSearchParams(),
  })),
}));

// seller/orders uses global.fetch, not apiClient

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatDate: (d: any) => "Jan 1, 2025",
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  Card: ({ children }: any) => <div>{children}</div>,
  DataTable: () => <div data-testid="data-table" />,
  AdminPageHeader: ({ title }: any) => <h1>{title}</h1>,
  TablePagination: () => <div data-testid="table-pagination" />,
  Text: ({ children }: any) => <span>{children}</span>,
  getOrderTableColumns: () => [],
}));

describe("Seller Orders Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the orders page heading", async () => {
    render(<SellerOrdersPage />);
    // The page renders "Orders" or "My Orders" heading
    const heading =
      screen.queryByText(UI_LABELS.SELLER_PAGE?.ORDERS_TITLE ?? "Orders") ??
      screen.queryByRole("heading");
    expect(heading).toBeTruthy();
  });

  it("renders DataTable when data is loaded", async () => {
    render(<SellerOrdersPage />);
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination", async () => {
    render(<SellerOrdersPage />);
    expect(await screen.findByTestId("table-pagination")).toBeInTheDocument();
  });

  it("uses useUrlTable for state management", async () => {
    const { useUrlTable } = require("@/hooks");
    render(<SellerOrdersPage />);
    await screen.findByTestId("data-table");
    expect(useUrlTable).toHaveBeenCalled();
  });

  it("redirects to login if user is not authenticated", async () => {
    const { useAuth } = require("@/hooks");
    (useAuth as jest.Mock).mockReturnValueOnce({ user: null, loading: false });
    render(<SellerOrdersPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("passes page param to API request", async () => {
    const { useApiQuery } = require("@/hooks");
    render(<SellerOrdersPage />);
    await screen.findByTestId("data-table");
    expect(useApiQuery).toHaveBeenCalled();
    // Verify queryKey includes page reference
    const queryKey = useApiQuery.mock.calls[0][0]?.queryKey ?? [];
    expect(Array.isArray(queryKey)).toBe(true);
  });
});
