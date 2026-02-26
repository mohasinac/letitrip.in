/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminCarouselView } from "../AdminCarouselView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}));

jest.mock("@/services", () => ({
  carouselService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    reorder: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, actionLabel, onAction }: any) => (
    <div data-testid="admin-page-header">
      {title}
      {actionLabel && onAction && (
        <button data-testid="action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  SideDrawer: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="side-drawer">{children}</div> : null,
  DataTable: ({ columns }: any) => (
    <div data-testid="data-table">{columns?.length ?? 0} cols</div>
  ),
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  getCarouselTableColumns: () => [{ key: "title", header: "Title" }],
  CarouselSlideForm: () => <div data-testid="carousel-form" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    ADMIN: { CAROUSEL: "/admin/carousel", CAROUSEL_NEW: "/admin/carousel/new" },
  },
}));

describe("AdminCarouselView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminCarouselView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminCarouselView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable", () => {
    render(<AdminCarouselView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders Add Slide button", () => {
    render(<AdminCarouselView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
