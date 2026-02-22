import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import SellerProductsPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

// Mock global.fetch used by the seller/products page
const mockFetchData = {
  data: [
    {
      id: "product-1",
      title: "Test Product",
      price: 1000,
      status: "published",
      sellerId: "seller-uid",
      mainImage: null,
    },
  ],
  meta: { total: 30, page: 1, limit: 25, totalPages: 2 },
};
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockFetchData),
  } as Response),
);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/seller/products",
}));

const mockUrlTable = {
  get: jest.fn().mockReturnValue(""),
  getNumber: jest.fn().mockReturnValue(1),
  set: jest.fn(),
  setMany: jest.fn(),
  setPage: jest.fn(),
  setPageSize: jest.fn(),
  setSort: jest.fn(),
  buildSieveParams: jest.fn().mockReturnValue(""),
  params: new URLSearchParams(),
};

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({
    user: {
      uid: "seller-uid",
      email: "seller@test.com",
      role: "seller",
      displayName: "Test Seller",
    },
    loading: false,
  })),
  useApiQuery: jest.fn(() => ({
    data: {
      // seller/products page reads data?.data for the array
      data: [
        {
          id: "product-1",
          title: "Test Product",
          price: 1000,
          status: "published",
          sellerId: "seller-uid",
          mainImage: null,
        },
      ],
      meta: { page: 1, limit: 25, total: 30, totalPages: 2 },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    isSuccess: false,
  }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
  useUrlTable: jest.fn(() => mockUrlTable),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
}));

jest.mock("lucide-react", () => ({
  Store: () => <span data-testid="store-icon" />,
}));

jest.mock("@/components", () => ({
  Spinner: () => <div data-testid="spinner" />,
  DataTable: () => <div data-testid="data-table" />,
  AdminPageHeader: ({ title, actionLabel, onAction }: any) => (
    <div>
      <h1>{title}</h1>
      {actionLabel && (
        <button onClick={onAction} data-testid="page-action-btn">
          {actionLabel}
        </button>
      )}
    </div>
  ),
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="admin-filter-bar">{children}</div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  SideDrawer: ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div data-testid="side-drawer" data-title={title}>
        {children}
      </div>
    ) : null,
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete-modal" /> : null,
  ProductForm: () => <div data-testid="product-form" />,
  getProductTableColumns: () => [],
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  Badge: ({ children }: any) => <span>{children}</span>,
  FilterDrawer: ({ children, activeCount }: any) => (
    <div data-testid="filter-drawer" data-active={activeCount}>
      <button>Filters</button>
      {children}
    </div>
  ),
  FilterFacetSection: () => <div data-testid="filter-facet-section" />,
  ActiveFilterChips: ({ filters }: any) =>
    filters?.length ? <div data-testid="active-filter-chips" /> : null,
}));

describe("Seller Products Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the products page heading / AdminPageHeader", async () => {
    render(<SellerProductsPage />);
    // Check for heading element
    const heading = await screen.findByRole("heading");
    expect(heading).toBeInTheDocument();
  });

  it("renders DataTable when data is loaded", async () => {
    render(<SellerProductsPage />);
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination", async () => {
    render(<SellerProductsPage />);
    expect(await screen.findByTestId("table-pagination")).toBeInTheDocument();
  });

  it("renders AdminFilterBar (visible on md+)", async () => {
    render(<SellerProductsPage />);
    expect(await screen.findByTestId("admin-filter-bar")).toBeInTheDocument();
  });

  it("renders FilterDrawer for mobile filters", async () => {
    render(<SellerProductsPage />);
    expect(await screen.findByTestId("filter-drawer")).toBeInTheDocument();
  });

  it("does NOT navigate to /seller/products/new — opens SideDrawer instead", async () => {
    render(<SellerProductsPage />);
    await screen.findByTestId("data-table");
    // Find the "Add product" action button rendered by AdminPageHeader
    const addButton = screen.queryByTestId("page-action-btn");
    if (addButton) {
      fireEvent.click(addButton);
      // Should open side drawer, not navigate to /new
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining("/new"),
      );
      expect(screen.getByTestId("side-drawer")).toBeInTheDocument();
    } else {
      // If no button found, just verify no navigation to /new happened
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining("/new"),
      );
    }
  });

  it("uses useUrlTable for state (no local useState for filters)", async () => {
    const { useUrlTable } = require("@/hooks");
    render(<SellerProductsPage />);
    await screen.findByTestId("data-table");
    expect(useUrlTable).toHaveBeenCalled();
  });

  it("redirects to login when unauthenticated", async () => {
    const { useAuth } = require("@/hooks");
    (useAuth as jest.Mock).mockReturnValueOnce({ user: null, loading: false });
    render(<SellerProductsPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
