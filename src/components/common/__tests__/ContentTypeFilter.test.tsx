import { fireEvent, render, screen } from "@testing-library/react";
import type { ContentType, ContentTypeFacets } from "../ContentTypeFilter";
import {
  CONTENT_TYPE_OPTIONS,
  ContentTypeFilter,
  getContentTypePlaceholder,
} from "../ContentTypeFilter";

describe("ContentTypeFilter", () => {
  const defaultProps = {
    value: "all" as ContentType,
    onChange: jest.fn(),
  };

  const mockFacets: ContentTypeFacets = {
    products: 150,
    auctions: 45,
    shops: 30,
    categories: 12,
    blog: 8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CONTENT_TYPE_OPTIONS constant", () => {
    it("has all required content types", () => {
      expect(CONTENT_TYPE_OPTIONS).toHaveLength(6);
      const values = CONTENT_TYPE_OPTIONS.map((opt) => opt.value);
      expect(values).toEqual([
        "all",
        "products",
        "auctions",
        "shops",
        "categories",
        "blog",
      ]);
    });

    it("each option has required properties", () => {
      CONTENT_TYPE_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(option).toHaveProperty("icon");
        expect(option).toHaveProperty("placeholder");
      });
    });

    it("has proper labels", () => {
      const labels = CONTENT_TYPE_OPTIONS.map((opt) => opt.label);
      expect(labels).toEqual([
        "All",
        "Products",
        "Auctions",
        "Shops",
        "Categories",
        "Blog",
      ]);
    });
  });

  describe("getContentTypePlaceholder helper", () => {
    it("returns correct placeholder for each type", () => {
      expect(getContentTypePlaceholder("all")).toBe("Search everything...");
      expect(getContentTypePlaceholder("products")).toBe("Search products...");
      expect(getContentTypePlaceholder("auctions")).toBe("Search auctions...");
      expect(getContentTypePlaceholder("shops")).toBe("Search shops...");
      expect(getContentTypePlaceholder("categories")).toBe(
        "Search categories..."
      );
      expect(getContentTypePlaceholder("blog")).toBe("Search blog posts...");
    });

    it("returns default for unknown type", () => {
      expect(getContentTypePlaceholder("unknown" as ContentType)).toBe(
        "Search..."
      );
    });
  });

  describe("Chips Variant", () => {
    it("renders all content type chips", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" />);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Auctions")).toBeInTheDocument();
      expect(screen.getByText("Shops")).toBeInTheDocument();
      expect(screen.getByText("Categories")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
    });

    it("highlights selected chip", () => {
      render(
        <ContentTypeFilter {...defaultProps} value="products" variant="chips" />
      );
      const productsChip = screen.getByText("Products").closest("button");
      expect(productsChip).toHaveClass("bg-primary", "text-white");
    });

    it("calls onChange when chip is clicked", () => {
      const onChange = jest.fn();
      render(
        <ContentTypeFilter
          {...defaultProps}
          onChange={onChange}
          variant="chips"
        />
      );
      fireEvent.click(screen.getByText("Products"));
      expect(onChange).toHaveBeenCalledWith("products");
    });

    it("shows counts when facets provided and showCounts true", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="chips"
          facets={mockFacets}
          showCounts
        />
      );
      expect(screen.getByText("245")).toBeInTheDocument(); // Total for "All"
      expect(screen.getByText("150")).toBeInTheDocument(); // Products
      expect(screen.getByText("45")).toBeInTheDocument(); // Auctions
    });

    it("hides counts when showCounts false", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="chips"
          facets={mockFacets}
          showCounts={false}
        />
      );
      expect(screen.queryByText("245")).not.toBeInTheDocument();
      expect(screen.queryByText("150")).not.toBeInTheDocument();
    });

    it("applies small size classes", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" size="sm" />);
      const chip = screen.getByText("All").closest("button");
      expect(chip).toHaveClass("px-2", "py-1", "text-xs");
    });

    it("applies medium size classes (default)", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" size="md" />);
      const chip = screen.getByText("All").closest("button");
      expect(chip).toHaveClass("px-3", "py-1.5", "text-sm");
    });

    it("applies large size classes", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" size="lg" />);
      const chip = screen.getByText("All").closest("button");
      expect(chip).toHaveClass("px-4", "py-2", "text-base");
    });

    it("disables all chips when disabled prop is true", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" disabled />);
      const chips = screen.getAllByRole("button");
      chips.forEach((chip) => {
        expect(chip).toBeDisabled();
        expect(chip).toHaveClass("opacity-50", "cursor-not-allowed");
      });
    });

    it("does not call onChange when disabled chip clicked", () => {
      const onChange = jest.fn();
      render(
        <ContentTypeFilter
          {...defaultProps}
          onChange={onChange}
          variant="chips"
          disabled
        />
      );
      fireEvent.click(screen.getByText("Products"));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("has proper aria-pressed attribute", () => {
      render(
        <ContentTypeFilter {...defaultProps} value="products" variant="chips" />
      );
      const productsChip = screen.getByText("Products").closest("button");
      const allChip = screen.getByText("All").closest("button");
      expect(productsChip).toHaveAttribute("aria-pressed", "true");
      expect(allChip).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("Dropdown Variant", () => {
    it("renders dropdown trigger button", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      expect(
        screen.getByRole("button", { expanded: false })
      ).toBeInTheDocument();
    });

    it("shows selected option label", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          value="products"
          variant="dropdown"
        />
      );
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("opens dropdown on click", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      const button = screen.getByRole("button", { expanded: false });
      fireEvent.click(button);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("closes dropdown when clicking outside", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("shows all options when open", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getAllByRole("option")).toHaveLength(6);
    });

    it("highlights selected option", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          value="products"
          variant="dropdown"
        />
      );
      fireEvent.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");
      const productsOption = options.find((opt) =>
        opt.textContent?.includes("Products")
      );
      expect(productsOption).toHaveClass("bg-primary/10", "text-primary");
    });

    it("shows checkmark on selected option", () => {
      const { container } = render(
        <ContentTypeFilter
          {...defaultProps}
          value="products"
          variant="dropdown"
        />
      );
      fireEvent.click(screen.getByRole("button"));
      const checkmarks = container.querySelectorAll("svg");
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it("calls onChange and closes dropdown when option selected", () => {
      const onChange = jest.fn();
      render(
        <ContentTypeFilter
          {...defaultProps}
          onChange={onChange}
          variant="dropdown"
        />
      );
      fireEvent.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");
      fireEvent.click(options[1]); // Click "Products"
      expect(onChange).toHaveBeenCalledWith("products");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("rotates chevron when open", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      const button = screen.getByRole("button");

      // Get all SVGs in button (there should be icon + chevron)
      const svgs = button.querySelectorAll("svg");
      const chevron = Array.from(svgs).find((svg) =>
        svg.querySelector('path[d*="19 9l-7 7-7-7"]')
      );

      expect(chevron).toBeInTheDocument();
      expect(chevron?.classList.contains("rotate-180")).toBe(false);

      fireEvent.click(button);

      // After click, chevron should rotate
      expect(chevron?.classList.contains("rotate-180")).toBe(true);
    });

    it("does not open when disabled", () => {
      render(
        <ContentTypeFilter {...defaultProps} variant="dropdown" disabled />
      );
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <ContentTypeFilter
          {...defaultProps}
          variant="dropdown"
          className="custom-class"
        />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("has proper ARIA attributes", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-haspopup", "listbox");
      expect(button).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("each option has aria-selected attribute", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          value="products"
          variant="dropdown"
        />
      );
      fireEvent.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");
      options.forEach((option) => {
        expect(option).toHaveAttribute("aria-selected");
      });
    });
  });

  describe("Tabs Variant", () => {
    it("renders all tabs", () => {
      render(<ContentTypeFilter {...defaultProps} variant="tabs" />);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Auctions")).toBeInTheDocument();
    });

    it("highlights selected tab with border", () => {
      render(
        <ContentTypeFilter {...defaultProps} value="products" variant="tabs" />
      );
      const productsTab = screen.getByText("Products").closest("button");
      expect(productsTab).toHaveClass("border-primary", "text-primary");
    });

    it("non-selected tabs have transparent border", () => {
      render(
        <ContentTypeFilter {...defaultProps} value="products" variant="tabs" />
      );
      const allTab = screen.getByText("All").closest("button");
      expect(allTab).toHaveClass("border-transparent");
    });

    it("calls onChange when tab is clicked", () => {
      const onChange = jest.fn();
      render(
        <ContentTypeFilter
          {...defaultProps}
          onChange={onChange}
          variant="tabs"
        />
      );
      fireEvent.click(screen.getByText("Products"));
      expect(onChange).toHaveBeenCalledWith("products");
    });

    it("shows counts when facets provided and showCounts true", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="tabs"
          facets={mockFacets}
          showCounts
        />
      );
      expect(screen.getByText("245")).toBeInTheDocument(); // Total
      expect(screen.getByText("150")).toBeInTheDocument(); // Products
    });

    it("disables empty tabs (count = 0)", () => {
      const emptyFacets: ContentTypeFacets = {
        products: 10,
        auctions: 0,
        shops: 5,
        categories: 0,
        blog: 3,
      };
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="tabs"
          facets={emptyFacets}
          showCounts
        />
      );
      const auctionsTab = screen.getByText("Auctions").closest("button");
      expect(auctionsTab).toHaveClass("opacity-40", "cursor-not-allowed");
      expect(auctionsTab).toBeDisabled();
    });

    it("does not disable All tab even when counts are 0", () => {
      const emptyFacets: ContentTypeFacets = {
        products: 0,
        auctions: 0,
        shops: 0,
        categories: 0,
        blog: 0,
      };
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="tabs"
          facets={emptyFacets}
          showCounts
        />
      );
      const allTab = screen.getByText("All").closest("button");
      expect(allTab).not.toBeDisabled();
    });

    it("does not call onChange for empty tabs", () => {
      const onChange = jest.fn();
      const emptyFacets: ContentTypeFacets = {
        products: 10,
        auctions: 0,
        shops: 5,
        categories: 0,
        blog: 3,
      };
      render(
        <ContentTypeFilter
          {...defaultProps}
          onChange={onChange}
          variant="tabs"
          facets={emptyFacets}
          showCounts
        />
      );
      const auctionsTab = screen.getByText("Auctions").closest("button");
      fireEvent.click(auctionsTab!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("has horizontal scroll for overflow", () => {
      const { container } = render(
        <ContentTypeFilter {...defaultProps} variant="tabs" />
      );
      const tabsContainer = container.querySelector(".overflow-x-auto");
      expect(tabsContainer).toBeInTheDocument();
    });

    it("disables all tabs when disabled prop is true", () => {
      render(<ContentTypeFilter {...defaultProps} variant="tabs" disabled />);
      const tabs = screen.getAllByRole("button");
      tabs.forEach((tab) => {
        expect(tab).toBeDisabled();
        expect(tab).toHaveClass("opacity-50", "cursor-not-allowed");
      });
    });
  });

  describe("Dark Mode", () => {
    it("chips have dark mode classes", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" />);
      const chips = screen.getAllByRole("button");
      const unselectedChip = chips.find((chip) =>
        chip.textContent?.includes("Products")
      );
      expect(unselectedChip).toHaveClass("dark:bg-gray-700");
    });

    it("dropdown has dark mode classes", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      fireEvent.click(screen.getByRole("button"));
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveClass("dark:bg-gray-800");
      expect(listbox).toHaveClass("dark:border-gray-700");
    });

    it("tabs have dark mode classes", () => {
      render(<ContentTypeFilter {...defaultProps} variant="tabs" />);
      const tabs = screen.getAllByRole("button");
      const unselectedTab = tabs.find(
        (tab) =>
          tab.textContent?.includes("Products") &&
          !tab.textContent?.includes("245")
      );
      expect(unselectedTab).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Accessibility", () => {
    it("chips have proper button role", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(6);
    });

    it("dropdown has proper ARIA attributes", () => {
      render(<ContentTypeFilter {...defaultProps} variant="dropdown" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-haspopup");
      expect(button).toHaveAttribute("aria-expanded");
    });

    it("tabs have proper focus ring", () => {
      render(<ContentTypeFilter {...defaultProps} variant="tabs" />);
      const tab = screen.getByText("All").closest("button");
      expect(tab).toHaveClass("focus:outline-none", "focus:ring-2");
    });

    it("disabled states have proper cursor", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" disabled />);
      const chip = screen.getByText("All").closest("button");
      expect(chip).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Icons", () => {
    it("renders icons for each option", () => {
      const { container } = render(
        <ContentTypeFilter {...defaultProps} variant="chips" />
      );
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThanOrEqual(6); // At least one per chip
    });

    it("icons have proper size in small variant", () => {
      const { container } = render(
        <ContentTypeFilter {...defaultProps} variant="chips" size="sm" />
      );
      const icons = container.querySelectorAll("svg");
      icons.forEach((icon) => {
        expect(icon).toHaveClass("w-3", "h-3");
      });
    });

    it("icons have proper size in medium variant", () => {
      const { container } = render(
        <ContentTypeFilter {...defaultProps} variant="chips" size="md" />
      );
      const icons = container.querySelectorAll("svg");
      icons.forEach((icon) => {
        expect(icon).toHaveClass("w-4", "h-4");
      });
    });

    it("icons have proper size in large variant", () => {
      const { container } = render(
        <ContentTypeFilter {...defaultProps} variant="chips" size="lg" />
      );
      const icons = container.querySelectorAll("svg");
      icons.forEach((icon) => {
        expect(icon).toHaveClass("w-5", "h-5");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined facets gracefully", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="chips"
          showCounts
          facets={undefined}
        />
      );
      // When facets are undefined, counts should show 0
      const zeros = screen.queryAllByText("0");
      expect(zeros.length).toBeGreaterThan(0);
    });

    it("calculates total count correctly", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="tabs"
          facets={mockFacets}
          showCounts
        />
      );
      // 150+45+30+12+8 = 245
      const totalCounts = screen.getAllByText("245");
      expect(totalCounts.length).toBeGreaterThan(0);
    });

    it("handles zero counts", () => {
      const zeroFacets: ContentTypeFacets = {
        products: 0,
        auctions: 0,
        shops: 0,
        categories: 0,
        blog: 0,
      };
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="chips"
          facets={zeroFacets}
          showCounts
        />
      );
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThan(0); // Multiple zeros for counts
    });

    it("renders with default variant when not specified", () => {
      render(<ContentTypeFilter {...defaultProps} />);
      // Default is "chips"
      expect(screen.getByText("All").closest("button")).toHaveClass(
        "rounded-full"
      );
    });

    it("renders with default size when not specified", () => {
      render(<ContentTypeFilter {...defaultProps} variant="chips" />);
      const chip = screen.getByText("All").closest("button");
      expect(chip).toHaveClass("px-3", "py-1.5"); // md size
    });
  });

  describe("Responsive Design", () => {
    it("dropdown hides label text on small screens", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          value="products"
          variant="dropdown"
        />
      );
      const label = screen.getByText("Products");
      expect(label).toHaveClass("hidden");
      expect(label).toHaveClass("sm:inline");
    });

    it("tabs container allows horizontal scroll", () => {
      const { container } = render(
        <ContentTypeFilter {...defaultProps} variant="tabs" />
      );
      // The TabsVariant returns a div with overflow-x-auto directly
      const tabsContainer = container.querySelector(".overflow-x-auto");
      expect(tabsContainer).toBeInTheDocument();
      expect(tabsContainer).toHaveClass("overflow-x-auto");
    });

    it("tabs have whitespace-nowrap to prevent wrapping", () => {
      render(<ContentTypeFilter {...defaultProps} variant="tabs" />);
      const tab = screen.getByText("All").closest("button");
      expect(tab).toHaveClass("whitespace-nowrap");
    });
  });

  describe("Count Badges", () => {
    it("shows count badges with proper styling in chips", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          value="products"
          variant="chips"
          facets={mockFacets}
          showCounts
        />
      );
      const badge = screen.getByText("150").closest("span");
      expect(badge).toHaveClass("rounded-full", "text-xs");
    });

    it("selected chip has different badge background", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          value="products"
          variant="chips"
          facets={mockFacets}
          showCounts
        />
      );
      const badges = screen.getAllByText("150");
      const selectedBadge = badges[0].closest("span");
      expect(selectedBadge?.className).toContain("bg-white/20");
    });

    it("unselected chip has gray badge background", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          value="all"
          variant="chips"
          facets={mockFacets}
          showCounts
        />
      );
      const unselectedBadge = screen.getByText("150").closest("span");
      expect(unselectedBadge).toHaveClass("bg-gray-200");
      expect(unselectedBadge).toHaveClass("dark:bg-gray-600");
    });

    it("tabs show count badges when showCounts true", () => {
      render(
        <ContentTypeFilter
          {...defaultProps}
          variant="tabs"
          facets={mockFacets}
          showCounts
        />
      );
      expect(screen.getByText("150")).toBeInTheDocument();
    });
  });
});
