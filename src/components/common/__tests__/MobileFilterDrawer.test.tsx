import { fireEvent, render, screen } from "@testing-library/react";
import MobileFilterDrawer from "../MobileFilterDrawer";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  X: jest.fn(() => <div data-testid="x-icon" />),
  SlidersHorizontal: jest.fn(() => <div data-testid="sliders-icon" />),
}));

// Mock useMobile hook
const mockIsMobile = jest.fn();
jest.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => mockIsMobile(),
}));

describe("MobileFilterDrawer Component", () => {
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
    mockIsMobile.mockReturnValue(true);
    document.body.style.overflow = "unset";
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("should render when isOpen is true and isMobile is true", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.getByText("Filter content")).toBeInTheDocument();
    });

    it("should not render when isMobile is false", () => {
      mockIsMobile.mockReturnValue(false);
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.queryByText("Filter content")).not.toBeInTheDocument();
    });

    it("should not render when isOpen is false and not animating", () => {
      render(<MobileFilterDrawer {...defaultProps} isOpen={false} />);
      jest.runAllTimers();
      expect(screen.queryByText("Filter content")).not.toBeInTheDocument();
    });

    it("should render default title Filters", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(<MobileFilterDrawer {...defaultProps} title="Advanced Filters" />);
      expect(screen.getByText("Advanced Filters")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.getByText("Filter content")).toBeInTheDocument();
    });
  });

  describe("Header", () => {
    it("should render SlidersHorizontal icon", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.getByTestId("sliders-icon")).toBeInTheDocument();
    });

    it("should render close button with X icon", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("should have aria-label on close button", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const closeButtons = screen.getAllByRole("button", {
        name: "Close filters",
      });
      const buttonElement = closeButtons.find((el) => el.tagName === "BUTTON");
      expect(buttonElement).toBeInTheDocument();
    });

    it("should call onClose after animation when close button clicked", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const closeButtons = screen.getAllByRole("button", {
        name: "Close filters",
      });
      const buttonElement = closeButtons.find((el) => el.tagName === "BUTTON");

      fireEvent.click(buttonElement!);

      expect(mockOnClose).not.toHaveBeenCalled();
      jest.advanceTimersByTime(300);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have sticky header", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const header = screen.getByText("Filters").closest("div")?.parentElement;
      expect(header).toHaveClass("sticky");
      expect(header).toHaveClass("top-0");
    });
  });

  describe("Backdrop", () => {
    it("should render backdrop when open", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toBeInTheDocument();
    });

    it("should have z-50 on backdrop", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toHaveClass("z-50");
    });

    it("should call handleClose when backdrop clicked", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");

      fireEvent.click(backdrop!);
      jest.advanceTimersByTime(300);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have role=button on backdrop", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toHaveAttribute("role", "button");
    });

    it("should have tabIndex=-1 on backdrop", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toHaveAttribute("tabIndex", "-1");
    });

    it("should have aria-label on backdrop", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toHaveAttribute("aria-label", "Backdrop");
    });
  });

  describe("Footer Actions", () => {
    it("should render Reset button when onReset provided", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should not render Reset button when onReset not provided", () => {
      render(<MobileFilterDrawer {...defaultProps} onReset={undefined} />);
      expect(screen.queryByText("Reset")).not.toBeInTheDocument();
    });

    it("should render Apply button when onApply provided", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });

    it("should not render Apply button when onApply not provided", () => {
      render(<MobileFilterDrawer {...defaultProps} onApply={undefined} />);
      expect(screen.queryByText("Apply Filters")).not.toBeInTheDocument();
    });

    it("should call onReset when Reset button clicked", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      fireEvent.click(resetButton);
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it("should call onApply when Apply button clicked", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const applyButton = screen.getByText("Apply Filters");

      fireEvent.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it("should close drawer after Apply clicked", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const applyButton = screen.getByText("Apply Filters");

      fireEvent.click(applyButton);
      jest.advanceTimersByTime(300);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have sticky footer with bottom-32", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const footer = screen.getByText("Reset").closest("div");
      expect(footer).toHaveClass("sticky", "bottom-32");
    });
  });

  describe("Animation", () => {
    it("should start animation when opening", () => {
      const { rerender } = render(
        <MobileFilterDrawer {...defaultProps} isOpen={false} />
      );

      rerender(<MobileFilterDrawer {...defaultProps} isOpen={true} />);

      const { container } = render(
        <MobileFilterDrawer {...defaultProps} isOpen={true} />
      );
      const drawer = container.querySelector(".translate-y-0");
      expect(drawer).toBeInTheDocument();
    });

    it("should animate out when closing", () => {
      const { rerender, container } = render(
        <MobileFilterDrawer {...defaultProps} isOpen={true} />
      );

      rerender(<MobileFilterDrawer {...defaultProps} isOpen={false} />);

      const drawer = container.querySelector(".translate-y-full");
      expect(drawer).toBeInTheDocument();
    });

    it("should delay onClose by 300ms for animation", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const closeButton = screen.getByRole("button", { name: "Close filters" });

      fireEvent.click(closeButton);

      expect(mockOnClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(299);
      expect(mockOnClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should apply transition classes", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const drawer = container.querySelector(".transition-transform");
      expect(drawer).toHaveClass("duration-300");
    });

    it("should apply opacity transition to backdrop", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const backdrop = container.querySelector(".transition-opacity");
      expect(backdrop).toHaveClass("duration-300");
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when drawer opens", () => {
      render(<MobileFilterDrawer {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should unlock body scroll when drawer closes", () => {
      const { rerender } = render(
        <MobileFilterDrawer {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileFilterDrawer {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");
    });

    it("should unlock body scroll on unmount", () => {
      const { unmount } = render(
        <MobileFilterDrawer {...defaultProps} isOpen={true} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("unset");
    });
  });

  describe("Layout and Positioning", () => {
    it("should position drawer at bottom of screen", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const drawer = container.querySelector(".fixed.inset-x-0.bottom-0");
      expect(drawer).toBeInTheDocument();
    });

    it("should have max height of 85vh", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const drawer = container.querySelector(".rounded-t-2xl");
      expect(drawer).toHaveStyle({ maxHeight: "85vh" });
    });

    it("should have rounded top corners", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const drawer = container.querySelector(".rounded-t-2xl");
      expect(drawer).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <MobileFilterDrawer {...defaultProps} className="custom-class" />
      );
      const drawer = container.querySelector(".custom-class");
      expect(drawer).toBeInTheDocument();
    });
  });

  describe("Content Scrolling", () => {
    it("should make content scrollable", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const content = container.querySelector(".overflow-y-auto");
      expect(content).toBeInTheDocument();
    });

    it("should have max height for content area", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const content = container.querySelector("[style*='calc']");
      expect(content).toHaveStyle({ maxHeight: "calc(85vh - 140px)" });
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
        <MobileFilterDrawer {...defaultProps}>{longContent}</MobileFilterDrawer>
      );

      expect(screen.getByText("Item 0")).toBeInTheDocument();
      expect(screen.getByText("Item 99")).toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("should apply dark mode classes to drawer", () => {
      const { container } = render(<MobileFilterDrawer {...defaultProps} />);
      const drawer = container.querySelector(".dark\\:bg-gray-800");
      expect(drawer).toBeInTheDocument();
    });

    it("should apply dark mode classes to header", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const header = screen.getByText("Filters").closest("div")?.parentElement;
      expect(header).toHaveClass("dark:border-gray-700");
      expect(header).toHaveClass("dark:bg-gray-800");
    });

    it("should apply dark mode classes to title", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const title = screen.getByText("Filters");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should apply dark mode classes to footer", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const footer = screen.getByText("Reset").closest("div");
      expect(footer).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("should apply dark mode classes to Reset button", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      expect(resetButton).toHaveClass(
        "dark:border-gray-600",
        "dark:text-gray-200",
        "dark:hover:bg-gray-700"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing title gracefully", () => {
      render(<MobileFilterDrawer {...defaultProps} title={undefined as any} />);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should handle empty children", () => {
      render(<MobileFilterDrawer {...defaultProps}>{null}</MobileFilterDrawer>);
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("should handle multiple close attempts", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const closeButton = screen.getByRole("button", { name: "Close filters" });

      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      jest.advanceTimersByTime(600);

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it("should handle rapid state changes", () => {
      const { rerender } = render(
        <MobileFilterDrawer {...defaultProps} isOpen={false} />
      );

      rerender(<MobileFilterDrawer {...defaultProps} isOpen={true} />);
      rerender(<MobileFilterDrawer {...defaultProps} isOpen={false} />);
      rerender(<MobileFilterDrawer {...defaultProps} isOpen={true} />);

      expect(screen.getByText("Filter content")).toBeInTheDocument();
    });

    it("should not throw when isMobile changes", () => {
      const { rerender } = render(<MobileFilterDrawer {...defaultProps} />);

      mockIsMobile.mockReturnValue(false);
      expect(() =>
        rerender(<MobileFilterDrawer {...defaultProps} />)
      ).not.toThrow();
    });
  });

  describe("Button Styling", () => {
    it("should style Reset button with border", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      expect(resetButton).toHaveClass("border", "border-gray-300");
    });

    it("should style Apply button with background color", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const applyButton = screen.getByText("Apply Filters");
      expect(applyButton).toHaveClass("bg-blue-600", "hover:bg-blue-700");
    });

    it("should make both buttons flex-1 for equal width", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const resetButton = screen.getByText("Reset");
      const applyButton = screen.getByText("Apply Filters");

      expect(resetButton).toHaveClass("flex-1");
      expect(applyButton).toHaveClass("flex-1");
    });

    it("should apply hover styles to close button", () => {
      render(<MobileFilterDrawer {...defaultProps} />);
      const closeButton = screen.getByRole("button", { name: "Close filters" });
      expect(closeButton).toHaveClass(
        "hover:bg-gray-100",
        "dark:hover:bg-gray-700"
      );
    });
  });

  describe("Multiple Instances", () => {
    it("should support multiple drawers independently", () => {
      const mockOnClose1 = jest.fn();
      const mockOnClose2 = jest.fn();

      render(
        <div>
          <MobileFilterDrawer
            {...defaultProps}
            title="Drawer 1"
            onClose={mockOnClose1}
          />
          <MobileFilterDrawer
            {...defaultProps}
            title="Drawer 2"
            onClose={mockOnClose2}
          />
        </div>
      );

      expect(screen.getByText("Drawer 1")).toBeInTheDocument();
      expect(screen.getByText("Drawer 2")).toBeInTheDocument();
    });
  });
});
