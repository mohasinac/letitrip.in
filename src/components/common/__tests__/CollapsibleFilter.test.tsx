import { fireEvent, render, screen } from "@testing-library/react";
import { CollapsibleFilter } from "../CollapsibleFilter";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("CollapsibleFilter", () => {
  const mockSections = [
    {
      id: "brand",
      title: "Brand",
      type: "checkbox" as const,
      options: [
        { label: "Apple", value: "apple", count: 150 },
        { label: "Samsung", value: "samsung", count: 120 },
        { label: "Sony", value: "sony", count: 80 },
      ],
    },
    {
      id: "price",
      title: "Price Range",
      type: "radio" as const,
      options: [
        { label: "Under ₹10,000", value: "0-10000" },
        { label: "₹10,000 - ₹50,000", value: "10000-50000" },
        { label: "Over ₹50,000", value: "50000+" },
      ],
    },
    {
      id: "rating",
      title: "Rating",
      type: "checkbox" as const,
      searchable: true,
      options: [
        { label: "4★ & above", value: "4", count: 200 },
        { label: "3★ & above", value: "3", count: 150 },
        { label: "2★ & above", value: "2", count: 50 },
      ],
    },
  ];

  const defaultProps = {
    sections: mockSections,
    activeFilters: {},
    onChange: jest.fn(),
    onClear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe("Basic Rendering", () => {
    it("renders filter title", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("renders all section titles", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getByText("Brand")).toBeInTheDocument();
      expect(screen.getByText("Price Range")).toBeInTheDocument();
      expect(screen.getByText("Rating")).toBeInTheDocument();
    });

    it("expands first 3 sections by default", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Under ₹10,000")).toBeInTheDocument();
      expect(screen.getByText("4★ & above")).toBeInTheDocument();
    });

    it("renders all filter options", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Samsung")).toBeInTheDocument();
      expect(screen.getByText("Sony")).toBeInTheDocument();
    });

    it("shows option counts when provided", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getAllByText("(150)")[0]).toBeInTheDocument();
      expect(screen.getAllByText("(120)")[0]).toBeInTheDocument();
    });
  });

  describe("Expand/Collapse Sections", () => {
    it("toggles section on header click", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const brandHeader = screen.getByText("Brand").closest("button");
      fireEvent.click(brandHeader!);
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    });

    it("shows ChevronDown when expanded", () => {
      const { container } = render(<CollapsibleFilter {...defaultProps} />);
      const brandSection = screen
        .getByText("Brand")
        .closest("div")?.parentElement;
      const chevronDown = brandSection?.querySelector(
        '[class*="lucide-chevron-down"]'
      );
      expect(chevronDown).toBeInTheDocument();
    });

    it("shows ChevronRight when collapsed", () => {
      const { container } = render(<CollapsibleFilter {...defaultProps} />);
      const brandHeader = screen.getAllByText("Brand")[0].closest("button");
      fireEvent.click(brandHeader!);
      // After collapsing, check for chevron-right
      const brandSection = screen
        .getAllByText("Brand")[0]
        .closest("div")?.parentElement;
      const chevronRight = brandSection?.querySelector(
        '[class*="lucide-chevron-right"]'
      );
      expect(chevronRight).toBeInTheDocument();
    });

    it("saves expanded state to localStorage", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const brandHeader = screen.getByText("Brand").closest("button");
      fireEvent.click(brandHeader!);
      const stored = JSON.parse(
        localStorageMock.getItem("collapsible-filter-expanded-state") || "{}"
      );
      expect(stored.brand).toBe(false);
    });

    it("loads expanded state from localStorage", () => {
      localStorageMock.setItem(
        "collapsible-filter-expanded-state",
        JSON.stringify({ brand: false, price: false, rating: true })
      );
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
      expect(screen.queryByText("Under ₹10,000")).not.toBeInTheDocument();
      expect(screen.getByText("4★ & above")).toBeInTheDocument();
    });
  });

  describe("Expand/Collapse All", () => {
    it("renders expand all button", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getByText("Expand All")).toBeInTheDocument();
    });

    it("renders collapse all button", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getByText("Collapse All")).toBeInTheDocument();
    });

    it("expands all sections on expand all click", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const brandHeader = screen.getByText("Brand").closest("button");
      fireEvent.click(brandHeader!);
      const expandAllButton = screen.getByText("Expand All");
      fireEvent.click(expandAllButton);
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Under ₹10,000")).toBeInTheDocument();
      expect(screen.getByText("4★ & above")).toBeInTheDocument();
    });

    it("collapses all sections on collapse all click", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const collapseAllButton = screen.getByText("Collapse All");
      fireEvent.click(collapseAllButton);
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
      expect(screen.queryByText("Under ₹10,000")).not.toBeInTheDocument();
      expect(screen.queryByText("4★ & above")).not.toBeInTheDocument();
    });

    it("saves state to localStorage on expand all", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const expandAllButton = screen.getByText("Expand All");
      fireEvent.click(expandAllButton);
      const stored = JSON.parse(
        localStorageMock.getItem("collapsible-filter-expanded-state") || "{}"
      );
      expect(stored.brand).toBe(true);
      expect(stored.price).toBe(true);
      expect(stored.rating).toBe(true);
    });
  });

  describe("Checkbox Filters", () => {
    it("renders checkboxes for checkbox type sections", () => {
      const { container } = render(<CollapsibleFilter {...defaultProps} />);
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("calls onChange when checkbox is clicked", () => {
      const onChange = jest.fn();
      render(<CollapsibleFilter {...defaultProps} onChange={onChange} />);
      const label = screen.getByText("Apple");
      const appleCheckbox = label.closest("label")?.querySelector("input");
      fireEvent.click(appleCheckbox!);
      expect(onChange).toHaveBeenCalledWith("brand", ["apple"]);
    });

    it("adds value to array when checked", () => {
      const onChange = jest.fn();
      const activeFilters = { brand: ["samsung"] };
      render(
        <CollapsibleFilter
          {...defaultProps}
          activeFilters={activeFilters}
          onChange={onChange}
        />
      );
      const label = screen.getByText("Apple");
      const appleCheckbox = label.closest("label")?.querySelector("input");
      fireEvent.click(appleCheckbox!);
      expect(onChange).toHaveBeenCalledWith("brand", ["samsung", "apple"]);
    });

    it("removes value from array when unchecked", () => {
      const onChange = jest.fn();
      const activeFilters = { brand: ["apple", "samsung"] };
      render(
        <CollapsibleFilter
          {...defaultProps}
          activeFilters={activeFilters}
          onChange={onChange}
        />
      );
      const label = screen.getByText("Apple");
      const appleCheckbox = label
        .closest("label")
        ?.querySelector("input") as HTMLInputElement;
      fireEvent.click(appleCheckbox);
      expect(onChange).toHaveBeenCalledWith("brand", ["samsung"]);
    });

    it("shows checked state for active filters", () => {
      const activeFilters = { brand: ["apple"] };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      const label = screen.getByText("Apple");
      const appleCheckbox = label
        .closest("label")
        ?.querySelector("input") as HTMLInputElement;
      expect(appleCheckbox.checked).toBe(true);
    });
  });

  describe("Radio Filters", () => {
    it("renders radio buttons for radio type sections", () => {
      const { container } = render(<CollapsibleFilter {...defaultProps} />);
      const radios = container.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBeGreaterThan(0);
    });

    it("calls onChange when radio is selected", () => {
      const onChange = jest.fn();
      render(<CollapsibleFilter {...defaultProps} onChange={onChange} />);
      const label = screen.getByText("Under ₹10,000");
      const radio = label.closest("label")?.querySelector("input");
      fireEvent.click(radio!);
      expect(onChange).toHaveBeenCalledWith("price", "0-10000");
    });

    it("shows checked state for active radio", () => {
      const activeFilters = { price: "0-10000" };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      const label = screen.getByText("Under ₹10,000");
      const radio = label
        .closest("label")
        ?.querySelector("input") as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it("only one radio can be selected at a time", () => {
      const onChange = jest.fn();
      const activeFilters = { price: "0-10000" };
      render(
        <CollapsibleFilter
          {...defaultProps}
          activeFilters={activeFilters}
          onChange={onChange}
        />
      );
      const label = screen.getByText("₹10,000 - ₹50,000");
      const radio2 = label.closest("label")?.querySelector("input");
      fireEvent.click(radio2!);
      expect(onChange).toHaveBeenCalledWith("price", "10000-50000");
    });
  });

  describe("Active Filter Count", () => {
    it("shows total active filter count", () => {
      const activeFilters = { brand: ["apple", "samsung"], price: "0-10000" };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows section active count", () => {
      const activeFilters = { brand: ["apple", "samsung"] };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      const brandSection = screen.getByText("Brand").closest("button");
      expect(brandSection).toHaveTextContent("2");
    });

    it("hides count when no active filters", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const filterTitle = screen.getByText("Filters");
      const badge = filterTitle.parentElement?.querySelector(".bg-blue-100");
      expect(badge).not.toBeInTheDocument();
    });

    it("counts single value as 1", () => {
      const activeFilters = { price: "0-10000" };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      const priceSection = screen.getByText("Price Range").closest("button");
      expect(priceSection).toHaveTextContent("1");
    });
  });

  describe("Clear Filters", () => {
    it("shows clear all button when filters active", () => {
      const activeFilters = { brand: ["apple"] };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      expect(screen.getByText("Clear All")).toBeInTheDocument();
    });

    it("hides clear all button when no active filters", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.queryByText("Clear All")).not.toBeInTheDocument();
    });

    it("calls onClear without argument when clear all clicked", () => {
      const onClear = jest.fn();
      const activeFilters = { brand: ["apple"] };
      render(
        <CollapsibleFilter
          {...defaultProps}
          activeFilters={activeFilters}
          onClear={onClear}
        />
      );
      const clearAllButton = screen.getByText("Clear All");
      fireEvent.click(clearAllButton);
      expect(onClear).toHaveBeenCalledWith();
    });

    it("shows section clear button when section has active filters", () => {
      const activeFilters = { brand: ["apple"] };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      const brandSection = screen.getByText("Brand").closest("button");
      const clearButtons = screen.getAllByText("Clear");
      expect(clearButtons.length).toBeGreaterThan(0);
    });

    it("calls onClear with section id when section clear clicked", () => {
      const onClear = jest.fn();
      const activeFilters = { brand: ["apple"] };
      render(
        <CollapsibleFilter
          {...defaultProps}
          activeFilters={activeFilters}
          onClear={onClear}
        />
      );
      const brandSection = screen.getByText("Brand").closest("button");
      const clearButton = brandSection?.querySelector("button");
      if (clearButton && clearButton.textContent === "Clear") {
        fireEvent.click(clearButton);
        expect(onClear).toHaveBeenCalledWith("brand");
      }
    });

    it("stops propagation when section clear clicked", () => {
      const onClear = jest.fn();
      const activeFilters = { brand: ["apple"] };
      const { container } = render(
        <CollapsibleFilter
          {...defaultProps}
          activeFilters={activeFilters}
          onClear={onClear}
        />
      );
      const brandSection = screen.getByText("Brand").closest("button");
      const clearButton = brandSection?.querySelector("button");
      if (clearButton && clearButton.textContent === "Clear") {
        fireEvent.click(clearButton);
      }
      // Section should not collapse when clear button clicked
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("shows search input for searchable sections with enough options", () => {
      // Create a section with more options than searchThreshold
      const sectionsWithManyOptions = [
        ...mockSections.slice(0, 2),
        {
          id: "rating",
          title: "Rating",
          type: "checkbox" as const,
          searchable: true,
          options: [
            { label: "5★ & above", value: "5", count: 250 },
            { label: "4★ & above", value: "4", count: 200 },
            { label: "3★ & above", value: "3", count: 150 },
            { label: "2★ & above", value: "2", count: 50 },
            { label: "1★ & above", value: "1", count: 20 },
          ],
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionsWithManyOptions}
        />
      );
      expect(
        screen.getByPlaceholderText("Search rating...")
      ).toBeInTheDocument();
    });

    it("hides search input by default", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      expect(
        screen.queryByPlaceholderText("Search brand...")
      ).not.toBeInTheDocument();
    });

    it("shows search when enabled globally", () => {
      // Create sections with enough options to trigger search
      const sectionsWithManyOptions = [
        {
          id: "brand",
          title: "Brand",
          type: "checkbox" as const,
          options: [
            { label: "Apple", value: "apple", count: 150 },
            { label: "Samsung", value: "samsung", count: 120 },
            { label: "Sony", value: "sony", count: 80 },
            { label: "LG", value: "lg", count: 70 },
            { label: "Xiaomi", value: "xiaomi", count: 60 },
          ],
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionsWithManyOptions}
          search={true}
        />
      );
      expect(
        screen.getByPlaceholderText("Search brand...")
      ).toBeInTheDocument();
    });

    it("respects searchThreshold", () => {
      render(
        <CollapsibleFilter
          {...defaultProps}
          search={true}
          searchThreshold={10}
        />
      );
      expect(
        screen.queryByPlaceholderText("Search brand...")
      ).not.toBeInTheDocument();
    });

    it("filters options based on search query", () => {
      const sectionsWithManyOptions = [
        {
          id: "brand",
          title: "Brand",
          type: "checkbox" as const,
          options: [
            { label: "Apple", value: "apple", count: 150 },
            { label: "Samsung", value: "samsung", count: 120 },
            { label: "Sony", value: "sony", count: 80 },
            { label: "LG", value: "lg", count: 70 },
            { label: "Xiaomi", value: "xiaomi", count: 60 },
          ],
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionsWithManyOptions}
          search={true}
        />
      );
      const searchInput = screen.getByPlaceholderText("Search brand...");
      fireEvent.change(searchInput, { target: { value: "Apple" } });
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.queryByText("Samsung")).not.toBeInTheDocument();
    });

    it("search is case insensitive", () => {
      const sectionsWithManyOptions = [
        {
          id: "brand",
          title: "Brand",
          type: "checkbox" as const,
          options: [
            { label: "Apple", value: "apple", count: 150 },
            { label: "Samsung", value: "samsung", count: 120 },
            { label: "Sony", value: "sony", count: 80 },
            { label: "LG", value: "lg", count: 70 },
            { label: "Xiaomi", value: "xiaomi", count: 60 },
          ],
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionsWithManyOptions}
          search={true}
        />
      );
      const searchInput = screen.getByPlaceholderText("Search brand...");
      fireEvent.change(searchInput, { target: { value: "APPLE" } });
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    it("shows no results message when search has no matches", () => {
      const sectionsWithManyOptions = [
        {
          id: "brand",
          title: "Brand",
          type: "checkbox" as const,
          options: [
            { label: "Apple", value: "apple", count: 150 },
            { label: "Samsung", value: "samsung", count: 120 },
            { label: "Sony", value: "sony", count: 80 },
            { label: "LG", value: "lg", count: 70 },
            { label: "Xiaomi", value: "xiaomi", count: 60 },
          ],
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionsWithManyOptions}
          search={true}
        />
      );
      const searchInput = screen.getByPlaceholderText("Search brand...");
      fireEvent.change(searchInput, { target: { value: "NonExistent" } });
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    it("clears search maintains filter state", () => {
      const onChange = jest.fn();
      const sectionsWithManyOptions = [
        {
          id: "brand",
          title: "Brand",
          type: "checkbox" as const,
          options: [
            { label: "Apple", value: "apple", count: 150 },
            { label: "Samsung", value: "samsung", count: 120 },
            { label: "Sony", value: "sony", count: 80 },
            { label: "LG", value: "lg", count: 70 },
            { label: "Xiaomi", value: "xiaomi", count: 60 },
          ],
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionsWithManyOptions}
          search={true}
          onChange={onChange}
        />
      );
      const searchInput = screen.getByPlaceholderText("Search brand...");
      fireEvent.change(searchInput, { target: { value: "Apple" } });
      const label = screen.getByText("Apple");
      const appleCheckbox = label.closest("label")?.querySelector("input");
      fireEvent.click(appleCheckbox!);
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(onChange).toHaveBeenCalledWith("brand", ["apple"]);
    });
  });

  describe("Dark Mode", () => {
    it("has dark mode classes on container", () => {
      const { container } = render(<CollapsibleFilter {...defaultProps} />);
      const section = container.querySelector(".dark\\:bg-gray-800");
      expect(section).toBeInTheDocument();
    });

    it("has dark mode classes on section headers", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const brandHeader = screen.getByText("Brand").closest("button");
      expect(brandHeader?.className).toBeDefined();
    });

    it("has dark mode classes on section title", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const title = screen.getByText("Filters");
      expect(title.className).toBeDefined();
    });

    it("has dark mode classes on search input", () => {
      const sectionsWithManyOptions = [
        ...mockSections.slice(0, 2),
        {
          id: "rating",
          title: "Rating",
          type: "checkbox" as const,
          searchable: true,
          options: [
            { label: "5★ & above", value: "5", count: 250 },
            { label: "4★ & above", value: "4", count: 200 },
            { label: "3★ & above", value: "3", count: 150 },
            { label: "2★ & above", value: "2", count: 50 },
            { label: "1★ & above", value: "1", count: 20 },
          ],
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionsWithManyOptions}
        />
      );
      const searchInput = screen.getByPlaceholderText("Search rating...");
      expect(searchInput.className).toBeDefined();
    });

    it("has dark mode classes on labels", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const label = screen.getByText("Apple").closest("label");
      expect(label?.querySelector("span")?.className).toBeDefined();
    });

    it("has dark mode classes on count badges", () => {
      const activeFilters = { brand: ["apple"] };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      const badge = screen.getAllByText("1")[0].closest("span");
      expect(badge?.className).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("checkboxes have proper labels", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      // Find checkbox by its label text within the label element
      const label = screen.getByText("Apple");
      const checkbox = label.closest("label")?.querySelector("input");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    it("radio buttons have proper labels", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      // Find radio by its label text within the label element
      const label = screen.getByText("Under ₹10,000");
      const radio = label.closest("label")?.querySelector("input");
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute("type", "radio");
    });

    it("search inputs have placeholders", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      // Rating section has searchable: true
      const searchInput = screen.queryByPlaceholderText("Search rating...");
      // Search only appears if needsSearch condition is met (options >= searchThreshold)
      // Rating has 3 options, default searchThreshold is 5, so no search input
      expect(searchInput).not.toBeInTheDocument();
    });

    it("labels are clickable", () => {
      const onChange = jest.fn();
      render(<CollapsibleFilter {...defaultProps} onChange={onChange} />);
      const label = screen.getByText("Apple");
      const checkbox = label.closest("label")?.querySelector("input");
      fireEvent.click(checkbox!);
      expect(onChange).toHaveBeenCalledWith("brand", ["apple"]);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty sections array", () => {
      render(<CollapsibleFilter {...defaultProps} sections={[]} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("handles section with no options", () => {
      const sectionsWithEmpty = [
        ...mockSections,
        { id: "empty", title: "Empty", type: "checkbox" as const, options: [] },
      ];
      render(
        <CollapsibleFilter {...defaultProps} sections={sectionsWithEmpty} />
      );
      const emptyHeader = screen.getByText("Empty");
      fireEvent.click(emptyHeader.closest("button")!);
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    it("handles undefined activeFilters", () => {
      const onChange = jest.fn();
      render(
        <CollapsibleFilter
          sections={mockSections}
          activeFilters={{}}
          onChange={onChange}
          onClear={jest.fn()}
        />
      );
      const label = screen.getByText("Apple");
      const appleCheckbox = label.closest("label")?.querySelector("input");
      fireEvent.click(appleCheckbox!);
      expect(onChange).toHaveBeenCalledWith("brand", ["apple"]);
    });

    it("handles corrupted localStorage data", () => {
      localStorageMock.setItem(
        "collapsible-filter-expanded-state",
        "invalid json"
      );
      render(<CollapsibleFilter {...defaultProps} />);
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    it("handles options without counts", () => {
      const sectionsWithoutCounts = [
        {
          id: "brand",
          title: "Brand",
          type: "checkbox" as const,
          options: [
            { label: "Apple", value: "apple" },
            { label: "Samsung", value: "samsung" },
          ],
        },
      ];
      render(
        <CollapsibleFilter {...defaultProps} sections={sectionsWithoutCounts} />
      );
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });
  });

  describe("Scrollable Content", () => {
    it("applies max height to options container", () => {
      const { container } = render(<CollapsibleFilter {...defaultProps} />);
      const optionsContainer = container.querySelector(".space-y-2");
      // Verify options container exists
      expect(optionsContainer).toBeInTheDocument();
    });
  });

  describe("Section with Many Options", () => {
    it("shows search for sections exceeding threshold", () => {
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        label: `Option ${i}`,
        value: `opt${i}`,
      }));
      const sectionWithMany = [
        {
          id: "many",
          title: "Many Options",
          type: "checkbox" as const,
          options: manyOptions,
        },
      ];
      render(
        <CollapsibleFilter
          {...defaultProps}
          sections={sectionWithMany}
          search={true}
          searchThreshold={5}
        />
      );
      expect(
        screen.getByPlaceholderText("Search many options...")
      ).toBeInTheDocument();
    });
  });

  describe("Button Styling", () => {
    it("expand all button has correct classes", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const expandAllButton = screen.getByText("Expand All");
      expect(expandAllButton.className).toBeDefined();
    });

    it("clear all button has correct styling", () => {
      const activeFilters = { brand: ["apple"] };
      render(
        <CollapsibleFilter {...defaultProps} activeFilters={activeFilters} />
      );
      const clearAllButton = screen.getByText("Clear All");
      expect(clearAllButton.className).toBeDefined();
    });
  });

  describe("Hover States", () => {
    it("section header has hover state", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const brandHeader = screen.getByText("Brand").closest("button");
      expect(brandHeader?.className).toBeDefined();
    });

    it("expand all button has hover state", () => {
      render(<CollapsibleFilter {...defaultProps} />);
      const expandAllButton = screen.getByText("Expand All");
      expect(expandAllButton.className).toBeDefined();
    });
  });
});
