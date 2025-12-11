/**
 * Comprehensive Toast Component Test Suite
 * Tests all toast types, auto-dismiss, manual close, and edge cases
 */

import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import Toast from "../Toast";

describe("Toast Component - Comprehensive Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("should render when show is true", () => {
      render(<Toast message="Test message" show={true} onClose={jest.fn()} />);
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should not render when show is false", () => {
      render(<Toast message="Test message" show={false} onClose={jest.fn()} />);
      expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    });

    it("should render close button", () => {
      render(<Toast message="Test message" show={true} onClose={jest.fn()} />);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });
  });

  describe("Toast Types", () => {
    it("should render success toast with success icon", () => {
      const { container } = render(
        <Toast
          message="Success!"
          type="success"
          show={true}
          onClose={jest.fn()}
        />
      );
      expect(screen.getByText("Success!")).toBeInTheDocument();
      expect(container.querySelector(".text-green-800")).toBeInTheDocument();
    });

    it("should render error toast with error icon", () => {
      const { container } = render(
        <Toast message="Error!" type="error" show={true} onClose={jest.fn()} />
      );
      expect(screen.getByText("Error!")).toBeInTheDocument();
      expect(container.querySelector(".text-red-800")).toBeInTheDocument();
    });

    it("should render info toast with info icon", () => {
      const { container } = render(
        <Toast message="Info!" type="info" show={true} onClose={jest.fn()} />
      );
      expect(screen.getByText("Info!")).toBeInTheDocument();
      expect(container.querySelector(".text-blue-800")).toBeInTheDocument();
    });

    it("should render warning toast with warning icon", () => {
      const { container } = render(
        <Toast
          message="Warning!"
          type="warning"
          show={true}
          onClose={jest.fn()}
        />
      );
      expect(screen.getByText("Warning!")).toBeInTheDocument();
      expect(container.querySelector(".text-yellow-800")).toBeInTheDocument();
    });

    it("should use info type by default", () => {
      const { container } = render(
        <Toast message="Default" show={true} onClose={jest.fn()} />
      );
      expect(container.querySelector(".text-blue-800")).toBeInTheDocument();
    });
  });

  describe("Auto-Dismiss", () => {
    it("should auto-dismiss after default duration (3000ms)", () => {
      const onClose = jest.fn();
      render(<Toast message="Auto dismiss" show={true} onClose={onClose} />);

      expect(onClose).not.toHaveBeenCalled();
      jest.advanceTimersByTime(3000);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should auto-dismiss after custom duration", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="Custom duration"
          duration={5000}
          show={true}
          onClose={onClose}
        />
      );

      jest.advanceTimersByTime(4999);
      expect(onClose).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not auto-dismiss when duration is 0", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="No auto-dismiss"
          duration={0}
          show={true}
          onClose={onClose}
        />
      );

      jest.advanceTimersByTime(10000);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not auto-dismiss when duration is negative", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="Negative duration"
          duration={-1}
          show={true}
          onClose={onClose}
        />
      );

      jest.advanceTimersByTime(10000);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Manual Close", () => {
    it("should call onClose when close button clicked", () => {
      const onClose = jest.fn();
      render(<Toast message="Closable" show={true} onClose={onClose} />);

      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should allow multiple clicks on close button", () => {
      const onClose = jest.fn();
      render(<Toast message="Closable" show={true} onClose={onClose} />);

      const closeButton = screen.getByRole("button", { name: "Close" });
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("Styling", () => {
    it("should have fixed positioning", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={jest.fn()} />
      );
      expect(container.firstChild).toHaveClass("fixed");
    });

    it("should be positioned at top-right", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={jest.fn()} />
      );
      expect(container.firstChild).toHaveClass("top-20", "right-4");
    });

    it("should have high z-index", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={jest.fn()} />
      );
      expect(container.firstChild).toHaveClass("z-[100]");
    });

    it("should have slide-in animation", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={jest.fn()} />
      );
      expect(container.firstChild).toHaveClass("animate-slide-in-right");
    });

    it("should have success colors", () => {
      const { container } = render(
        <Toast message="Test" type="success" show={true} onClose={jest.fn()} />
      );
      const toast = container.querySelector(".bg-green-50");
      expect(toast).toBeInTheDocument();
    });

    it("should have error colors", () => {
      const { container } = render(
        <Toast message="Test" type="error" show={true} onClose={jest.fn()} />
      );
      const toast = container.querySelector(".bg-red-50");
      expect(toast).toBeInTheDocument();
    });

    it("should have min and max width", () => {
      const { container } = render(
        <Toast message="Test" show={true} onClose={jest.fn()} />
      );
      const toast = container.querySelector(".min-w-\\[300px\\]");
      expect(toast).toHaveClass("max-w-md");
    });
  });

  describe("Dark Mode", () => {
    it("should have dark mode classes for success", () => {
      const { container } = render(
        <Toast message="Test" type="success" show={true} onClose={jest.fn()} />
      );
      expect(
        container.querySelector(".dark\\:bg-green-900\\/30")
      ).toBeInTheDocument();
    });

    it("should have dark mode classes for error", () => {
      const { container } = render(
        <Toast message="Test" type="error" show={true} onClose={jest.fn()} />
      );
      expect(
        container.querySelector(".dark\\:bg-red-900\\/30")
      ).toBeInTheDocument();
    });

    it("should have dark mode classes for info", () => {
      const { container } = render(
        <Toast message="Test" type="info" show={true} onClose={jest.fn()} />
      );
      expect(
        container.querySelector(".dark\\:bg-blue-900\\/30")
      ).toBeInTheDocument();
    });

    it("should have dark mode classes for warning", () => {
      const { container } = render(
        <Toast message="Test" type="warning" show={true} onClose={jest.fn()} />
      );
      expect(
        container.querySelector(".dark\\:bg-yellow-900\\/30")
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty message", () => {
      render(<Toast message="" show={true} onClose={jest.fn()} />);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("should handle very long message", () => {
      const longMessage = "A".repeat(1000);
      render(<Toast message={longMessage} show={true} onClose={jest.fn()} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle special characters in message", () => {
      const message = "Test <>&\"' 日本語";
      render(<Toast message={message} show={true} onClose={jest.fn()} />);
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it("should handle HTML in message (should be escaped)", () => {
      const message = "<script>alert('xss')</script>";
      render(<Toast message={message} show={true} onClose={jest.fn()} />);
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should handle multiline message", () => {
      const message = "Line 1\nLine 2\nLine 3";
      render(<Toast message={message} show={true} onClose={jest.fn()} />);
      // Multiline text is split across nodes, use regex matcher
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });
  });

  describe("Timer Cleanup", () => {
    it("should clear timer on unmount", () => {
      const onClose = jest.fn();
      const { unmount } = render(
        <Toast message="Test" duration={3000} show={true} onClose={onClose} />
      );

      jest.advanceTimersByTime(1000);
      unmount();
      jest.advanceTimersByTime(2000);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should clear timer when show changes to false", () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <Toast message="Test" duration={3000} show={true} onClose={onClose} />
      );

      jest.advanceTimersByTime(1000);
      rerender(
        <Toast message="Test" duration={3000} show={false} onClose={onClose} />
      );
      jest.advanceTimersByTime(2000);

      // Timer should be cleared, onClose not called
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should restart timer when show changes from false to true", () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <Toast message="Test" duration={3000} show={false} onClose={onClose} />
      );

      rerender(
        <Toast message="Test" duration={3000} show={true} onClose={onClose} />
      );

      jest.advanceTimersByTime(3000);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have accessible close button", () => {
      render(<Toast message="Test" show={true} onClose={jest.fn()} />);
      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toBeInTheDocument();
    });

    it("should have readable text", () => {
      render(
        <Toast message="Accessible message" show={true} onClose={jest.fn()} />
      );
      expect(screen.getByText("Accessible message")).toBeVisible();
    });

    it("should have icon for screen readers", () => {
      const { container } = render(
        <Toast message="Test" type="success" show={true} onClose={jest.fn()} />
      );
      // Icons are rendered as SVG
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Real-world Scenarios", () => {
    it("should show success message after save", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="Changes saved successfully"
          type="success"
          show={true}
          onClose={onClose}
        />
      );
      expect(
        screen.getByText("Changes saved successfully")
      ).toBeInTheDocument();
      jest.advanceTimersByTime(3000);
      expect(onClose).toHaveBeenCalled();
    });

    it("should show error message on failure", () => {
      render(
        <Toast
          message="Failed to save changes"
          type="error"
          show={true}
          onClose={jest.fn()}
        />
      );
      expect(screen.getByText("Failed to save changes")).toBeInTheDocument();
    });

    it("should show warning before destructive action", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="This action cannot be undone"
          type="warning"
          duration={0}
          show={true}
          onClose={onClose}
        />
      );
      expect(
        screen.getByText("This action cannot be undone")
      ).toBeInTheDocument();
      jest.advanceTimersByTime(10000);
      expect(onClose).not.toHaveBeenCalled(); // Should not auto-close
    });

    it("should show info message for updates", () => {
      render(
        <Toast
          message="New version available"
          type="info"
          show={true}
          onClose={jest.fn()}
        />
      );
      expect(screen.getByText("New version available")).toBeInTheDocument();
    });
  });

  describe("Multiple Toasts", () => {
    it("should render multiple toasts independently", () => {
      render(
        <>
          <Toast message="Toast 1" show={true} onClose={jest.fn()} />
          <Toast message="Toast 2" show={true} onClose={jest.fn()} />
        </>
      );
      expect(screen.getByText("Toast 1")).toBeInTheDocument();
      expect(screen.getByText("Toast 2")).toBeInTheDocument();
    });

    it("should have independent timers", () => {
      const onClose1 = jest.fn();
      const onClose2 = jest.fn();
      render(
        <>
          <Toast
            message="Fast"
            duration={1000}
            show={true}
            onClose={onClose1}
          />
          <Toast
            message="Slow"
            duration={3000}
            show={true}
            onClose={onClose2}
          />
        </>
      );

      jest.advanceTimersByTime(1000);
      expect(onClose1).toHaveBeenCalledTimes(1);
      expect(onClose2).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);
      expect(onClose2).toHaveBeenCalledTimes(1);
    });
  });

  describe("Performance", () => {
    it("should handle rapid show/hide transitions", () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <Toast message="Test" show={false} onClose={onClose} />
      );

      for (let i = 0; i < 10; i++) {
        rerender(<Toast message="Test" show={true} onClose={onClose} />);
        rerender(<Toast message="Test" show={false} onClose={onClose} />);
      }

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
