import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import SearchPage from "../page";

const mockSet = jest.fn();
const mockClear = jest.fn();
const mockGet = jest.fn().mockReturnValue("");
const mockGetNumber = jest.fn().mockReturnValue(1);
const mockUseApiQuery = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/search",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
  useUrlTable: () => ({
    get: mockGet,
    getNumber: mockGetNumber,
    set: mockSet,
    setMany: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    clear: mockClear,
    params: new URLSearchParams(),
  }),
}));

jest.mock("@/utils", () => ({
  debounce: (fn: any) => fn,
}));

jest.mock("@/components", () => ({
  PRODUCT_SORT_VALUES: { NEWEST: "-createdAt" },
  FilterDrawer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="filter-drawer">{children}</div>
  ),
  FilterFacetSection: () => <div data-testid="filter-facet" />,
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
      {filters.map((f: any) => (
        <button key={f.key} onClick={() => onRemove(f.key)}>
          {f.label} ×
        </button>
      ))}
      {filters.length > 0 && <button onClick={onClearAll}>Clear all</button>}
    </div>
  ),
  SearchResultsSection: ({ products, isLoading, urlQ, onSortChange }: any) => (
    <div data-testid="search-results">
      {isLoading && <div data-testid="results-loading">Loading...</div>}
      {!isLoading && products?.length === 0 && urlQ && (
        <div data-testid="no-results">No results for &ldquo;{urlQ}&rdquo;</div>
      )}
      <select
        aria-label="Sort"
        onChange={(e) => onSortChange?.(e.target.value)}
      >
        <option value="-createdAt">Newest</option>
        <option value="price">Price</option>
      </select>
      {products?.map((p: any) => (
        <div key={p.id} data-testid={`product-${p.id}`}>
          {p.title}
        </div>
      ))}
    </div>
  ),
  EmptyState: ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => (
    <div data-testid="empty-state">
      {title}
      {description && <p>{description}</p>}
    </div>
  ),
}));

describe("SearchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue("");
    mockGetNumber.mockReturnValue(1);
    // Default: two useApiQuery calls (categories + search)
    mockUseApiQuery
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      }) // categories
      .mockReturnValueOnce({ data: null, isLoading: false, error: null }); // search
  });

  it("renders search input pre-filled with ?q= URL param", () => {
    mockGet.mockImplementation((key: string) => (key === "q" ? "shoes" : ""));
    mockUseApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: {
            q: "shoes",
            page: 1,
            limit: 24,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });
    render(<SearchPage />);
    const input = screen.getByRole("searchbox");
    expect((input as HTMLInputElement).value).toBe("shoes");
  });

  it("renders loading skeleton when isLoading=true", () => {
    mockGet.mockImplementation((key: string) => (key === "q" ? "shoes" : ""));
    mockUseApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({ data: null, isLoading: true, error: null });
    render(<SearchPage />);
    expect(screen.getByTestId("results-loading")).toBeInTheDocument();
  });

  it("renders ProductCard grid when results are present", () => {
    mockGet.mockImplementation((key: string) => (key === "q" ? "shoes" : ""));
    mockUseApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [
            {
              id: "p1",
              title: "Sneakers",
              price: 999,
              currency: "INR",
              mainImage: "",
              status: "published",
              featured: false,
              isAuction: false,
              currentBid: 0,
              isPromoted: false,
            },
          ],
          meta: {
            q: "shoes",
            page: 1,
            limit: 24,
            total: 1,
            totalPages: 1,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });
    render(<SearchPage />);
    expect(screen.getByTestId("product-p1")).toBeInTheDocument();
  });

  it("renders EmptyState with query text when no results", () => {
    mockGet.mockImplementation((key: string) => (key === "q" ? "xyz123" : ""));
    mockUseApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: {
            q: "xyz123",
            page: 1,
            limit: 24,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });
    render(<SearchPage />);
    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });

  it("ActiveFilterChips visible when category filter is active", () => {
    mockGet.mockImplementation((key: string) =>
      key === "category" ? "electronics" : "",
    );
    mockUseApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: {
            q: "",
            page: 1,
            limit: 24,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });
    render(<SearchPage />);
    // Active filter chips should render with the category
    expect(screen.getByTestId("active-filter-chips")).toBeInTheDocument();
  });

  it("chip dismiss calls table.set to remove the filter", () => {
    mockGet.mockImplementation((key: string) =>
      key === "category" ? "electronics" : "",
    );
    mockUseApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: {
            q: "",
            page: 1,
            limit: 24,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });
    render(<SearchPage />);
    fireEvent.click(screen.getByText(/Category ×/));
    expect(mockSet).toHaveBeenCalledWith("category", "");
  });

  it("sort dropdown updates ?sort= URL param", () => {
    // Need a query so SearchResultsSection renders (hasAnyFilter must be true)
    mockGet.mockImplementation((key: string) => (key === "q" ? "shoes" : ""));
    mockUseApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [
            {
              id: "p1",
              title: "Sneakers",
              price: 999,
              currency: "INR",
              mainImage: "",
              status: "published",
              featured: false,
              isAuction: false,
              currentBid: 0,
              isPromoted: false,
            },
          ],
          meta: {
            q: "shoes",
            page: 1,
            limit: 24,
            total: 1,
            totalPages: 1,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });
    render(<SearchPage />);
    const sortSelect = screen.getByRole("combobox");
    fireEvent.change(sortSelect, { target: { value: "price" } });
    expect(mockSet).toHaveBeenCalledWith("sort", "price");
  });
});
