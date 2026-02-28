import { render, screen } from "@testing-library/react";
import type React from "react";
import EditAddressPage from "../page";

const mockPush = jest.fn();
const mockUpdateAddress = jest.fn();
const mockDeleteAddress = jest.fn();

const mockAddress = {
  id: "address-1",
  label: "Home",
  fullName: "Test User",
  phone: "1234567890",
  addressLine1: "Line 1",
  addressLine2: "",
  city: "City",
  state: "State",
  postalCode: "000000",
  country: "India",
  isDefault: false,
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "address-1" }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" }, loading: false }),
  useAddress: () => ({
    data: mockAddress,
    isLoading: false,
    error: null,
  }),
  useUpdateAddress: () => ({ mutate: mockUpdateAddress, isLoading: false }),
  useDeleteAddress: () => ({ mutate: mockDeleteAddress, isLoading: false }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Spinner: () => <div data-testid="spinner" />,
  AddressForm: () => <div data-testid="address-form" />,
  ConfirmDeleteModal: () => <div data-testid="confirm-delete" />,
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
  SUCCESS_MESSAGES: {
    ADDRESS: { UPDATED: "Address updated", DELETED: "Address deleted" },
  },
  ERROR_MESSAGES: {
    ADDRESS: { FETCH_FAILED: "Fetch failed" },
    GENERIC: { INTERNAL_ERROR: "An error occurred" },
  },
}));

describe("Edit Address Page", () => {
  it("renders edit form with address data", () => {
    render(<EditAddressPage />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-delete")).toBeInTheDocument();
  });

  it("renders delete button", () => {
    render(<EditAddressPage />);
    expect(screen.getByRole("button", { name: "delete" })).toBeInTheDocument();
  });
});
