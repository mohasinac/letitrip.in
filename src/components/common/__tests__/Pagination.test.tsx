/**
 * @jest-environment jsdom
 *
 * Pagination Component Tests
 * Tests page navigation, page size changes, and edge cases
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { Pagination } from "../Pagination";

describe("Pagination Component", () => {
  const mockOnPageChange = jest.fn();
  const mockOnPageSizeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByTitle("Previous page")).toBeInTheDocument();
    });

    it("should not render when totalPages is 1 and no totalItems", () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={1}
          onPageChange={mockOnPageChange}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("should not render when totalPages is 0", () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={0}
          onPageChange={mockOnPageChange}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render when totalPages is 1 but totalItems exists", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={1}
          totalItems={10}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText("10 items")).toBeInTheDocument();
    });

    it("should display current page and total pages", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={10}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText(/Page 2/i)).toBeInTheDocument();
      expect(screen.getByText(/of 10/)).toBeInTheDocument();
    });
  });

  describe("Navigation Buttons", () => {
    it("should render Previous button", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByTitle("Previous page")).toBeInTheDocument();
    });

    it("should render Next button", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByTitle("Next page")).toBeInTheDocument();
    });

    it("should disable Previous on first page", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const prevButton = screen.getByTitle("Previous page");
      expect(prevButton).toBeDisabled();
    });

    it("should disable Next on last page", () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const nextButton = screen.getByTitle("Next page");
      expect(nextButton).toBeDisabled();
    });

    it("should enable Previous on non-first page", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const prevButton = screen.getByTitle("Previous page");
      expect(prevButton).not.toBeDisabled();
    });

    it("should enable Next on non-last page", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const nextButton = screen.getByTitle("Next page");
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("First/Last Buttons", () => {
    it("should not render First/Last buttons by default", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.queryByTitle("First page")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Last page")).not.toBeInTheDocument();
    });

    it("should render First/Last buttons when showFirstLast is true", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      expect(screen.getByTitle("First page")).toBeInTheDocument();
      expect(screen.getByTitle("Last page")).toBeInTheDocument();
    });

    it("should disable First button on first page", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      const firstButton = screen.getByTitle("First page");
      expect(firstButton).toBeDisabled();
    });

    it("should disable Last button on last page", () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      const lastButton = screen.getByTitle("Last page");
      expect(lastButton).toBeDisabled();
    });

    it("should enable First button when not on first page", () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      const firstButton = screen.getByTitle("First page");
      expect(firstButton).not.toBeDisabled();
    });

    it("should enable Last button when not on last page", () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      const lastButton = screen.getByTitle("Last page");
      expect(lastButton).not.toBeDisabled();
    });
  });

  describe("Page Change Events", () => {
    it("should call onPageChange when Next is clicked", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const nextButton = screen.getByTitle("Next page");
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it("should call onPageChange when Previous is clicked", () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const prevButton = screen.getByTitle("Previous page");
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("should call onPageChange with 1 when First is clicked", () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      const firstButton = screen.getByTitle("First page");
      fireEvent.click(firstButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it("should call onPageChange with totalPages when Last is clicked", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      const lastButton = screen.getByTitle("Last page");
      fireEvent.click(lastButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(5);
    });

    it("should not call onPageChange when clicking disabled Previous", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const prevButton = screen.getByTitle("Previous page");
      fireEvent.click(prevButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("should not call onPageChange when clicking disabled Next", () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const nextButton = screen.getByTitle("Next page");
      fireEvent.click(nextButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe("Items Display", () => {
    it("should display total items count", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalItems={100}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText("100 items")).toBeInTheDocument();
    });

    it('should display singular "item" for 1 item', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={1}
          totalItems={1}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText("1 item")).toBeInTheDocument();
    });

    it('should display plural "items" for 0 items', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={1}
          totalItems={0}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText("0 items")).toBeInTheDocument();
    });

    it('should display plural "items" for multiple items', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalItems={50}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText("50 items")).toBeInTheDocument();
    });

    it("should not display items count when totalItems is undefined", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.queryByText(/items?$/)).not.toBeInTheDocument();
    });
  });

  describe("Page Size Selector", () => {
    it("should render page size selector when onPageSizeChange is provided", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );
      expect(screen.getByText("Show")).toBeInTheDocument();
      expect(screen.getByText("per page")).toBeInTheDocument();
    });

    it("should not render page size selector when onPageSizeChange is not provided", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.queryByText("Show")).not.toBeInTheDocument();
    });

    it("should display current page size", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          pageSize={25}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("25");
    });

    it("should render default page sizes [10, 25, 50, 100]", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue("10");
      expect(options[1]).toHaveValue("25");
      expect(options[2]).toHaveValue("50");
      expect(options[3]).toHaveValue("100");
    });

    it("should render custom page sizes", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          pageSize={5}
          pageSizes={[5, 15, 30]}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue("5");
      expect(options[1]).toHaveValue("15");
      expect(options[2]).toHaveValue("30");
    });

    it("should call onPageSizeChange when size is changed", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "50" } });

      expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          className="custom-pagination"
        />
      );
      expect(container.querySelector(".custom-pagination")).toBeInTheDocument();
    });

    it("should apply disabled styling to disabled buttons", () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const disabledButton = container.querySelector("[disabled]");
      expect(disabledButton).toHaveClass("disabled:opacity-50");
    });

    it("should apply hover styles to enabled buttons", () => {
      const { container } = render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const button = screen.getByTitle("Previous page");
      expect(button).toHaveClass("hover:bg-gray-100");
    });
  });

  describe("Edge Cases", () => {
    it("should handle currentPage > totalPages", () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const nextButton = screen.getByTitle("Next page");
      expect(nextButton).toBeDisabled();
    });

    it("should handle currentPage = 0", () => {
      render(
        <Pagination
          currentPage={0}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const prevButton = screen.getByTitle("Previous page");
      expect(prevButton).toBeDisabled();
    });

    it("should handle negative currentPage", () => {
      render(
        <Pagination
          currentPage={-1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const prevButton = screen.getByTitle("Previous page");
      expect(prevButton).toBeDisabled();
    });

    it("should handle very large totalPages", () => {
      render(
        <Pagination
          currentPage={500}
          totalPages={1000}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText(/of 1000/)).toBeInTheDocument();
    });

    it("should handle totalItems of 0", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={1}
          totalItems={0}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByText("0 items")).toBeInTheDocument();
    });

    it("should handle rapid navigation clicks", () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={10}
          onPageChange={mockOnPageChange}
        />
      );
      const nextButton = screen.getByTitle("Next page");

      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("Accessibility", () => {
    it("should have title attributes on buttons", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      expect(screen.getByTitle("Previous page")).toBeInTheDocument();
      expect(screen.getByTitle("Next page")).toBeInTheDocument();
    });

    it("should have title attributes on First/Last buttons", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
          showFirstLast
        />
      );
      expect(screen.getByTitle("First page")).toBeInTheDocument();
      expect(screen.getByTitle("Last page")).toBeInTheDocument();
    });

    it("should properly disable buttons", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const prevButton = screen.getByTitle("Previous page");
      expect(prevButton).toBeDisabled();
      expect(prevButton).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should have proper button styling for focus states", () => {
      const { container } = render(
        <Pagination
          currentPage={2}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("transition-colors");
    });

    it("should have accessible page size selector", () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should have responsive flex layout", () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={5}
          totalItems={50}
          pageSize={10}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
        />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex", "flex-col", "sm:flex-row");
    });

    it("should have proper gap spacing", () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
        />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("gap-4");
    });
  });
});

// BUG FIX #42: Pagination Component Issues
// ISSUE 1: No validation for currentPage prop - accepts negative values
// ISSUE 2: No validation for totalPages prop - accepts 0 or negative
// ISSUE 3: Doesn't reset to page 1 when pageSize changes (common UX pattern)
// ISSUE 4: No aria-label for pagination container for screen readers
// ISSUE 5: Page buttons don't have aria-current for current page
// ISSUE 6: No keyboard shortcuts (Home/End for first/last page)
// ISSUE 7: Missing aria-label on page size select
// ISSUE 8: No visual indication of total page range (e.g., "Showing 1-10 of 100")
// ISSUE 9: Buttons don't prevent multiple rapid clicks (debouncing)
// ISSUE 10: No compact mode for mobile with just prev/next
