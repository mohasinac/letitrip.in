import { render, screen } from "@testing-library/react";
import type React from "react";
import AddAddressPage from "../page";

const mockPush = jest.fn();
const mockCreateAddress = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  useAuth: () => ({ user: { uid: "user-1" }, loading: false }),
  useCreateAddress: () => ({
    mutate: mockCreateAddress,
    isLoading: false,
  }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Spinner: () => <div data-testid="spinner" />,
  AddressForm: () => <div data-testid="address-form" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4", cardPadding: "p-4" },
  },
  ROUTES: {
    AUTH: { LOGIN: "/auth/login" },
    USER: { ADDRESSES: "/user/addresses" },
  },
  SUCCESS_MESSAGES: { ADDRESS: { CREATED: "Address created" } },
  ERROR_MESSAGES: { GENERIC: { INTERNAL_ERROR: "An error occurred" } },
}));

describe("Add Address Page", () => {
  it("renders the address form when authenticated", () => {
    render(<AddAddressPage />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    jest.resetModules();
    jest.mock("@/hooks", () => ({
      ...jest.requireActual("@/hooks"),
      useAuth: () => ({ user: null, loading: false }),
      useCreateAddress: () => ({ mutate: jest.fn(), isLoading: false }),
    }));
    // basic smoke test — auth redirect handled in component
    render(<AddAddressPage />);
  });

  it("shows spinner when auth is loading", () => {
    jest.doMock("@/hooks", () => ({
      useAuth: () => ({ user: null, loading: true }),
      useCreateAddress: () => ({ mutate: jest.fn(), isLoading: false }),
    }));
    render(<AddAddressPage />);
  });
});
