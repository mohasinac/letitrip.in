import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShopFilters, ShopFilterValues } from "./ShopFilters";

describe("ShopFilters", () => {
  const mockOnChange = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnReset = jest.fn();

  const defaultProps = {
    filters: {} as ShopFilterValues,
    onChange: mockOnChange,
    onApply: mockOnApply,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders filter header", () => {
      render(<ShopFilters {...defaultProps} />);

      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("renders all filter sections", () => {
      render(<ShopFilters {...defaultProps} />);

      expect(screen.getByText("Verification Status")).toBeInTheDocument();
      expect(screen.getByText("Minimum Rating")).toBeInTheDocument();
      expect(screen.getByText("Shop Features")).toBeInTheDocument();
    });

    it("renders apply button", () => {
      render(<ShopFilters {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Apply Filters/i })
      ).toBeInTheDocument();
    });

    it("does not show clear all button when no filters active", () => {
      render(<ShopFilters {...defaultProps} />);

      expect(screen.queryByText(/Clear All/i)).not.toBeInTheDocument();
    });

    it("shows clear all button when filters are active", () => {
      render(<ShopFilters {...defaultProps} filters={{ verified: true }} />);

      expect(screen.getByText(/Clear All/i)).toBeInTheDocument();
    });
  });

  describe("Verification Status Filter", () => {
    it("renders verified shops checkbox", () => {
      render(<ShopFilters {...defaultProps} />);

      expect(screen.getByText("Verified Shops Only")).toBeInTheDocument();
    });

    it("checks verified when filter is set", () => {
      render(<ShopFilters {...defaultProps} filters={{ verified: true }} />);

      const checkbox = screen.getByText("Verified Shops Only")
        .previousSibling as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });

    it("calls onChange when verified checkbox clicked", () => {
      render(<ShopFilters {...defaultProps} />);

      const checkbox = screen.getByText("Verified Shops Only")
        .previousSibling as HTMLInputElement;
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ verified: true });
    });

    it("removes filter when unchecked", () => {
      render(<ShopFilters {...defaultProps} filters={{ verified: true }} />);

      const checkbox = screen.getByText("Verified Shops Only")
        .previousSibling as HTMLInputElement;
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ verified: undefined });
    });
  });

  describe("Minimum Rating Filter", () => {
    it("renders all rating options", () => {
      render(<ShopFilters {...defaultProps} />);

      expect(screen.getByText("4+ Stars")).toBeInTheDocument();
      expect(screen.getByText("3+ Stars")).toBeInTheDocument();
      expect(screen.getByText("2+ Stars")).toBeInTheDocument();
      expect(screen.getByText("1+ Stars")).toBeInTheDocument();
      expect(screen.getByText("Any Rating")).toBeInTheDocument();
    });

    it("displays star icons", () => {
      render(<ShopFilters {...defaultProps} />);

      const starElements = screen.getAllByText(/★/);
      expect(starElements.length).toBeGreaterThan(0);
    });

    it("selects rating when filter is set", () => {
      render(<ShopFilters {...defaultProps} filters={{ rating: 4 }} />);

      const label = screen
        .getByText("4+ Stars")
        .closest("label") as HTMLLabelElement;
      const radio = label.querySelector("input") as HTMLInputElement;
      expect(radio).toBeChecked();
    });

    it("calls onChange when rating selected", () => {
      render(<ShopFilters {...defaultProps} />);

      const radio = screen.getByText("4+ Stars")
        .previousSibling as HTMLInputElement;
      fireEvent.click(radio);

      expect(mockOnChange).toHaveBeenCalledWith({ rating: 4 });
    });

    it("changes rating selection", () => {
      render(<ShopFilters {...defaultProps} filters={{ rating: 4 }} />);

      const radio = screen.getByText("3+ Stars")
        .previousSibling as HTMLInputElement;
      fireEvent.click(radio);

      expect(mockOnChange).toHaveBeenCalledWith({ rating: 3 });
    });
    it("handles any rating selection", () => {
      render(<ShopFilters {...defaultProps} filters={{ rating: 4 }} />);

      const label = screen
        .getByText("Any Rating")
        .closest("label") as HTMLLabelElement;
      const radio = label.querySelector("input") as HTMLInputElement;
      fireEvent.click(radio);

      expect(mockOnChange).toHaveBeenCalledWith({ rating: undefined });
    });

    it("does not show star for any rating option", () => {
      render(<ShopFilters {...defaultProps} />);

      const anyRatingLabel = screen.getByText("Any Rating");
      expect(anyRatingLabel.textContent).not.toContain("★");
    });
  });

  describe("Shop Features Filter", () => {
    it("renders all feature checkboxes", () => {
      render(<ShopFilters {...defaultProps} />);

      expect(screen.getByText("Featured Only")).toBeInTheDocument();
      expect(screen.getByText("Homepage Only")).toBeInTheDocument();
      expect(screen.getByText("Show Banned")).toBeInTheDocument();
    });

    it("checks featured when filter is set", () => {
      render(<ShopFilters {...defaultProps} filters={{ featured: true }} />);

      const checkbox = screen.getByText("Featured Only")
        .previousSibling as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });

    it("checks homepage when filter is set", () => {
      render(<ShopFilters {...defaultProps} filters={{ homepage: true }} />);

      const checkbox = screen.getByText("Homepage Only")
        .previousSibling as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });

    it("checks banned when filter is set", () => {
      render(<ShopFilters {...defaultProps} filters={{ banned: true }} />);

      const checkbox = screen.getByText("Show Banned")
        .previousSibling as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });

    it("calls onChange when featured clicked", () => {
      render(<ShopFilters {...defaultProps} />);

      const checkbox = screen.getByText("Featured Only")
        .previousSibling as HTMLInputElement;
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ featured: true });
    });

    it("calls onChange when homepage clicked", () => {
      render(<ShopFilters {...defaultProps} />);

      const checkbox = screen.getByText("Homepage Only")
        .previousSibling as HTMLInputElement;
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ homepage: true });
    });

    it("calls onChange when banned clicked", () => {
      render(<ShopFilters {...defaultProps} />);

      const checkbox = screen.getByText("Show Banned")
        .previousSibling as HTMLInputElement;
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ banned: true });
    });

    it("removes filter when unchecked", () => {
      render(<ShopFilters {...defaultProps} filters={{ featured: true }} />);

      const checkbox = screen.getByText("Featured Only")
        .previousSibling as HTMLInputElement;
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ featured: undefined });
    });
  });

  describe("Actions", () => {
    it("calls onApply when apply button clicked", () => {
      render(<ShopFilters {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: /Apply Filters/i }));

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it("calls onReset when clear all clicked", () => {
      render(<ShopFilters {...defaultProps} filters={{ verified: true }} />);

      fireEvent.click(screen.getByText(/Clear All/i));

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Multiple Filters", () => {
    it("handles multiple filters active simultaneously", () => {
      const filters: ShopFilterValues = {
        verified: true,
        rating: 4,
        featured: true,
        homepage: true,
        banned: false,
      };

      render(<ShopFilters {...defaultProps} filters={filters} />);

      const verifiedCheckbox = screen.getByText("Verified Shops Only")
        .previousSibling as HTMLInputElement;
      expect(verifiedCheckbox).toBeChecked();

      const ratingLabel = screen
        .getByText("4+ Stars")
        .closest("label") as HTMLLabelElement;
      const ratingRadio = ratingLabel.querySelector(
        "input"
      ) as HTMLInputElement;
      expect(ratingRadio).toBeChecked();

      const featuredCheckbox = screen.getByText("Featured Only")
        .previousSibling as HTMLInputElement;
      expect(featuredCheckbox).toBeChecked();

      const homepageCheckbox = screen.getByText("Homepage Only")
        .previousSibling as HTMLInputElement;
      expect(homepageCheckbox).toBeChecked();
    });

    it("preserves other filters when updating one", () => {
      render(
        <ShopFilters
          {...defaultProps}
          filters={{ verified: true, rating: 4 }}
        />
      );

      const featuredCheckbox = screen.getByText("Featured Only")
        .previousSibling as HTMLInputElement;
      fireEvent.click(featuredCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith({
        verified: true,
        rating: 4,
        featured: true,
      });
    });
  });

  describe("Filter State Detection", () => {
    it("detects verified as active filter", () => {
      render(<ShopFilters {...defaultProps} filters={{ verified: true }} />);

      expect(screen.getByText(/Clear All/i)).toBeInTheDocument();
    });

    it("detects rating as active filter", () => {
      render(<ShopFilters {...defaultProps} filters={{ rating: 4 }} />);

      expect(screen.getByText(/Clear All/i)).toBeInTheDocument();
    });

    it("detects featured as active filter", () => {
      render(<ShopFilters {...defaultProps} filters={{ featured: true }} />);

      expect(screen.getByText(/Clear All/i)).toBeInTheDocument();
    });

    it("detects homepage as active filter", () => {
      render(<ShopFilters {...defaultProps} filters={{ homepage: true }} />);

      expect(screen.getByText(/Clear All/i)).toBeInTheDocument();
    });

    it("detects banned as active filter", () => {
      render(<ShopFilters {...defaultProps} filters={{ banned: true }} />);

      expect(screen.getByText(/Clear All/i)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies correct styling to filter header", () => {
      render(<ShopFilters {...defaultProps} />);

      const header = screen.getByText("Filters").closest("div");
      expect(header?.parentElement).toHaveClass(
        "flex",
        "items-center",
        "justify-between"
      );
    });

    it("applies correct styling to apply button", () => {
      render(<ShopFilters {...defaultProps} />);

      const button = screen.getByRole("button", { name: /Apply Filters/i });
      expect(button).toHaveClass(
        "w-full",
        "rounded-lg",
        "bg-blue-600",
        "text-white"
      );
    });

    it("applies correct styling to clear button", () => {
      render(<ShopFilters {...defaultProps} filters={{ verified: true }} />);

      const clearButton = screen.getByText(/Clear All/i).closest("button");
      expect(clearButton).toHaveClass("text-blue-600");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty filters object", () => {
      render(<ShopFilters {...defaultProps} filters={{}} />);

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });
    it("handles rating value of 0", () => {
      render(<ShopFilters {...defaultProps} filters={{ rating: 0 }} />);

      const label = screen
        .getByText("Any Rating")
        .closest("label") as HTMLLabelElement;
      const radio = label.querySelector("input") as HTMLInputElement;
      expect(radio).toBeChecked();
    });

    it("handles all filters enabled", () => {
      const filters: ShopFilterValues = {
        verified: true,
        rating: 4,
        featured: true,
        homepage: true,
        banned: true,
      };

      render(<ShopFilters {...defaultProps} filters={filters} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked(); // verified
      expect(checkboxes[1]).toBeChecked(); // featured
      expect(checkboxes[2]).toBeChecked(); // homepage
      expect(checkboxes[3]).toBeChecked(); // banned
    });

    it("handles false boolean values", () => {
      render(<ShopFilters {...defaultProps} filters={{ verified: false }} />);

      const checkbox = screen.getByText("Verified Shops Only")
        .previousSibling as HTMLInputElement;
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("Accessibility", () => {
    it("renders checkboxes with proper type", () => {
      render(<ShopFilters {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBe(4); // verified, featured, homepage, banned
    });

    it("renders radio buttons with proper type", () => {
      render(<ShopFilters {...defaultProps} />);

      const radios = screen.getAllByRole("radio");
      expect(radios.length).toBe(5); // 4 ratings + any rating
    });

    it("associates labels with inputs", () => {
      render(<ShopFilters {...defaultProps} />);

      const label = screen.getByText("Verified Shops Only").closest("label");
      expect(label).toBeInTheDocument();
    });

    it("groups radio buttons with same name", () => {
      render(<ShopFilters {...defaultProps} />);

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute("name", "rating");
      });
    });
  });

  describe("Rating Icon Display", () => {
    it("shows correct number of stars for each rating", () => {
      render(<ShopFilters {...defaultProps} />);

      const fourStarsLabel = screen.getByText("4+ Stars");
      const threeStarsLabel = screen.getByText("3+ Stars");

      expect(fourStarsLabel.parentElement?.textContent).toContain("★");
      expect(threeStarsLabel.parentElement?.textContent).toContain("★");
    });
  });
});
