/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminPayoutsView } from "../AdminPayoutsView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listPayouts: jest.fn(),
    updatePayout: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title }: any) => (
    <div data-testid="admin-page-header">{title}</div>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  DataTable: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <span>{columns?.length ?? 0} cols</span>
      <span>{(data ?? []).length} rows</span>
    </div>
  ),
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  getPayoutTableColumns: () => [
    { key: "amount", header: "Amount" },
    { key: "status", header: "Status" },
  ],
  PayoutStatusForm: () => <div data-testid="payout-form" />,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
  },
  ERROR_MESSAGES: { GENERIC: { UNEXPECTED: "Unexpected error" } },
  SUCCESS_MESSAGES: {
    ADMIN: { PAYOUT_APPROVED: "Approved", PAYOUT_REJECTED: "Rejected" },
  },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
}));

describe("AdminPayoutsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminPayoutsView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminPayoutsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders payout DataTable", () => {
    render(<AdminPayoutsView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
