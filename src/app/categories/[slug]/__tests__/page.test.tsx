import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockApiQuery = jest.fn();
const mockSet = jest.fn();
const mockGet = jest.fn().mockReturnValue("");
const mockGetNumber = jest.fn().mockReturnValue(1);

// Mock React.use() to synchronously return resolved params
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn().mockReturnValue({ slug: "electronics" }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/categories/electronics",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockApiQuery(...args),
  useUrlTable: () => ({
    get: mockGet,
    getNumber: mockGetNumber,
    set: mockSet,
    setMany: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    clear: jest.fn(),
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
      <div data-testid="product-skeleton" />
    ) : (
      <div data-testid="product-grid">
        {products?.map((p: any) => (
          <div key={p.id} data-testid={`product-${p.id}`}>
            {p.title}
          </div>
        ))}
      </div>
    ),
  ProductSortBar: ({ onSortChange }: { onSortChange: (v: string) => void }) => (
    <div data-testid="product-sort-bar">
      <button onClick={() => onSortChange("-price")}>Sort by Price</button>
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
  Spinner: () => <div data-testid="spinner" />,
  FilterDrawer: ({
    children,
    activeCount,
  }: {
    children: React.ReactNode;
    activeCount: number;
  }) => (
    <div data-testid="filter-drawer" data-active={activeCount}>
      <button>Filters</button>
      {children}
    </div>
  ),
  FilterFacetSection: ({ title }: { title: string }) => (
    <div data-testid={`facet-${title.toLowerCase().replace(/ /g, "-")}`}>
      {title}
    </div>
  ),
  ActiveFilterChips: ({
    filters,
    onRemove,
  }: {
    filters: any[];
    onRemove: (k: string) => void;
  }) => (
    <div data-testid="active-filter-chips">
      {filters.map((f: any) => (
        <button key={f.key} onClick={() => onRemove(f.key)}>
          {f.label}: {f.value} ×
        </button>
      ))}
    </div>
  ),
  PRODUCT_SORT_VALUES: { NEWEST: "-createdAt" },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import CategoryProductsPage from "../page";

describe("CategoryProductsPage", () => {
  const mockCategory = {
    id: "cat-1",
    name: "Electronics",
    slug: "electronics",
    description: "All electronics",
    tier: 1,
    isActive: true,
  };

  const mockProduct = (id: string) => ({
    id,
    title: `Product ${id}`,
    price: 999,
    currency: "INR",
    mainImage: "",
    status: "published",
    featured: false,
    isAuction: false,
    currentBid: 0,
    isPromoted: false,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue("");
    mockGetNumber.mockReturnValue(1);
    // Default: category + products calls
    mockApiQuery
      .mockReturnValueOnce({
        data: { data: [mockCategory] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: { page: 1, limit: 24, total: 0, totalPages: 0 },
        },
        isLoading: false,
        error: null,
      });
  });

  it("renders product list scoped to category", () => {
    mockApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [mockCategory] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [mockProduct("p1"), mockProduct("p2")],
          meta: { page: 1, limit: 24, total: 2, totalPages: 1 },
        },
        isLoading: false,
        error: null,
      });
    render(
      <CategoryProductsPage
        params={Promise.resolve({ slug: "electronics" })}
      />,
    );
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    expect(screen.getByText("Product p1")).toBeInTheDocument();
  });

  it("renders category name as page heading", () => {
    render(
      <CategoryProductsPage
        params={Promise.resolve({ slug: "electronics" })}
      />,
    );
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
  });

  it("FilterDrawer trigger visible", () => {
    render(
      <CategoryProductsPage
        params={Promise.resolve({ slug: "electronics" })}
      />,
    );
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
  });

  it("switching sort calls table.set with sort key", () => {
    render(
      <CategoryProductsPage
        params={Promise.resolve({ slug: "electronics" })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sort by Price" }));
    expect(mockSet).toHaveBeenCalledWith("sort", "-price");
  });

  it("renders pagination when totalPages > 1", () => {
    mockApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [mockCategory] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [mockProduct("p1")],
          meta: { page: 1, limit: 24, total: 50, totalPages: 3 },
        },
        isLoading: false,
        error: null,
      });
    render(
      <CategoryProductsPage
        params={Promise.resolve({ slug: "electronics" })}
      />,
    );
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("renders NotFound for invalid slug (no category found)", () => {
    mockApiQuery
      .mockReset()
      .mockReturnValueOnce({
        data: { data: [] },
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: { page: 1, limit: 24, total: 0, totalPages: 0 },
        },
        isLoading: false,
        error: null,
      });
    render(
      <CategoryProductsPage
        params={Promise.resolve({ slug: "nonexistent" })}
      />,
    );
    // Category name heading should not show valid category name
    expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
  });
});
