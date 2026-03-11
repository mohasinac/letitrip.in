/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminCategoriesView } from "../AdminCategoriesView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}));

jest.mock("@/services", () => ({
  categoryService: {
    listAll: jest.fn(),
    listTree: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, action }: any) => (
    <div data-testid="admin-page-header">
      {title}
      {action}
    </div>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  CategoryTreeView: ({ categories }: any) => (
    <div data-testid="category-tree">
      {(categories ?? []).length} categories
    </div>
  ),
  DataTable: ({ columns }: any) => (
    <div data-testid="data-table">{columns?.length ?? 0} cols</div>
  ),
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete" /> : null,
  getCategoryTableColumns: () => [{ key: "name", header: "Name" }],
  CategoryForm: () => <div data-testid="category-form" />,
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
  ROUTES: {
    ADMIN: {
      CATEGORIES: "/admin/categories",
      CATEGORY_NEW: "/admin/categories/new",
    },
  },
  SUCCESS_MESSAGES: {
    CATEGORY: { CREATED: "Created", UPDATED: "Updated", DELETED: "Deleted" },
  },
  ERROR_MESSAGES: { CATEGORY: { NOT_FOUND: "Not found" } },
}));

describe("AdminCategoriesView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminCategoriesView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminCategoriesView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders Add Category button", () => {
    render(<AdminCategoriesView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
