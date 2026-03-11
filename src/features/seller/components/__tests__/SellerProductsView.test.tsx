/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SellerProductsView } from "../SellerProductsView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useAuth: jest.fn(() => ({
    user: { uid: "seller_1", role: "seller" },
    loading: false,
  })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
  useUrlTable: jest.fn(() => ({
    get: jest.fn(() => ""),
    getNumber: jest.fn(() => 1),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
    buildSieveParams: jest.fn(() => ""),
  })),
}));

// Mock the feature hook
jest.mock("../../hooks", () => ({
  useSellerProducts: jest.fn(() => ({
    data: null,
    isLoading: false,
    refetch: jest.fn(),
    deleteMutation: { mutate: jest.fn(), isLoading: false },
    createMutation: { mutate: jest.fn(), isLoading: false },
    updateMutation: { mutate: jest.fn(), isLoading: false },
    PAGE_SIZE: 25,
  })),
}));

// Mock SellerProductCard
jest.mock("../SellerProductCard", () => ({
  SellerProductCard: ({ product }: any) => (
    <div data-testid="seller-product-card">{product.title}</div>
  ),
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, actionLabel, onAction }: any) => (
    <div data-testid="admin-page-header">
      {title}
      {actionLabel && onAction && (
        <button onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  ),
  DataTable: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <span>{columns?.length ?? 0} cols</span>
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="filter-bar">{children}</div>
  ),
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete" /> : null,
  ProductForm: () => <div data-testid="product-form" />,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
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
  Spinner: () => <div data-testid="spinner" />,
  useProductTableColumns: () => [{ key: "title", header: "Title" }],
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: { bgPrimary: "bg-white", textPrimary: "text-gray-900" },
    input: { base: "border rounded" },
  },
  ROUTES: { SELLER: { PRODUCTS: "/seller/products" } },
  SUCCESS_MESSAGES: { PRODUCT: { DELETED: "Deleted" } },
}));

jest.mock("lucide-react", () => ({
  Store: () => <span data-testid="store-icon" />,
}));

describe("SellerProductsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<SellerProductsView />);
  });

  it("renders AdminPageHeader", () => {
    render(<SellerProductsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders Add Product button", () => {
    render(<SellerProductsView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders filter drawer", () => {
    render(<SellerProductsView />);
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
  });
});
