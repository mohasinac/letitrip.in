import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toast from "../Toast";

// Mock timers
jest.useFakeTimers();

describe("Toast Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // Basic rendering tests
  describe("Basic Rendering", () => {
    it("renders toast when show is true", () => {
      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("does not render when show is false", () => {
      render(
        <Toast message="Test message" show={false} onClose={mockOnClose} />
      );

      expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    });

    it("renders with default info type", () => {
      const { container } = render(
        <Toast message="Info message" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".bg-blue-50");
      expect(toastEl).toBeInTheDocument();
    });

    it("renders close button", () => {
      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toBeInTheDocument();
    });

    it("renders in fixed position at top right", () => {
      const { container } = render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      const wrapper = container.querySelector(".fixed.top-20.right-4");
      expect(wrapper).toBeInTheDocument();
    });

    it("has z-index 100 for stacking", () => {
      const { container } = render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      const wrapper = container.querySelector(".z-\\[100\\]");
      expect(wrapper).toBeInTheDocument();
    });
  });

  // Type-specific rendering
  describe("Toast Types", () => {
    it("renders success toast with green styling", () => {
      const { container } = render(
        <Toast
          message="Success!"
          type="success"
          show={true}
          onClose={mockOnClose}
        />
      );

      const toastEl = container.querySelector(".bg-green-50");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass("text-green-800", "border-green-200");
    });

    it("renders success toast with CheckCircle icon", () => {
      const { container } = render(
        <Toast
          message="Success!"
          type="success"
          show={true}
          onClose={mockOnClose}
        />
      );

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("lucide");
    });

    it("renders error toast with red styling", () => {
      const { container } = render(
        <Toast
          message="Error!"
          type="error"
          show={true}
          onClose={mockOnClose}
        />
      );

      const toastEl = container.querySelector(".bg-red-50");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass("text-red-800", "border-red-200");
    });

    it("renders error toast with XCircle icon", () => {
      const { container } = render(
        <Toast
          message="Error!"
          type="error"
          show={true}
          onClose={mockOnClose}
        />
      );

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
      expect(icons[0]).toHaveClass("lucide");
    });

    it("renders info toast with blue styling", () => {
      const { container } = render(
        <Toast message="Info!" type="info" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".bg-blue-50");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass("text-blue-800", "border-blue-200");
    });

    it("renders info toast with Info icon", () => {
      const { container } = render(
        <Toast message="Info!" type="info" show={true} onClose={mockOnClose} />
      );

      const icon = container.querySelector(".lucide-info");
      expect(icon).toBeInTheDocument();
    });

    it("renders warning toast with yellow styling", () => {
      const { container } = render(
        <Toast
          message="Warning!"
          type="warning"
          show={true}
          onClose={mockOnClose}
        />
      );

      const toastEl = container.querySelector(".bg-yellow-50");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass("text-yellow-800", "border-yellow-200");
    });

    it("renders warning toast with AlertTriangle icon", () => {
      const { container } = render(
        <Toast
          message="Warning!"
          type="warning"
          show={true}
          onClose={mockOnClose}
        />
      );

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
      expect(icons[0]).toHaveClass("lucide");
    });
  });

  // Dark mode styling
  describe("Dark Mode", () => {
    it("applies dark mode classes for success toast", () => {
      const { container } = render(
        <Toast
          message="Success!"
          type="success"
          show={true}
          onClose={mockOnClose}
        />
      );

      const toastEl = container.querySelector(".dark\\:bg-green-900\\/30");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass(
        "dark:text-green-300",
        "dark:border-green-800"
      );
    });

    it("applies dark mode classes for error toast", () => {
      const { container } = render(
        <Toast
          message="Error!"
          type="error"
          show={true}
          onClose={mockOnClose}
        />
      );

      const toastEl = container.querySelector(".dark\\:bg-red-900\\/30");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass("dark:text-red-300", "dark:border-red-800");
    });

    it("applies dark mode classes for info toast", () => {
      const { container } = render(
        <Toast message="Info!" type="info" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".dark\\:bg-blue-900\\/30");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass("dark:text-blue-300", "dark:border-blue-800");
    });

    it("applies dark mode classes for warning toast", () => {
      const { container } = render(
        <Toast
          message="Warning!"
          type="warning"
          show={true}
          onClose={mockOnClose}
        />
      );

      const toastEl = container.querySelector(".dark\\:bg-yellow-900\\/30");
      expect(toastEl).toBeInTheDocument();
      expect(toastEl).toHaveClass(
        "dark:text-yellow-300",
        "dark:border-yellow-800"
      );
    });
  });

  // Close interaction
  describe("Close Functionality", () => {
    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      const closeButton = screen.getByRole("button", { name: "Close" });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("has hover effect on close button", () => {
      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toHaveClass("hover:opacity-70");
    });
  });

  // Auto-dismiss timer
  describe("Auto-dismiss Timer", () => {
    it("auto-dismisses after default 3000ms", () => {
      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("auto-dismisses after custom duration", () => {
      render(
        <Toast
          message="Test message"
          show={true}
          duration={5000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        jest.advanceTimersByTime(4999);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not auto-dismiss when duration is 0", () => {
      render(
        <Toast
          message="Test message"
          show={true}
          duration={0}
          onClose={mockOnClose}
        />
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not start timer when show is false", () => {
      render(
        <Toast
          message="Test message"
          show={false}
          duration={3000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("clears timer on unmount", () => {
      const { unmount } = render(
        <Toast
          message="Test message"
          show={true}
          duration={3000}
          onClose={mockOnClose}
        />
      );

      unmount();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("restarts timer when show changes from false to true", () => {
      const { rerender } = render(
        <Toast
          message="Test message"
          show={false}
          duration={3000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      rerender(
        <Toast
          message="Test message"
          show={true}
          duration={3000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // Message variations
  describe("Message Content", () => {
    it("renders long messages", () => {
      const longMessage =
        "This is a very long message that should still render properly in the toast component without breaking the layout or causing issues.";

      render(<Toast message={longMessage} show={true} onClose={mockOnClose} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("renders empty message", () => {
      const { container } = render(
        <Toast message="" show={true} onClose={mockOnClose} />
      );

      const messageEl = container.querySelector("p.flex-1");
      expect(messageEl).toBeInTheDocument();
      expect(messageEl?.textContent).toBe("");
    });

    it("applies text-sm font-medium to message", () => {
      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      const messageEl = screen.getByText("Test message");
      expect(messageEl).toHaveClass("text-sm", "font-medium");
    });

    it("message takes flex-1 to fill space", () => {
      render(
        <Toast message="Test message" show={true} onClose={mockOnClose} />
      );

      const messageEl = screen.getByText("Test message");
      expect(messageEl).toHaveClass("flex-1");
    });
  });

  // Styling and layout
  describe("Styling and Layout", () => {
    it("has minimum width of 300px", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".min-w-\\[300px\\]");
      expect(toastEl).toBeInTheDocument();
    });

    it("has maximum width constraint", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".max-w-md");
      expect(toastEl).toBeInTheDocument();
    });

    it("has rounded corners", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".rounded-lg");
      expect(toastEl).toBeInTheDocument();
    });

    it("has shadow styling", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".shadow-lg");
      expect(toastEl).toBeInTheDocument();
    });

    it("has border styling", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".border");
      expect(toastEl).toBeInTheDocument();
    });

    it("has slide-in animation", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const wrapper = container.querySelector(".animate-slide-in-right");
      expect(wrapper).toBeInTheDocument();
    });

    it("uses flexbox for layout", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".flex.items-center.gap-3");
      expect(toastEl).toBeInTheDocument();
    });

    it("has padding on toast content", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const toastEl = container.querySelector(".px-4.py-3");
      expect(toastEl).toBeInTheDocument();
    });

    it("icon is flex-shrink-0 to prevent shrinking", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const iconWrapper = container.querySelector(".flex-shrink-0");
      expect(iconWrapper).toBeInTheDocument();
    });

    it("close button is flex-shrink-0", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toHaveClass("flex-shrink-0");
    });
  });

  // Icon rendering
  describe("Icon Rendering", () => {
    it("icon has w-5 h-5 size classes", () => {
      const { container } = render(
        <Toast message="Test" type="info" show={true} onClose={mockOnClose} />
      );

      const icon = container.querySelector(".lucide-info");
      expect(icon).toHaveClass("w-5", "h-5");
    });

    it("close X icon has w-4 h-4 size classes", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={mockOnClose} />
      );

      const closeIcon = container.querySelector(".lucide-x");
      expect(closeIcon).toHaveClass("w-4", "h-4");
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("handles rapid show/hide toggles", () => {
      const { rerender } = render(
        <Toast
          message="Test"
          show={true}
          duration={3000}
          onClose={mockOnClose}
        />
      );

      rerender(
        <Toast
          message="Test"
          show={false}
          duration={3000}
          onClose={mockOnClose}
        />
      );
      rerender(
        <Toast
          message="Test"
          show={true}
          duration={3000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("handles very short durations", () => {
      render(
        <Toast message="Test" show={true} duration={1} onClose={mockOnClose} />
      );

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("handles very long durations", () => {
      render(
        <Toast
          message="Test"
          show={true}
          duration={999999}
          onClose={mockOnClose}
        />
      );

      act(() => {
        jest.advanceTimersByTime(999998);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("handles negative duration as no auto-dismiss", () => {
      render(
        <Toast message="Test" show={true} duration={-1} onClose={mockOnClose} />
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // Multiple instances
  describe("Multiple Instances", () => {
    it("can render multiple toasts simultaneously", () => {
      const { rerender } = render(
        <div>
          <Toast
            message="Toast 1"
            type="success"
            show={true}
            onClose={jest.fn()}
          />
          <Toast
            message="Toast 2"
            type="error"
            show={true}
            onClose={jest.fn()}
          />
          <Toast
            message="Toast 3"
            type="warning"
            show={true}
            onClose={jest.fn()}
          />
        </div>
      );

      expect(screen.getByText("Toast 1")).toBeInTheDocument();
      expect(screen.getByText("Toast 2")).toBeInTheDocument();
      expect(screen.getByText("Toast 3")).toBeInTheDocument();
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("close button has aria-label", () => {
      render(<Toast message="Test" show={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toHaveAttribute("aria-label", "Close");
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup({ delay: null });

      render(<Toast message="Test" show={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: "Close" });
      closeButton.focus();

      await user.keyboard("{Enter}");

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
