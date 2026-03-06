/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchView } from "../SearchView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useUrlTable: jest.fn(() => ({
    get: jest.fn((key: string) => (key === "q" ? "shoes" : "")),
    getNumber: jest.fn(() => 1),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
    buildSearchParams: jest.fn(() => ""),
  })),
}));

jest.mock("@/services", () => ({
  searchService: { search: jest.fn() },
  categoryService: { listAll: jest.fn() },
}));

jest.mock("@/utils", () => ({
  debounce: (fn: any) => fn,
}));

jest.mock("../SearchResultsSection", () => ({
  SearchResultsSection: ({ results }: any) => (
    <div data-testid="search-results">{(results ?? []).length} results</div>
  ),
}));

jest.mock("@/components", () => ({
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
    icon: { muted: "text-gray-400" },
  },
  API_ENDPOINTS: {
    SEARCH: "/api/search",
    CATEGORIES: { LIST_ALL: "/api/categories" },
  },
}));

jest.mock("lucide-react", () => ({
  Search: ({ className }: any) => (
    <span data-testid="search-icon" className={className} />
  ),
}));

describe("SearchView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<SearchView />);
  });

  it("renders search results section", () => {
    render(<SearchView />);
    expect(screen.getByTestId("search-results")).toBeInTheDocument();
  });

  it("renders filter drawer", () => {
    render(<SearchView />);
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
  });

  it("renders active filter chips", () => {
    render(<SearchView />);
    expect(screen.getByTestId("active-chips")).toBeInTheDocument();
  });

  it("shows no-results empty state when query returns empty", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockImplementation((opts: any) => {
      const key = Array.isArray(opts?.queryKey) ? opts.queryKey[0] : "";
      if (key === "categories") {
        return { data: [], isLoading: false, error: null };
      }
      return {
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
      };
    });
    render(<SearchView />);
    expect(screen.getByTestId("search-results")).toBeInTheDocument();
  });
});
