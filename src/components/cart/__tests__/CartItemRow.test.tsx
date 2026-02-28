import React from "react";
import { render, screen } from "@testing-library/react";
import { CartItemRow } from "../CartItemRow";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));
jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount}`,
}));

const mockItem = {
  itemId: "i1",
  productId: "p1",
  productTitle: "Trek Boots",
  productImage: "/img.jpg",
  price: 2500,
  currency: "INR",
  quantity: 2,
  sellerId: "s1",
  sellerName: "Himalaya Treks",
  isAuction: false,
  addedAt: new Date(),
  updatedAt: new Date(),
  slug: "trek-boots",
};

describe("CartItemRow", () => {
  const defaultProps = {
    item: mockItem as any,
    onUpdateQuantity: jest.fn(),
    onRemove: jest.fn(),
  };

  it("renders product title", () => {
    render(<CartItemRow {...defaultProps} />);
    expect(screen.getByText("Trek Boots")).toBeInTheDocument();
  });

  it("renders remove button with translation key", () => {
    render(<CartItemRow {...defaultProps} />);
    expect(screen.getByText("remove")).toBeInTheDocument();
  });

  it("renders correctly when isUpdating is true", () => {
    const { container } = render(<CartItemRow {...defaultProps} isUpdating />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper?.className).toContain("opacity-60");
  });
});
