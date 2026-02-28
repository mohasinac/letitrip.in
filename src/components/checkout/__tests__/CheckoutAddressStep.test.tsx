import React from "react";
import { render, screen } from "@testing-library/react";
import { CheckoutAddressStep } from "../CheckoutAddressStep";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockAddress = {
  id: "addr1",
  userId: "u1",
  label: "Home",
  fullName: "Jane Doe",
  phone: "9876543210",
  addressLine1: "123 Main St",
  addressLine2: null,
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
  country: "India",
  landmark: null,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CheckoutAddressStep", () => {
  it("shows selectAddress heading", () => {
    render(
      <CheckoutAddressStep
        addresses={[]}
        selectedAddressId={null}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("selectAddress")).toBeInTheDocument();
  });

  it("shows noAddresses message when no addresses", () => {
    render(
      <CheckoutAddressStep
        addresses={[]}
        selectedAddressId={null}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("noAddresses")).toBeInTheDocument();
  });

  it("shows addNewAddress link in empty state", () => {
    render(
      <CheckoutAddressStep
        addresses={[]}
        selectedAddressId={null}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("addNewAddress")).toBeInTheDocument();
  });

  it("renders address when addresses are provided", () => {
    render(
      <CheckoutAddressStep
        addresses={[mockAddress as any]}
        selectedAddressId="addr1"
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders addNewAddress link when addresses exist", () => {
    render(
      <CheckoutAddressStep
        addresses={[mockAddress as any]}
        selectedAddressId="addr1"
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("addNewAddress")).toBeInTheDocument();
  });
});
