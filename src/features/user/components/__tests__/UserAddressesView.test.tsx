import React from "react";
import { render, screen } from "@testing-library/react";
import { UserAddressesView } from "../UserAddressesView";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useAuth: () => ({ user: null, loading: true }),
  useAddresses: () => ({
    data: null,
    isLoading: true,
    error: null,
    refetch: jest.fn(),
  }),
  useDeleteAddress: () => ({ mutate: jest.fn(), isLoading: false }),
  useSetDefaultAddress: () => ({ mutate: jest.fn() }),
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}));

jest.mock("@/components", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  Spinner: ({ label }: { label?: string }) => (
    <div data-testid="spinner">{label}</div>
  ),
  EmptyState: () => <div data-testid="empty-state" />,
  AddressCard: () => <div data-testid="address-card" />,
  ConfirmDeleteModal: () => <div data-testid="confirm-delete-modal" />,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    AUTH: { LOGIN: "/login" },
    USER: {
      ADDRESSES_ADD: "/user/addresses/add",
      ADDRESSES_EDIT: (id: string) => `/user/addresses/edit/${id}`,
    },
  },
  THEME_CONSTANTS: { spacing: { stack: "space-y-4" } },
  SUCCESS_MESSAGES: {
    ADDRESS: { DELETED: "Deleted", DEFAULT_SET: "Default set" },
  },
  ERROR_MESSAGES: { GENERIC: { INTERNAL_ERROR: "An error occurred" } },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

describe("UserAddressesView", () => {
  it("shows spinner while auth is loading", () => {
    render(<UserAddressesView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});
