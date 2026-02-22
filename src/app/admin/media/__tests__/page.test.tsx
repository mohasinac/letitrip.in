import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import AdminMediaPage from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/media",
}));

jest.mock("@/hooks", () => ({
  useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
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
  Badge: ({ children }: any) => <span>{children}</span>,
  AdminPageHeader: ({ title, subtitle }: any) => (
    <div>
      <h1 data-testid="page-title">{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
  MediaOperationForm: ({ onSubmit }: any) => (
    <form
      data-testid="media-operation-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({});
      }}
    >
      <button type="submit">Submit</button>
    </form>
  ),
  DataTable: () => <div data-testid="data-table" />,
  getMediaTableColumns: () => [],
  useToast: () => ({ showToast: jest.fn() }),
}));

const LABELS = UI_LABELS.ADMIN.MEDIA;

describe("Admin Media Operations Page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the media page title", () => {
    render(<AdminMediaPage />);
    expect(screen.getByTestId("page-title")).toHaveTextContent(LABELS.TITLE);
  });

  it("renders the MediaOperationForm", () => {
    render(<AdminMediaPage />);
    expect(screen.getByTestId("media-operation-form")).toBeInTheDocument();
  });

  it("shows DataTable only when recent operations exist (empty by default)", () => {
    render(<AdminMediaPage />);
    // DataTable is conditionally rendered only when recentOperations.length > 0
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("renders Crop Image and Trim Video operation type options", () => {
    render(<AdminMediaPage />);
    // Buttons include emoji prefix, so use regex or partial match
    expect(
      screen.getByText((content) => content.includes(LABELS.CROP_IMAGE)),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes(LABELS.TRIM_VIDEO)),
    ).toBeInTheDocument();
  });

  it("shows No operations text when recent operations list is empty", () => {
    render(<AdminMediaPage />);
    expect(screen.getByText(LABELS.NO_OPERATIONS)).toBeInTheDocument();
  });
});
