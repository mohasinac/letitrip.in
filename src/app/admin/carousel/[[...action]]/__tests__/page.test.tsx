import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import type React from "react";
import AdminCarouselPage from "../page";
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
    data: { slides: [] },
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
  getCarouselTableColumns: () => ({ columns: [], actions: [] }),
  CarouselSlideForm: () => <div data-testid="carousel-form" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("Admin Carousel Page", () => {
  it("renders carousel content", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <AdminCarouselPage params={Promise.resolve({})} />
      </Suspense>,
    );

    expect(
      await screen.findByText(UI_LABELS.ADMIN.CAROUSEL.TITLE),
    ).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
