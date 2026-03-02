/**
 * SellerStoreView tests
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { SellerStoreView } from "../SellerStoreView";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/seller/store",
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "seller-1", email: "s@e.com", displayName: "Seller" },
    loading: false,
  })),
}));

jest.mock("../../hooks", () => ({
  useSellerStore: jest.fn().mockReturnValue({
    publicProfile: { storeName: "Test Shop", isVacationMode: false },
    storeSlug: "test-shop",
    isLoading: false,
    isSaving: false,
    error: null,
    updateStore: jest.fn(),
    refetch: jest.fn(),
  }),
  useSellerProducts: jest.fn(() => ({})),
  useSellerOrders: jest.fn(() => ({})),
}));

jest.mock("lucide-react", () => ({
  Store: () => <span data-testid="icon-store" />,
  Globe: () => <span data-testid="icon-globe" />,
  MapPin: () => <span data-testid="icon-mappin" />,
  Twitter: () => <span data-testid="icon-twitter" />,
  Instagram: () => <span data-testid="icon-instagram" />,
  Facebook: () => <span data-testid="icon-facebook" />,
  Linkedin: () => <span data-testid="icon-linkedin" />,
}));

jest.mock("@/components", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  FormField: ({ label, name }: any) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input name={name} />
    </div>
  ),
  Toggle: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      data-testid="vacation-toggle"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
  Alert: ({ children, title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>
      {title && <strong>{title}</strong>}
      {children}
    </div>
  ),
  Spinner: ({ size }: any) => <div data-testid={`spinner-${size}`} />,
  Divider: () => <hr />,
  Heading: ({ children, level }: any) => {
    const Tag = `h${level ?? 2}` as any;
    return <Tag>{children}</Tag>;
  },
  Text: ({ children }: any) => <p>{children}</p>,
  Label: ({ children }: any) => <label>{children}</label>,
  Caption: ({ children }: any) => <small>{children}</small>,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  ROUTES: { AUTH: { LOGIN: "/auth/login" } },
  SUCCESS_MESSAGES: {
    USER: { STORE_UPDATED: "Store settings saved successfully" },
  },
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4", padding: { md: "p-4", lg: "p-6" } },
    typography: { h3: "text-lg font-semibold" },
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
  },
}));

describe("SellerStoreView", () => {
  it("renders form sections without crashing", () => {
    render(<SellerStoreView />);
    expect(screen.getByText("sectionStoreDetails")).toBeInTheDocument();
    expect(screen.getByText("sectionSocial")).toBeInTheDocument();
    expect(screen.getByText("sectionPolicies")).toBeInTheDocument();
    expect(screen.getByText("sectionVacation")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    const { useSellerStore } = require("../../hooks");
    (useSellerStore as jest.Mock).mockReturnValueOnce({
      publicProfile: null,
      storeSlug: null,
      isLoading: true,
      isSaving: false,
      error: null,
      updateStore: jest.fn(),
      refetch: jest.fn(),
    });
    render(<SellerStoreView />);
    expect(screen.getByTestId("spinner-lg")).toBeInTheDocument();
  });

  it("does not show vacation alert when vacation mode is off", () => {
    render(<SellerStoreView />);
    expect(screen.queryByTestId("alert-warning")).not.toBeInTheDocument();
  });
});
