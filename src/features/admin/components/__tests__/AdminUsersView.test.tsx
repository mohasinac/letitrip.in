/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminUsersView } from "../AdminUsersView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useUrlTable: jest.fn(() => ({
    get: jest.fn((key: string) => (key === "tab" ? "all" : "")),
    getNumber: jest.fn(() => 1),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
    buildSieveParams: jest.fn(() => ""),
  })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
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
  DataTable: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <span data-testid="col-count">{columns?.length ?? 0}</span>
      <span data-testid="row-count">{(data ?? []).length}</span>
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete" /> : null,
  ListingLayout: ({ children }: any) => (
    <div data-testid="listing-layout">{children}</div>
  ),
  Search: ({ onChange }: any) => (
    <input
      data-testid="search-input"
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Search"
    />
  ),
  FilterFacetSection: () => <div data-testid="filter-facet-section" />,
  useUserTableColumns: () => [
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
  ],
  UserDetailDrawer: ({ isOpen }: any) =>
    isOpen ? <div data-testid="user-drawer" /> : null,
  useToast: () => ({ showToast: jest.fn() }),
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
  ROUTES: { ADMIN: { USERS: "/admin/users" } },
}));

describe("AdminUsersView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminUsersView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminUsersView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable with user columns", () => {
    render(<AdminUsersView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders search/filter controls", () => {
    render(<AdminUsersView />);
    expect(screen.getByTestId("user-filters")).toBeInTheDocument();
  });

  it("renders TablePagination", () => {
    render(<AdminUsersView />);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });
});
