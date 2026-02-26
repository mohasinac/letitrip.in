/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminReviewsView } from "../AdminReviewsView";

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
    get: jest.fn(() => ""),
    getNumber: jest.fn(() => 1),
    set: jest.fn(),
    setPage: jest.fn(),
    params: { toString: () => "" },
    buildSieveParams: jest.fn(() => ""),
  })),
}));

jest.mock("@/services", () => ({
  reviewService: {
    list: jest.fn(),
    listAdmin: jest.fn(),
    vote: jest.fn(),
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
    </div>
  ),
  TablePagination: () => <div data-testid="table-pagination" />,
  Modal: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ConfirmDeleteModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="confirm-delete" /> : null,
  getReviewTableColumns: () => [{ key: "rating", header: "Rating" }],
  ReviewRowActions: () => <div data-testid="review-actions" />,
  ReviewDetailView: () => <div data-testid="review-detail" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: { gap: { md: "gap-4" }, stack: "space-y-4" },
    patterns: { adminInput: "border border-gray-300 rounded-lg px-3 py-2" },
    input: { base: "border border-gray-300 rounded-lg px-3 py-2 w-full" },
  },
  ROUTES: { ADMIN: { REVIEWS: "/admin/reviews" } },
}));

describe("AdminReviewsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminReviewsView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminReviewsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable with review columns", () => {
    render(<AdminReviewsView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
