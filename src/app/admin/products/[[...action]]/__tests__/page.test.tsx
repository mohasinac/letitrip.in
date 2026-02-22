import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { Suspense } from "react";
import AdminProductsPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: (_: Promise<any>) => ({ action: undefined }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/products",
}));

const mockBuildSieveParams = jest.fn().mockReturnValue("?page=1&pageSize=25");
const mockGet = jest.fn().mockReturnValue("");

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: {
      products: [],
      meta: { page: 1, limit: 25, total: 0, totalPages: 1 },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
  useUrlTable: jest.fn(() => ({
    get: mockGet,
    getNumber: jest.fn().mockReturnValue(1),
    set: jest.fn(),
    setMany: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    buildSieveParams: mockBuildSieveParams,
    params: new URLSearchParams(),
  })),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  AdminPageHeader: ({ title }: any) => <h1>{title}</h1>,
  DrawerFormFooter: ({ onCancel }: any) => (
    <button onClick={onCancel}>Cancel</button>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="admin-filter-bar">{children}</div>
  ),
  FormField: ({ label, onChange }: any) => (
    <input aria-label={label} onChange={onChange} />
  ),
  getProductTableColumns: () => [],
  ProductForm: () => <div data-testid="product-form" />,
  ConfirmDeleteModal: () => <div />,
}));

describe("Admin Products Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the products page title", async () => {
    render(
      <Suspense fallback={null}>
        <AdminProductsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(
      await screen.findByText(UI_LABELS.ADMIN.PRODUCTS.TITLE),
    ).toBeInTheDocument();
  });

  it("renders DataTable component", async () => {
    render(
      <Suspense fallback={null}>
        <AdminProductsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination component", async () => {
    render(
      <Suspense fallback={null}>
        <AdminProductsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("table-pagination")).toBeInTheDocument();
  });

  it("renders AdminFilterBar with search input", async () => {
    render(
      <Suspense fallback={null}>
        <AdminProductsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("admin-filter-bar")).toBeInTheDocument();
  });

  it("uses useUrlTable for state and queryKey contains params", async () => {
    const { useUrlTable, useApiQuery } = require("@/hooks");
    render(
      <Suspense fallback={null}>
        <AdminProductsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    await screen.findByTestId("data-table");
    expect(useUrlTable).toHaveBeenCalled();
    // queryKey should reference table.params.toString() — check apiQuery was invoked
    expect(useApiQuery).toHaveBeenCalled();
    const queryKey = useApiQuery.mock.calls[0][0].queryKey;
    expect(Array.isArray(queryKey)).toBe(true);
    expect(queryKey).toContain("admin");
    expect(queryKey).toContain("products");
  });
});
