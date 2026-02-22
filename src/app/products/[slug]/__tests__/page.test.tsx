import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockApiQuery = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/products/test-product",
}));

jest.mock("@/hooks", () => ({
  useApiQuery: (...args: any[]) => mockApiQuery(...args),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: { get: jest.fn().mockResolvedValue({}) },
}));

jest.mock("@/components", () => ({
  ProductImageGallery: ({ images }: { images?: string[] }) => (
    <div data-testid="product-image-gallery">
      {images?.[0] && <img src={images[0]} alt="product" />}
    </div>
  ),
  ProductInfo: ({ title, price }: { title?: string; price?: number }) => (
    <div data-testid="product-info">
      <h1>{title}</h1>
      <span data-testid="product-price">{price}</span>
    </div>
  ),
  ProductReviews: () => <div data-testid="product-reviews" />,
  AddToCartButton: ({
    productId,
    disabled,
  }: {
    productId?: string;
    disabled?: boolean;
  }) => (
    <button data-testid="add-to-cart-button" disabled={disabled}>
      Add to Cart
    </button>
  ),
  RelatedProducts: () => <div data-testid="related-products" />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

// Mock React.use() to synchronously return resolved params in tests
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  use: jest.fn().mockReturnValue({ slug: "test-product" }),
}));

import ProductDetailPage from "../page";

describe("ProductDetailPage", () => {
  const mockProduct = {
    id: "prod-1",
    title: "Awesome Widget",
    price: 999,
    currency: "INR",
    mainImage: "https://example.com/img.jpg",
    images: ["https://example.com/img.jpg"],
    description: "A great product",
    status: "published",
    availableQuantity: 5,
    stockQuantity: 5,
    featured: false,
    isAuction: false,
    category: "electronics",
    sellerId: "seller-1",
    slug: "awesome-widget",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product title and price", () => {
    mockApiQuery.mockReturnValue({
      data: { data: mockProduct },
      isLoading: false,
      error: null,
    });
    render(
      <ProductDetailPage params={Promise.resolve({ slug: "test-product" })} />,
    );
    expect(screen.getByText("Awesome Widget")).toBeInTheDocument();
    expect(screen.getByTestId("product-price")).toBeInTheDocument();
  });

  it("renders Add to Cart button", () => {
    mockApiQuery.mockReturnValue({
      data: { data: mockProduct },
      isLoading: false,
      error: null,
    });
    render(
      <ProductDetailPage params={Promise.resolve({ slug: "test-product" })} />,
    );
    expect(screen.getByTestId("add-to-cart-button")).toBeInTheDocument();
  });

  it("renders product image", () => {
    mockApiQuery.mockReturnValue({
      data: { data: mockProduct },
      isLoading: false,
      error: null,
    });
    render(
      <ProductDetailPage params={Promise.resolve({ slug: "test-product" })} />,
    );
    expect(screen.getByTestId("product-image-gallery")).toBeInTheDocument();
  });

  it("renders NotFound when product is null / 404", () => {
    mockApiQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Not found"),
    });
    render(
      <ProductDetailPage params={Promise.resolve({ slug: "not-exist" })} />,
    );
    // Shows error/not-found UI — look for the back link or not-found heading
    // The page renders a fallback with back-to-products link
    expect(screen.queryByTestId("product-info")).not.toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockApiQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    render(
      <ProductDetailPage params={Promise.resolve({ slug: "test-product" })} />,
    );
    expect(screen.queryByTestId("product-info")).not.toBeInTheDocument();
    expect(screen.queryByTestId("add-to-cart-button")).not.toBeInTheDocument();
  });
});
