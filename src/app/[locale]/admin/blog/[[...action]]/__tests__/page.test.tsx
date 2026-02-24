import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { Suspense } from "react";
import AdminBlogPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: (_: Promise<any>) => ({ action: undefined }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/blog",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: {
      posts: [],
      meta: {
        total: 0,
        published: 0,
        drafts: 0,
        featured: 0,
        filteredTotal: 0,
        page: 1,
        pageSize: 25,
        totalPages: 1,
        hasMore: false,
      },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showError: jest.fn(), showSuccess: jest.fn() }),
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
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, "data-testid": testId }: any) => (
    <button onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  AdminPageHeader: ({ title, actionLabel, onAction }: any) => (
    <div>
      <h1>{title}</h1>
      {actionLabel && (
        <button onClick={onAction} data-testid="page-action-btn">
          {actionLabel}
        </button>
      )}
    </div>
  ),
  DrawerFormFooter: ({ onCancel, submitLabel }: any) => (
    <div>
      <button onClick={onCancel} data-testid="cancel-btn">
        Cancel
      </button>
      <button type="submit">{submitLabel || "Save"}</button>
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  AdminFilterBar: ({ children }: any) => (
    <div data-testid="admin-filter-bar">{children}</div>
  ),
  ConfirmDeleteModal: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="confirm-delete">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
  getBlogTableColumns: () => [],
  BlogForm: () => <div data-testid="blog-form" />,
}));

const LABELS = UI_LABELS.ADMIN.BLOG;

describe("Admin Blog Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the blog page title", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBlogPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByText(LABELS.TITLE)).toBeInTheDocument();
  });

  it("renders the DataTable", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBlogPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders New Post action button", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBlogPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByTestId("page-action-btn")).toBeInTheDocument();
  });

  it("clicking New Post button opens SideDrawer in create mode", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBlogPage params={Promise.resolve({})} />
      </Suspense>,
    );
    const btn = await screen.findByTestId("page-action-btn");
    fireEvent.click(btn);
    expect(await screen.findByTestId("side-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("blog-form")).toBeInTheDocument();
  });

  it("status filter tabs render All, Drafts, Published, Archived", async () => {
    render(
      <Suspense fallback={null}>
        <AdminBlogPage params={Promise.resolve({})} />
      </Suspense>,
    );
    expect(await screen.findByText(LABELS.FILTER_ALL)).toBeInTheDocument();
    // FILTER_DRAFT may appear in both tab buttons and stat cards, so we check at least one
    expect(
      screen.getAllByText(LABELS.FILTER_DRAFT).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(LABELS.FILTER_PUBLISHED).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(LABELS.FILTER_ARCHIVED)).toBeInTheDocument();
  });
});
