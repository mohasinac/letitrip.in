import { fireEvent, render, screen } from "@testing-library/react";
import { ViewToggle } from "../ViewToggle";

describe("ViewToggle", () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders both grid and table buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      expect(screen.getByText("Grid")).toBeInTheDocument();
      expect(screen.getByText("Table")).toBeInTheDocument();
    });

    it("renders with test id", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      expect(screen.getByTestId("view-toggle")).toBeInTheDocument();
    });

    it("renders Grid3x3 and Table2 icons", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBe(2);
    });

    it("applies container classes", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );
      const toggleContainer = screen.getByTestId("view-toggle");
      expect(toggleContainer).toHaveClass(
        "inline-flex",
        "rounded-lg",
        "border",
        "border-gray-300",
        "bg-white",
        "p-1"
      );
    });
  });

  describe("Active State - Grid View", () => {
    it("highlights grid button when view is grid", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("bg-blue-600", "text-white");
    });

    it("does not highlight table button when view is grid", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton).toHaveClass("text-gray-700");
      expect(tableButton).not.toHaveClass("bg-blue-600");
    });

    it("applies hover classes to inactive table button", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton?.className).toContain("hover:bg-gray-100");
    });
  });

  describe("Active State - Table View", () => {
    it("highlights table button when view is table", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);
      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton).toHaveClass("bg-blue-600", "text-white");
    });

    it("does not highlight grid button when view is table", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);
      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("text-gray-700");
      expect(gridButton).not.toHaveClass("bg-blue-600");
    });

    it("applies hover classes to inactive grid button", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);
      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton?.className).toContain("hover:bg-gray-100");
    });
  });

  describe("User Interactions", () => {
    it("calls onViewChange with grid when grid button clicked", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);
      const gridButton = screen.getByText("Grid").closest("button")!;
      fireEvent.click(gridButton);
      expect(mockOnViewChange).toHaveBeenCalledWith("grid");
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });

    it("calls onViewChange with table when table button clicked", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const tableButton = screen.getByText("Table").closest("button")!;
      fireEvent.click(tableButton);
      expect(mockOnViewChange).toHaveBeenCalledWith("table");
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });

    it("allows clicking active button (no-op but event fires)", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const gridButton = screen.getByText("Grid").closest("button")!;
      fireEvent.click(gridButton);
      expect(mockOnViewChange).toHaveBeenCalledWith("grid");
    });

    it("handles rapid view changes", () => {
      const { rerender } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );
      const tableButton = screen.getByText("Table").closest("button")!;
      const gridButton = screen.getByText("Grid").closest("button")!;

      fireEvent.click(tableButton);
      rerender(<ViewToggle view="table" onViewChange={mockOnViewChange} />);
      fireEvent.click(gridButton);
      rerender(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);

      expect(mockOnViewChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("Button Styling", () => {
    it("applies transition-colors to all buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.className).toContain("transition-colors");
      });
    });

    it("applies consistent padding to both buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("px-3", "py-1.5");
      });
    });

    it("applies rounded-md to both buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("rounded-md");
      });
    });

    it("applies flex items-center gap-2 to both buttons", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("flex", "items-center", "gap-2");
      });
    });
  });

  describe("Icons", () => {
    it("renders icons with correct size classes", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );
      const icons = container.querySelectorAll("svg");
      icons.forEach((icon) => {
        expect(icon).toHaveClass("h-4", "w-4");
      });
    });

    it("displays Grid3x3 icon in grid button", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );
      const gridButton = screen.getByText("Grid").closest("button")!;
      const icon = gridButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("displays Table2 icon in table button", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={mockOnViewChange} />
      );
      const tableButton = screen.getByText("Table").closest("button")!;
      const icon = tableButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("renders buttons as button elements", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("provides accessible text labels", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      expect(screen.getByText("Grid")).toBeInTheDocument();
      expect(screen.getByText("Table")).toBeInTheDocument();
    });

    it("maintains focus visibility", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const gridButton = screen.getByText("Grid").closest("button")!;
      gridButton.focus();
      expect(document.activeElement).toBe(gridButton);
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined onViewChange gracefully", () => {
      const { container } = render(
        <ViewToggle view="grid" onViewChange={() => {}} />
      );
      const gridButton = screen.getByText("Grid").closest("button")!;
      expect(() => fireEvent.click(gridButton)).not.toThrow();
    });

    it("renders correctly with grid view initially", () => {
      render(<ViewToggle view="grid" onViewChange={mockOnViewChange} />);
      const gridButton = screen.getByText("Grid").closest("button");
      expect(gridButton).toHaveClass("bg-blue-600");
    });

    it("renders correctly with table view initially", () => {
      render(<ViewToggle view="table" onViewChange={mockOnViewChange} />);
      const tableButton = screen.getByText("Table").closest("button");
      expect(tableButton).toHaveClass("bg-blue-600");
    });
  });
});
