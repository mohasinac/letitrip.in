import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import ProductsPage from "../page";

const mockSet = jest.fn();
const mockClear = jest.fn();
const mockSetPage = jest.fn();
const mockGetNumber = jest.fn().mockReturnValue(1);
const mockGet = jest.fn().mockReturnValue("");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/products",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useUrlTable: () => ({
    get: mockGet,
    getNumber: mockGetNumber,
    set: mockSet,
    setMany: jest.fn(),
    setPage: mockSetPage,
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    clear: mockClear,
    params: new URLSearchParams(),
  }),
}));

jest.mock("@/components", () => ({
  ProductGrid: ({
    loading,
    products,
  }: {
    loading: boolean;
    products: any[];
  }) =>
    loading ? (
      <div data-testid="product-grid-skeleton" />
    ) : (
      <div data-testid="product-grid">
        {products?.map((p: any) => (
          <div key={p.id} data-testid={`product-${p.id}`}>
            {p.title}
          </div>
        ))}
      </div>
    ),
  ProductFilters: () => <div data-testid="product-filters" />,
  ProductSortBar: ({ onSortChange }: { onSortChange: (v: string) => void }) => (
    <div data-testid="product-sort-bar">
      <button onClick={() => onSortChange("price")}>Sort</button>
    </div>
  ),
  FilterDrawer: ({
    children,
    activeCount,
  }: {
    children: React.ReactNode;
    activeCount: number;
  }) => (
    <div data-testid="filter-drawer" data-active-count={activeCount}>
      <button>Filters {activeCount > 0 ? `(${activeCount})` : ""}</button>
      {children}
    </div>
  ),
  ActiveFilterChips: ({
    filters,
    onRemove,
    onClearAll,
  }: {
    filters: any[];
    onRemove: (k: string) => void;
    onClearAll: () => void;
  }) => (
    <div data-testid="active-filter-chips">
      {filters.map((f) => (
        <button key={f.key} onClick={() => onRemove(f.key)}>
          {f.label}: {f.value} ×
        </button>
      ))}
      {filters.length > 1 && <button onClick={onClearAll}>Clear all</button>}
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
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
  PRODUCT_SORT_VALUES: { NEWEST: "-createdAt" },
}));

const { useApiQuery } = jest.requireMock("@/hooks");

describe("ProductsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue("");
    mockGetNumber.mockReturnValue(1);
    useApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("renders loading skeleton when isLoading=true", () => {
    useApiQuery.mockReturnValue({ data: null, isLoading: true, error: null });
    render(<ProductsPage />);
    expect(screen.getByTestId("product-grid-skeleton")).toBeInTheDocument();
  });

  it("renders product grid cards when data is populated", () => {
    useApiQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "p1",
            title: "Product One",
            price: 100,
            currency: "INR",
            mainImage: "",
            status: "published",
            featured: false,
            isAuction: false,
            currentBid: 0,
            isPromoted: false,
            category: "cat1",
          },
          {
            id: "p2",
            title: "Product Two",
            price: 200,
            currency: "INR",
            mainImage: "",
            status: "published",
            featured: false,
            isAuction: false,
            currentBid: 0,
            isPromoted: false,
            category: "cat1",
          },
        ],
        meta: { page: 1, limit: 24, total: 2, totalPages: 1, hasMore: false },
      },
      isLoading: false,
      error: null,
    });
    render(<ProductsPage />);
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    expect(screen.getByText("Product One")).toBeInTheDocument();
    expect(screen.getByText("Product Two")).toBeInTheDocument();
  });

  it("renders EmptyState when data.items is empty", () => {
    useApiQuery.mockReturnValue({
      data: {
        data: [],
        meta: { page: 1, limit: 24, total: 0, totalPages: 0, hasMore: false },
      },
      isLoading: false,
      error: null,
    });
    render(<ProductsPage />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("filter bar is present on desktop (sidebar filters rendered)", () => {
    render(<ProductsPage />);
    // ProductFilters is rendered twice: in aside sidebar + inside FilterDrawer
    expect(
      screen.getAllByTestId("product-filters").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("FilterDrawer trigger button is present", () => {
    render(<ProductsPage />);
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
  });

  it("ActiveFilterChips hidden when no filters active", () => {
    render(<ProductsPage />);
    // chips rendered only when activeFilters.length > 0
    expect(screen.queryByTestId("active-filter-chips")).not.toBeInTheDocument();
  });

  it("ActiveFilterChips shows chips when URL has active filters", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "category") return "electronics";
      return "";
    });
    render(<ProductsPage />);
    expect(screen.getByTestId("active-filter-chips")).toBeInTheDocument();
    expect(screen.getByText(/Category.*electronics/)).toBeInTheDocument();
  });

  it("URL updates on filter change (table.set called)", () => {
    render(<ProductsPage />);
    // ProductSortBar triggers onSortChange which calls table.set
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    expect(mockSet).toHaveBeenCalledWith("sort", "price");
  });

  it("pagination visible when totalPages > 1", () => {
    useApiQuery.mockReturnValue({
      data: {
        data: [
          {
            id: "p1",
            title: "P1",
            price: 100,
            currency: "INR",
            mainImage: "",
            status: "published",
            featured: false,
            isAuction: false,
            currentBid: 0,
            isPromoted: false,
            category: "c1",
          },
        ],
        meta: { page: 1, limit: 24, total: 100, totalPages: 5, hasMore: true },
      },
      isLoading: false,
      error: null,
    });
    render(<ProductsPage />);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
