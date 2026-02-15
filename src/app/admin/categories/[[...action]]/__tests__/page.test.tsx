import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import type React from "react";
import AdminCategoriesPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: (promise: Promise<any>) => ({}),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("@/hooks", () => ({
  useApiQuery: () => ({
    data: { categories: [] },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useApiMutation: () => ({ mutate: jest.fn() }),
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
  CategoryTreeView: () => <div data-testid="category-tree" />,
  DataTable: () => <div data-testid="data-table" />,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  SideDrawer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  getCategoryTableColumns: () => ({ columns: [], actions: [] }),
  CategoryForm: () => <div data-testid="category-form" />,
  flattenCategories: () => [],
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("Admin Categories Page", () => {
  it("renders categories content", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <AdminCategoriesPage params={Promise.resolve({})} />
      </Suspense>,
    );

    expect(
      await screen.findByText(UI_LABELS.ADMIN.CATEGORIES.TITLE),
    ).toBeInTheDocument();
  });
});
