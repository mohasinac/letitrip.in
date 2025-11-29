import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toast from "./Toast";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe("Toast", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Visibility", () => {
    it("renders when show is true", () => {
      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />,
      );
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("does not render when show is false", () => {
      render(
        <Toast message="Test message" show={false} onClose={mockOnClose} />,
      );
      expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    });

    it("returns null when show is false", () => {
      const { container } = render(
        <Toast message="Test message" show={false} onClose={mockOnClose} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Message Display", () => {
    it("displays the provided message", () => {
      render(<Toast message="Success!" show={true} onClose={mockOnClose} />);
      expect(screen.getByText("Success!")).toBeInTheDocument();
    });

    it("displays long messages", () => {
      const longMessage = "This is a very long message ".repeat(10).trim();
      render(<Toast message={longMessage} show={true} onClose={mockOnClose} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("displays messages with special characters", () => {
      render(
        <Toast
          message="Item added to cart! (2x)"
          show={true}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByText("Item added to cart! (2x)")).toBeInTheDocument();
    });

    it("displays message as paragraph element", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);
      const message = screen.getByText("Test");
      expect(message.tagName).toBe("P");
    });
  });

  describe("Toast Types", () => {
    it("renders success type with correct icon", () => {
      render(
        <Toast
          message="Success"
          type="success"
          show={true}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
    });

    it("renders error type with correct icon", () => {
      render(
        <Toast
          message="Error"
          type="error"
          show={true}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByTestId("x-circle-icon")).toBeInTheDocument();
    });

    it("renders info type with correct icon (default)", () => {
      render(<Toast message="Info" show={true} onClose={mockOnClose} />);
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });

    it("renders warning type with correct icon", () => {
      render(
        <Toast
          message="Warning"
          type="warning"
          show={true}
          onClose={mockOnClose}
        />,
      );
      expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
    });

    it("defaults to info type when type is not provided", () => {
      render(<Toast message="Default" show={true} onClose={mockOnClose} />);
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });
  });

  describe("Color Styling", () => {
    it("applies success colors", () => {
      const { container } = render(
        <Toast
          message="Success"
          type="success"
          show={true}
          onClose={mockOnClose}
        />,
      );
      const toast = container.querySelector(".bg-green-50");
      expect(toast).toHaveClass("text-green-800", "border-green-200");
    });

    it("applies error colors", () => {
      const { container } = render(
        <Toast
          message="Error"
          type="error"
          show={true}
          onClose={mockOnClose}
        />,
      );
      const toast = container.querySelector(".bg-red-50");
      expect(toast).toHaveClass("text-red-800", "border-red-200");
    });

    it("applies info colors", () => {
      const { container } = render(
        <Toast message="Info" type="info" show={true} onClose={mockOnClose} />,
      );
      const toast = container.querySelector(".bg-blue-50");
      expect(toast).toHaveClass("text-blue-800", "border-blue-200");
    });

    it("applies warning colors", () => {
      const { container } = render(
        <Toast
          message="Warning"
          type="warning"
          show={true}
          onClose={mockOnClose}
        />,
      );
      const toast = container.querySelector(".bg-yellow-50");
      expect(toast).toHaveClass("text-yellow-800", "border-yellow-200");
    });
  });

  describe("Auto-dismiss", () => {
    it("calls onClose after default duration (3000ms)", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);

      expect(mockOnClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(3000);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose after custom duration", () => {
      render(
        <Toast
          message="Test"
          show={true}
          duration={5000}
          onClose={mockOnClose}
        />,
      );

      jest.advanceTimersByTime(4999);
      expect(mockOnClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not auto-dismiss when duration is 0", () => {
      render(
        <Toast message="Test" show={true} duration={0} onClose={mockOnClose} />,
      );

      jest.advanceTimersByTime(10000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("clears timer on unmount", () => {
      const { unmount } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );

      unmount();
      jest.advanceTimersByTime(3000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("resets timer when show changes to true", () => {
      const { rerender } = render(
        <Toast message="Test" show={false} onClose={mockOnClose} />,
      );

      rerender(<Toast message="Test" show={true} onClose={mockOnClose} />);

      jest.advanceTimersByTime(3000);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Close Button", () => {
    it("renders close button", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText("Close");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("close button has aria-label", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText("Close");
      expect(closeButton).toBeInTheDocument();
    });

    it("close button has hover effect", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText("Close");
      expect(closeButton).toHaveClass("hover:opacity-70", "transition-opacity");
    });
  });

  describe("Positioning", () => {
    it("renders at top right", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("fixed", "top-20", "right-4");
    });

    it("has high z-index", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("z-[100]");
    });

    it("has slide-in animation", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("animate-slide-in-right");
    });
  });

  describe("Layout and Styling", () => {
    it("applies flex layout to toast content", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const toast = container.querySelector(".flex.items-center");
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveClass("gap-3");
    });

    it("applies padding and rounded corners", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const toast = container.querySelector(".rounded-lg");
      expect(toast).toHaveClass("px-4", "py-3");
    });

    it("applies shadow and border", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const toast = container.querySelector(".shadow-lg");
      expect(toast).toHaveClass("border");
    });

    it("applies min and max width", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const toast = container.querySelector(".min-w-\\[300px\\]");
      expect(toast).toHaveClass("max-w-md");
    });

    it("applies text-sm and font-medium to message", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);
      const message = screen.getByText("Test");
      expect(message).toHaveClass("text-sm", "font-medium");
    });

    it("applies flex-1 to message for proper stretching", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);
      const message = screen.getByText("Test");
      expect(message).toHaveClass("flex-1");
    });

    it("applies flex-shrink-0 to icon", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />,
      );
      const iconWrapper = container.querySelector(".flex-shrink-0");
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty message", () => {
      render(<Toast message="" show={true} onClose={mockOnClose} />);
      // Empty text node might not be queryable, but component should still render
      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
      expect(screen.getByLabelText("Close")).toBeInTheDocument();
    });

    it("handles very short duration", () => {
      render(
        <Toast message="Test" show={true} duration={1} onClose={mockOnClose} />,
      );

      jest.advanceTimersByTime(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("handles negative duration as no auto-dismiss", () => {
      render(
        <Toast
          message="Test"
          show={true}
          duration={-100}
          onClose={mockOnClose}
        />,
      );

      jest.advanceTimersByTime(10000);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("handles multiple re-renders", () => {
      const { rerender } = render(
        <Toast message="Test 1" show={true} onClose={mockOnClose} />,
      );

      rerender(<Toast message="Test 2" show={true} onClose={mockOnClose} />);
      rerender(<Toast message="Test 3" show={true} onClose={mockOnClose} />);

      expect(screen.getByText("Test 3")).toBeInTheDocument();
    });

    it("handles all props combined", () => {
      render(
        <Toast
          message="Complete test"
          type="success"
          duration={5000}
          show={true}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Complete test")).toBeInTheDocument();
      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
    });
  });
});
