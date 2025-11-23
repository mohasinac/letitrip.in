import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorMessage, getUserFriendlyError, InlineError } from "./ErrorMessage";

describe("ErrorMessage", () => {
  describe("Basic Rendering", () => {
    it("renders error message", () => {
      render(<ErrorMessage message="Something went wrong" />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders default title", () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
    });

    it("renders custom title", () => {
      render(<ErrorMessage title="Custom Error" message="Error details" />);
      expect(screen.getByText("Custom Error")).toBeInTheDocument();
    });

    it("renders error icon", () => {
      const { container } = render(<ErrorMessage message="Error" />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("shows retry button when enabled", () => {
      render(<ErrorMessage message="Error" showRetry onRetry={() => {}} />);
      expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    });

    it("does not show retry button by default", () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.queryByRole("button", { name: /Try Again/i })).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button clicked", () => {
      const onRetry = jest.fn();
      render(<ErrorMessage message="Error" showRetry onRetry={onRetry} />);
      
      fireEvent.click(screen.getByRole("button", { name: /Try Again/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("shows go home button when enabled", () => {
      render(<ErrorMessage message="Error" showGoHome />);
      expect(screen.getByRole("button", { name: /Go Home/i })).toBeInTheDocument();
    });

    it("navigates to home when go home clicked with default handler", () => {
      delete (window as any).location;
      window.location = { href: "" } as any;
      
      render(<ErrorMessage message="Error" showGoHome />);
      fireEvent.click(screen.getByRole("button", { name: /Go Home/i }));
      
      expect(window.location.href).toBe("/");
    });

    it("calls custom onGoHome handler", () => {
      const onGoHome = jest.fn();
      render(<ErrorMessage message="Error" showGoHome onGoHome={onGoHome} />);
      
      fireEvent.click(screen.getByRole("button", { name: /Go Home/i }));
      expect(onGoHome).toHaveBeenCalledTimes(1);
    });

    it("shows go back button when enabled", () => {
      render(<ErrorMessage message="Error" showGoBack />);
      expect(screen.getByRole("button", { name: /Go Back/i })).toBeInTheDocument();
    });

    it("goes back in history when go back clicked", () => {
      const mockBack = jest.fn();
      window.history.back = mockBack;
      
      render(<ErrorMessage message="Error" showGoBack />);
      fireEvent.click(screen.getByRole("button", { name: /Go Back/i }));
      
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("calls custom onGoBack handler", () => {
      const onGoBack = jest.fn();
      render(<ErrorMessage message="Error" showGoBack onGoBack={onGoBack} />);
      
      fireEvent.click(screen.getByRole("button", { name: /Go Back/i }));
      expect(onGoBack).toHaveBeenCalledTimes(1);
    });

    it("shows all action buttons together", () => {
      render(
        <ErrorMessage 
          message="Error" 
          showRetry 
          onRetry={() => {}}
          showGoHome 
          showGoBack 
        />
      );
      
      expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Go Home/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Go Back/i })).toBeInTheDocument();
    });
  });

  describe("Technical Error Details", () => {
    it("shows technical details in development mode", () => {
      (process.env as any).NODE_ENV = "development";
      const error = new Error("Technical error message");
      
      render(<ErrorMessage message="User message" error={error} />);
      
      expect(screen.getByText("Show technical details")).toBeInTheDocument();
    });

    it("expands technical details when clicked", () => {
      (process.env as any).NODE_ENV = "development";
      const error = new Error("Technical error");
      
      render(<ErrorMessage message="User message" error={error} />);
      
      const details = screen.getByText("Show technical details");
      fireEvent.click(details);
      
      expect(screen.getByText("Technical error")).toBeInTheDocument();
    });

    it("shows error stack trace in development", () => {
      (process.env as any).NODE_ENV = "development";
      const error = new Error("Test error");
      error.stack = "Error stack trace here";
      
      render(<ErrorMessage message="User message" error={error} />);
      
      const details = screen.getByText("Show technical details");
      fireEvent.click(details);
      
      expect(screen.getByText("Error stack trace here")).toBeInTheDocument();
    });

    it("does not show technical details in production", () => {
      (process.env as any).NODE_ENV = "production";
      const error = new Error("Technical error");
      
      render(<ErrorMessage message="User message" error={error} />);
      
      expect(screen.queryByText("Show technical details")).not.toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(<ErrorMessage message="Error" className="custom-class" />);
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(<ErrorMessage message="Error" className="mt-8" />);
      const wrapper = container.querySelector(".flex.flex-col.mt-8");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty message", () => {
      render(<ErrorMessage message="" />);
      expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
    });

    it("handles very long messages", () => {
      const longMessage = "Very long error message ".repeat(50);
      render(<ErrorMessage message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("handles special characters in message", () => {
      const specialMessage = '<Error> & "Special" characters';
      render(<ErrorMessage message={specialMessage} />);
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("handles error without message", () => {
      (process.env as any).NODE_ENV = "development";
      const error = {} as Error;
      render(<ErrorMessage message="User message" error={error} />);
      expect(screen.getByText("User message")).toBeInTheDocument();
    });
  });
});

describe("getUserFriendlyError", () => {
  it("returns default message for null error", () => {
    expect(getUserFriendlyError(null)).toBe("Something went wrong. Please try again.");
  });

  it("returns default message for undefined error", () => {
    expect(getUserFriendlyError(undefined)).toBe("Something went wrong. Please try again.");
  });

  it("converts permission-denied error", () => {
    const error = new Error("permission-denied");
    const result = getUserFriendlyError(error);
    expect(result).toContain("permission");
    expect(result).toContain("sign in");
  });

  it("converts not-found error", () => {
    const error = new Error("not-found");
    const result = getUserFriendlyError(error);
    expect(result).toContain("couldn't find");
  });

  it("converts already-exists error", () => {
    const error = new Error("already-exists");
    const result = getUserFriendlyError(error);
    expect(result).toContain("already exists");
  });

  it("converts unauthenticated error", () => {
    const error = new Error("unauthenticated");
    const result = getUserFriendlyError(error);
    expect(result).toContain("sign in");
  });

  it("converts network error", () => {
    const error = new Error("network error occurred");
    const result = getUserFriendlyError(error);
    expect(result).toContain("Connection");
    expect(result).toContain("internet");
  });

  it("converts fetch error", () => {
    const error = new Error("fetch failed");
    const result = getUserFriendlyError(error);
    expect(result).toContain("Connection");
  });

  it("converts timeout error", () => {
    const error = new Error("Request timeout");
    const result = getUserFriendlyError(error);
    expect(result).toContain("timed out");
  });

  it("converts invalid error", () => {
    const error = new Error("invalid input");
    const result = getUserFriendlyError(error);
    expect(result).toContain("Invalid");
  });

  it("converts required error", () => {
    const error = new Error("Field is required");
    const result = getUserFriendlyError(error);
    expect(result).toContain("required");
  });

  it("converts payment error", () => {
    const error = new Error("payment processing failed");
    const result = getUserFriendlyError(error);
    expect(result).toContain("Payment failed");
  });

  it("returns default for unknown error", () => {
    const error = new Error("Unknown random error");
    const result = getUserFriendlyError(error);
    expect(result).toContain("Something went wrong");
  });

  it("handles error without message property", () => {
    const error = { toString: () => "String error" };
    const result = getUserFriendlyError(error);
    expect(result).toBeDefined();
  });

  it("handles string errors", () => {
    const result = getUserFriendlyError("network error");
    expect(result).toContain("Connection");
  });
});

describe("InlineError", () => {
  it("renders inline error message", () => {
    render(<InlineError message="Inline error" />);
    expect(screen.getByText("Inline error")).toBeInTheDocument();
  });

  it("renders error icon", () => {
    const { container } = render(<InlineError message="Error" />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("has error styling", () => {
    const { container } = render(<InlineError message="Error" />);
    const wrapper = container.querySelector(".bg-red-50.border-red-200");
    expect(wrapper).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<InlineError message="Error" className="custom-class" />);
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("preserves base classes with custom className", () => {
    const { container } = render(<InlineError message="Error" className="mt-4" />);
    const wrapper = container.querySelector(".flex.items-center.mt-4");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders as compact layout", () => {
    const { container } = render(<InlineError message="Error" />);
    const wrapper = container.querySelector(".flex.items-center.gap-2");
    expect(wrapper).toBeInTheDocument();
  });

  it("handles long messages", () => {
    const longMessage = "Very long inline error message ".repeat(20);
    render(<InlineError message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it("handles special characters", () => {
    const specialMessage = '<Error> & "Test"';
    render(<InlineError message={specialMessage} />);
    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it("icon has flex-shrink-0 class", () => {
    const { container } = render(<InlineError message="Error" />);
    const icon = container.querySelector("svg");
    expect(icon).toHaveClass("flex-shrink-0");
  });
});
