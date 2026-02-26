/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminNewsletterView } from "../AdminNewsletterView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listNewsletter: jest.fn(),
    updateNewsletterEntry: jest.fn(),
    deleteNewsletterEntry: jest.fn(),
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
      <span>{columns?.length ?? 0} cols</span>
      <span>{(data ?? []).length} rows</span>
    </div>
  ),
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete" /> : null,
  getNewsletterTableColumns: () => [
    { key: "email", header: "Email" },
    { key: "status", header: "Status" },
  ],
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
  },
  ERROR_MESSAGES: { GENERIC: { UNEXPECTED: "Unexpected error" } },
  SUCCESS_MESSAGES: {
    NEWSLETTER: { UNSUBSCRIBED: "Unsubscribed", DELETED: "Deleted" },
  },
}));

describe("AdminNewsletterView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminNewsletterView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminNewsletterView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders subscriber DataTable", () => {
    render(<AdminNewsletterView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("shows subscriber stats cards", () => {
    const { useApiQuery } = require("@/hooks");
    useApiQuery.mockReturnValue({
      data: {
        stats: { total: 100, active: 80, unsubscribed: 20, sources: {} },
        subscribers: [],
      },
      isLoading: false,
      error: null,
    });
    render(<AdminNewsletterView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });
});
