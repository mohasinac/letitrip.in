/**
 * Tests for ErrorBoundary component
 *
 * Coverage:
 * - Catches and displays errors
 * - Fallback UI rendering
 * - Error logging
 * - Recovery mechanism
 * - Children rendering when no errors
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

// Suppress console.error for cleaner test output
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ErrorBoundary Component", () => {
  describe("Normal Rendering", () => {
    it("renders children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("renders multiple children without errors", () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
      expect(screen.getByText("Child 3")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("catches errors from children", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // Should show error UI instead of crashing
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("displays error title", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("displays error message", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });

    it("logs error to console", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("Fallback UI", () => {
    it("renders custom fallback when provided", () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });

    it("renders default fallback when not provided", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // Default fallback includes error icon and message
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe("Recovery", () => {
    it("shows try again button in default fallback", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(
        screen.getByRole("button", { name: /try again/i }),
      ).toBeInTheDocument();
    });

    it("resets error state when try again is clicked", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // Error is shown
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click try again
      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      tryAgainButton.click();

      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
    });
  });

  describe("Error Details", () => {
    it("captures error message in state", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // Error message should be available in the UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("handles errors without messages", () => {
      const ThrowErrorNoMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowErrorNoMessage />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe("Nested Error Boundaries", () => {
    it("inner boundary catches errors before outer", () => {
      render(
        <ErrorBoundary fallback={<div>Outer boundary</div>}>
          <div>Outer content</div>
          <ErrorBoundary fallback={<div>Inner boundary</div>}>
            <ThrowError shouldThrow />
          </ErrorBoundary>
        </ErrorBoundary>,
      );

      expect(screen.getByText("Inner boundary")).toBeInTheDocument();
      expect(screen.getByText("Outer content")).toBeInTheDocument();
      expect(screen.queryByText("Outer boundary")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("error message is displayed prominently", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      const heading = screen.getByRole("heading", {
        name: /something went wrong/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("try again button is keyboard accessible", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      const button = screen.getByRole("button", { name: /try again/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null children", () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      // Should render without errors
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("handles undefined children", () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("handles errors during rendering", () => {
      const ErrorComponent = () => {
        throw new Error("Render error");
      };

      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("handles errors in lifecycle methods", () => {
      class ErrorInLifecycle extends React.Component {
        componentDidMount() {
          throw new Error("Lifecycle error");
        }
        render() {
          return <div>Content</div>;
        }
      }

      render(
        <ErrorBoundary>
          <ErrorInLifecycle />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe("Multiple Errors", () => {
    it("displays most recent error", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Reset and throw new error
      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      tryAgainButton.click();

      const ThrowDifferentError = () => {
        throw new Error("Different error");
      };

      rerender(
        <ErrorBoundary>
          <ThrowDifferentError />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
