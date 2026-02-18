import { render, screen } from "@testing-library/react";
import type React from "react";
import AdminSiteSettings from "../page";
import { UI_LABELS } from "@/constants";

jest.mock("@/components", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  BackgroundSettings: () => <div data-testid="background-settings" />,
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/components/admin/site", () => ({
  SiteBasicInfoForm: () => <div data-testid="basic-info-form" />,
  SiteContactForm: () => <div data-testid="contact-form" />,
  SiteSocialLinksForm: () => <div data-testid="social-links-form" />,
}));

jest.mock("@/classes", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

jest.mock("@/hooks", () => ({
  useApiQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useApiMutation: () => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Admin Site Settings Page", () => {
  it("renders site settings content", () => {
    render(<AdminSiteSettings />);

    expect(screen.getByText(UI_LABELS.ADMIN.SITE.TITLE)).toBeInTheDocument();
    expect(screen.getByTestId("background-settings")).toBeInTheDocument();
  });
});
