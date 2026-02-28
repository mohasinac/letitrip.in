/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { AdminOrdersView } from "../AdminOrdersView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useUrlTable: jest.fn(() => ({
    get: jest.fn().mockReturnValue(""),
    getNumber: jest.fn().mockReturnValue(25),
    set: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    buildSieveParams: jest.fn().mockReturnValue(""),
    params: new URLSearchParams(),
  })),
  useMessage: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  })),
}));

jest.mock("@/features/admin/hooks", () => ({
  useAdminOrders: jest.fn(() => ({
    data: {
      orders: [],
      meta: { total: 0, page: 1, pageSize: 25, totalPages: 1 },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    updateMutation: { mutate: jest.fn(), isLoading: false },
  })),
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
  DataTable: () => <div data-testid="data-table" />,
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  TablePagination: () => <div data-testid="table-pagination" />,
  OrderStatusForm: () => <div data-testid="order-status-form" />,
  useOrderTableColumns: () => ({ columns: [] }),
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    ADMIN: {
      ORDERS: "/admin/orders",
    },
  },
  ERROR_MESSAGES: {
    ORDER: {
      FETCH_FAILED: "Failed to fetch orders",
      UPDATE_FAILED: "Failed to update order",
    },
  },
  SUCCESS_MESSAGES: {
    ORDER: { UPDATED: "Order updated" },
  },
}));

describe("AdminOrdersView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    expect(() => render(<AdminOrdersView />)).not.toThrow();
  });

  it("renders the AdminPageHeader", () => {
    render(<AdminOrdersView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable", () => {
    render(<AdminOrdersView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination", () => {
    render(<AdminOrdersView />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });

  it("renders status filter tabs", () => {
    render(<AdminOrdersView />);
    const buttons = screen.getAllByRole("button");
    // Should have at least the 6 status filter tabs (all, pending, confirmed, shipped, delivered, cancelled)
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it("does not render the drawer when closed", () => {
    render(<AdminOrdersView />);
    expect(screen.queryByTestId("side-drawer")).not.toBeInTheDocument();
  });
});
