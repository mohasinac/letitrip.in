import { render, screen } from "@testing-library/react";
import type React from "react";
import { AdminCarouselView } from "@/features/admin";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
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
  useCarouselTableColumns: () => ({ columns: [], actions: () => null }),
  CarouselSlideForm: () => <div data-testid="carousel-form" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("Admin Carousel Page", () => {
  it("renders carousel content", async () => {
    render(<AdminCarouselView />);
    expect(
      await screen.findByText(UI_LABELS.ADMIN.CAROUSEL.TITLE),
    ).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
