import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductDetailView } from "../ProductDetailView";

jest.mock("@/hooks", () => ({
  useApiQuery: () => ({ data: undefined, isLoading: true, error: null }),
}));

jest.mock("@/services", () => ({
  productService: { getById: jest.fn() },
}));

jest.mock("@/components", () => ({
  ProductImageGallery: () => <div data-testid="gallery" />,
  ProductInfo: () => <div data-testid="product-info" />,
  ProductReviews: () => <div data-testid="reviews" />,
  AddToCartButton: () => <button data-testid="add-to-cart" />,
  RelatedProducts: () => <div data-testid="related" />,
  Heading: ({
    children,
    level,
  }: {
    children: React.ReactNode;
    level?: number;
  }) => React.createElement(`h${level ?? 2}`, {}, children),
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock("@/constants", () => ({
  ROUTES: { PUBLIC: { PRODUCTS: "/products" } },
  THEME_CONSTANTS: {
    themed: {
      bgSecondary: "bg-gray-50",
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    borderRadius: { xl: "rounded-xl" },
  },
}));

jest.mock("next/link", () => ({ children }: { children: React.ReactNode }) => (
  <a>{children}</a>
));
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

describe("ProductDetailView", () => {
  it("shows loading skeleton while fetching", () => {
    const { container } = render(<ProductDetailView slug="test-slug" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows not-found state when no product and no loading", () => {
    jest.requireMock("@/hooks").useApiQuery = () => ({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
    });
    render(<ProductDetailView slug="missing" />);
    expect(screen.getByText("productNotFound")).toBeInTheDocument();
  });
});
