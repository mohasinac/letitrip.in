/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserEditAddressView } from "../UserEditAddressView";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ id: "addr_123" }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({ user: { uid: "user_1" }, loading: false })),
  useAddress: jest.fn(() => ({
    data: {
      id: "addr_123",
      line1: "123 Main St",
      city: "Mumbai",
      state: "MH",
      postalCode: "400001",
      country: "IN",
      isDefault: false,
    },
    isLoading: false,
    error: null,
  })),
  useUpdateAddress: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useDeleteAddress: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
}));

jest.mock("@/components", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Heading: ({ children }: any) => <div role="heading">{children}</div>,
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  Spinner: ({ size, label }: any) => <div data-testid="spinner">{label}</div>,
  AddressForm: ({ onSubmit, onCancel, submitLabel }: any) => (
    <div data-testid="address-form">
      <button onClick={() => onSubmit({})}>Submit: {submitLabel}</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
  ConfirmDeleteModal: ({ isOpen, onClose, onConfirm, title }: any) =>
    isOpen ? (
      <div role="dialog">
        <span>{title}</span>
        <button onClick={onClose}>Close</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4", cardPadding: "p-4" },
  },
  ROUTES: {
    AUTH: { LOGIN: "/login" },
    USER: { ADDRESSES: "/user/addresses" },
  },
  SUCCESS_MESSAGES: {
    ADDRESS: { UPDATED: "Address updated.", DELETED: "Address deleted." },
  },
  ERROR_MESSAGES: {
    ADDRESS: { FETCH_FAILED: "Failed to fetch address." },
    GENERIC: { INTERNAL_ERROR: "An error occurred." },
  },
}));

describe("UserEditAddressView", () => {
  it("renders the edit form with heading", () => {
    render(<UserEditAddressView />);
    expect(screen.getByText("edit")).toBeInTheDocument();
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("shows spinner while loading", () => {
    const { useAuth } = require("@/hooks");
    (useAuth as jest.Mock).mockReturnValueOnce({ user: null, loading: true });

    render(<UserEditAddressView />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("shows delete button", () => {
    render(<UserEditAddressView />);
    const deleteButton = screen.getByText("delete");
    expect(deleteButton).toBeInTheDocument();
  });

  it("returns null when user is absent and not loading", () => {
    const { useAuth } = require("@/hooks");
    (useAuth as jest.Mock).mockReturnValueOnce({ user: null, loading: false });

    const { container } = render(<UserEditAddressView />);
    expect(container.firstChild).toBeNull();
  });
});
