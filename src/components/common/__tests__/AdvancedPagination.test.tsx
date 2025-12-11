/**
 * Comprehensive tests for AdvancedPagination component
 * Tests: Page navigation, page size selector, page input, dark mode
 * Focus: First/Last buttons, disabled states, page numbers, item count
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { AdvancedPagination } from "../AdvancedPagination";

describe("AdvancedPagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 20,
    totalItems: 200,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders pagination component", () => {
      render(<AdvancedPagination {...defaultProps} />);
      expect(
        screen.getByText(/showing 1 to 20 of 200 items/i)
      ).toBeInTheDocument();
    });

    it("displays correct item range for first page", () => {
      render(<AdvancedPagination {...defaultProps} />);
      expect(
        screen.getByText("Showing 1 to 20 of 200 items")
      ).toBeInTheDocument();
    });

    it("displays correct item range for middle page", () => {
      render(<AdvancedPagination {...defaultProps} currentPage={5} />);
      expect(
        screen.getByText("Showing 81 to 100 of 200 items")
      ).toBeInTheDocument();
    });

    it("displays correct item range for last page", () => {
      render(<AdvancedPagination {...defaultProps} currentPage={10} />);
      expect(
        screen.getByText("Showing 181 to 200 of 200 items")
      ).toBeInTheDocument();
    });

    it("handles partial last page correctly", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={5}
          totalPages={5}
          totalItems={95}
        />
      );
      expect(
        screen.getByText("Showing 81 to 95 of 95 items")
      ).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <AdvancedPagination {...defaultProps} className="custom-class" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("returns null when totalPages is 1 and no page size selector", () => {
      const { container } = render(
        <AdvancedPagination
          {...defaultProps}
          totalPages={1}
          showPageSizeSelector={false}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Navigation Buttons", () => {
    it("renders all navigation buttons when showFirstLast is true", () => {
      render(<AdvancedPagination {...defaultProps} showFirstLast={true} />);

      expect(screen.getByLabelText("First page")).toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
      expect(screen.getByLabelText("Last page")).toBeInTheDocument();
    });

    it("hides first/last buttons when showFirstLast is false", () => {
      render(<AdvancedPagination {...defaultProps} showFirstLast={false} />);

      expect(screen.queryByLabelText("First page")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Last page")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    });

    it("calls onPageChange when previous button is clicked", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={5}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(screen.getByLabelText("Previous page"));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it("calls onPageChange when next button is clicked", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={5}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(screen.getByLabelText("Next page"));
      expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it("calls onPageChange when first button is clicked", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={5}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(screen.getByLabelText("First page"));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("calls onPageChange when last button is clicked", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={5}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(screen.getByLabelText("Last page"));
      expect(onPageChange).toHaveBeenCalledWith(10);
    });
  });

  describe("Disabled States", () => {
    it("disables previous and first buttons on first page", () => {
      render(<AdvancedPagination {...defaultProps} currentPage={1} />);

      expect(screen.getByLabelText("Previous page")).toBeDisabled();
      expect(screen.getByLabelText("First page")).toBeDisabled();
    });

    it("disables next and last buttons on last page", () => {
      render(<AdvancedPagination {...defaultProps} currentPage={10} />);

      expect(screen.getByLabelText("Next page")).toBeDisabled();
      expect(screen.getByLabelText("Last page")).toBeDisabled();
    });

    it("enables all buttons on middle page", () => {
      render(<AdvancedPagination {...defaultProps} currentPage={5} />);

      expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
      expect(screen.getByLabelText("Next page")).not.toBeDisabled();
      expect(screen.getByLabelText("First page")).not.toBeDisabled();
      expect(screen.getByLabelText("Last page")).not.toBeDisabled();
    });

    it("applies disabled styling to disabled buttons", () => {
      render(<AdvancedPagination {...defaultProps} currentPage={1} />);

      const firstButton = screen.getByLabelText("First page");
      expect(firstButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });
  });

  describe("Page Numbers Display", () => {
    it("shows all page numbers when totalPages <= 5", () => {
      render(<AdvancedPagination {...defaultProps} totalPages={5} />);

      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    });

    it("shows ellipsis when near start (currentPage <= 3)", () => {
      render(
        <AdvancedPagination {...defaultProps} currentPage={2} totalPages={10} />
      );

      expect(screen.getByText("...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    });

    it("shows ellipsis when near end (currentPage >= totalPages - 2)", () => {
      render(
        <AdvancedPagination {...defaultProps} currentPage={9} totalPages={10} />
      );

      expect(screen.getByText("...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    });

    it("shows two ellipses when in middle", () => {
      render(
        <AdvancedPagination {...defaultProps} currentPage={5} totalPages={20} />
      );

      const ellipses = screen.getAllByText("...");
      expect(ellipses).toHaveLength(2);
    });

    it("highlights current page", () => {
      render(<AdvancedPagination {...defaultProps} currentPage={5} />);

      const currentButton = screen.getByRole("button", { name: "5" });
      expect(currentButton).toHaveClass("bg-purple-600", "text-white");
    });

    it("does not highlight non-current pages", () => {
      render(
        <AdvancedPagination {...defaultProps} currentPage={5} totalPages={7} />
      );

      const button6 = screen.getByRole("button", { name: "6" });
      expect(button6).not.toHaveClass("bg-purple-600", "text-white");
      expect(button6).toHaveClass("text-gray-700", "dark:text-gray-300");
    });

    it("calls onPageChange when page number is clicked", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "3" }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe("Page Size Selector", () => {
    it("renders page size selector when showPageSizeSelector is true", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      expect(screen.getByLabelText("Per page:")).toBeInTheDocument();
    });

    it("hides page size selector when showPageSizeSelector is false", () => {
      render(
        <AdvancedPagination {...defaultProps} showPageSizeSelector={false} />
      );

      expect(screen.queryByLabelText("Per page:")).not.toBeInTheDocument();
    });

    it("hides page size selector when onPageSizeChange is not provided", () => {
      render(
        <AdvancedPagination {...defaultProps} showPageSizeSelector={true} />
      );

      expect(screen.queryByLabelText("Per page:")).not.toBeInTheDocument();
    });

    it("displays default page size options", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      const select = screen.getByLabelText("Per page:") as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.value);

      expect(options).toEqual(["10", "20", "50", "100"]);
    });

    it("displays custom page size options", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
          pageSizeOptions={[5, 15, 25]}
        />
      );

      const select = screen.getByLabelText("Per page:") as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.value);

      expect(options).toEqual(["5", "15", "25"]);
    });

    it("shows current page size as selected", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          pageSize={50}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      const select = screen.getByLabelText("Per page:") as HTMLSelectElement;
      expect(select.value).toBe("50");
    });

    it("calls onPageSizeChange when page size is changed", () => {
      const onPageSizeChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const select = screen.getByLabelText("Per page:");
      fireEvent.change(select, { target: { value: "50" } });

      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });
  });

  describe("Page Input", () => {
    it("renders page input when showPageInput is true and totalPages > 1", () => {
      render(<AdvancedPagination {...defaultProps} showPageInput={true} />);

      expect(screen.getByLabelText("Go to:")).toBeInTheDocument();
    });

    it("hides page input when showPageInput is false", () => {
      render(<AdvancedPagination {...defaultProps} showPageInput={false} />);

      expect(screen.queryByLabelText("Go to:")).not.toBeInTheDocument();
    });

    it("hides page input when totalPages is 1", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          totalPages={1}
          showPageInput={true}
        />
      );

      expect(screen.queryByLabelText("Go to:")).not.toBeInTheDocument();
    });

    it("has correct min and max attributes", () => {
      render(<AdvancedPagination {...defaultProps} showPageInput={true} />);

      const input = screen.getByLabelText("Go to:") as HTMLInputElement;
      expect(input).toHaveAttribute("min", "1");
      expect(input).toHaveAttribute("max", "10");
    });

    it("shows current page as default value", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={5}
          showPageInput={true}
        />
      );

      const input = screen.getByLabelText("Go to:") as HTMLInputElement;
      expect(input.defaultValue).toBe("5");
    });

    it("calls onPageChange when valid page number is submitted", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          onPageChange={onPageChange}
          showPageInput={true}
        />
      );

      const input = screen.getByLabelText("Go to:");
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "7" } });
      fireEvent.submit(form);

      expect(onPageChange).toHaveBeenCalledWith(7);
    });

    it("does not call onPageChange for page number below 1", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          onPageChange={onPageChange}
          showPageInput={true}
        />
      );

      const input = screen.getByLabelText("Go to:");
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "0" } });
      fireEvent.submit(form);

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("does not call onPageChange for page number above totalPages", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          onPageChange={onPageChange}
          showPageInput={true}
        />
      );

      const input = screen.getByLabelText("Go to:");
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "11" } });
      fireEvent.submit(form);

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("handles non-numeric input gracefully", () => {
      const onPageChange = jest.fn();
      render(
        <AdvancedPagination
          {...defaultProps}
          onPageChange={onPageChange}
          showPageInput={true}
        />
      );

      const input = screen.getByLabelText("Go to:");
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "abc" } });
      fireEvent.submit(form);

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to item count text", () => {
      const { container } = render(<AdvancedPagination {...defaultProps} />);
      const itemCount = container.querySelector(".text-gray-600");

      expect(itemCount).toHaveClass("dark:text-gray-400");
    });

    it("applies dark mode classes to navigation buttons", () => {
      render(<AdvancedPagination {...defaultProps} />);

      const prevButton = screen.getByLabelText("Previous page");
      expect(prevButton).toHaveClass(
        "dark:hover:bg-gray-700",
        "dark:text-gray-300"
      );
    });

    it("applies dark mode classes to page number buttons", () => {
      render(<AdvancedPagination {...defaultProps} totalPages={5} />);

      const button2 = screen.getByRole("button", { name: "2" });
      expect(button2).toHaveClass(
        "dark:text-gray-300",
        "dark:hover:bg-gray-700"
      );
    });

    it("applies dark mode classes to page size selector", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      const select = screen.getByLabelText("Per page:");
      expect(select).toHaveClass(
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-white"
      );
    });

    it("applies dark mode classes to page input", () => {
      render(<AdvancedPagination {...defaultProps} showPageInput={true} />);

      const input = screen.getByLabelText("Go to:");
      expect(input).toHaveClass(
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-white"
      );
    });

    it("applies dark mode classes to labels", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      const label = screen.getByText("Per page:");
      expect(label).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Responsive Design", () => {
    it("uses flex-col and sm:flex-row for main container", () => {
      const { container } = render(<AdvancedPagination {...defaultProps} />);
      const main = container.firstChild;

      expect(main).toHaveClass("flex-col", "sm:flex-row");
    });

    it("uses hidden sm:flex for page numbers container", () => {
      const { container } = render(
        <AdvancedPagination {...defaultProps} totalPages={5} />
      );
      const pageNumbers = container.querySelector(".hidden.sm\\:flex");

      expect(pageNumbers).toBeInTheDocument();
    });

    it("uses whitespace-nowrap for labels", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      const label = screen.getByText("Per page:");
      expect(label).toHaveClass("whitespace-nowrap");
    });
  });

  describe("Edge Cases", () => {
    it("handles single page correctly", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={1}
          totalPages={1}
          totalItems={15}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      expect(
        screen.getByText("Showing 1 to 15 of 15 items")
      ).toBeInTheDocument();
    });

    it("handles zero items correctly", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={1}
          totalPages={1}
          totalItems={0}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      expect(screen.getByText("Showing 1 to 0 of 0 items")).toBeInTheDocument();
    });

    it("handles very large page numbers", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={500}
          totalPages={1000}
          pageSize={10}
          totalItems={10000}
        />
      );

      expect(
        screen.getByText("Showing 4991 to 5000 of 10000 items")
      ).toBeInTheDocument();
    });

    it("handles page size larger than total items", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={1}
          totalPages={1}
          pageSize={100}
          totalItems={50}
        />
      );

      expect(
        screen.getByText("Showing 1 to 50 of 50 items")
      ).toBeInTheDocument();
    });

    it("handles totalPages of 0", () => {
      const { container } = render(
        <AdvancedPagination
          {...defaultProps}
          totalPages={0}
          showPageSizeSelector={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-labels for navigation buttons", () => {
      render(<AdvancedPagination {...defaultProps} />);

      expect(screen.getByLabelText("First page")).toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
      expect(screen.getByLabelText("Last page")).toBeInTheDocument();
    });

    it("has proper htmlFor association for labels", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      const label = screen.getByText("Per page:");
      expect(label).toHaveAttribute("for", "pageSize");

      const select = screen.getByLabelText("Per page:");
      expect(select).toHaveAttribute("id", "pageSize");
    });

    it("page input has proper id and label association", () => {
      render(<AdvancedPagination {...defaultProps} showPageInput={true} />);

      const input = screen.getByLabelText("Go to:");
      expect(input).toHaveAttribute("id", "pageInput");
      expect(input).toHaveAttribute("name", "page");
    });

    it("all buttons are keyboard accessible", () => {
      render(<AdvancedPagination {...defaultProps} totalPages={5} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.tagName).toBe("BUTTON");
      });
    });
  });

  describe("Focus States", () => {
    it("applies focus ring to page size selector", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          showPageSizeSelector={true}
          onPageSizeChange={jest.fn()}
        />
      );

      const select = screen.getByLabelText("Per page:");
      expect(select).toHaveClass("focus:ring-2", "focus:ring-purple-500");
    });

    it("applies focus ring to page input", () => {
      render(<AdvancedPagination {...defaultProps} showPageInput={true} />);

      const input = screen.getByLabelText("Go to:");
      expect(input).toHaveClass("focus:ring-2", "focus:ring-purple-500");
    });
  });

  describe("Integration Tests", () => {
    it("combines all features together", () => {
      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={5}
          showPageSizeSelector={true}
          showPageInput={true}
          showFirstLast={true}
          onPageSizeChange={jest.fn()}
        />
      );

      expect(
        screen.getByText("Showing 81 to 100 of 200 items")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Per page:")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to:")).toBeInTheDocument();
      expect(screen.getByLabelText("First page")).toBeInTheDocument();
    });

    it("handles multiple user interactions", () => {
      const onPageChange = jest.fn();
      const onPageSizeChange = jest.fn();

      render(
        <AdvancedPagination
          {...defaultProps}
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showPageSizeSelector={true}
        />
      );

      // Change page size
      fireEvent.change(screen.getByLabelText("Per page:"), {
        target: { value: "50" },
      });
      expect(onPageSizeChange).toHaveBeenCalledWith(50);

      // Navigate to next page
      fireEvent.click(screen.getByLabelText("Next page"));
      expect(onPageChange).toHaveBeenCalledWith(2);

      // Click page number
      fireEvent.click(screen.getByRole("button", { name: "3" }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });
});
