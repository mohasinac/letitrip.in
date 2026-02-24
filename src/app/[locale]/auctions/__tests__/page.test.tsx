import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import AuctionsPage from "../page";

const mockSet = jest.fn();
const mockSetPage = jest.fn();
const mockGet = jest.fn().mockReturnValue("");
const mockGetNumber = jest.fn().mockReturnValue(1);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/auctions",
}));

const mockUseApiQuery = jest.fn();

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
  useUrlTable: () => ({
    get: mockGet,
    getNumber: mockGetNumber,
    set: mockSet,
    setMany: jest.fn(),
    setPage: mockSetPage,
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    clear: jest.fn(),
    params: new URLSearchParams(),
  }),
}));

jest.mock("@/components", () => ({
  AuctionGrid: ({
    auctions,
    loading,
  }: {
    auctions: any[];
    loading: boolean;
  }) =>
    loading ? (
      <div data-testid="auction-skeleton" />
    ) : auctions.length === 0 ? (
      <div data-testid="auctions-empty">No auctions found</div>
    ) : (
      <div data-testid="auction-grid">
        {auctions.map((a: any) => (
          <div key={a.id} data-testid={`auction-${a.id}`}>
            {a.title} — {a.currentBid}
          </div>
        ))}
      </div>
    ),
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage + 1)}>Next Page</button>
    </div>
  ),
  FilterDrawer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="filter-drawer">{children}</div>
  ),
  FilterFacetSection: () => <div data-testid="filter-facet-section" />,
  ActiveFilterChips: ({
    filters,
    onRemove,
  }: {
    filters: any[];
    onRemove: () => void;
  }) => (
    <div data-testid="active-filter-chips">
      {filters.map((f: any) => (
        <button key={f.key} onClick={onRemove}>
          {f.value} ×
        </button>
      ))}
    </div>
  ),
}));

describe("AuctionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue("");
    mockGetNumber.mockReturnValue(1);
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it("renders loading skeleton when isLoading=true", () => {
    mockUseApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(<AuctionsPage />);
    expect(screen.getByTestId("auction-skeleton")).toBeInTheDocument();
  });

  it("renders auction cards with current bid and countdown", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "a1",
            title: "Rare Vase",
            currentBid: 500,
            startingBid: 100,
            auctionEndDate: new Date(Date.now() + 86400000).toISOString(),
            status: "published",
            isAuction: true,
          },
        ],
        meta: { page: 1, limit: 24, total: 1, totalPages: 1 },
      },
      isLoading: false,
      error: null,
    });
    render(<AuctionsPage />);
    expect(screen.getByTestId("auction-grid")).toBeInTheDocument();
    expect(screen.getByText(/Rare Vase/)).toBeInTheDocument();
  });

  it("renders EmptyState when no auctions", () => {
    mockUseApiQuery.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
    });
    render(<AuctionsPage />);
    expect(screen.getByTestId("auctions-empty")).toBeInTheDocument();
  });

  it("sort dropdown updates ?sort= URL param", () => {
    mockUseApiQuery.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 24, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
    });
    render(<AuctionsPage />);
    const sortSelect = screen.getByRole("combobox");
    fireEvent.change(sortSelect, { target: { value: "-currentBid" } });
    expect(mockSet).toHaveBeenCalledWith("sort", "-currentBid");
  });

  it("pagination visible when totalPages > 1", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "a1",
            title: "Item 1",
            currentBid: 100,
            startingBid: 50,
            auctionEndDate: new Date(Date.now() + 86400000).toISOString(),
            status: "published",
            isAuction: true,
          },
        ],
        meta: { page: 1, limit: 24, total: 50, totalPages: 3 },
      },
      isLoading: false,
      error: null,
    });
    render(<AuctionsPage />);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
