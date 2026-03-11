/**
 * StoreProductsView Tests
 *
 * Covers:
 * - Loading state shows Spinner
 * - Error state shows EmptyState
 * - Empty products list shows EmptyState
 * - Products grid renders ProductGrid with fetched items
 * - Pagination renders when data is present
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components", () => ({
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
  Spinner: () => <div data-testid="spinner" />,
  TablePagination: ({
    total,
    currentPage,
  }: {
    total: number;
    currentPage: number;
  }) => (
    <div
      data-testid="table-pagination"
      data-total={total}
      data-page={currentPage}
    />
  ),
  ProductGrid: ({ products }: { products: unknown[] }) => (
    <div data-testid="product-grid" data-count={products.length} />
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
    flex: { hCenter: "flex justify-center" },
    page: { empty: "py-16" },
  },
}));

const mockTable = {
  get: jest.fn((key: string) =>
    key === "page" ? "1" : key === "pageSize" ? "24" : "",
  ),
  getNumber: jest.fn((key: string, def: number) => def),
  set: jest.fn(),
  setPage: jest.fn(),
  params: { toString: () => "" },
};

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useUrlTable: () => mockTable,
}));

const mockUseStoreProducts = jest.fn();
jest.mock("../../hooks", () => ({
  useStoreProducts: (...args: unknown[]) => mockUseStoreProducts(...args),
}));

import { StoreProductsView } from "../StoreProductsView";

const baseItem = {
  id: "p1",
  title: "Test Product",
  price: 100,
  currency: "INR",
  mainImage: "https://example.com/product.jpg",
  status: "published",
  featured: false,
  isAuction: false,
  currentBid: null,
  isPromoted: false,
  slug: "test-product",
};

describe("StoreProductsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows spinner while loading", () => {
    mockUseStoreProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<StoreProductsView storeSlug="test-store" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state on error", () => {
    mockUseStoreProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("fetch failed"),
    });
    render(<StoreProductsView storeSlug="test-store" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows empty state when no products", () => {
    mockUseStoreProducts.mockReturnValue({
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
    render(<StoreProductsView storeSlug="test-store" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders ProductGrid with correct item count", () => {
    mockUseStoreProducts.mockReturnValue({
      data: {
        items: [baseItem, { ...baseItem, id: "p2", slug: "test-product-2" }],
        total: 2,
        page: 1,
        pageSize: 24,
        totalPages: 1,
        hasMore: false,
      },
      isLoading: false,
      error: null,
    });
    render(<StoreProductsView storeSlug="test-store" />);
    const grid = screen.getByTestId("product-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute("data-count", "2");
  });

  it("renders TablePagination when items are present", () => {
    mockUseStoreProducts.mockReturnValue({
      data: {
        items: [baseItem],
        total: 1,
        page: 1,
        pageSize: 24,
        totalPages: 1,
        hasMore: false,
      },
      isLoading: false,
      error: null,
    });
    render(<StoreProductsView storeSlug="test-store" />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });
});
