/**
 * @jest-environment jsdom
 *
 * ErrorState Component Tests
 * Tests error display, retry functionality, and different error types
 */

import { fireEvent, render, screen } from "@testing-library/react";
import ErrorState from "../ErrorState";

describe("ErrorState Component", () => {
  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(<ErrorState />);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("should render default error message", () => {
      render(<ErrorState />);
      expect(
        screen.getByText("Something went wrong. Please try again")
      ).toBeInTheDocument();
    });

    it("should render custom error message", () => {
      render(<ErrorState message="Custom error occurred" />);
      expect(screen.getByText("Custom error occurred")).toBeInTheDocument();
    });

    it("should render AlertTriangle icon", () => {
      const { container } = render(<ErrorState />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<ErrorState className="custom-class" />);
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Error Types", () => {
    it('should display "Error" heading for default type', () => {
      render(<ErrorState type="error" />);
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please try again")
      ).toBeInTheDocument();
    });

    it('should display "Not Found" heading for not-found type', () => {
      render(<ErrorState type="not-found" />);
      expect(screen.getByText("Not Found")).toBeInTheDocument();
      expect(
        screen.getByText("The item you're looking for doesn't exist")
      ).toBeInTheDocument();
    });

    it("should display network error message", () => {
      render(<ErrorState type="network" />);
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Network error. Please check your connection")
      ).toBeInTheDocument();
    });

    it("should override type message with custom message", () => {
      render(<ErrorState type="not-found" message="Custom message" />);
      expect(screen.getByText("Custom message")).toBeInTheDocument();
      expect(
        screen.queryByText("The item you're looking for doesn't exist")
      ).not.toBeInTheDocument();
    });

    it('should use default message when message is "Something went wrong"', () => {
      render(<ErrorState type="network" message="Something went wrong" />);
      expect(
        screen.getByText("Network error. Please check your connection")
      ).toBeInTheDocument();
    });
  });

  describe("Retry Functionality", () => {
    it("should render retry button when onRetry is provided", () => {
      const onRetry = jest.fn();
      render(<ErrorState onRetry={onRetry} />);
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
    });

    it("should not render retry button when onRetry is not provided", () => {
      render(<ErrorState />);
      expect(
        screen.queryByRole("button", { name: /try again/i })
      ).not.toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", () => {
      const onRetry = jest.fn();
      render(<ErrorState onRetry={onRetry} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should call onRetry multiple times on multiple clicks", () => {
      const onRetry = jest.fn();
      render(<ErrorState onRetry={onRetry} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });

    it("should render RefreshCw icon in retry button", () => {
      const onRetry = jest.fn();
      const { container } = render(<ErrorState onRetry={onRetry} />);

      const button = screen.getByRole("button", { name: /try again/i });
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply centered layout classes", () => {
      const { container } = render(<ErrorState />);
      const wrapper = container.querySelector(
        ".flex.flex-col.items-center.justify-center"
      );
      expect(wrapper).toBeInTheDocument();
    });

    it("should apply padding classes", () => {
      const { container } = render(<ErrorState />);
      const wrapper = container.querySelector(".py-12.px-4");
      expect(wrapper).toBeInTheDocument();
    });

    it("should apply red background to icon container", () => {
      const { container } = render(<ErrorState />);
      const iconContainer = container.querySelector(".bg-red-100");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should apply dark mode classes to icon container", () => {
      const { container } = render(<ErrorState />);
      const iconContainer = container.querySelector(".dark\\:bg-red-900\\/30");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should apply max-width to content", () => {
      const { container } = render(<ErrorState />);
      const content = container.querySelector(".max-w-md");
      expect(content).toBeInTheDocument();
    });

    it("should combine custom className with default classes", () => {
      const { container } = render(<ErrorState className="my-custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("my-custom-class");
      expect(wrapper).toHaveClass("flex");
      expect(wrapper).toHaveClass("flex-col");
    });
  });

  describe("Icon Rendering", () => {
    it("should render AlertTriangle icon with correct size", () => {
      const { container } = render(<ErrorState />);
      const icon = container.querySelector(".w-8.h-8");
      expect(icon).toBeInTheDocument();
    });

    it("should render icon with red color", () => {
      const { container } = render(<ErrorState />);
      const icon = container.querySelector(".text-red-600");
      expect(icon).toBeInTheDocument();
    });

    it("should render icon with dark mode color", () => {
      const { container } = render(<ErrorState />);
      const icon = container.querySelector(".dark\\:text-red-400");
      expect(icon).toBeInTheDocument();
    });

    it("should render icon in circular background", () => {
      const { container } = render(<ErrorState />);
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should render icon container with correct dimensions", () => {
      const { container } = render(<ErrorState />);
      const iconContainer = container.querySelector(".w-16.h-16");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Message Display", () => {
    it("should display heading with correct styling", () => {
      const { container } = render(<ErrorState />);
      const heading = container.querySelector(".text-xl.font-semibold");
      expect(heading).toBeInTheDocument();
    });

    it("should display message with correct styling", () => {
      const { container } = render(<ErrorState />);
      const message = container.querySelector(".text-gray-600");
      expect(message).toBeInTheDocument();
    });

    it("should display long messages correctly", () => {
      const longMessage =
        "This is a very long error message that should wrap properly and remain readable to the user even when it spans multiple lines";
      render(<ErrorState message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should display messages with special characters", () => {
      render(<ErrorState message="Error: 404 - Page not found!" />);
      expect(
        screen.getByText("Error: 404 - Page not found!")
      ).toBeInTheDocument();
    });
  });

  describe("Button Styling", () => {
    it("should apply correct button classes when retry is available", () => {
      const { container } = render(<ErrorState onRetry={() => {}} />);
      const button = container.querySelector(
        ".bg-blue-600.text-white.rounded-lg"
      );
      expect(button).toBeInTheDocument();
    });

    it("should apply hover state classes to button", () => {
      const { container } = render(<ErrorState onRetry={() => {}} />);
      const button = container.querySelector(".hover\\:bg-blue-700");
      expect(button).toBeInTheDocument();
    });

    it("should apply dark mode hover classes to button", () => {
      const { container } = render(<ErrorState onRetry={() => {}} />);
      const button = container.querySelector(".dark\\:hover\\:bg-blue-500");
      expect(button).toBeInTheDocument();
    });

    it("should apply transition classes to button", () => {
      const { container } = render(<ErrorState onRetry={() => {}} />);
      const button = container.querySelector(".transition-colors");
      expect(button).toBeInTheDocument();
    });

    it("should render button with icon and text", () => {
      render(<ErrorState onRetry={() => {}} />);
      const button = screen.getByRole("button", { name: /try again/i });
      expect(button).toHaveTextContent("Try Again");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty message string", () => {
      render(<ErrorState message="" />);
      // Empty message is treated as empty, not default
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });

    it("should handle null onRetry gracefully", () => {
      render(<ErrorState onRetry={null as any} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should handle undefined type", () => {
      render(<ErrorState type={undefined as any} />);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("should handle invalid type", () => {
      render(<ErrorState type={"invalid" as any} />);
      expect(
        screen.getByText("Something went wrong. Please try again")
      ).toBeInTheDocument();
    });

    it("should handle whitespace-only className", () => {
      const { container } = render(<ErrorState className="   " />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Type-Specific Behavior", () => {
    it("should show appropriate icon for all error types", () => {
      const types: Array<"error" | "not-found" | "network"> = [
        "error",
        "not-found",
        "network",
      ];
      types.forEach((type) => {
        const { container } = render(<ErrorState type={type} />);
        const icon = container.querySelector("svg");
        expect(icon).toBeInTheDocument();
      });
    });

    it("should maintain consistent styling across error types", () => {
      const types: Array<"error" | "not-found" | "network"> = [
        "error",
        "not-found",
        "network",
      ];
      types.forEach((type) => {
        const { container } = render(<ErrorState type={type} />);
        const wrapper = container.querySelector(".flex.flex-col.items-center");
        expect(wrapper).toBeInTheDocument();
      });
    });
  });

  describe("Integration Tests", () => {
    it("should render complete error state with all props", () => {
      const onRetry = jest.fn();
      render(
        <ErrorState
          message="Failed to load data"
          onRetry={onRetry}
          type="network"
          className="custom-error"
        />
      );

      expect(screen.getByText("Failed to load data")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("should work with dynamic message updates", () => {
      const { rerender } = render(<ErrorState message="Loading..." />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      rerender(<ErrorState message="Failed to load" />);
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });

    it("should work with dynamic retry handler", () => {
      const onRetry1 = jest.fn();
      const onRetry2 = jest.fn();

      const { rerender } = render(<ErrorState onRetry={onRetry1} />);
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
      expect(onRetry1).toHaveBeenCalledTimes(1);

      rerender(<ErrorState onRetry={onRetry2} />);
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
      expect(onRetry2).toHaveBeenCalledTimes(1);
      expect(onRetry1).toHaveBeenCalledTimes(1);
    });

    it("should handle removing retry handler", () => {
      const { rerender } = render(<ErrorState onRetry={() => {}} />);
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();

      rerender(<ErrorState />);
      expect(
        screen.queryByRole("button", { name: /try again/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      const { container } = render(<ErrorState />);
      expect(container.querySelector("h3")).toBeInTheDocument();
      expect(container.querySelector("p")).toBeInTheDocument();
    });

    it("should have visible text content", () => {
      render(<ErrorState />);
      expect(screen.getByText("Error")).toBeVisible();
      expect(
        screen.getByText("Something went wrong. Please try again")
      ).toBeVisible();
    });

    it("should have accessible button when retry is available", () => {
      render(<ErrorState onRetry={() => {}} />);
      const button = screen.getByRole("button", { name: /try again/i });
      expect(button).toBeVisible();
      expect(button).toBeEnabled();
    });

    it("should have sufficient color contrast", () => {
      const { container } = render(<ErrorState />);
      const heading = container.querySelector(".text-gray-900");
      const message = container.querySelector(".text-gray-600");
      expect(heading).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it("should support dark mode", () => {
      const { container } = render(<ErrorState />);
      const darkElements = container.querySelectorAll('[class*="dark:"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });
});

// BUG FIX #39: ErrorState Component Issues
// ISSUE 1: getMessage() treats "Something went wrong" as special case - fragile string comparison
// ISSUE 2: No ARIA role="alert" or aria-live for screen reader announcements
// ISSUE 3: Error type doesn't affect icon - always shows AlertTriangle (should vary by type)
// ISSUE 4: onRetry not debounced - rapid clicks can trigger multiple retries
// ISSUE 5: No loading state on retry button - user can't tell if retry is in progress
// ISSUE 6: No error code/ID support for tracking/debugging
// ISSUE 7: getMessage switch uses default message as fallback case - should be explicit
// ISSUE 8: No support for actionable errors (e.g., "Contact Support" button)
// ISSUE 9: Hardcoded dark mode classes instead of using theme system
// ISSUE 10: No way to customize button text (always "Try Again")
