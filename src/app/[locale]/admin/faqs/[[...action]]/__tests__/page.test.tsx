import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import type React from "react";
import AdminFAQsPage from "../page";
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
    data: { faqs: [] },
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
  SideDrawer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DataTable: () => <div data-testid="data-table" />,
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  getFaqTableColumns: () => ({ columns: [], actions: [] }),
  FaqForm: () => <div data-testid="faq-form" />,
  AdminFilterBar: () => <div data-testid="admin-filter-bar" />,
  FormField: () => <div data-testid="form-field" />,
  TablePagination: () => <div data-testid="table-pagination" />,
}));

describe("Admin FAQs Page", () => {
  it("renders faqs content", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <AdminFAQsPage params={Promise.resolve({})} />
      </Suspense>,
    );

    expect(
      await screen.findByText(UI_LABELS.ADMIN.FAQS.TITLE),
    ).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
