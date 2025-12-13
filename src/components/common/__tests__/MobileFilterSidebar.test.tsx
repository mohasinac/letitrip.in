import { fireEvent, render, screen } from "@testing-library/react";
import { MobileFilterSidebar } from "../MobileFilterSidebar";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  X: jest.fn(() => <div data-testid="x-icon" />),
}));

describe("MobileFilterSidebar Component", () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnReset = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onApply: mockOnApply,
    onReset: mockOnReset,
    children: <div>Filter content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
  });

  describe("Basic Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      expect(screen.getByText("Filter content")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<MobileFilterSidebar {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Filter content")).not.toBeInTheDocument();
    });

    it("should render default title Filters", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(<MobileFilterSidebar {...defaultProps} title="Custom Filters" />);
      expect(screen.getByText("Custom Filters")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      expect(screen.getByText("Filter content")).toBeInTheDocument();
    });
  });

  describe("Header", () => {
    it("should render close button with X icon", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("should have aria-label on close button", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close filters");
      expect(closeButton).toBeInTheDocument();
    });

    it("should call onClose when close button clicked", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close filters");
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have border bottom on header", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const header = screen.getByText("Filters").closest("div");
      expect(header).toHaveClass(
        "border-b",
        "border-gray-200",
        "dark:border-gray-700"
      );
    });
  });

  describe("Backdrop", () => {
    it("should render backdrop when open", () => {
      const { container } = render(<MobileFilterSidebar {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toBeInTheDocument();
    });

    it("should have aria-hidden=true on backdrop", () => {
      const { container } = render(<MobileFilterSidebar {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toHaveAttribute("aria-hidden", "true");
    });

    it("should call onClose when backdrop clicked", () => {
      const { container } = render(<MobileFilterSidebar {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should only close when clicking backdrop itself not children", () => {
      const { container } = render(<MobileFilterSidebar {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");

      // Create event that targets backdrop
      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", {
        value: backdrop,
        enumerable: true,
      });
      Object.defineProperty(event, "currentTarget", {
        value: backdrop,
        enumerable: true,
      });
      backdrop?.dispatchEvent(event);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Footer Actions", () => {
    it("should render Reset button", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should render Apply button", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });

    it("should call onReset when Reset button clicked", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      fireEvent.click(resetButton);
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it("should call onApply when Apply button clicked", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);
      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it("should close sidebar after Apply clicked", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const applyButton = screen.getByText("Apply Filters");
      fireEvent.click(applyButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have border top on footer", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const footer = screen.getByText("Reset").closest("div");
      expect(footer).toHaveClass(
        "border-t",
        "border-gray-200",
        "dark:border-gray-700"
      );
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when sidebar opens", () => {
      render(<MobileFilterSidebar {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should unlock body scroll when sidebar closes", () => {
      const { rerender } = render(
        <MobileFilterSidebar {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileFilterSidebar {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");
    });

    it("should unlock body scroll on unmount", () => {
      const { unmount } = render(
        <MobileFilterSidebar {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("unset");
    });

    it("should handle rapid open/close", () => {
      const { rerender } = render(
        <MobileFilterSidebar {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileFilterSidebar {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");

      rerender(<MobileFilterSidebar {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");
    });
  });

  describe("Accessibility", () => {
    it("should have role=dialog", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should have aria-modal=true", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby pointing to title", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "filter-sidebar-title");
    });

    it("should have id on title matching aria-labelledby", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const title = screen.getByText("Filters");
      expect(title).toHaveAttribute("id", "filter-sidebar-title");
    });
  });

  describe("Layout and Positioning", () => {
    it("should position sidebar fixed on right side", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("fixed", "right-0", "top-0");
    });

    it("should have bottom-32 class accounting for BottomNav", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("bottom-32");
    });

    it("should have z-50 for layering", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("z-50");
    });

    it("should hide on medium screens and above", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("md:hidden");
    });

    it("should have max width constraint", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("max-w-sm");
    });
  });

  describe("Dark Mode Support", () => {
    it("should apply dark mode classes to sidebar", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("dark:bg-gray-800");
    });

    it("should apply dark mode classes to header", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const header = screen.getByText("Filters").closest("div");
      expect(header).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("should apply dark mode classes to title", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const title = screen.getByText("Filters");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should apply dark mode classes to close button", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close filters");
      expect(closeButton).toHaveClass(
        "dark:text-gray-400",
        "dark:hover:bg-gray-700"
      );
    });

    it("should apply dark mode classes to footer", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const footer = screen.getByText("Reset").closest("div");
      expect(footer).toHaveClass("dark:bg-gray-900", "dark:border-gray-700");
    });

    it("should apply dark mode classes to Reset button", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      expect(resetButton).toHaveClass(
        "dark:text-gray-300",
        "dark:bg-gray-800",
        "dark:border-gray-600",
        "dark:hover:bg-gray-700"
      );
    });
  });

  describe("Content Scrolling", () => {
    it("should make content scrollable", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const content = screen.getByText("Filter content").parentElement;
      expect(content).toHaveClass("overflow-y-auto");
    });

    it("should render long content", () => {
      const longContent = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      );
      render(
        <MobileFilterSidebar {...defaultProps}>
          {longContent}
        </MobileFilterSidebar>
      );
      expect(screen.getByText("Item 0")).toBeInTheDocument();
      expect(screen.getByText("Item 99")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing title gracefully", () => {
      render(
        <MobileFilterSidebar {...defaultProps} title={undefined as any} />
      );
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should handle empty children", () => {
      render(
        <MobileFilterSidebar {...defaultProps}>{null}</MobileFilterSidebar>
      );
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toBeInTheDocument();
    });

    it("should handle multiple Apply clicks", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const applyButton = screen.getByText("Apply Filters");

      fireEvent.click(applyButton);
      fireEvent.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(2);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple Reset clicks", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const resetButton = screen.getByText("Reset");

      fireEvent.click(resetButton);
      fireEvent.click(resetButton);
      fireEvent.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(3);
    });

    it("should not throw error when changing isOpen rapidly", () => {
      const { rerender } = render(
        <MobileFilterSidebar {...defaultProps} isOpen={false} />
      );

      expect(() => {
        rerender(<MobileFilterSidebar {...defaultProps} isOpen={true} />);
        rerender(<MobileFilterSidebar {...defaultProps} isOpen={false} />);
        rerender(<MobileFilterSidebar {...defaultProps} isOpen={true} />);
      }).not.toThrow();
    });
  });

  describe("Button Styling", () => {
    it("should style Reset button with border", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      expect(resetButton).toHaveClass("border", "border-gray-300");
    });

    it("should style Apply button with background color", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const applyButton = screen.getByText("Apply Filters");
      expect(applyButton).toHaveClass("bg-blue-600", "hover:bg-blue-700");
    });

    it("should make both buttons flex-1 for equal width", () => {
      render(<MobileFilterSidebar {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      const applyButton = screen.getByText("Apply Filters");

      expect(resetButton).toHaveClass("flex-1");
      expect(applyButton).toHaveClass("flex-1");
    });
  });

  describe("Multiple Instances", () => {
    it("should support multiple sidebars independently", () => {
      const mockOnClose1 = jest.fn();
      const mockOnClose2 = jest.fn();

      render(
        <div>
          <MobileFilterSidebar
            {...defaultProps}
            title="Sidebar 1"
            onClose={mockOnClose1}
          />
          <MobileFilterSidebar
            {...defaultProps}
            title="Sidebar 2"
            onClose={mockOnClose2}
          />
        </div>
      );

      expect(screen.getByText("Sidebar 1")).toBeInTheDocument();
      expect(screen.getByText("Sidebar 2")).toBeInTheDocument();
    });
  });
});
