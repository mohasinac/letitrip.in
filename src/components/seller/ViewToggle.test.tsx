import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewToggle } from "./ViewToggle";

describe("ViewToggle", () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders both grid and table buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      expect(screen.getByText("Grid")).toBeInTheDocument();
      expect(screen.getByText("Table")).toBeInTheDocument();
    });

    it("renders with correct container styling", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("inline-flex", "rounded-lg", "border");
    });
  });

  // Active State
  describe("Active State", () => {
    it("highlights grid button when view is grid", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("bg-blue-600", "text-white");
    });

    it("highlights table button when view is table", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton).toHaveClass("bg-blue-600", "text-white");
    });

    it("shows inactive styling on non-selected button", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton).toHaveClass("text-gray-700");
      expect(tableButton).not.toHaveClass("bg-blue-600");
    });
  });

  // Icons
  describe("Icons", () => {
    it("renders grid icon in grid button", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      const icon = gridButton?.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("h-4", "w-4");
    });

    it("renders table icon in table button", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table").closest("button");
      const icon = tableButton?.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("h-4", "w-4");
    });
  });

  // User Interactions
  describe("User Interactions", () => {
    it("calls onViewChange with 'grid' when grid button clicked", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid");
      fireEvent.click(gridButton);

      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
      expect(mockOnViewChange).toHaveBeenCalledWith("grid");
    });

    it("calls onViewChange with 'table' when table button clicked", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table");
      fireEvent.click(tableButton);

      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
      expect(mockOnViewChange).toHaveBeenCalledWith("table");
    });

    it("allows clicking already active button", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid");
      fireEvent.click(gridButton);

      expect(mockOnViewChange).toHaveBeenCalledWith("grid");
    });

    it("handles rapid clicks correctly", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table");
      fireEvent.click(tableButton);
      fireEvent.click(tableButton);
      fireEvent.click(tableButton);

      expect(mockOnViewChange).toHaveBeenCalledTimes(3);
    });
  });

  // Button Styling
  describe("Button Styling", () => {
    it("has hover effect on inactive button", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton?.className).toContain("hover:bg-gray-100");
    });

    it("has consistent padding and size", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("px-3", "py-1.5", "text-sm");
    });

    it("has rounded corners on buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("rounded-md");
    });

    it("has transition animation", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("transition-colors");
    });
  });

  // Layout
  describe("Layout", () => {
    it("displays buttons in horizontal layout", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("inline-flex");
    });

    it("has proper gap between icon and text", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("gap-2");
    });

    it("aligns items properly", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("items-center");
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("renders as button elements", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("has keyboard accessible buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton?.tagName).toBe("BUTTON");
    });

    it("buttons are focusable", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      const gridButton = screen.getByText("Grid").closest("button");
      gridButton?.focus();
      expect(document.activeElement).toBe(gridButton);
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles view prop changes", () => {
      const { rerender } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );

      let gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("bg-blue-600");

      rerender(<ViewToggle view="table" onViewChange={mockOnViewChange} />);

      gridButton = screen.getByText("Grid").closest("button");
      const tableButton = screen.getByText("Table").closest("button");
      expect(gridButton).not.toHaveClass("bg-blue-600");
      expect(tableButton).toHaveClass("bg-blue-600");
    });

    it("maintains state through multiple toggles", () => {
      const { rerender } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );

      rerender(<ViewToggle view="table" onViewChange={mockOnViewChange} />);
      rerender(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      rerender(<ViewToggle view="table" onViewChange={mockOnViewChange} />);

      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton).toHaveClass("bg-blue-600");
    });

    it("works with different callback functions", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = render(
        <ViewToggle view="grid" onViewChange={callback1} />
      );
      fireEvent.click(screen.getByText("Table"));
      expect(callback1).toHaveBeenCalled();

      rerender(<ViewToggle view="table" onViewChange={callback2} />);
      fireEvent.click(screen.getByText("Grid"));
      expect(callback2).toHaveBeenCalled();
    });
  });
});
