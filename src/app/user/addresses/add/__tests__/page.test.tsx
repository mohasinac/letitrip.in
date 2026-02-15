import { render, screen } from "@testing-library/react";
import type React from "react";
import AddAddressPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" }, loading: false }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Spinner: () => <div data-testid="spinner" />,
  AddressForm: () => <div data-testid="address-form" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("Add Address Page", () => {
  it("renders the address form", () => {
    render(<AddAddressPage />);

    expect(screen.getByText(UI_LABELS.USER.ADDRESSES.ADD)).toBeInTheDocument();
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });
});
