/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminSectionsView } from "../AdminSectionsView";

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
  homepageSectionsService: {
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
  DataTable: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <span>{columns?.length ?? 0} cols</span>
      <span>{(data ?? []).length} rows</span>
    </div>
  ),
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  useSectionTableColumns: () => [{ key: "type", header: "Type" }],
  SectionForm: () => <div data-testid="section-form" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    ADMIN: { SECTIONS: "/admin/sections", SECTIONS_NEW: "/admin/sections/new" },
  },
}));

describe("AdminSectionsView", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    render(<AdminSectionsView />);
  });

  it("renders AdminPageHeader", () => {
    render(<AdminSectionsView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
  });

  it("renders DataTable", () => {
    render(<AdminSectionsView />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(<AdminSectionsView />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
