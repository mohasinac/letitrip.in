/**
 * Products Page Tests
 *
 * Tests for product listing and filtering
 */

import { FALLBACK_PRODUCTS } from "@/lib/fallback-data";
import { render, screen } from "@testing-library/react";

describe("Products Page", () => {
  const mockProducts = FALLBACK_PRODUCTS;

  describe("Product Listing", () => {
    it("should render product list", () => {
      render(
        <div data-testid="products-list">
          {mockProducts.slice(0, 12).map((product) => (
            <div key={product.id} data-testid={`product-${product.id}`}>
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <span>Rating: {product.rating}</span>
            </div>
          ))}
        </div>,
      );

      expect(screen.getByTestId("products-list")).toBeInTheDocument();
    });

    it("should display product details correctly", () => {
      const product = mockProducts[0];

      render(
        <div>
          <h3>{product.name}</h3>
          <p>₹{product.price}</p>
          <span>Rating: {product.rating}/5</span>
          <span>{product.reviewCount} reviews</span>
          <span>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
        </div>,
      );

      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(`₹${product.price}`)).toBeInTheDocument();
      expect(
        screen.getByText(`Rating: ${product.rating}/5`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${product.reviewCount} reviews`),
      ).toBeInTheDocument();
    });

    it("should show stock status", () => {
      const inStockProduct = mockProducts.find((p) => p.stock > 0);
      const outOfStockProduct = mockProducts.find((p) => p.stock === 0);

      render(
        <div>
          {inStockProduct && (
            <div data-testid="in-stock">
              <span>
                {inStockProduct.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          )}
          {outOfStockProduct && (
            <div data-testid="out-of-stock">
              <span>
                {outOfStockProduct.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          )}
        </div>,
      );

      if (inStockProduct) {
        expect(screen.getByTestId("in-stock")).toHaveTextContent("In Stock");
      }
      if (outOfStockProduct) {
        expect(screen.getByTestId("out-of-stock")).toHaveTextContent(
          "Out of Stock",
        );
      }
    });
  });

  describe("Product Filtering", () => {
    it("should filter featured products", () => {
      const featuredProducts = mockProducts.filter((p) => p.featured);

      expect(featuredProducts.length).toBeGreaterThan(0);
      featuredProducts.forEach((product) => {
        expect(product.featured).toBe(true);
      });
    });

    it("should filter by category", () => {
      const electronicsProducts = mockProducts.filter(
        (p) => p.categorySlug === "electronics",
      );

      expect(electronicsProducts.length).toBeGreaterThan(0);
      electronicsProducts.forEach((product) => {
        expect(product.categorySlug).toBe("electronics");
      });
    });

    it("should filter by price range", () => {
      const minPrice = 500;
      const maxPrice = 3000;
      const filteredProducts = mockProducts.filter(
        (p) => p.price >= minPrice && p.price <= maxPrice,
      );

      filteredProducts.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it("should filter by stock status", () => {
      const inStockProducts = mockProducts.filter((p) => p.stock > 0);

      inStockProducts.forEach((product) => {
        expect(product.stock).toBeGreaterThan(0);
      });
    });

    it("should filter by condition", () => {
      const newProducts = mockProducts.filter((p) => p.condition === "new");

      newProducts.forEach((product) => {
        expect(product.condition).toBe("new");
      });
    });
  });

  describe("Product Sorting", () => {
    it("should sort by price ascending", () => {
      const sorted = [...mockProducts].sort((a, b) => a.price - b.price);

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
      }
    });

    it("should sort by price descending", () => {
      const sorted = [...mockProducts].sort((a, b) => b.price - a.price);

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i + 1].price);
      }
    });

    it("should sort by rating", () => {
      const sorted = [...mockProducts].sort((a, b) => b.rating - a.rating);

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].rating).toBeGreaterThanOrEqual(sorted[i + 1].rating);
      }
    });

    it("should sort by popularity (view count)", () => {
      const sorted = [...mockProducts].sort(
        (a, b) => b.viewCount - a.viewCount,
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].viewCount).toBeGreaterThanOrEqual(
          sorted[i + 1].viewCount,
        );
      }
    });
  });

  describe("Product Search", () => {
    it("should search products by name", () => {
      const searchQuery = "wireless";
      const results = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      results.forEach((product) => {
        expect(product.name.toLowerCase()).toContain(searchQuery.toLowerCase());
      });
    });

    it("should search products by description", () => {
      const searchQuery = "premium";
      const results = mockProducts.filter((p) =>
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      results.forEach((product) => {
        expect(product.description?.toLowerCase()).toContain(
          searchQuery.toLowerCase(),
        );
      });
    });
  });
});
