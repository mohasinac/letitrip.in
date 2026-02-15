import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import type React from "react";
import AdminSectionsPage from "../page";
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
    data: { sections: [] },
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
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  DataTable: () => <div data-testid="data-table" />,
  SideDrawer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  DrawerFormFooter: () => <div data-testid="drawer-footer" />,
  getSectionTableColumns: () => ({ columns: [], actions: [] }),
  SectionForm: () => <div data-testid="section-form" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("Admin Sections Page", () => {
  it("renders sections content", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <AdminSectionsPage params={Promise.resolve({})} />
      </Suspense>,
    );

    expect(
      await screen.findByText(UI_LABELS.ADMIN.SECTIONS.TITLE),
    ).toBeInTheDocument();
  });
});
