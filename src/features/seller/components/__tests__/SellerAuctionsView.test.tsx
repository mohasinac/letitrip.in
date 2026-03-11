/**
 * SellerAuctionsView tests
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/seller/auctions",
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useAuth: jest.fn(() => ({
    user: { uid: "seller-1", email: "s@e.com", displayName: "Seller" },
    loading: false,
  })),
  useApiQuery: jest.fn(() => ({
    data: {
      products: [],
      meta: { total: 0, page: 1, limit: 24, totalPages: 0, hasMore: false },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useUrlTable: jest.fn(() => ({
    get: jest.fn().mockReturnValue(""),
    getNumber: jest.fn().mockReturnValue(1),
    set: jest.fn(),
    setPage: jest.fn(),
    setSort: jest.fn(),
    params: new URLSearchParams(),
  })),
}));

jest.mock("@/services", () => ({
  sellerService: {
    listMyProducts: jest.fn().mockResolvedValue({
      products: [],
      meta: { total: 0, page: 1, limit: 24, totalPages: 0, hasMore: false },
    }),
  },
}));

jest.mock("lucide-react", () => ({
  Gavel: () => <span data-testid="icon-gavel" />,
}));

jest.mock("@/components", () => ({
  Spinner: ({ size }: any) => <div data-testid={`spinner-${size}`} />,
  Input: ({ placeholder }: any) => (
    <input data-testid="search-input" placeholder={placeholder} />
  ),
  DataTable: ({ loading, emptyTitle }: any) => (
    <div data-testid="data-table">
      {loading && <div data-testid="table-loading" />}
      {emptyTitle && <div data-testid="empty-title">{emptyTitle}</div>}
    </div>
  ),
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="filter-bar">{children}</div>
  ),
  TablePagination: ({ total }: any) => (
    <div data-testid="pagination">{total}</div>
  ),
}));

jest.mock("../SellerProductCard", () => ({
  SellerProductCard: ({ product }: any) => (
    <div data-testid="seller-product-card">{product?.title}</div>
  ),
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    SELLER: { PRODUCTS: "/seller/products" },
  },
  THEME_CONSTANTS: { spacing: { stack: "space-y-4" } },
}));

import { SellerAuctionsView } from "../SellerAuctionsView";

describe("SellerAuctionsView", () => {
  it("renders filter bar and data table without crashing", () => {
    render(<SellerAuctionsView />);
    expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("shows empty title when no auctions", () => {
    render(<SellerAuctionsView />);
    expect(screen.getByTestId("empty-title")).toHaveTextContent("noAuctions");
  });

  it("does not render pagination when total is 0", () => {
    render(<SellerAuctionsView />);
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("calls sellerService.listMyProducts with auction filter", () => {
    const { sellerService } = require("@/services");
    const { useApiQuery } = require("@/hooks");
    render(<SellerAuctionsView />);
    const opts = (useApiQuery as jest.Mock).mock.calls[0]?.[0];
    if (opts?.queryFn) opts.queryFn();
    expect(sellerService.listMyProducts).toHaveBeenCalledWith(
      expect.stringContaining("isAuction"),
    );
  });

  it("shows pagination when total > 0", () => {
    const { useApiQuery } = require("@/hooks");
    (useApiQuery as jest.Mock).mockReturnValueOnce({
      data: {
        products: [{ id: "a-1", title: "Vintage Camera" }],
        meta: { total: 10, page: 1, limit: 24, totalPages: 1, hasMore: false },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SellerAuctionsView />);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
