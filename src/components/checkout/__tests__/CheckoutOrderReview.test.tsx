import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutOrderReview } from "../CheckoutOrderReview";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params && typeof params === "object") {
      return `${key}(${JSON.stringify(params)})`;
    }
    return key;
  },
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));
jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount}`,
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

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

const mockItem = {
  itemId: "i1",
  productId: "p1",
  productTitle: "Trek Boots",
  productImage: "/img.jpg",
  price: 2500,
  currency: "INR",
  quantity: 1,
  sellerId: "s1",
  sellerName: "Himalaya Treks",
  isAuction: false,
  addedAt: new Date(),
  updatedAt: new Date(),
};

const defaultProps = {
  items: [mockItem as any],
  address: mockAddress as any,
  subtotal: 2500,
  paymentMethod: "cod" as const,
  onPaymentMethodChange: jest.fn(),
  onChangeAddress: jest.fn(),
};

describe("CheckoutOrderReview", () => {
  it("renders shippingTo label", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.getByText("shippingTo")).toBeInTheDocument();
  });

  it("renders changeAddress label", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.getByText("changeAddress")).toBeInTheDocument();
  });

  it("renders orderItems label", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.getByText("orderItems")).toBeInTheDocument();
  });

  it("renders paymentMethod label", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.getByText("paymentMethod")).toBeInTheDocument();
  });

  it("renders cod option", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.getByText("cod")).toBeInTheDocument();
  });

  it("renders orderTotal label", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.getByText("orderTotal")).toBeInTheDocument();
  });

  it("renders product title in order items", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.getByText("Trek Boots")).toBeInTheDocument();
  });

  it("does NOT render UPI option when upiVpa is not provided", () => {
    render(<CheckoutOrderReview {...defaultProps} />);
    expect(screen.queryByText("upiManual")).not.toBeInTheDocument();
  });

  it("renders UPI option when upiVpa is provided", () => {
    render(<CheckoutOrderReview {...defaultProps} upiVpa="letitrip@upi" />);
    expect(screen.getByText("upiManual")).toBeInTheDocument();
  });

  it("shows UPI instructions panel when upi_manual is selected", () => {
    render(
      <CheckoutOrderReview
        {...defaultProps}
        paymentMethod="upi_manual"
        upiVpa="letitrip@upi"
      />,
    );
    expect(screen.getByText("letitrip@upi")).toBeInTheDocument();
    expect(screen.getByText("upiInstructions")).toBeInTheDocument();
    expect(screen.getByText("copyUpiId")).toBeInTheDocument();
  });

  it("calls onPaymentMethodChange with upi_manual when UPI button is clicked", () => {
    const onPaymentMethodChange = jest.fn();
    render(
      <CheckoutOrderReview
        {...defaultProps}
        onPaymentMethodChange={onPaymentMethodChange}
        upiVpa="letitrip@upi"
      />,
    );
    fireEvent.click(screen.getByText("upiManual").closest("button")!);
    expect(onPaymentMethodChange).toHaveBeenCalledWith("upi_manual");
  });

  it("copies UPI ID to clipboard on copy button click", async () => {
    render(
      <CheckoutOrderReview
        {...defaultProps}
        paymentMethod="upi_manual"
        upiVpa="letitrip@upi"
      />,
    );
    fireEvent.click(screen.getByText("copyUpiId"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("letitrip@upi");
  });
});
