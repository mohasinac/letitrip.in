import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "../tables/ErrorState";

describe("ErrorState", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<ErrorState />);
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please try again")
      ).toBeInTheDocument();
    });

    it("renders with custom message", () => {
      render(<ErrorState message="Custom error message" />);
      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(<ErrorState title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("renders default icon when no custom icon provided", () => {
      const { container } = render(<ErrorState />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("renders custom icon when provided", () => {
      const CustomIcon = () => <span data-testid="custom-icon">⚠️</span>;
      render(<ErrorState icon={<CustomIcon />} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  describe("Error Types", () => {
    it("renders generic error type", () => {
      render(<ErrorState type="error" />);
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please try again")
      ).toBeInTheDocument();
    });

    it("renders not-found error type", () => {
      render(<ErrorState type="not-found" />);
      expect(screen.getByText("Not Found")).toBeInTheDocument();
      expect(
        screen.getByText("The item you're looking for doesn't exist")
      ).toBeInTheDocument();
    });

    it("renders network error type", () => {
      render(<ErrorState type="network" />);
      expect(screen.getByText("Connection Error")).toBeInTheDocument();
      expect(
        screen.getByText("Network error. Please check your connection")
      ).toBeInTheDocument();
    });

    it("renders unauthorized error type", () => {
      render(<ErrorState type="unauthorized" />);
      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(
        screen.getByText("You don't have permission to access this resource")
      ).toBeInTheDocument();
    });

    it("renders server error type", () => {
      render(<ErrorState type="server" />);
      expect(screen.getByText("Server Error")).toBeInTheDocument();
      expect(
        screen.getByText("Server error. Our team has been notified")
      ).toBeInTheDocument();
    });

    it("custom message overrides type-based message", () => {
      render(<ErrorState type="not-found" message="Custom override" />);
      expect(screen.getByText("Custom override")).toBeInTheDocument();
      expect(
        screen.queryByText("The item you're looking for doesn't exist")
      ).not.toBeInTheDocument();
    });

    it("custom title overrides type-based title", () => {
      render(<ErrorState type="not-found" title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.queryByText("Not Found")).not.toBeInTheDocument();
    });
  });

  describe("Retry Functionality", () => {
    it("renders retry button when onRetry is provided", () => {
      const handleRetry = vi.fn();
      render(<ErrorState onRetry={handleRetry} />);
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("does not render retry button when onRetry is not provided", () => {
      render(<ErrorState />);
      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", () => {
      const handleRetry = vi.fn();
      render(<ErrorState onRetry={handleRetry} />);
      fireEvent.click(screen.getByText("Try Again"));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("handles multiple retry clicks", () => {
      const handleRetry = vi.fn();
      render(<ErrorState onRetry={handleRetry} />);
      const button = screen.getByText("Try Again");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleRetry).toHaveBeenCalledTimes(3);
    });

    it("renders custom retry label", () => {
      render(<ErrorState onRetry={vi.fn()} retryLabel="Reload Page" />);
      expect(screen.getByText("Reload Page")).toBeInTheDocument();
      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });

    it("renders default retry icon", () => {
      const { container } = render(<ErrorState onRetry={vi.fn()} />);
      const button = screen.getByText("Try Again");
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("renders custom retry icon", () => {
      const CustomRetryIcon = () => (
        <span data-testid="custom-retry-icon">🔄</span>
      );
      render(<ErrorState onRetry={vi.fn()} retryIcon={<CustomRetryIcon />} />);
      expect(screen.getByTestId("custom-retry-icon")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className to root", () => {
      const { container } = render(<ErrorState className="custom-root" />);
      const root = container.firstChild;
      expect(root).toHaveClass("custom-root");
    });

    it("preserves default classes with custom className", () => {
      const { container } = render(<ErrorState className="custom-class" />);
      const root = container.firstChild;
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("flex-col");
      expect(root).toHaveClass("items-center");
      expect(root).toHaveClass("custom-class");
    });

    it("applies custom iconClassName", () => {
      const { container } = render(
        <ErrorState iconClassName="custom-icon-wrapper" />
      );
      const iconWrapper = container.querySelector(".custom-icon-wrapper");
      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).not.toHaveClass("rounded-full");
    });

    it("applies custom titleClassName", () => {
      render(<ErrorState titleClassName="custom-title" />);
      const title = screen.getByText("Error");
      expect(title).toHaveClass("custom-title");
      expect(title).not.toHaveClass("text-xl");
    });

    it("applies custom messageClassName", () => {
      render(<ErrorState messageClassName="custom-message" />);
      const message = screen.getByText(
        "Something went wrong. Please try again"
      );
      expect(message).toHaveClass("custom-message");
      expect(message).not.toHaveClass("text-gray-600");
    });

    it("applies custom retryButtonClassName", () => {
      render(
        <ErrorState
          onRetry={vi.fn()}
          retryButtonClassName="custom-retry-button"
        />
      );
      const button = screen.getByText("Try Again");
      expect(button).toHaveClass("custom-retry-button");
      expect(button).not.toHaveClass("bg-blue-600");
    });
  });

  describe("Layout", () => {
    it("renders with correct flex layout", () => {
      const { container } = render(<ErrorState />);
      const root = container.firstChild;
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("flex-col");
      expect(root).toHaveClass("items-center");
      expect(root).toHaveClass("justify-center");
    });

    it("applies padding classes", () => {
      const { container } = render(<ErrorState />);
      const root = container.firstChild;
      expect(root).toHaveClass("py-12");
      expect(root).toHaveClass("px-4");
    });

    it("content wrapper has text-center class", () => {
      const { container } = render(<ErrorState />);
      const wrapper = container.querySelector(".text-center");
      expect(wrapper).toBeInTheDocument();
    });

    it("content wrapper has max-width", () => {
      const { container } = render(<ErrorState />);
      const wrapper = container.querySelector(".max-w-md");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("includes dark mode classes for icon container", () => {
      const { container } = render(<ErrorState />);
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toHaveClass("dark:bg-red-900/30");
    });

    it("includes dark mode classes for title", () => {
      render(<ErrorState />);
      const title = screen.getByText("Error");
      expect(title).toHaveClass("dark:text-white");
    });

    it("includes dark mode classes for message", () => {
      render(<ErrorState />);
      const message = screen.getByText(
        "Something went wrong. Please try again"
      );
      expect(message).toHaveClass("dark:text-gray-400");
    });

    it("includes dark mode classes for retry button", () => {
      render(<ErrorState onRetry={vi.fn()} />);
      const button = screen.getByText("Try Again");
      expect(button).toHaveClass("dark:hover:bg-blue-500");
    });
  });

  describe("Complex Scenarios", () => {
    it("renders complete error state with all custom props", () => {
      const Icon = () => <span data-testid="icon">❌</span>;
      const RetryIcon = () => <span data-testid="retry-icon">🔄</span>;
      const handleRetry = vi.fn();

      render(
        <ErrorState
          icon={<Icon />}
          title="Custom Error Title"
          message="This is a custom error message"
          onRetry={handleRetry}
          retryLabel="Reload"
          retryIcon={<RetryIcon />}
          className="custom-error"
        />
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("Custom Error Title")).toBeInTheDocument();
      expect(
        screen.getByText("This is a custom error message")
      ).toBeInTheDocument();
      expect(screen.getByText("Reload")).toBeInTheDocument();
      expect(screen.getByTestId("retry-icon")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Reload"));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("handles very long error message", () => {
      const longMessage =
        "This is a very long error message that should wrap properly and maintain good readability even with lots of text content.";
      render(<ErrorState message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("handles empty string message", () => {
      render(<ErrorState message="" />);
      const { container } = render(<ErrorState message="" />);
      expect(container.querySelector("p")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic heading for title", () => {
      render(<ErrorState />);
      const title = screen.getByText("Error");
      expect(title.tagName).toBe("H3");
    });

    it("uses semantic button element for retry", () => {
      render(<ErrorState onRetry={vi.fn()} />);
      const button = screen.getByText("Try Again");
      expect(button.tagName).toBe("BUTTON");
    });

    it("message uses paragraph element", () => {
      render(<ErrorState />);
      const message = screen.getByText(
        "Something went wrong. Please try again"
      );
      expect(message.tagName).toBe("P");
    });
  });

  describe("Default Export", () => {
    it("can be imported as default export", async () => {
      const { default: DefaultErrorState } = await import(
        "../tables/ErrorState"
      );
      const { container } = render(<DefaultErrorState />);
      expect(container.querySelector(".flex")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null icon gracefully", () => {
      render(<ErrorState icon={null} />);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("handles undefined message gracefully", () => {
      render(<ErrorState message={undefined} />);
      expect(
        screen.getByText("Something went wrong. Please try again")
      ).toBeInTheDocument();
    });

    it("handles undefined title gracefully", () => {
      render(<ErrorState title={undefined} />);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("handles empty retry label", () => {
      render(<ErrorState onRetry={vi.fn()} retryLabel="" />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
    });
  });
});
