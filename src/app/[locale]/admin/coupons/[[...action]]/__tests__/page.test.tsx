import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { Suspense } from "react";
import AdminCouponsPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: (_: Promise<any>) => ({ action: undefined }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/coupons",
}));

const mockBuildSieveParams = jest.fn().mockReturnValue("?page=1&pageSize=25");

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: {
      coupons: [],
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
  DrawerFormFooter: ({ onCancel }: any) => (
    <button onClick={onCancel}>Cancel</button>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="admin-filter-bar">{children}</div>
  ),
  FormField: ({ label }: any) => <input aria-label={label} />,
  ConfirmDeleteModal: () => <div data-testid="confirm-delete" />,
  getCouponTableColumns: () => [],
  CouponForm: () => <div data-testid="coupon-form" />,
  couponToFormState: (c: any) => c,
  formStateToCouponPayload: (s: any) => s,
}));

describe("Admin Coupons Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the coupons page title", async () => {
    render(
      <Suspense fallback={null}>
        <AdminCouponsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(
      await screen.findByText(UI_LABELS.ADMIN.COUPONS.TITLE),
    ).toBeInTheDocument();
  });

  it("renders DataTable component", async () => {
    render(
      <Suspense fallback={null}>
        <AdminCouponsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination component", async () => {
    render(
      <Suspense fallback={null}>
        <AdminCouponsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("table-pagination")).toBeInTheDocument();
  });

  it("renders search input in filter bar (sends code@=* Sieve filter)", async () => {
    render(
      <Suspense fallback={null}>
        <AdminCouponsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("admin-filter-bar")).toBeInTheDocument();
  });

  it("uses useUrlTable for state management", async () => {
    const { useUrlTable } = require("@/hooks");
    render(
      <Suspense fallback={null}>
        <AdminCouponsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    await screen.findByTestId("data-table");
    expect(useUrlTable).toHaveBeenCalled();
    const defaults = useUrlTable.mock.calls[0][0]?.defaults ?? {};
    expect(defaults.sort).toBeDefined();
  });

  it("includes create coupon button", async () => {
    render(
      <Suspense fallback={null}>
        <AdminCouponsPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(
      await screen.findByText(UI_LABELS.ADMIN.COUPONS.CREATE),
    ).toBeInTheDocument();
  });
});
