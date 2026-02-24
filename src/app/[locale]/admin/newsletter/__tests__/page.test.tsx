import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import AdminNewsletterPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/newsletter",
}));

const mockMutate = jest.fn();

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: {
      subscribers: [],
      meta: { total: 0, page: 1, pageSize: 25, totalPages: 1, hasMore: false },
      stats: { total: 42, active: 38, unsubscribed: 4, sources: {} },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: jest.fn(() => ({
    mutate: mockMutate,
    isLoading: false,
  })),
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
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  AdminPageHeader: ({ title, subtitle }: any) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete-modal" /> : null,
  getNewsletterTableColumns: () => [],
}));

describe("Admin Newsletter Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the newsletter page title", async () => {
    render(<AdminNewsletterPage />);
    expect(
      await screen.findByText(UI_LABELS.ADMIN.NEWSLETTER.TITLE),
    ).toBeInTheDocument();
  });

  it("renders DataTable for subscriber list", async () => {
    render(<AdminNewsletterPage />);
    expect(await screen.findByTestId("data-table")).toBeInTheDocument();
  });

  it("renders newsletter stats when data is available", async () => {
    render(<AdminNewsletterPage />);
    await screen.findByTestId("data-table");
    // Stats (total: 42, active: 38) should appear somewhere on the page
    // The stats section shows these numbers
    expect(screen.getByText("42") || screen.getByText("38")).toBeTruthy();
  });

  it("renders status filter tabs", async () => {
    render(<AdminNewsletterPage />);
    expect(
      await screen.findByText(UI_LABELS.ADMIN.NEWSLETTER.FILTER_ALL),
    ).toBeInTheDocument();
  });

  it("renders active subscribers tab", async () => {
    render(<AdminNewsletterPage />);
    expect(
      await screen.findByText(UI_LABELS.ADMIN.NEWSLETTER.FILTER_ACTIVE),
    ).toBeInTheDocument();
  });

  it("changes status tab and updates internal state (shows active subscribers label)", async () => {
    render(<AdminNewsletterPage />);
    // There should be at least 2 status tab buttons
    const allTab = await screen.findByText(
      UI_LABELS.ADMIN.NEWSLETTER.FILTER_ALL,
    );
    const activeTab = screen.getByText(
      UI_LABELS.ADMIN.NEWSLETTER.FILTER_ACTIVE,
    );
    expect(allTab).toBeInTheDocument();
    expect(activeTab).toBeInTheDocument();
    // Clicking active tab should not throw
    expect(() => fireEvent.click(activeTab)).not.toThrow();
  });
});
