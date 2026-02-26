/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProductsView } from "../ProductsView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn().mockImplementation((opts: any) => {
    const key = Array.isArray(opts?.queryKey) ? opts.queryKey[0] : "";
    if (key === "products") {
      return {
        data: {
          items: [
            {
              id: "p1",
              title: "Test Product",
              price: 100,
              status: "published",
            },
          ],
          total: 1,
          page: 1,
          pageSize: 24,
          totalPages: 1,
          hasMore: false,
        },
        isLoading: false,
        error: null,
      };
    }
    return { data: null, isLoading: false, error: null };
  }),
  useUrlTable: jest.fn(() => ({
    get: jest.fn((key: string) => (key === "category" ? "electronics" : "")),
    getNumber: jest.fn(() => 1),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
    buildSieveParams: jest.fn(() => ""),
  })),
}));

jest.mock("@/services", () => ({
  productService: { list: jest.fn() },
}));

jest.mock("@/components", () => ({
  ProductGrid: ({ products }: any) => (
    <div data-testid="product-grid">{(products ?? []).length} products</div>
  ),
  ProductFilters: () => <div data-testid="product-filters" />,
  ProductSortBar: () => <div data-testid="product-sort-bar" />,
  FilterDrawer: ({ children, trigger }: any) => (
    <div data-testid="filter-drawer">
      {trigger}
      {children}
    </div>
  ),
  ActiveFilterChips: () => <div data-testid="active-chips" />,
  Pagination: () => <div data-testid="pagination" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  PRODUCT_SORT_VALUES: {
    NEWEST: "-createdAt",
    PRICE_LOW: "price",
    PRICE_HIGH: "-price",
  },
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
  },
}));

jest.mock("lucide-react", () => ({
  PackageSearch: () => <span data-testid="package-icon" />,
}));

describe("ProductsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<ProductsView />);
  });

  it("renders filter drawer trigger", () => {
    render(<ProductsView />);
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
  });

  it("renders product grid", () => {
    render(<ProductsView />);
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
  });

  it("renders active filter chips", () => {
    render(<ProductsView />);
    expect(screen.getByTestId("active-chips")).toBeInTheDocument();
  });
});
