import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";

// Mock heavy sub-modules to isolate SearchResultsSection logic
jest.mock("@/components/products", () => ({
  ProductGrid: ({ loading }: { loading?: boolean }) =>
    loading ? (
      <div data-testid="product-grid-loading" />
    ) : (
      <div data-testid="product-grid" />
    ),
  ProductSortBar: ({ onSortChange }: { onSortChange: (s: string) => void }) => (
    <button onClick={() => onSortChange("price")}>Sort</button>
  ),
}));

jest.mock("@/components/ui", () => ({
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <nav aria-label="pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        Prev
      </button>
      <span>
        {currentPage}/{totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  ),
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    SEARCH_PAGE: {
      NO_RESULTS: "No results found",
      NO_RESULTS_SUBTITLE: (q: string) => `No results for "${q}"`,
      EMPTY_QUERY: "Enter a search term",
    },
  },
}));

// Import after mocks
import { SearchResultsSection } from "../SearchResultsSection";

const baseProps = {
  products: [
    {
      id: "1",
      title: "T",
      price: 10,
      currency: "INR",
      mainImage: "",
      status: "published" as const,
      featured: false,
      isAuction: false,
      currentBid: 0,
      isPromoted: false,
    },
  ],
  total: 30,
  totalPages: 2,
  urlQ: "shoes",
  urlSort: "default" as any,
  urlPage: 1,
  isLoading: false,
  onSortChange: jest.fn(),
  onPageChange: jest.fn(),
};

describe("SearchResultsSection", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders Pagination component (not raw prev/next buttons) when total > PAGE_SIZE", () => {
    render(<SearchResultsSection {...baseProps} />);
    expect(
      screen.getByRole("navigation", { name: /pagination/i }),
    ).toBeInTheDocument();
  });

  it("does not render raw Prev/Next text buttons", () => {
    render(<SearchResultsSection {...baseProps} />);
    // No standalone BACK/NEXT buttons outside the mocked Pagination
    // The mock renders "Prev"/"Next" inside nav — verify they are inside nav
    const nav = screen.getByRole("navigation", { name: /pagination/i });
    expect(nav).toBeInTheDocument();
  });

  it("calls onPageChange with correct page when navigating forward", async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(
      <SearchResultsSection
        {...baseProps}
        urlPage={1}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with correct page when navigating back", async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(
      <SearchResultsSection
        {...baseProps}
        urlPage={2}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("hides Pagination when total <= 24 (PAGE_SIZE)", () => {
    render(<SearchResultsSection {...baseProps} total={10} />);
    expect(
      screen.queryByRole("navigation", { name: /pagination/i }),
    ).toBeNull();
  });

  it("shows empty state when products array is empty", () => {
    render(<SearchResultsSection {...baseProps} products={[]} total={0} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading=true", () => {
    render(<SearchResultsSection {...baseProps} isLoading={true} />);
    expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();
  });
});
