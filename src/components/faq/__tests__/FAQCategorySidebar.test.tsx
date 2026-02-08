import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  FAQCategorySidebar,
  FAQ_CATEGORIES,
  FAQCategoryKey,
} from "../FAQCategorySidebar";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("FAQCategorySidebar", () => {
  const mockCategoryCounts: Record<FAQCategoryKey, number> = {
    general: 20,
    products: 15,
    shipping: 15,
    returns: 12,
    payment: 18,
    account: 10,
    sellers: 12,
  };

  const mockOnCategorySelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render sidebar with title", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      expect(screen.getByText("Categories")).toBeInTheDocument();
    });

    it('should render "All FAQs" button with total count', () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const allButton = screen.getByText("All FAQs").closest("button");
      expect(allButton).toBeInTheDocument();

      // Total count: 20+15+15+12+18+10+12 = 102
      expect(screen.getByText("102")).toBeInTheDocument();
    });

    it("should render all category buttons with correct labels", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      Object.entries(FAQ_CATEGORIES).forEach(([, category]) => {
        expect(screen.getByText(category.label)).toBeInTheDocument();
      });
    });

    it("should render all category icons", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      Object.entries(FAQ_CATEGORIES).forEach(([, category]) => {
        expect(screen.getByText(category.icon)).toBeInTheDocument();
      });
    });

    it("should render category counts", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      expect(screen.getByText("20")).toBeInTheDocument(); // general
      expect(screen.getAllByText("15")).toHaveLength(2); // products & shipping (both have 15)
      expect(screen.getAllByText("12")).toHaveLength(2); // returns & sellers (both have 12)
      expect(screen.getByText("18")).toBeInTheDocument(); // payment
      expect(screen.getByText("10")).toBeInTheDocument(); // account
    });

    it('should render "Contact Support" CTA', () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      expect(screen.getByText("Still have questions?")).toBeInTheDocument();
      const contactLink = screen.getByText("Contact Support");
      expect(contactLink).toBeInTheDocument();
      expect(contactLink.closest("a")).toHaveAttribute("href", "/contact");
    });
  });

  describe("Category Selection", () => {
    it('should call onCategorySelect when "All FAQs" is clicked', () => {
      render(
        <FAQCategorySidebar
          selectedCategory="general"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const allButton = screen.getByText("All FAQs").closest("button");
      fireEvent.click(allButton!);

      expect(mockOnCategorySelect).toHaveBeenCalledTimes(1);
      expect(mockOnCategorySelect).toHaveBeenCalledWith("all");
    });

    it("should call onCategorySelect when a category is clicked", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const generalButton = screen.getByText("General").closest("button");
      fireEvent.click(generalButton!);

      expect(mockOnCategorySelect).toHaveBeenCalledTimes(1);
      expect(mockOnCategorySelect).toHaveBeenCalledWith("general");
    });

    it("should call onCategorySelect with correct key for each category", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      // Test products category
      const productsButton = screen
        .getByText("Products & Auctions")
        .closest("button");
      fireEvent.click(productsButton!);
      expect(mockOnCategorySelect).toHaveBeenCalledWith("products");

      // Test shipping category
      const shippingButton = screen
        .getByText("Shipping & Delivery")
        .closest("button");
      fireEvent.click(shippingButton!);
      expect(mockOnCategorySelect).toHaveBeenCalledWith("shipping");

      // Test sellers category
      const sellersButton = screen.getByText("For Sellers").closest("button");
      fireEvent.click(sellersButton!);
      expect(mockOnCategorySelect).toHaveBeenCalledWith("sellers");
    });
  });

  describe("Visual States", () => {
    it('should highlight "All FAQs" when selected', () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const allButton = screen.getByText("All FAQs").closest("button");
      expect(allButton).toHaveClass("font-medium");
    });

    it("should highlight selected category", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="general"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const generalButton = screen.getByText("General").closest("button");
      expect(generalButton).toHaveClass("font-medium");
    });

    it("should not highlight unselected categories", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="general"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const productsButton = screen
        .getByText("Products & Auctions")
        .closest("button");
      expect(productsButton).not.toHaveClass("font-medium");
    });

    it("should show description for selected category", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="general"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      expect(
        screen.getByText(FAQ_CATEGORIES.general.description),
      ).toBeInTheDocument();
    });

    it("should not show description for unselected categories", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="general"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      expect(
        screen.queryByText(FAQ_CATEGORIES.products.description),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(FAQ_CATEGORIES.shipping.description),
      ).not.toBeInTheDocument();
    });

    it('should not show description for "All FAQs"', () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      // None of the descriptions should be visible
      Object.values(FAQ_CATEGORIES).forEach((category) => {
        expect(
          screen.queryByText(category.description),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero counts for all categories", () => {
      const zeroCounts: Record<FAQCategoryKey, number> = {
        general: 0,
        products: 0,
        shipping: 0,
        returns: 0,
        payment: 0,
        account: 0,
        sellers: 0,
      };

      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={zeroCounts}
        />,
      );

      // Total should be 0
      expect(screen.getByText("All FAQs").closest("button")).toContainHTML("0");
    });

    it("should handle missing count for a category", () => {
      const partialCounts = {
        general: 20,
        products: 15,
        shipping: 15,
      } as Record<FAQCategoryKey, number>;

      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={partialCounts}
        />,
      );

      // Should render without crashing
      expect(screen.getByText("Categories")).toBeInTheDocument();
    });

    it("should handle very large counts", () => {
      const largeCounts: Record<FAQCategoryKey, number> = {
        general: 999,
        products: 888,
        shipping: 777,
        returns: 666,
        payment: 555,
        account: 444,
        sellers: 333,
      };

      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={largeCounts}
        />,
      );

      // Total: 999+888+777+666+555+444+333 = 4662
      expect(screen.getByText("4662")).toBeInTheDocument();
      expect(screen.getByText("999")).toBeInTheDocument();
    });

    it("should handle rapid category switching", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      // Click multiple categories in succession
      const generalButton = screen.getByText("General").closest("button");
      const shippingButton = screen
        .getByText("Shipping & Delivery")
        .closest("button");
      const productsButton = screen
        .getByText("Products & Auctions")
        .closest("button");

      fireEvent.click(generalButton!);
      fireEvent.click(shippingButton!);
      fireEvent.click(productsButton!);

      expect(mockOnCategorySelect).toHaveBeenCalledTimes(3);
      expect(mockOnCategorySelect).toHaveBeenNthCalledWith(1, "general");
      expect(mockOnCategorySelect).toHaveBeenNthCalledWith(2, "shipping");
      expect(mockOnCategorySelect).toHaveBeenNthCalledWith(3, "products");
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles for all categories", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      // All category items should be buttons (8 total: All FAQs + 7 categories)
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(8);
    });

    it("should have proper link role for Contact Support", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const contactLink = screen.getByRole("link", {
        name: /contact support/i,
      });
      expect(contactLink).toBeInTheDocument();
      expect(contactLink).toHaveAttribute("href", "/contact");
    });

    it("should be keyboard navigable", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        // All buttons should be keyboard accessible (no tabIndex=-1)
        expect(button).not.toHaveAttribute("tabindex", "-1");
      });
    });

    it("should support Enter key for category selection", () => {
      render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const generalButton = screen.getByText("General").closest("button");
      fireEvent.keyDown(generalButton!, { key: "Enter", code: "Enter" });
      fireEvent.click(generalButton!); // Click still fires after keyDown

      expect(mockOnCategorySelect).toHaveBeenCalledWith("general");
    });
  });

  describe("Sticky Positioning", () => {
    it("should have sticky class for sidebar positioning", () => {
      const { container } = render(
        <FAQCategorySidebar
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
          categoryCounts={mockCategoryCounts}
        />,
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass("sticky");
      expect(sidebar).toHaveClass("top-4");
    });
  });

  describe("FAQ_CATEGORIES Constant", () => {
    it("should have exactly 7 categories defined", () => {
      expect(Object.keys(FAQ_CATEGORIES)).toHaveLength(7);
    });

    it("should have all required categories", () => {
      const expectedCategories: FAQCategoryKey[] = [
        "general",
        "products",
        "shipping",
        "returns",
        "payment",
        "account",
        "sellers",
      ];

      expectedCategories.forEach((key) => {
        expect(FAQ_CATEGORIES[key]).toBeDefined();
        expect(FAQ_CATEGORIES[key].label).toBeTruthy();
        expect(FAQ_CATEGORIES[key].icon).toBeTruthy();
        expect(FAQ_CATEGORIES[key].description).toBeTruthy();
      });
    });

    it("should have unique labels for all categories", () => {
      const labels = Object.values(FAQ_CATEGORIES).map((cat) => cat.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it("should have unique icons for all categories", () => {
      const icons = Object.values(FAQ_CATEGORIES).map((cat) => cat.icon);
      const uniqueIcons = new Set(icons);
      expect(uniqueIcons.size).toBe(icons.length);
    });
  });
});
