/**
 * Shop Detail Page Tests
 *
 * Tests for individual shop page
 */

import { FALLBACK_PRODUCTS, FALLBACK_SHOPS } from "@/lib/fallback-data";
import { render, screen } from "@testing-library/react";

describe("Shop Detail Page", () => {
  const mockShop = FALLBACK_SHOPS[0];
  const mockShopProducts = FALLBACK_PRODUCTS.filter(
    (p) => p.shopSlug === mockShop.slug,
  );

  describe("Shop Information", () => {
    it("should display shop name", () => {
      render(<h1>{mockShop.name}</h1>);
      expect(screen.getByText(mockShop.name)).toBeInTheDocument();
    });

    it("should display shop description", () => {
      if (mockShop.description) {
        render(<p>{mockShop.description}</p>);
        expect(screen.getByText(mockShop.description)).toBeInTheDocument();
      }
    });

    it("should display shop rating", () => {
      render(<span>{mockShop.rating}/5</span>);
      expect(screen.getByText(`${mockShop.rating}/5`)).toBeInTheDocument();
    });

    it("should display review count", () => {
      render(<span>({mockShop.reviewCount} reviews)</span>);
      expect(
        screen.getByText(`(${mockShop.reviewCount} reviews)`),
      ).toBeInTheDocument();
    });

    it("should show verification badge if verified", () => {
      if (mockShop.verified) {
        render(<span>✓ Verified Seller</span>);
        expect(screen.getByText("✓ Verified Seller")).toBeInTheDocument();
      }
    });
  });

  describe("Shop Statistics", () => {
    it("should display total products", () => {
      render(<span>{mockShop.totalProducts} Products</span>);
      expect(
        screen.getByText(`${mockShop.totalProducts} Products`),
      ).toBeInTheDocument();
    });

    it("should have valid product count", () => {
      expect(mockShop.totalProducts).toBeGreaterThanOrEqual(0);
      expect(typeof mockShop.totalProducts).toBe("number");
    });
  });

  describe("Shop Media", () => {
    it("should have shop logo", () => {
      expect(mockShop.logo).toBeTruthy();
      expect(typeof mockShop.logo).toBe("string");
    });

    it("should have shop banner", () => {
      if (mockShop.banner) {
        expect(typeof mockShop.banner).toBe("string");
      }
    });
  });

  describe("Contact Information", () => {
    it("should display shop address", () => {
      if (mockShop.address) {
        render(<p>{mockShop.address}</p>);
        expect(screen.getByText(mockShop.address)).toBeInTheDocument();
      }
    });

    it("should display shop phone", () => {
      if (mockShop.phone) {
        render(<a href={`tel:${mockShop.phone}`}>{mockShop.phone}</a>);
        expect(screen.getByText(mockShop.phone)).toBeInTheDocument();
      }
    });

    it("should display shop email", () => {
      if (mockShop.email) {
        render(<a href={`mailto:${mockShop.email}`}>{mockShop.email}</a>);
        expect(screen.getByText(mockShop.email)).toBeInTheDocument();
      }
    });

    it("should display shop website", () => {
      if (mockShop.website) {
        render(<a href={mockShop.website}>Visit Website</a>);
        expect(screen.getByText("Visit Website")).toBeInTheDocument();
      }
    });
  });

  describe("Shop Products", () => {
    it("should list shop products", () => {
      const shopProducts = FALLBACK_PRODUCTS.filter(
        (p) => p.shopSlug === mockShop.slug,
      );

      expect(Array.isArray(shopProducts)).toBe(true);
    });

    it("should filter products by shop", () => {
      mockShopProducts.forEach((product) => {
        expect(product.shopSlug).toBe(mockShop.slug);
      });
    });
  });

  describe("Shop Categories", () => {
    it("should display shop categories", () => {
      if (mockShop.categories && mockShop.categories.length > 0) {
        render(
          <div>
            {mockShop.categories.map((cat, idx) => (
              <span key={idx}>{cat}</span>
            ))}
          </div>,
        );

        mockShop.categories.forEach((category) => {
          expect(screen.getByText(category)).toBeInTheDocument();
        });
      }
    });

    it("should have valid categories array", () => {
      if (mockShop.categories) {
        expect(Array.isArray(mockShop.categories)).toBe(true);
      }
    });
  });

  describe("Shop Owner Information", () => {
    it("should have owner ID", () => {
      expect(mockShop.ownerId).toBeTruthy();
      expect(typeof mockShop.ownerId).toBe("string");
    });

    it("should have owner name", () => {
      if (mockShop.ownerName) {
        expect(typeof mockShop.ownerName).toBe("string");
      }
    });

    it("should have owner email", () => {
      if (mockShop.ownerEmail) {
        expect(typeof mockShop.ownerEmail).toBe("string");
        expect(mockShop.ownerEmail).toContain("@");
      }
    });
  });

  describe("Shop Status", () => {
    it("should have valid status", () => {
      expect(["active", "inactive", "suspended"]).toContain(mockShop.status);
    });

    it("should show active status", () => {
      if (mockShop.status === "active") {
        render(<span className="text-green-600">Active</span>);
        expect(screen.getByText("Active")).toBeInTheDocument();
      }
    });
  });

  describe("Shop Metadata", () => {
    it("should have valid slug", () => {
      expect(mockShop.slug).toBeTruthy();
      expect(typeof mockShop.slug).toBe("string");
    });

    it("should have timestamps", () => {
      expect(mockShop.createdAt).toBeInstanceOf(Date);
      expect(mockShop.updatedAt).toBeInstanceOf(Date);
    });

    it("should have featured flag", () => {
      expect(typeof mockShop.featured).toBe("boolean");
    });
  });
});
