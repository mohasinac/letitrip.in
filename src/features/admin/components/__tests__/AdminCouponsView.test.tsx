/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminCouponsView } from "../AdminCouponsView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
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

jest.mock("@/services", () => ({
  couponService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    validate: jest.fn(),
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
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete" /> : null,
  getCouponTableColumns: () => [
    { key: "code", header: "Code" },
    { key: "discount", header: "Discount" },
  ],
  CouponForm: () => <div data-testid="coupon-form" />,
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="filter-bar">{children}</div>
  ),
  couponToFormState: jest.fn((c: any) => c ?? {}),
  formStateToCouponPayload: jest.fn((f: any) => f ?? {}),
  FormField: ({ label }: any) => <div data-testid="form-field">{label}</div>,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { gap: { md: "gap-4" } },
  },
  ROUTES: { ADMIN: { COUPONS: "/admin/coupons" } },
  ERROR_MESSAGES: { GENERIC: { UNEXPECTED: "Unexpected error" } },
  SUCCESS_MESSAGES: {
    ADMIN: { COUPON_CREATED: "Created", COUPON_DELETED: "Deleted" },
  },
}));

describe("AdminCouponsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminCouponsView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminCouponsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable", () => {
    render(<AdminCouponsView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders at least one action button", () => {
    render(<AdminCouponsView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
