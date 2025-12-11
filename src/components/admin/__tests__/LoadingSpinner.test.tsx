/**
 * LoadingSpinner Component - Comprehensive Tests
 * Tests all props, accessibility, and edge cases
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render with custom message", () => {
      render(<LoadingSpinner message="Loading data..." />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("should render in fullScreen mode", () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      expect(container.querySelector(".min-h-\\[400px\\]")).toBeInTheDocument();
    });

    it("should render without fullScreen mode", () => {
      const { container } = render(<LoadingSpinner fullScreen={false} />);
      expect(
        container.querySelector(".min-h-\\[400px\\]")
      ).not.toBeInTheDocument();
    });
  });

  describe("Size Variations", () => {
    it("should render small size", () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      expect(container.querySelector(".h-4.w-4")).toBeInTheDocument();
    });

    it("should render medium size (default)", () => {
      const { container } = render(<LoadingSpinner size="md" />);
      expect(container.querySelector(".h-8.w-8")).toBeInTheDocument();
    });

    it("should render large size", () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      expect(container.querySelector(".h-12.w-12")).toBeInTheDocument();
    });

    it("should render extra large size", () => {
      const { container } = render(<LoadingSpinner size="xl" />);
      expect(container.querySelector(".h-16.w-16")).toBeInTheDocument();
    });
  });

  describe("Color Variations", () => {
    it("should render primary color (default)", () => {
      const { container } = render(<LoadingSpinner color="primary" />);
      expect(container.querySelector(".border-blue-600")).toBeInTheDocument();
    });

    it("should render white color", () => {
      const { container } = render(<LoadingSpinner color="white" />);
      expect(container.querySelector(".border-white")).toBeInTheDocument();
    });

    it("should render gray color", () => {
      const { container } = render(<LoadingSpinner color="gray" />);
      expect(container.querySelector(".border-gray-900")).toBeInTheDocument();
    });
  });

  describe("Message Handling", () => {
    it("should render empty message", () => {
      render(<LoadingSpinner message="" />);
      // Empty message should show sr-only text
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render long message", () => {
      const longMessage = "A".repeat(200);
      render(<LoadingSpinner message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should render message with special characters", () => {
      render(<LoadingSpinner message="Loading... <test> & 'data'" />);
      expect(
        screen.getByText("Loading... <test> & 'data'")
      ).toBeInTheDocument();
    });

    it("should render undefined message", () => {
      render(<LoadingSpinner message={undefined} />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have role='status'", () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have aria-busy", () => {
      render(<LoadingSpinner />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-busy", "true");
    });

    it("should have aria-live='polite'", () => {
      render(<LoadingSpinner />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("should hide spinner from screen readers", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveAttribute("aria-hidden", "true");
    });

    it("should provide screen reader text when no message", () => {
      render(<LoadingSpinner />);
      expect(screen.getByText("Loading...")).toHaveClass("sr-only");
    });

    it("should not have sr-only text when message is provided", () => {
      render(<LoadingSpinner message="Custom loading" />);
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  describe("Combined Props", () => {
    it("should handle all props together", () => {
      const { container } = render(
        <LoadingSpinner
          size="lg"
          color="white"
          fullScreen
          message="Loading profile..."
        />
      );
      expect(container.querySelector(".h-12.w-12")).toBeInTheDocument();
      expect(container.querySelector(".border-white")).toBeInTheDocument();
      expect(container.querySelector(".min-h-\\[400px\\]")).toBeInTheDocument();
      expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    it("should handle minimal props", () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.querySelector(".h-8.w-8")).toBeInTheDocument();
      expect(container.querySelector(".border-blue-600")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    it("should apply animation classes", () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("should apply rounded-full class", () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.querySelector(".rounded-full")).toBeInTheDocument();
    });

    it("should apply message animation when message exists", () => {
      const { container } = render(<LoadingSpinner message="Loading..." />);
      const message = container.querySelector(".animate-pulse");
      expect(message).toBeInTheDocument();
    });

    it("should apply flex layout classes", () => {
      const { container } = render(<LoadingSpinner />);
      expect(
        container.querySelector(".flex.flex-col.items-center.gap-3")
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null message", () => {
      // @ts-expect-error - Testing runtime behavior
      render(<LoadingSpinner message={null} />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should handle numeric message", () => {
      // @ts-expect-error - Testing runtime behavior
      render(<LoadingSpinner message={123} />);
      expect(screen.getByText("123")).toBeInTheDocument();
    });

    it("should handle invalid size gracefully", () => {
      // @ts-expect-error - Testing runtime behavior
      const { container } = render(<LoadingSpinner size="invalid" />);
      // Should fall back to md or handle gracefully
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle invalid color gracefully", () => {
      // @ts-expect-error - Testing runtime behavior
      const { container } = render(<LoadingSpinner color="invalid" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Snapshot Tests", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with fullScreen", () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with message", () => {
      const { container } = render(
        <LoadingSpinner message="Loading data..." />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all props", () => {
      const { container } = render(
        <LoadingSpinner
          size="xl"
          color="gray"
          fullScreen
          message="Please wait..."
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
