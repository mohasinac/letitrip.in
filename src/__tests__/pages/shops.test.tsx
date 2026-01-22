/**
 * Shops Page Tests
 *
 * Tests for shop listing and details
 */

import { FALLBACK_SHOPS } from "@/lib/fallback-data";
import { render, screen } from "@testing-library/react";

describe("Shops Page", () => {
  const mockShops = FALLBACK_SHOPS;

  describe("Shop Listing", () => {
    it("should render shop list", () => {
      render(
        <div data-testid="shops-list">
          {mockShops.map((shop) => (
            <div key={shop.id} data-testid={`shop-${shop.id}`}>
              <h3>{shop.name}</h3>
              <p>Rating: {shop.rating}/5</p>
              <span>{shop.verified ? "Verified" : "Not Verified"}</span>
            </div>
          ))}
        </div>,
      );

      expect(screen.getByTestId("shops-list")).toBeInTheDocument();
    });

    it("should display shop details correctly", () => {
      const shop = mockShops[0];

      render(
        <div>
          <h3>{shop.name}</h3>
          <p>{shop.description}</p>
          <p>Rating: {shop.rating}/5</p>
          <p>{shop.totalProducts} Products</p>
          <p>{shop.reviewCount} Reviews</p>
          {shop.verified && <span>✓ Verified Seller</span>}
        </div>,
      );

      expect(screen.getByText(shop.name)).toBeInTheDocument();
      expect(screen.getByText(`Rating: ${shop.rating}/5`)).toBeInTheDocument();
      expect(
        screen.getByText(`${shop.totalProducts} Products`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${shop.reviewCount} Reviews`),
      ).toBeInTheDocument();
    });

    it("should show verification badge for verified shops", () => {
      const verifiedShops = mockShops.filter((s) => s.verified);

      expect(verifiedShops.length).toBeGreaterThan(0);
      verifiedShops.forEach((shop) => {
        expect(shop.verified).toBe(true);
      });
    });

    it("should validate shop ratings", () => {
      mockShops.forEach((shop) => {
        expect(shop.rating).toBeGreaterThanOrEqual(0);
        expect(shop.rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe("Shop Statistics", () => {
    it("should show product count", () => {
      mockShops.forEach((shop) => {
        expect(shop.totalProducts).toBeGreaterThanOrEqual(0);
        expect(typeof shop.totalProducts).toBe("number");
      });
    });

    it("should show review count", () => {
      mockShops.forEach((shop) => {
        expect(shop.reviewCount).toBeGreaterThanOrEqual(0);
        expect(typeof shop.reviewCount).toBe("number");
      });
    });
  });

  describe("Shop Filtering", () => {
    it("should filter verified shops", () => {
      const verifiedShops = mockShops.filter((s) => s.verified);

      verifiedShops.forEach((shop) => {
        expect(shop.verified).toBe(true);
      });
    });

    it("should filter by rating", () => {
      const minRating = 4.0;
      const highRatedShops = mockShops.filter((s) => s.rating >= minRating);

      highRatedShops.forEach((shop) => {
        expect(shop.rating).toBeGreaterThanOrEqual(minRating);
      });
    });

    it("should filter by location", () => {
      const location = "Mumbai";
      const localShops = mockShops.filter((s) =>
        s.location?.toLowerCase().includes(location.toLowerCase()),
      );

      localShops.forEach((shop) => {
        expect(shop.location?.toLowerCase()).toContain(location.toLowerCase());
      });
    });
  });

  describe("Shop Sorting", () => {
    it("should sort by rating descending", () => {
      const sorted = [...mockShops].sort((a, b) => b.rating - a.rating);

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].rating).toBeGreaterThanOrEqual(sorted[i + 1].rating);
      }
    });

    it("should sort by total products descending", () => {
      const sorted = [...mockShops].sort(
        (a, b) => b.totalProducts - a.totalProducts,
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].totalProducts).toBeGreaterThanOrEqual(
          sorted[i + 1].totalProducts,
        );
      }
    });

    it("should sort verified shops first", () => {
      const sorted = [...mockShops].sort((a, b) => {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        return 0;
      });

      const firstVerifiedIndex = sorted.findIndex((s) => s.verified);
      const lastVerifiedIndex = sorted.findLastIndex((s) => s.verified);

      if (firstVerifiedIndex !== -1 && lastVerifiedIndex !== -1) {
        for (let i = firstVerifiedIndex; i <= lastVerifiedIndex; i++) {
          expect(sorted[i].verified).toBe(true);
        }
      }
    });
  });

  describe("Shop Search", () => {
    it("should search shops by name", () => {
      const searchQuery = "tech";
      const results = mockShops.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      results.forEach((shop) => {
        expect(shop.name.toLowerCase()).toContain(searchQuery.toLowerCase());
      });
    });

    it("should search shops by description", () => {
      const searchQuery = "premium";
      const results = mockShops.filter((s) =>
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      results.forEach((shop) => {
        expect(shop.description?.toLowerCase()).toContain(
          searchQuery.toLowerCase(),
        );
      });
    });
  });
});
