import { render, screen } from "@testing-library/react";
import type React from "react";
import UserAddressesPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" }, loading: false }),
  useAddresses: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useDeleteAddress: () => ({ mutate: jest.fn(), isLoading: false }),
  useSetDefaultAddress: () => ({ mutate: jest.fn(), isLoading: false }),
  useMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}));

jest.mock("@/components", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Spinner: () => <div data-testid="spinner" />,
  EmptyState: ({
    title,
    actionLabel,
  }: {
    title: string;
    actionLabel: string;
  }) => (
    <div>
      <div>{title}</div>
      <button>{actionLabel}</button>
    </div>
  ),
  AddressCard: () => <div data-testid="address-card" />,
  ConfirmDeleteModal: () => <div data-testid="confirm-delete" />,
}));

describe("User Addresses Page", () => {
  it("renders empty state and add button", () => {
    render(<UserAddressesPage />);

    expect(
      screen.getByText(UI_LABELS.USER.ADDRESSES.TITLE),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.USER.ADDRESSES.ADD }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.USER.ADDRESSES.ADD_FIRST }),
    ).toBeInTheDocument();
  });
});
