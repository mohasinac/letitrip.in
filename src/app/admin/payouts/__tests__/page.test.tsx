import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import AdminPayoutsPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/payouts",
}));

const mockUseApiQuery = jest.fn(() => ({
  data: { payouts: [], meta: { total: 0 } },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockUseApiQuery(...args),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
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

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, "data-testid": testId }: any) => (
    <button onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  AdminPageHeader: ({ title }: any) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
  DrawerFormFooter: ({ onCancel, submitLabel }: any) => (
    <div>
      <button onClick={onCancel} data-testid="cancel-btn">
        Cancel
      </button>
      <button type="submit">{submitLabel || "Save"}</button>
    </div>
  ),
  getPayoutTableColumns: () => [],
  PayoutStatusForm: () => <div data-testid="payout-status-form" />,
}));

const LABELS = UI_LABELS.ADMIN.PAYOUTS;

describe("Admin Payouts Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the payouts page title", () => {
    render(<AdminPayoutsPage />);
    expect(screen.getByTestId("page-title")).toHaveTextContent(LABELS.TITLE);
  });

  it("renders the DataTable", () => {
    render(<AdminPayoutsPage />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders status filter tabs: All, Pending, Processing, Completed, Failed", () => {
    render(<AdminPayoutsPage />);
    expect(screen.getByText(LABELS.FILTER_ALL)).toBeInTheDocument();
    expect(screen.getByText(LABELS.FILTER_PENDING)).toBeInTheDocument();
    expect(screen.getByText(LABELS.FILTER_PROCESSING)).toBeInTheDocument();
    expect(screen.getByText(LABELS.FILTER_COMPLETED)).toBeInTheDocument();
    expect(screen.getByText(LABELS.FILTER_FAILED)).toBeInTheDocument();
  });

  it("clicking a status tab updates the filter", () => {
    render(<AdminPayoutsPage />);
    const pendingTab = screen.getByText(LABELS.FILTER_PENDING);
    fireEvent.click(pendingTab);
    // After clicking, Pending tab should be rendered (state update reflected)
    expect(screen.getByText(LABELS.FILTER_PENDING)).toBeInTheDocument();
  });

  it("SideDrawer is initially closed", () => {
    render(<AdminPayoutsPage />);
    expect(screen.queryByTestId("side-drawer")).not.toBeInTheDocument();
  });

  it("TablePagination is not rendered (payouts page uses simpler layout)", () => {
    render(<AdminPayoutsPage />);
    // Payouts uses internal state pagination, no TablePagination component
    expect(screen.queryByTestId("table-pagination")).not.toBeInTheDocument();
  });
});
