import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import AdminEventsPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/events",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
  useUrlTable: () => ({
    get: jest.fn().mockReturnValue(""),
    getNumber: jest.fn().mockReturnValue(1),
    set: jest.fn(),
    setMany: jest.fn(),
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    setSort: jest.fn(),
    buildSieveParams: jest.fn().mockReturnValue(""),
    params: new URLSearchParams(),
  }),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    ADMIN: {
      EVENTS: "/admin/events",
      EVENTS_ENTRIES: (id: string) => `/admin/events/${id}/entries`,
    },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4" },
    },
    typography: { h2: "text-2xl font-bold" },
    borderRadius: { xl: "rounded-xl" },
  },
}));

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  AdminPageHeader: ({ title, subtitle }: any) => (
    <div>
      <h1 data-testid="page-title">{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="filter-bar">{children}</div>
  ),
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete-modal" /> : null,
  TablePagination: () => <div data-testid="table-pagination" />,
  StatusBadge: ({ status }: any) => <span>{status}</span>,
  Select: ({ children }: any) => <select>{children}</select>,
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
  EventFormDrawer: ({ isOpen }: any) =>
    isOpen ? <div data-testid="event-form-drawer" /> : null,
  useDeleteEvent: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useChangeEventStatus: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
  })),
  EVENT_STATUS_VALUES: ["", "active", "draft", "paused", "ended"],
  EVENT_TYPE_VALUES: ["poll", "sale", "offer", "survey", "feedback"],
  EVENT_SORT_OPTIONS: [{ value: "-createdAt", label: "Newest" }],
}));

const { useEvents } = require("@/features/events");

describe("Admin Events Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() => render(<AdminEventsPage />)).not.toThrow();
  });

  it("renders the page header", () => {
    render(<AdminEventsPage />);
    expect(screen.getByTestId("page-title")).toBeInTheDocument();
  });

  it("renders the DataTable for events list", () => {
    render(<AdminEventsPage />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders TablePagination", () => {
    render(<AdminEventsPage />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });

  it("shows loading state when events are fetching", () => {
    (useEvents as jest.Mock).mockReturnValue({
      events: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
      isLoading: true,
      refetch: jest.fn(),
    });
    render(<AdminEventsPage />);
    // DataTable should still render (it handles its own loading state)
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
