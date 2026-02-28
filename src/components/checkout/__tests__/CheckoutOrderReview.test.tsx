import React from "react";
import { render, screen } from "@testing-library/react";
import { CheckoutOrderReview } from "../CheckoutOrderReview";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));
jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount}`,
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
});
