/**
 * StoreAuctionsView Tests
 *
 * Covers:
 * - Loading state shows Spinner
 * - Error state shows EmptyState
 * - Empty auctions list shows EmptyState
 * - Auctions data renders AuctionGrid with correct count
 * - Pagination renders when data is present
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components", () => ({
  AuctionGrid: ({ auctions }: { auctions: unknown[] }) => (
    <div data-testid="auction-grid" data-count={auctions.length} />
  ),
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
    <div data-testid="table-pagination" data-total={total} data-page={currentPage} />
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
  get: jest.fn((key: string) => (key === "page" ? "1" : key === "pageSize" ? "24" : "")),
  getNumber: jest.fn((key: string, def: number) => def),
  set: jest.fn(),
  setPage: jest.fn(),
  params: { toString: () => "" },
};

jest.mock("@/hooks", () => ({
  useUrlTable: () => mockTable,
}));

const mockUseStoreAuctions = jest.fn();
jest.mock("../../hooks", () => ({
  useStoreAuctions: (...args: unknown[]) => mockUseStoreAuctions(...args),
}));

import { StoreAuctionsView } from "../StoreAuctionsView";

const baseAuction = {
  id: "a1",
  title: "Vintage Camera",
  price: 500,
  currency: "INR",
  mainImage: "https://example.com/auction.jpg",
  isAuction: true,
  auctionEndDate: new Date(Date.now() + 86400000),
  startingBid: 500,
  currentBid: 650,
  bidCount: 3,
  featured: false,
};

describe("StoreAuctionsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows spinner while loading", () => {
    mockUseStoreAuctions.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<StoreAuctionsView storeSlug="test-store" />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state on error", () => {
    mockUseStoreAuctions.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("fetch failed"),
    });
    render(<StoreAuctionsView storeSlug="test-store" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows empty state when no auctions", () => {
    mockUseStoreAuctions.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 24, totalPages: 0, hasMore: false },
      isLoading: false,
      error: null,
    });
    render(<StoreAuctionsView storeSlug="test-store" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders AuctionGrid with correct count", () => {
    mockUseStoreAuctions.mockReturnValue({
      data: {
        items: [baseAuction, { ...baseAuction, id: "a2" }],
        total: 2,
        page: 1,
        pageSize: 24,
        totalPages: 1,
        hasMore: false,
      },
      isLoading: false,
      error: null,
    });
    render(<StoreAuctionsView storeSlug="test-store" />);
    const grid = screen.getByTestId("auction-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute("data-count", "2");
  });

  it("renders TablePagination when auctions are present", () => {
    mockUseStoreAuctions.mockReturnValue({
      data: { items: [baseAuction], total: 1, page: 1, pageSize: 24, totalPages: 1, hasMore: false },
      isLoading: false,
      error: null,
    });
    render(<StoreAuctionsView storeSlug="test-store" />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });
});
