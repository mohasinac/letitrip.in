/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminBidsView } from "../AdminBidsView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
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
  adminService: { listBids: jest.fn() },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title }: any) => (
    <div data-testid="admin-page-header">{title}</div>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  SideDrawer: ({ children, isOpen }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  DataTable: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <span data-testid="col-count">{columns?.length ?? 0}</span>
      <span data-testid="row-count">{data?.length ?? 0}</span>
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  useBidTableColumns: () => [{ key: "bidAmount", header: "Bid Amount" }],
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
  },
  ROUTES: { ADMIN: { BIDS: "/admin/bids" } },
  ERROR_MESSAGES: { GENERIC: { UNEXPECTED: "Unexpected error" } },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatDate: (d: any) => String(d),
}));

describe("AdminBidsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminBidsView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminBidsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable", () => {
    render(<AdminBidsView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders status filter tabs", () => {
    render(<AdminBidsView />);
    // Status tabs rendered as buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
