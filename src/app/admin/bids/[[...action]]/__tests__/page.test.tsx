import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { Suspense } from "react";
import AdminBidsPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: (_: Promise<any>) => ({ action: undefined }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/bids",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: {
      bids: [],
      meta: { total: 0, page: 1, pageSize: 25, totalPages: 1 },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
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
  apiClient: { get: jest.fn(), patch: jest.fn() },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatDate: (d: any) => "Jan 1, 2025",
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  AdminPageHeader: ({ title }: any) => (
    <h1 data-testid="page-header">{title}</h1>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  getBidTableColumns: () => [],
}));

describe("Admin Bids Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the bids page title", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBidsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(
      await screen.findByText(UI_LABELS.ADMIN.BIDS.TITLE),
    ).toBeInTheDocument();
  });

  it("renders DataTable", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBidsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBidsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("table-pagination")).toBeInTheDocument();
  });

  it("uses useUrlTable with default sort -bidDate", async () => {
    const { useUrlTable } = require("@/hooks");
    render(
      <Suspense fallback={null}>
        <AdminBidsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    await screen.findByTestId("data-table");
    const calls = useUrlTable.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][0]).toMatchObject({ defaults: { sort: "-bidDate" } });
  });

  it("renders status filter tabs including All Bids", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBidsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(
      await screen.findByText(UI_LABELS.ADMIN.BIDS.FILTER_ALL),
    ).toBeInTheDocument();
  });
});
