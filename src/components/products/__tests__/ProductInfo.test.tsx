import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductInfo } from "../ProductInfo";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return JSON.stringify({ key, ...params });
    return key;
  },
}));
jest.mock("@/components", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
}));
jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount}`,
  formatDate: (date: Date) => "Jan 1, 2025",
}));

const defaultProps = {
  title: "Trek Hiking Boots",
  description: "Great boots for trekking",
  price: 2500,
  currency: "INR",
  status: "published" as const,
  featured: false,
  stockQuantity: 10,
  availableQuantity: 10,
  category: "Footwear",
  sellerName: "Himalaya Treks",
  tags: ["boots", "trekking"],
};

describe("ProductInfo", () => {
  it("renders product title", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(screen.getByText("Trek Hiking Boots")).toBeInTheDocument();
  });

  it("renders featured badge for featured products", () => {
    render(<ProductInfo {...defaultProps} featured />);
    expect(screen.getByText("featured")).toBeInTheDocument();
  });

  it("renders auction badge for auction products", () => {
    render(<ProductInfo {...defaultProps} isAuction currentBid={1000} />);
    expect(screen.getByText("auction")).toBeInTheDocument();
  });

  it("renders description section", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("shows sold badge when status is sold", () => {
    render(
      <ProductInfo {...defaultProps} status="sold" onAddToCart={jest.fn()} />,
    );
    expect(screen.getByText("sold")).toBeInTheDocument();
  });

  it("shows outOfStock badge when status is out_of_stock", () => {
    render(
      <ProductInfo
        {...defaultProps}
        status="out_of_stock"
        onAddToCart={jest.fn()}
      />,
    );
    expect(screen.getByText("outOfStock")).toBeInTheDocument();
  });

  it("renders category info", () => {
    render(<ProductInfo {...defaultProps} />);
    expect(screen.getByText("Footwear")).toBeInTheDocument();
  });

  it("renders add to cart button when status is published", () => {
    render(<ProductInfo {...defaultProps} onAddToCart={jest.fn()} />);
    expect(screen.getByText("addToCart")).toBeInTheDocument();
  });
});
