import { render, screen } from "@testing-library/react";
import type React from "react";
import EditAddressPage from "../page";
import { UI_LABELS } from "@/constants";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "address-1" }),
}));

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" }, loading: false }),
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Button: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Spinner: () => <div data-testid="spinner" />,
  AddressForm: () => <div data-testid="address-form" />,
  ConfirmDeleteModal: () => <div data-testid="confirm-delete" />,
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("Edit Address Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fullName: "Test User",
        phone: "1234567890",
        addressLine1: "Line 1",
        city: "City",
        state: "State",
        pincode: "000000",
        country: "Country",
      }),
    } as Response);
  });

  it("renders edit form", async () => {
    render(<EditAddressPage />);

    expect(
      await screen.findByText(UI_LABELS.USER.ADDRESSES.EDIT),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.DELETE }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });
});
