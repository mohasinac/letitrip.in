/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminProductsView } from "../AdminProductsView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useMessage: jest.fn(() => ({ showError: jest.fn(), showSuccess: jest.fn() })),
  useUrlTable: jest.fn(() => ({
    get: jest.fn(() => ""),
    getNumber: jest.fn(() => 1),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
    buildSieveParams: jest.fn(() => ""),
  })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listAdminProducts: jest.fn(),
    createAdminProduct: jest.fn(),
    updateAdminProduct: jest.fn(),
    deleteAdminProduct: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, actionLabel, onAction }: any) => (
    <div data-testid="admin-page-header">
      {title}
      {actionLabel && onAction && (
        <button data-testid="action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  DataTable: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <span data-testid="col-count">{columns?.length ?? 0}</span>
      <span data-testid="row-count">{(data ?? []).length}</span>
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="filter-bar">{children}</div>
  ),
  FormField: ({ label }: any) => <div data-testid="form-field">{label}</div>,
  getProductTableColumns: () => [
    { key: "title", header: "Title" },
    { key: "price", header: "Price" },
    { key: "status", header: "Status" },
  ],
  ProductForm: () => <div data-testid="product-form" />,
}));

jest.mock("@/constants", () => ({
  ROUTES: { ADMIN: { PRODUCTS: "/admin/products" } },
}));

describe("AdminProductsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminProductsView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminProductsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable with product columns", () => {
    render(<AdminProductsView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders status filter tabs", () => {
    render(<AdminProductsView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders TablePagination", () => {
    render(<AdminProductsView />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });
});
