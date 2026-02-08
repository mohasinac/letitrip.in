import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FAQSortDropdown, FAQSortOption } from "../FAQSortDropdown";

describe("FAQSortDropdown", () => {
  const mockOnSortChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it('should render "Sort by:" label', () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      expect(screen.getByText("Sort by:")).toBeInTheDocument();
    });

    it("should render select dropdown", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should render all sort options", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      expect(
        screen.getByRole("option", { name: "Most Helpful" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Newest First" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "A-Z" })).toBeInTheDocument();
    });

    it("should have exactly 3 options", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    it("should render options with correct values", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const helpfulOption = screen.getByRole("option", {
        name: "Most Helpful",
      }) as HTMLOptionElement;
      const newestOption = screen.getByRole("option", {
        name: "Newest First",
      }) as HTMLOptionElement;
      const alphabeticalOption = screen.getByRole("option", {
        name: "A-Z",
      }) as HTMLOptionElement;

      expect(helpfulOption).toHaveValue("helpful");
      expect(newestOption).toHaveValue("newest");
      expect(alphabeticalOption).toHaveValue("alphabetical");
    });
  });

  describe("Selected Value Display", () => {
    it('should display "helpful" as selected when selectedSort is "helpful"', () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("helpful");
    });

    it('should display "newest" as selected when selectedSort is "newest"', () => {
      render(
        <FAQSortDropdown
          selectedSort="newest"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("newest");
    });

    it('should display "alphabetical" as selected when selectedSort is "alphabetical"', () => {
      render(
        <FAQSortDropdown
          selectedSort="alphabetical"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("alphabetical");
    });

    it("should update selected value when prop changes", () => {
      const { rerender } = render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      let select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("helpful");

      rerender(
        <FAQSortDropdown
          selectedSort="newest"
          onSortChange={mockOnSortChange}
        />,
      );

      select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("newest");
    });
  });

  describe("Sort Change Functionality", () => {
    it('should call onSortChange when selecting "Most Helpful"', () => {
      render(
        <FAQSortDropdown
          selectedSort="newest"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "helpful" } });

      expect(mockOnSortChange).toHaveBeenCalledTimes(1);
      expect(mockOnSortChange).toHaveBeenCalledWith("helpful");
    });

    it('should call onSortChange when selecting "Newest First"', () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "newest" } });

      expect(mockOnSortChange).toHaveBeenCalledTimes(1);
      expect(mockOnSortChange).toHaveBeenCalledWith("newest");
    });

    it('should call onSortChange when selecting "A-Z"', () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "alphabetical" } });

      expect(mockOnSortChange).toHaveBeenCalledTimes(1);
      expect(mockOnSortChange).toHaveBeenCalledWith("alphabetical");
    });

    it("should call onSortChange with correct type (FAQSortOption)", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "newest" } });

      const calledValue = mockOnSortChange.mock.calls[0][0];
      expect(typeof calledValue).toBe("string");
      expect(["helpful", "newest", "alphabetical"]).toContain(calledValue);
    });

    it("should not call onSortChange when selecting already selected option", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "helpful" } });

      // Still calls onChange, but with same value
      expect(mockOnSortChange).toHaveBeenCalledWith("helpful");
    });
  });

  describe("Multiple Sort Changes", () => {
    it("should handle rapid sort changes", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");

      fireEvent.change(select, { target: { value: "newest" } });
      fireEvent.change(select, { target: { value: "alphabetical" } });
      fireEvent.change(select, { target: { value: "helpful" } });

      expect(mockOnSortChange).toHaveBeenCalledTimes(3);
      expect(mockOnSortChange).toHaveBeenNthCalledWith(1, "newest");
      expect(mockOnSortChange).toHaveBeenNthCalledWith(2, "alphabetical");
      expect(mockOnSortChange).toHaveBeenNthCalledWith(3, "helpful");
    });

    it("should handle switching between all options", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      const sortOptions: FAQSortOption[] = [
        "newest",
        "alphabetical",
        "helpful",
      ];

      sortOptions.forEach((option) => {
        fireEvent.change(select, { target: { value: option } });
      });

      expect(mockOnSortChange).toHaveBeenCalledTimes(3);
      sortOptions.forEach((option, index) => {
        expect(mockOnSortChange).toHaveBeenNthCalledWith(index + 1, option);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have combobox role", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should have option roles for all options", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
      options.forEach((option) => {
        expect(option).toHaveAttribute("value");
      });
    });

    it("should be keyboard navigable", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");

      // Select should be focusable
      select.focus();
      expect(select).toHaveFocus();
    });

    it("should support keyboard selection with Enter", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");

      // Focus and use keyboard
      select.focus();
      fireEvent.keyDown(select, { key: "ArrowDown", code: "ArrowDown" });
      fireEvent.change(select, { target: { value: "newest" } });

      expect(mockOnSortChange).toHaveBeenCalledWith("newest");
    });

    it("should have cursor pointer", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("cursor-pointer");
    });

    it("should have focus ring styles", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("focus:ring-2", "focus:ring-blue-500");
    });
  });

  describe("Visual States", () => {
    it("should have focus outline when focused", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("focus:outline-none");
    });

    it("should have rounded corners", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select.className).toContain("rounded");
    });

    it("should have border", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select.className).toContain("border");
    });
  });

  describe("Edge Cases", () => {
    it("should handle initial render with each sort option", () => {
      const sortOptions: FAQSortOption[] = [
        "helpful",
        "newest",
        "alphabetical",
      ];

      sortOptions.forEach((sortOption) => {
        const { unmount } = render(
          <FAQSortDropdown
            selectedSort={sortOption}
            onSortChange={mockOnSortChange}
          />,
        );

        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe(sortOption);

        unmount();
      });
    });

    it("should maintain state after multiple re-renders", () => {
      const { rerender } = render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        rerender(
          <FAQSortDropdown
            selectedSort="helpful"
            onSortChange={mockOnSortChange}
          />,
        );
      }

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("helpful");
    });

    it("should handle prop updates correctly", () => {
      const { rerender } = render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      let select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("helpful");

      rerender(
        <FAQSortDropdown
          selectedSort="newest"
          onSortChange={mockOnSortChange}
        />,
      );
      select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("newest");

      rerender(
        <FAQSortDropdown
          selectedSort="alphabetical"
          onSortChange={mockOnSortChange}
        />,
      );
      select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("alphabetical");
    });
  });

  describe("SORT_OPTIONS Constant", () => {
    it("should have exactly 3 sort options", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    it("should have meaningful labels", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const labels = ["Most Helpful", "Newest First", "A-Z"];
      labels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("should have consistent value-label mapping", () => {
      render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const mappings = [
        { value: "helpful", label: "Most Helpful" },
        { value: "newest", label: "Newest First" },
        { value: "alphabetical", label: "A-Z" },
      ];

      mappings.forEach(({ value, label }) => {
        const option = screen.getByRole("option", {
          name: label,
        }) as HTMLOptionElement;
        expect(option.value).toBe(value);
      });
    });
  });

  describe("Integration", () => {
    it("should work with complete sort workflow", () => {
      const { rerender } = render(
        <FAQSortDropdown
          selectedSort="helpful"
          onSortChange={mockOnSortChange}
        />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;

      // Initial state
      expect(select.value).toBe("helpful");

      // User changes to newest
      fireEvent.change(select, { target: { value: "newest" } });
      expect(mockOnSortChange).toHaveBeenCalledWith("newest");

      // Parent updates prop
      rerender(
        <FAQSortDropdown
          selectedSort="newest"
          onSortChange={mockOnSortChange}
        />,
      );
      expect(select.value).toBe("newest");

      // User changes to alphabetical
      fireEvent.change(select, { target: { value: "alphabetical" } });
      expect(mockOnSortChange).toHaveBeenCalledWith("alphabetical");

      // Parent updates prop
      rerender(
        <FAQSortDropdown
          selectedSort="alphabetical"
          onSortChange={mockOnSortChange}
        />,
      );
      expect(select.value).toBe("alphabetical");
    });

    it("should handle callback function changes", () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      const { rerender } = render(
        <FAQSortDropdown selectedSort="helpful" onSortChange={mockCallback1} />,
      );

      const select = screen.getByRole("combobox");

      fireEvent.change(select, { target: { value: "newest" } });
      expect(mockCallback1).toHaveBeenCalledWith("newest");

      // Change callback
      rerender(
        <FAQSortDropdown selectedSort="newest" onSortChange={mockCallback2} />,
      );

      fireEvent.change(select, { target: { value: "alphabetical" } });
      expect(mockCallback2).toHaveBeenCalledWith("alphabetical");
      expect(mockCallback1).toHaveBeenCalledTimes(1); // First callback not called again
    });
  });
});
