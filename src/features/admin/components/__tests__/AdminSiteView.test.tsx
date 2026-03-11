/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminSiteView } from "../AdminSiteView";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: true,
    error: null,
    refetch: jest.fn(),
  })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}));

jest.mock("@/services", () => ({
  siteSettingsService: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title }: any) => (
    <div data-testid="admin-page-header">{title}</div>
  ),
  BackgroundSettings: () => <div data-testid="background-settings" />,
  SiteBasicInfoForm: () => <div data-testid="site-basic-info-form" />,
  SiteContactForm: () => <div data-testid="site-contact-form" />,
  SiteSocialLinksForm: () => <div data-testid="site-social-links-form" />,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
  },
}));

describe("AdminSiteView", () => {
  it("renders the loading state", () => {
    render(<AdminSiteView />);
    expect(screen.getByTestId("admin-page-header")).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders forms when data is loaded", () => {
    const { useApiQuery } = require("@/hooks");
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { data: { siteName: "LetItRip" } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AdminSiteView />);
    expect(screen.getByTestId("background-settings")).toBeInTheDocument();
    expect(screen.getByTestId("site-basic-info-form")).toBeInTheDocument();
    expect(screen.getByTestId("site-contact-form")).toBeInTheDocument();
    expect(screen.getByTestId("site-social-links-form")).toBeInTheDocument();
  });

  it("shows error state with retry button", () => {
    const { useApiQuery } = require("@/hooks");
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: "Fetch failed" },
      refetch: jest.fn(),
    });

    render(<AdminSiteView />);
    expect(screen.getByText("Fetch failed")).toBeInTheDocument();
    expect(screen.getByText("retry")).toBeInTheDocument();
  });
});
