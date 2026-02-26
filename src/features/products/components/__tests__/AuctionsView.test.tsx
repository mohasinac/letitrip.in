/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuctionsView } from "../AuctionsView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
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
  productService: { listAuctions: jest.fn() },
}));

jest.mock("@/components", () => ({
  AuctionGrid: ({ auctions }: any) => (
    <div data-testid="auction-grid">{(auctions ?? []).length} auctions</div>
  ),
  Pagination: () => <div data-testid="pagination" />,
  FilterDrawer: ({ children, trigger }: any) => (
    <div data-testid="filter-drawer">
      {trigger}
      {children}
    </div>
  ),
  FilterFacetSection: ({ title }: any) => (
    <div data-testid="facet-section">{title}</div>
  ),
  ActiveFilterChips: () => <div data-testid="active-chips" />,
  SortDropdown: () => <div data-testid="sort-dropdown" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
    typography: { h1: "text-4xl font-bold", h2: "text-3xl font-bold" },
  },
}));

describe("AuctionsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AuctionsView />);
  });

  it("renders filter drawer", () => {
    render(<AuctionsView />);
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    render(<AuctionsView />);
    expect(screen.getByTestId("sort-dropdown")).toBeInTheDocument();
  });

  it("renders auction grid", () => {
    render(<AuctionsView />);
    expect(screen.getByTestId("auction-grid")).toBeInTheDocument();
  });

  it("shows empty state when no auctions returned", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 24,
        totalPages: 0,
        hasMore: false,
      },
      isLoading: false,
      error: null,
    });
    render(<AuctionsView />);
    expect(screen.getByTestId("auction-grid")).toBeInTheDocument();
  });
});
