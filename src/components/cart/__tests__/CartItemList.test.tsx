import React from "react";
import { render, screen } from "@testing-library/react";
import { CartItemList } from "../CartItemList";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("@/components", () => ({
  CartItemRow: ({ item }: any) => (
    <div data-testid="cart-row">{item.productTitle}</div>
  ),
}));
// Mock CartItemRow from same directory
jest.mock("../CartItemRow", () => ({
  CartItemRow: ({ item }: any) => (
    <div data-testid="cart-row">{item.productTitle}</div>
  ),
}));

const mockItem = {
  itemId: "i1",
  productId: "p1",
  productTitle: "Trek Boots",
  productImage: "/img.jpg",
  price: 2500,
  currency: "INR",
  quantity: 1,
  sellerId: "s1",
  sellerName: "Seller",
  isAuction: false,
  addedAt: new Date(),
  updatedAt: new Date(),
};

describe("CartItemList", () => {
  const defaultProps = {
    items: [],
    updatingItemId: null,
    onUpdateQuantity: jest.fn(),
    onRemove: jest.fn(),
  };

  it("shows empty state when cart is empty", () => {
    render(<CartItemList {...defaultProps} />);
    expect(screen.getByText("empty")).toBeInTheDocument();
    expect(screen.getByText("emptyDesc")).toBeInTheDocument();
    expect(screen.getByText("startShopping")).toBeInTheDocument();
  });

  it("renders cart items when items are present", () => {
    render(<CartItemList {...defaultProps} items={[mockItem]} />);
    expect(screen.getByTestId("cart-row")).toBeInTheDocument();
  });

  it("does not show empty state when items exist", () => {
    render(<CartItemList {...defaultProps} items={[mockItem]} />);
    expect(screen.queryByText("empty")).not.toBeInTheDocument();
  });
});
