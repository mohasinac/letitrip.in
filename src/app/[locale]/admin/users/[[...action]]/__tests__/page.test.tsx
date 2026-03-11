import { render, screen } from "@testing-library/react";
import type React from "react";
import { AdminUsersView } from "@/features/admin";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  useApiQuery: () => ({
    data: { users: [], total: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useApiMutation: () => ({ mutate: jest.fn() }),
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

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  ConfirmDeleteModal: () => <div data-testid="confirm-delete" />,
  TablePagination: () => <div data-testid="table-pagination" />,
  useToast: () => ({ showToast: jest.fn() }),
  UserFilters: () => <div data-testid="user-filters" />,
  useUserTableColumns: () => ({ columns: [], actions: [] }),
  UserDetailDrawer: () => <div data-testid="user-drawer" />,
}));

describe("Admin Users Page", () => {
  it("renders users page content", async () => {
    render(<AdminUsersView />);

    expect(
      await screen.findByText(UI_LABELS.ADMIN.USERS.TITLE),
    ).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
