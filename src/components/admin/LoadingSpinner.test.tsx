import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  describe("Basic Rendering", () => {
    it("renders spinner element", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("renders without message by default", () => {
      render(<LoadingSpinner />);
      const message = screen.queryByText(/./);
      expect(message).not.toBeInTheDocument();
    });

    it("renders with message when provided", () => {
      render(<LoadingSpinner message="Loading data..." />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
    });

    it("applies animate-pulse to message", () => {
      render(<LoadingSpinner message="Loading..." />);
      const message = screen.getByText("Loading...");
      expect(message).toHaveClass("animate-pulse");
    });
  });

  describe("Size Variants", () => {
    it("renders small size correctly", () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-4", "w-4");
    });

    it("renders medium size by default", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-8", "w-8");
    });

    it("renders large size correctly", () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-12", "w-12");
    });

    it("renders extra large size correctly", () => {
      const { container } = render(<LoadingSpinner size="xl" />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-16", "w-16");
    });
  });

  describe("Color Variants", () => {
    it("renders primary color by default", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("border-blue-600");
    });

    it("renders white color correctly", () => {
      const { container } = render(<LoadingSpinner color="white" />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("border-white");
    });

    it("renders gray color correctly", () => {
      const { container } = render(<LoadingSpinner color="gray" />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("border-gray-900");
    });
  });

  describe("Full Screen Mode", () => {
    it("renders in full screen mode when fullScreen is true", () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      const wrapper = container.querySelector(".min-h-\\[400px\\]");
      expect(wrapper).toBeInTheDocument();
    });

    it("centers content in full screen mode", () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      const wrapper = container.querySelector(".min-h-\\[400px\\]");
      expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
    });

    it("does not render full screen wrapper by default", () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.querySelector(".min-h-\\[400px\\]");
      expect(wrapper).not.toBeInTheDocument();
    });

    it("renders spinner inside full screen wrapper", () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      const wrapper = container.querySelector(".min-h-\\[400px\\]");
      const spinner = wrapper?.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies rounded-full to spinner", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("rounded-full");
    });

    it("applies border-b-2 to spinner", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("border-b-2");
    });

    it("applies animate-spin to spinner", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("animate-spin");
    });

    it("applies text-sm to message", () => {
      render(<LoadingSpinner message="Loading..." />);
      const message = screen.getByText("Loading...");
      expect(message).toHaveClass("text-sm");
    });

    it("applies text-gray-600 to message", () => {
      render(<LoadingSpinner message="Loading..." />);
      const message = screen.getByText("Loading...");
      expect(message).toHaveClass("text-gray-600");
    });
  });

  describe("Layout", () => {
    it("wraps spinner and message in flex column container", () => {
      const { container } = render(<LoadingSpinner message="Loading..." />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("flex", "flex-col", "items-center");
    });

    it("applies gap-3 between spinner and message", () => {
      const { container } = render(<LoadingSpinner message="Loading..." />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("gap-3");
    });

    it("renders message as paragraph element", () => {
      render(<LoadingSpinner message="Loading..." />);
      const message = screen.getByText("Loading...");
      expect(message.tagName).toBe("P");
    });
  });

  describe("Combined Props", () => {
    it("renders with all props combined", () => {
      const { container } = render(
        <LoadingSpinner
          size="lg"
          color="white"
          fullScreen
          message="Loading data..."
        />
      );
      const wrapper = container.querySelector(".min-h-\\[400px\\]");
      const spinner = container.querySelector(".animate-spin");
      const message = screen.getByText("Loading data...");

      expect(wrapper).toBeInTheDocument();
      expect(spinner).toHaveClass("h-12", "w-12", "border-white");
      expect(message).toBeInTheDocument();
    });

    it("renders small spinner with gray color", () => {
      const { container } = render(<LoadingSpinner size="sm" color="gray" />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-4", "w-4", "border-gray-900");
    });

    it("renders xl spinner with message in full screen", () => {
      const { container } = render(
        <LoadingSpinner size="xl" message="Please wait..." fullScreen />
      );
      const spinner = container.querySelector(".animate-spin");
      const message = screen.getByText("Please wait...");
      const wrapper = container.querySelector(".min-h-\\[400px\\]");

      expect(spinner).toHaveClass("h-16", "w-16");
      expect(message).toBeInTheDocument();
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty message string", () => {
      const { container } = render(<LoadingSpinner message="" />);
      const message = container.querySelector("p");
      expect(message).not.toBeInTheDocument();
    });

    it("handles very long message", () => {
      const longMessage = "Loading ".repeat(50).trim();
      render(<LoadingSpinner message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("handles message with special characters", () => {
      render(<LoadingSpinner message="Loading... (50%)" />);
      expect(screen.getByText("Loading... (50%)")).toBeInTheDocument();
    });

    it("renders without any props", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("h-8", "w-8", "border-blue-600");
    });

    it("handles message with HTML entities", () => {
      render(<LoadingSpinner message="Loading &amp; processing..." />);
      expect(screen.getByText("Loading & processing...")).toBeInTheDocument();
    });
  });
});
