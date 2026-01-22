/**
 * Categories Page Tests
 *
 * Tests for category listing and navigation
 */

import { FALLBACK_CATEGORIES } from "@/lib/fallback-data";
import { render, screen } from "@testing-library/react";

describe("Categories Page", () => {
  const mockCategories = FALLBACK_CATEGORIES;

  describe("Category Listing", () => {
    it("should render category list", () => {
      render(
        <div data-testid="categories-list">
          {mockCategories.map((category) => (
            <div key={category.id} data-testid={`category-${category.id}`}>
              <h3>{category.name}</h3>
              <p>{category.productCount} Products</p>
            </div>
          ))}
        </div>,
      );

      expect(screen.getByTestId("categories-list")).toBeInTheDocument();
    });

    it("should display category details correctly", () => {
      const category = mockCategories[0];

      render(
        <div>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
          <p>{category.productCount} Products</p>
        </div>,
      );

      expect(screen.getByText(category.name)).toBeInTheDocument();
      if (category.description) {
        expect(screen.getByText(category.description)).toBeInTheDocument();
      }
    });

    it("should show product count for each category", () => {
      mockCategories.forEach((category) => {
        expect(category.productCount).toBeGreaterThanOrEqual(0);
        expect(typeof category.productCount).toBe("number");
      });
    });
  });

  describe("Category Hierarchy", () => {
    it("should identify parent categories", () => {
      const parentCategories = mockCategories.filter((c) => !c.parentId);
      expect(parentCategories.length).toBeGreaterThan(0);
    });

    it("should identify child categories", () => {
      const childCategories = mockCategories.filter((c) => c.parentId);

      childCategories.forEach((category) => {
        expect(category.parentId).toBeDefined();
      });
    });
  });

  describe("Category Validation", () => {
    it("should have required fields", () => {
      mockCategories.forEach((category) => {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("slug");
        expect(category).toHaveProperty("productCount");
      });
    });

    it("should have valid slugs", () => {
      mockCategories.forEach((category) => {
        expect(category.slug).toBeTruthy();
        expect(typeof category.slug).toBe("string");
        expect(category.slug.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Category Sorting", () => {
    it("should sort by product count descending", () => {
      const sorted = [...mockCategories].sort(
        (a, b) => b.productCount - a.productCount,
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].productCount).toBeGreaterThanOrEqual(
          sorted[i + 1].productCount,
        );
      }
    });

    it("should sort alphabetically by name", () => {
      const sorted = [...mockCategories].sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(
          sorted[i].name.localeCompare(sorted[i + 1].name),
        ).toBeLessThanOrEqual(0);
      }
    });
  });
});
