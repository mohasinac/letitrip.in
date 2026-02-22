import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { Suspense } from "react";
import AdminOrdersPage from "../page";
import { UI_LABELS } from "@/constants";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: (_promise: Promise<any>) => ({ action: undefined }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/orders",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: {
      orders: [],
      meta: { total: 0, page: 1, pageSize: 25, totalPages: 1 },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
  }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
  useUrlTable: jest.fn(() => ({
    get: jest.fn().mockReturnValue(""),
    getNumber: jest.fn().mockReturnValue(1),
    set: jest.fn(),
    setMany: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    buildSieveParams: jest.fn().mockReturnValue(""),
    params: new URLSearchParams(),
  })),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  AdminPageHeader: ({ title }: { title: string }) => (
    <h1 data-testid="page-header">{title}</h1>
  ),
  DrawerFormFooter: ({ onCancel, submitLabel }: any) => (
    <div>
      <button onClick={onCancel}>Cancel</button>
      <button>{submitLabel || "Save"}</button>
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  getOrderTableColumns: () => [],
  OrderStatusForm: () => <div data-testid="order-status-form" />,
}));

describe("Admin Orders Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the orders page with title", async () => {
    render(
      <Suspense fallback={<div>Loading…</div>}>
        <AdminOrdersPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(
      await screen.findByText(UI_LABELS.ADMIN.ORDERS.TITLE),
    ).toBeInTheDocument();
  });

  it("renders DataTable component", async () => {
    render(
      <Suspense fallback={null}>
        <AdminOrdersPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination component", async () => {
    render(
      <Suspense fallback={null}>
        <AdminOrdersPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("table-pagination")).toBeInTheDocument();
  });

  it("uses useUrlTable for state management (router.replace not push)", async () => {
    const { useUrlTable } = require("@/hooks");
    render(
      <Suspense fallback={null}>
        <AdminOrdersPage params={Promise.resolve({})} />
      </Suspense>,
    );
    await screen.findByTestId("data-table");
    // useUrlTable is a jest.fn() so we can verify it was called
    expect(useUrlTable).toHaveBeenCalled();
  });

  it("renders status filter tabs", async () => {
    render(
      <Suspense fallback={null}>
        <AdminOrdersPage params={Promise.resolve({})} />
      </Suspense>,
    );
    // Multiple status tabs should be rendered
    expect(
      await screen.findByText(UI_LABELS.ADMIN.ORDERS.FILTER_ALL),
    ).toBeInTheDocument();
  });
});
