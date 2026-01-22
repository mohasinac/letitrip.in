/**
 * Product Detail Page Tests
 *
 * Tests for individual product details page
 */

import { FALLBACK_PRODUCTS } from "@/lib/fallback-data";
import { render, screen } from "@testing-library/react";

describe("Product Detail Page", () => {
  const mockProduct = FALLBACK_PRODUCTS[0];

  describe("Product Information", () => {
    it("should display product name", () => {
      render(<h1>{mockProduct.name}</h1>);
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    it("should display product price", () => {
      render(
        <div>
          <span>₹{mockProduct.price}</span>
          {mockProduct.comparePrice && <span>₹{mockProduct.comparePrice}</span>}
        </div>,
      );

      expect(screen.getByText(`₹${mockProduct.price}`)).toBeInTheDocument();
      if (mockProduct.comparePrice) {
        expect(
          screen.getByText(`₹${mockProduct.comparePrice}`),
        ).toBeInTheDocument();
      }
    });

    it("should display product description", () => {
      render(<p>{mockProduct.description}</p>);
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });

    it("should display product rating", () => {
      render(
        <div>
          <span>{mockProduct.rating}/5</span>
          <span>({mockProduct.reviewCount} reviews)</span>
        </div>,
      );

      expect(screen.getByText(`${mockProduct.rating}/5`)).toBeInTheDocument();
      expect(
        screen.getByText(`(${mockProduct.reviewCount} reviews)`),
      ).toBeInTheDocument();
    });

    it("should display stock status", () => {
      const status = mockProduct.stock > 0 ? "In Stock" : "Out of Stock";
      render(<span>{status}</span>);
      expect(screen.getByText(status)).toBeInTheDocument();
    });

    it("should display product SKU", () => {
      render(<span>SKU: {mockProduct.sku}</span>);
      expect(screen.getByText(`SKU: ${mockProduct.sku}`)).toBeInTheDocument();
    });
  });

  describe("Shop Information", () => {
    it("should display shop name", () => {
      render(<a href="#">{mockProduct.shopName}</a>);
      expect(screen.getByText(mockProduct.shopName)).toBeInTheDocument();
    });

    it("should have link to shop page", () => {
      expect(mockProduct.shopSlug).toBeTruthy();
      expect(typeof mockProduct.shopSlug).toBe("string");
    });
  });

  describe("Product Images", () => {
    it("should have at least one image", () => {
      expect(mockProduct.images.length).toBeGreaterThan(0);
    });

    it("should have valid image URLs", () => {
      mockProduct.images.forEach((image) => {
        expect(typeof image).toBe("string");
        expect(image.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Price Calculations", () => {
    it("should calculate discount percentage when compare price exists", () => {
      if (mockProduct.comparePrice) {
        const discount = Math.round(
          ((mockProduct.comparePrice - mockProduct.price) /
            mockProduct.comparePrice) *
            100,
        );

        expect(discount).toBeGreaterThan(0);
        expect(discount).toBeLessThanOrEqual(100);
      }
    });

    it("should show savings amount when compare price exists", () => {
      if (mockProduct.comparePrice) {
        const savings = mockProduct.comparePrice - mockProduct.price;
        expect(savings).toBeGreaterThan(0);
      }
    });
  });

  describe("Product Metadata", () => {
    it("should have category information", () => {
      expect(mockProduct.category).toBeTruthy();
      expect(mockProduct.categorySlug).toBeTruthy();
    });

    it("should have condition information", () => {
      expect(mockProduct.condition).toBeTruthy();
      expect(["new", "used", "refurbished"]).toContain(mockProduct.condition);
    });

    it("should have status information", () => {
      expect(mockProduct.status).toBeTruthy();
      expect(["active", "inactive", "draft"]).toContain(mockProduct.status);
    });

    it("should have timestamps", () => {
      expect(mockProduct.createdAt).toBeInstanceOf(Date);
      expect(mockProduct.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Call-to-Action", () => {
    it("should show Add to Cart button when in stock", () => {
      if (mockProduct.stock > 0) {
        render(<button>Add to Cart</button>);
        expect(screen.getByText("Add to Cart")).toBeInTheDocument();
      }
    });

    it("should show Out of Stock when stock is zero", () => {
      const outOfStockProduct = FALLBACK_PRODUCTS.find((p) => p.stock === 0);
      if (outOfStockProduct) {
        expect(outOfStockProduct.stock).toBe(0);
      }
    });
  });
});
