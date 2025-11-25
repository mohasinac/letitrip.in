import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CategoryFilters } from "./CategoryFilters";
import type { CategoryFilterValues } from "./CategoryFilters";

describe("CategoryFilters", () => {
  const mockOnChange = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders filter header with icon", () => {
      const { container } = render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Filters")).toBeInTheDocument();
      // Check for SVG icon presence
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("renders all filter sections", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Category Features")).toBeInTheDocument();
      expect(screen.getByText("Category Level")).toBeInTheDocument();
    });

    it("renders all category feature checkboxes", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Featured Only")).toBeInTheDocument();
      expect(screen.getByText("Homepage Only")).toBeInTheDocument();
    });

    it("renders category level checkbox", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Leaf Categories Only")).toBeInTheDocument();
    });

    it("renders apply button", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });
  });

  describe("Featured Filter", () => {
    it("shows featured checkbox as unchecked by default", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Featured Only/i });
      expect(checkbox).not.toBeChecked();
    });

    it("shows featured checkbox as checked when filter active", () => {
      render(
        <CategoryFilters
          filters={{ featured: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Featured Only/i });
      expect(checkbox).toBeChecked();
    });

    it("calls onChange when featured checkbox is clicked", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Featured Only/i });
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ featured: true });
    });

    it("calls onChange with undefined when unchecking featured", () => {
      render(
        <CategoryFilters
          filters={{ featured: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Featured Only/i });
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ featured: undefined });
    });
  });

  describe("Homepage Filter", () => {
    it("shows homepage checkbox as unchecked by default", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Homepage Only/i });
      expect(checkbox).not.toBeChecked();
    });

    it("shows homepage checkbox as checked when filter active", () => {
      render(
        <CategoryFilters
          filters={{ homepage: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Homepage Only/i });
      expect(checkbox).toBeChecked();
    });

    it("calls onChange when homepage checkbox is clicked", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Homepage Only/i });
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ homepage: true });
    });
  });

  describe("Leaf Categories Filter", () => {
    it("shows isLeaf checkbox as unchecked by default", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /Leaf Categories Only/i,
      });
      expect(checkbox).not.toBeChecked();
    });

    it("shows isLeaf checkbox as checked when filter active", () => {
      render(
        <CategoryFilters
          filters={{ isLeaf: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /Leaf Categories Only/i,
      });
      expect(checkbox).toBeChecked();
    });

    it("calls onChange when isLeaf checkbox is clicked", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /Leaf Categories Only/i,
      });
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ isLeaf: true });
    });
  });

  describe("Clear All Button", () => {
    it("does not show clear all button when no filters active", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText("Clear All")).not.toBeInTheDocument();
    });

    it("shows clear all button when featured filter is active", () => {
      render(
        <CategoryFilters
          filters={{ featured: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("shows clear all button when homepage filter is active", () => {
      render(
        <CategoryFilters
          filters={{ homepage: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("shows clear all button when isLeaf filter is active", () => {
      render(
        <CategoryFilters
          filters={{ isLeaf: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("shows clear all button when multiple filters active", () => {
      render(
        <CategoryFilters
          filters={{ featured: true, homepage: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("calls onReset when clear all button is clicked", () => {
      render(
        <CategoryFilters
          filters={{ featured: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const clearButton = screen.getByText("Clear All");
      fireEvent.click(clearButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it("renders X icon in clear all button", () => {
      render(
        <CategoryFilters
          filters={{ featured: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const xIcon = document.querySelector("svg.lucide-x");
      expect(xIcon).toBeInTheDocument();
    });
  });

  describe("Apply Button", () => {
    it("calls onApply when apply button is clicked", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it("apply button has correct styling classes", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const applyButton = screen.getByText("Apply Filters");
      expect(applyButton).toHaveClass("w-full", "bg-blue-600", "text-white");
    });

    it("apply button is always rendered regardless of filters", () => {
      const { rerender } = render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Apply Filters")).toBeInTheDocument();

      rerender(
        <CategoryFilters
          filters={{ featured: true, homepage: true, isLeaf: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });
  });

  describe("Multiple Filter Combinations", () => {
    it("handles featured and homepage both checked", () => {
      render(
        <CategoryFilters
          filters={{ featured: true, homepage: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const featuredCheckbox = screen.getByRole("checkbox", {
        name: /Featured Only/i,
      });
      const homepageCheckbox = screen.getByRole("checkbox", {
        name: /Homepage Only/i,
      });

      expect(featuredCheckbox).toBeChecked();
      expect(homepageCheckbox).toBeChecked();
    });

    it("handles all filters checked", () => {
      render(
        <CategoryFilters
          filters={{ featured: true, homepage: true, isLeaf: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const featuredCheckbox = screen.getByRole("checkbox", {
        name: /Featured Only/i,
      });
      const homepageCheckbox = screen.getByRole("checkbox", {
        name: /Homepage Only/i,
      });
      const isLeafCheckbox = screen.getByRole("checkbox", {
        name: /Leaf Categories Only/i,
      });

      expect(featuredCheckbox).toBeChecked();
      expect(homepageCheckbox).toBeChecked();
      expect(isLeafCheckbox).toBeChecked();
    });

    it("preserves existing filters when updating one filter", () => {
      render(
        <CategoryFilters
          filters={{ featured: true, homepage: true }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const isLeafCheckbox = screen.getByRole("checkbox", {
        name: /Leaf Categories Only/i,
      });
      fireEvent.click(isLeafCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith({
        featured: true,
        homepage: true,
        isLeaf: true,
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles filters with parentId", () => {
      render(
        <CategoryFilters
          filters={{ parentId: "parent-123" }}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      // Should show clear all button even for non-checkbox filters
      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("handles rapid checkbox clicks", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const checkbox = screen.getByRole("checkbox", { name: /Featured Only/i });
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });

    it("handles rapid apply button clicks", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);
      fireEvent.click(applyButton);
      fireEvent.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(3);
    });
  });

  describe("Accessibility", () => {
    it("all checkboxes have proper labels", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(
        screen.getByRole("checkbox", { name: /Featured Only/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: /Homepage Only/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: /Leaf Categories Only/i })
      ).toBeInTheDocument();
    });

    it("checkboxes have cursor pointer styling", () => {
      const { container } = render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const labels = container.querySelectorAll("label.cursor-pointer");
      expect(labels.length).toBeGreaterThan(0);
    });

    it("apply button has focus ring", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const applyButton = screen.getByText("Apply Filters");
      expect(applyButton).toHaveClass("focus:ring-2", "focus:ring-blue-500");
    });
  });

  describe("Styling", () => {
    it("has proper spacing between sections", () => {
      const { container } = render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("space-y-6");
    });

    it("section headers have proper font weight", () => {
      render(
        <CategoryFilters
          filters={{}}
          onChange={mockOnChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const headers = screen.getAllByRole("heading", { level: 4 });
      headers.forEach((header) => {
        expect(header).toHaveClass("font-medium");
      });
    });
  });
});
