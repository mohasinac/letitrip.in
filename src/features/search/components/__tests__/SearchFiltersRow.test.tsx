/**
 * Tests for SearchFiltersRow component
 *
 * Coverage:
 * - Renders category filter dropdown
 * - Renders price range inputs
 * - Clear filters button visible when showClear is true
 * - Populates category options
 */

import { render, screen } from "@testing-library/react";
import { SearchFiltersRow } from "../SearchFiltersRow";
import type { CategoryDocument } from "@/db/schema";

const baseProps = {
  urlCategory: "",
  topCategories: [] as CategoryDocument[],
  urlMinPrice: "",
  urlMaxPrice: "",
  showClear: false,
  onCategoryChange: jest.fn(),
  onPriceFilter: jest.fn(),
  onClearFilters: jest.fn(),
};

const sampleCategories: CategoryDocument[] = [
  {
    id: "cat-001",
    name: "Electronics",
    slug: "electronics",
    tier: 1,
    parentId: null,
    description: "",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metrics: { productCount: 0, subCategoryCount: 0, viewCount: 0 },
    seo: { metaTitle: "", metaDescription: "", keywords: [] },
  } as unknown as CategoryDocument,
];

describe("SearchFiltersRow", () => {
  it("renders category filter label", () => {
    render(<SearchFiltersRow {...baseProps} />);
    expect(screen.getByText(/category/i)).toBeInTheDocument();
  });

  it("renders All Categories option", () => {
    render(<SearchFiltersRow {...baseProps} />);
    expect(screen.getByText(/all categories/i)).toBeInTheDocument();
  });

  it("renders price range label", () => {
    render(<SearchFiltersRow {...baseProps} />);
    expect(screen.getByText(/price range/i)).toBeInTheDocument();
  });

  it("renders category options from topCategories", () => {
    render(
      <SearchFiltersRow {...baseProps} topCategories={sampleCategories} />,
    );
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("shows clear filters button when showClear is true", () => {
    render(<SearchFiltersRow {...baseProps} showClear />);
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it("hides clear filters button when showClear is false", () => {
    render(<SearchFiltersRow {...baseProps} showClear={false} />);
    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument();
  });
});
