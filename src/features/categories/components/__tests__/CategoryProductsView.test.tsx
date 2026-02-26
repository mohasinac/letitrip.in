/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CategoryProductsView } from "../CategoryProductsView";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn().mockImplementation((opts: any) => {
    const key0 = Array.isArray(opts?.queryKey) ? opts.queryKey[0] : "";
    const key1 = Array.isArray(opts?.queryKey) ? opts.queryKey[1] : "";
    if (key0 === "categories") {
      return {
        data: {
          data: [
            {
              id: "cat_1",
              name: "Electronics",
              slug: "electronics",
              tier: 1,
              path: "/electronics",
            },
          ],
        },
        isLoading: false,
        error: null,
      };
    }
    if (key0 === "products" && key1 === "by-category") {
      return {
        data: {
          data: [
            {
              id: "p1",
              title: "Test Product",
              price: 100,
              status: "published",
              category: "cat_1",
            },
          ],
          meta: { total: 1, totalPages: 1 },
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
  categoryService: { getById: jest.fn(), listAll: jest.fn() },
  productService: { list: jest.fn() },
}));

jest.mock("@/components", () => ({
  ProductGrid: ({ products }: any) => (
    <div data-testid="product-grid">{(products ?? []).length} products</div>
  ),
  ProductSortBar: () => <div data-testid="product-sort-bar" />,
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
  Pagination: () => <div data-testid="pagination" />,
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  PRODUCT_SORT_VALUES: { NEWEST: "-createdAt" },
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
  API_ENDPOINTS: {
    CATEGORIES: { GET_BY_SLUG: (s: string) => `/api/categories/${s}` },
    PRODUCTS: { LIST: "/api/products" },
  },
  ROUTES: { PUBLIC: { HOME: "/" } },
}));

describe("CategoryProductsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing with a slug", () => {
    render(<CategoryProductsView slug="electronics" />);
  });

  it("renders product grid", () => {
    render(<CategoryProductsView slug="electronics" />);
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
  });

  it("renders filter drawer", () => {
    render(<CategoryProductsView slug="electronics" />);
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
  });

  it("renders active filter chips", () => {
    render(<CategoryProductsView slug="electronics" />);
    expect(screen.getByTestId("active-chips")).toBeInTheDocument();
  });
});
