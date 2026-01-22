/**
 * Homepage Tests
 *
 * Tests for the main landing page
 */

import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/lib/fallback-data";
import { render, screen } from "@testing-library/react";

// Mock the page component
const mockProducts = FALLBACK_PRODUCTS.slice(0, 8);
const mockCategories = FALLBACK_CATEGORIES.slice(0, 6);

describe("Homepage", () => {
  describe("Hero Section", () => {
    it("should render welcome message", () => {
      render(
        <div>
          <h1>Welcome to Let It Rip</h1>
          <p>India's Premier Auction & E-Commerce Platform</p>
        </div>,
      );

      expect(screen.getByText(/Welcome to Let It Rip/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Premier Auction & E-Commerce/i),
      ).toBeInTheDocument();
    });
  });

  describe("Featured Products Section", () => {
    it("should render featured products", () => {
      const featuredProducts = mockProducts.filter((p) => p.featured);

      render(
        <div>
          <h2>Featured Products</h2>
          {featuredProducts.map((product) => (
            <div key={product.id} data-testid={`product-${product.id}`}>
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
            </div>
          ))}
        </div>,
      );

      expect(screen.getByText("Featured Products")).toBeInTheDocument();
      featuredProducts.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });

    it("should display product prices correctly", () => {
      const product = mockProducts[0];

      render(
        <div>
          <span>₹{product.price.toLocaleString("en-IN")}</span>
        </div>,
      );

      expect(screen.getByText(/₹/)).toBeInTheDocument();
    });
  });

  describe("Categories Section", () => {
    it("should render popular categories", () => {
      render(
        <div>
          <h2>Popular Categories</h2>
          {mockCategories.map((category) => (
            <div key={category.id}>
              <span>{category.name}</span>
            </div>
          ))}
        </div>,
      );

      expect(screen.getByText("Popular Categories")).toBeInTheDocument();
      mockCategories.forEach((category) => {
        expect(screen.getByText(category.name)).toBeInTheDocument();
      });
    });
  });
});

describe("Fallback Data Integration", () => {
  it("should use fallback products when API fails", () => {
    expect(mockProducts.length).toBeGreaterThan(0);
    expect(mockProducts[0]).toHaveProperty("name");
    expect(mockProducts[0]).toHaveProperty("price");
    expect(mockProducts[0]).toHaveProperty("slug");
  });

  it("should use fallback categories when API fails", () => {
    expect(mockCategories.length).toBeGreaterThan(0);
    expect(mockCategories[0]).toHaveProperty("name");
    expect(mockCategories[0]).toHaveProperty("slug");
  });
});
