/**
 * Tests for ProductSection component
 *
 * Coverage:
 * - Returns null when products array is empty
 * - Renders section title via Heading primitive
 * - Renders section subtitle via Text primitive
 * - Renders one ProductCard per product
 */

import { render, screen } from "@testing-library/react";
import { ProductSection } from "../ProductSection";
import type { ProductDocument } from "@/db/schema";

jest.mock("@/components/products", () => ({
  ProductCard: ({ product }: { product: { id: string; title: string } }) => (
    <div data-testid="product-card">{product.title}</div>
  ),
}));

jest.mock("@/components", () => ({
  Heading: ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => <h2 data-testid={`heading-${level}`}>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="text">{children}</p>
  ),
}));

const makeProduct = (id: string): Partial<ProductDocument> => ({
  id,
  title: `Product ${id}`,
});

describe("ProductSection", () => {
  it("returns null when products array is empty", () => {
    const { container } = render(
      <ProductSection title="Title" subtitle="Sub" products={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders section title using Heading primitive", () => {
    render(
      <ProductSection
        title="Featured"
        subtitle="Hand-picked"
        products={[makeProduct("p1")] as ProductDocument[]}
      />,
    );
    expect(screen.getByTestId("heading-2")).toHaveTextContent("Featured");
  });

  it("renders section subtitle using Text primitive", () => {
    render(
      <ProductSection
        title="Featured"
        subtitle="Hand-picked items"
        products={[makeProduct("p1")] as ProductDocument[]}
      />,
    );
    expect(screen.getByTestId("text")).toHaveTextContent("Hand-picked items");
  });

  it("renders one ProductCard per product", () => {
    render(
      <ProductSection
        title="All"
        subtitle="All products"
        products={
          [
            makeProduct("p1"),
            makeProduct("p2"),
            makeProduct("p3"),
          ] as ProductDocument[]
        }
      />,
    );
    expect(screen.getAllByTestId("product-card")).toHaveLength(3);
  });
});
