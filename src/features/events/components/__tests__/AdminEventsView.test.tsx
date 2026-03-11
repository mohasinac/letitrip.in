/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminEventsView } from "../AdminEventsView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useUrlTable: jest.fn(() => ({
    get: jest.fn(() => ""),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
  })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
}));

jest.mock("@/features/events", () => ({
  useEvents: jest.fn(() => ({
    events: [],
    total: 0,
    page: 1,
    pageSize: 25,
    totalPages: 0,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useEventsTableColumns: jest.fn(() => ({ columns: [] })),
  useDeleteEvent: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  EventFormDrawer: ({ isOpen }: any) =>
    isOpen ? <div data-testid="event-form-drawer" /> : null,
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title }: any) => (
    <div data-testid="admin-page-header">{title}</div>
  ),
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="admin-filter-bar">{children}</div>
  ),
  DataTable: ({ emptyMessage }: any) => (
    <div data-testid="data-table">{emptyMessage}</div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div role="dialog">Confirm</div> : null,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    ADMIN: { EVENT_ENTRIES: (id: string) => `/admin/events/${id}/entries` },
  },
}));

describe("AdminEventsView", () => {
  it("renders without crashing", () => {
    render(<AdminEventsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders the data table with empty message", () => {
    render(<AdminEventsView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("noEvents")).toBeInTheDocument();
  });

  it("renders filter bar", () => {
    render(<AdminEventsView />);
    expect(screen.getByTestId("admin-filter-bar")).toBeInTheDocument();
  });

  it("renders table pagination", () => {
    render(<AdminEventsView />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });
});
