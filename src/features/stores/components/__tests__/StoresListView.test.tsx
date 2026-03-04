/**
 * StoresListView Tests
 *
 * Covers:
 * - Loading state shows Spinner
 * - Error state shows EmptyState
 * - Empty list shows EmptyState
 * - Search input uses the Search component (not bare Input)
 * - Store grid renders StoreCard for each item
 * - Pagination renders when data is present
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href }, children),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/",
}));

jest.mock("@/components", () => ({
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
  Heading: ({ children }: { children: React.ReactNode }) => (
    <h1 data-testid="heading">{children}</h1>
  ),
  Text: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <p data-testid="text" data-variant={variant}>{children}</p>
  ),
  Search: ({
    value,
    onChange,
    placeholder,
    onClear,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    onClear?: () => void;
  }) => (
    <input
      data-testid="search-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={() => onClear?.()}
    />
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

const baseStore = {
  uid: "u1",
  storeSlug: "test-store",
  displayName: "Seller One",
  storeName: "Test Store",
  totalProducts: 5,
};

const mockQuery = { data: undefined, isLoading: false, error: null };
const mockTable = {
  get: jest.fn((key: string) => (key === "q" ? "" : key === "page" ? "1" : key === "pageSize" ? "24" : "")),
  getNumber: jest.fn((key: string, def: number) => def),
  set: jest.fn(),
  setPage: jest.fn(),
  params: { toString: () => "" },
};

jest.mock("../../hooks", () => ({
  useStores: () => ({ query: mockQuery, table: mockTable }),
}));

// StoreCard — simple stub so we can count rendered cards
jest.mock("../StoreCard", () => ({
  StoreCard: ({ store }: { store: { uid: string; storeName: string } }) => (
    <div data-testid="store-card">{store.storeName}</div>
  ),
}));

import { StoresListView } from "../StoresListView";

describe("StoresListView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset query state
    Object.assign(mockQuery, { data: undefined, isLoading: false, error: null });
  });

  it("shows spinner while loading", () => {
    Object.assign(mockQuery, { isLoading: true });
    render(<StoresListView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows empty state on error", () => {
    Object.assign(mockQuery, { error: new Error("failed") });
    render(<StoresListView />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows empty state when no stores", () => {
    Object.assign(mockQuery, {
      data: { items: [], total: 0, page: 1, pageSize: 24, totalPages: 0, hasMore: false },
    });
    render(<StoresListView />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("uses Search component (not bare Input)", () => {
    render(<StoresListView />);
    // Our Search mock renders with data-testid="search-input"
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    // Confirm no bare input by checking the test id used was from Search, not a raw Input
    const input = screen.getByTestId("search-input");
    expect(input.tagName.toLowerCase()).toBe("input");
  });

  it("renders StoreCard for each store item", () => {
    Object.assign(mockQuery, {
      data: {
        items: [baseStore, { ...baseStore, uid: "u2", storeName: "Store Two", storeSlug: "store-two" }],
        total: 2,
        page: 1,
        pageSize: 24,
        totalPages: 1,
        hasMore: false,
      },
    });
    render(<StoresListView />);
    expect(screen.getAllByTestId("store-card")).toHaveLength(2);
    expect(screen.getByText("Test Store")).toBeInTheDocument();
    expect(screen.getByText("Store Two")).toBeInTheDocument();
  });

  it("renders TablePagination when stores are present", () => {
    Object.assign(mockQuery, {
      data: { items: [baseStore], total: 1, page: 1, pageSize: 24, totalPages: 1, hasMore: false },
    });
    render(<StoresListView />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });
});
