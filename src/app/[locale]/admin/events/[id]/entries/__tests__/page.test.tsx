import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import AdminEventEntriesPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/events/evt-1/entries",
  useParams: () => ({ id: "evt-1" }),
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
  ROUTES: { ADMIN: { EVENTS: "/admin/events" } },
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
  AdminPageHeader: ({ title }: any) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="filter-bar">{children}</div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

jest.mock("@/features/events", () => ({
  useEvent: jest.fn(() => ({
    event: {
      id: "evt-1",
      title: "Test Event",
      type: "survey",
      status: "active",
    },
    isLoading: false,
  })),
  useEventEntries: jest.fn(() => ({
    entries: [],
    total: 0,
    page: 1,
    pageSize: 25,
    totalPages: 0,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useEventStats: jest.fn(() => ({
    stats: {
      totalEntries: 0,
      approvedEntries: 0,
      pendingEntries: 0,
      rejectedEntries: 0,
    },
    isLoading: false,
  })),
  useEventEntriesTableColumns: jest.fn(() => ({ columns: [] })),
  EventStatsBanner: ({ stats }: any) => (
    <div data-testid="event-stats-banner">{stats?.totalEntries ?? 0}</div>
  ),
  EntryReviewDrawer: ({ isOpen }: any) =>
    isOpen ? <div data-testid="entry-review-drawer" /> : null,
  useReviewEntry: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}));

const { useEvent, useEventEntries } = require("@/features/events");

describe("Admin Event Entries Page (/admin/events/[id]/entries)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() => render(<AdminEventEntriesPage />)).not.toThrow();
  });

  it("renders the page header", () => {
    render(<AdminEventEntriesPage />);
    expect(screen.getByTestId("page-title")).toBeInTheDocument();
  });

  it("renders DataTable for entries list", () => {
    render(<AdminEventEntriesPage />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders EventStatsBanner with stats", () => {
    render(<AdminEventEntriesPage />);
    expect(screen.getByTestId("event-stats-banner")).toBeInTheDocument();
  });

  it("renders TablePagination", () => {
    render(<AdminEventEntriesPage />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });

  it("shows entries data when entries are loaded", () => {
    (useEventEntries as jest.Mock).mockReturnValue({
      entries: [
        {
          id: "entry-1",
          eventId: "evt-1",
          userId: "user-1",
          status: "pending",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      isLoading: false,
      refetch: jest.fn(),
    });
    render(<AdminEventEntriesPage />);
    // DataTable still renders, entries data passed as props
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
