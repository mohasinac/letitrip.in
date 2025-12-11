/**
 * ToggleSwitch Component - Comprehensive Tests
 * Tests all props, interactions, accessibility, and edge cases
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { ToggleSwitch } from "../ToggleSwitch";

describe("ToggleSwitch", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  describe("Basic Rendering", () => {
    it("should render in enabled state", () => {
      render(<ToggleSwitch enabled={true} onToggle={mockOnToggle} />);
      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("should render in disabled state", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} />);
      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    it("should call onToggle when clicked", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} />);
      const toggle = screen.getByRole("button");
      fireEvent.click(toggle);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("should not call onToggle when disabled", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} disabled />);
      const toggle = screen.getByRole("button");
      fireEvent.click(toggle);
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe("Size Variations", () => {
    it("should render small size", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} size="sm" />
      );
      expect(container.querySelector(".h-5.w-9")).toBeInTheDocument();
    });

    it("should render medium size (default)", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} size="md" />
      );
      expect(container.querySelector(".h-6.w-11")).toBeInTheDocument();
    });

    it("should render large size", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} size="lg" />
      );
      expect(container.querySelector(".h-7.w-14")).toBeInTheDocument();
    });

    it("should use medium size by default", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} />
      );
      expect(container.querySelector(".h-6.w-11")).toBeInTheDocument();
    });
  });

  describe("Label and Description", () => {
    it("should render with label", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label="Enable Notifications"
        />
      );
      expect(screen.getByText("Enable Notifications")).toBeInTheDocument();
    });

    it("should render with description", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          description="Receive email notifications"
        />
      );
      expect(
        screen.getByText("Receive email notifications")
      ).toBeInTheDocument();
    });

    it("should render with both label and description", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label="Enable Notifications"
          description="Receive email notifications"
        />
      );
      expect(screen.getByText("Enable Notifications")).toBeInTheDocument();
      expect(
        screen.getByText("Receive email notifications")
      ).toBeInTheDocument();
    });

    it("should render without label or description", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} />);
      const toggle = screen.getByRole("button");
      expect(toggle).toBeInTheDocument();
    });

    it("should generate id from label", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label="Enable Dark Mode"
        />
      );
      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("id", "toggle-enable-dark-mode");
    });

    it("should use custom id when provided", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label="Notifications"
          id="custom-toggle"
        />
      );
      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("id", "custom-toggle");
    });

    it("should have no id when no label and no custom id", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} />);
      const toggle = screen.getByRole("button");
      expect(toggle).not.toHaveAttribute("id");
    });
  });

  describe("Disabled State", () => {
    it("should apply disabled styles", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} disabled />
      );
      const toggle = container.querySelector("button");
      expect(toggle).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("should not apply disabled styles when not disabled", () => {
      const { container } = render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          disabled={false}
        />
      );
      const toggle = container.querySelector("button");
      expect(toggle).not.toHaveClass("opacity-50");
      expect(toggle).toHaveClass("cursor-pointer");
    });

    it("should have disabled attribute when disabled", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} disabled />);
      const toggle = screen.getByRole("button");
      expect(toggle).toBeDisabled();
    });
  });

  describe("Visual States", () => {
    it("should show enabled colors when enabled", () => {
      const { container } = render(
        <ToggleSwitch enabled={true} onToggle={mockOnToggle} />
      );
      const toggle = container.querySelector("button");
      expect(toggle).toHaveClass("bg-blue-600");
    });

    it("should show disabled colors when not enabled", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} />
      );
      const toggle = container.querySelector("button");
      expect(toggle).toHaveClass("bg-gray-200");
    });

    it("should translate circle when enabled (small)", () => {
      const { container } = render(
        <ToggleSwitch enabled={true} onToggle={mockOnToggle} size="sm" />
      );
      const circle = container.querySelector(".transform");
      expect(circle).toHaveClass("translate-x-5");
    });

    it("should not translate circle when disabled (small)", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} size="sm" />
      );
      const circle = container.querySelector(".transform");
      expect(circle).toHaveClass("translate-x-1");
    });
  });

  describe("Accessibility", () => {
    it("should have role='button'", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should have aria-pressed attribute", () => {
      render(<ToggleSwitch enabled={true} onToggle={mockOnToggle} />);
      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("should update aria-pressed when state changes", () => {
      const { rerender } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} />
      );
      let toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("aria-pressed", "false");

      rerender(<ToggleSwitch enabled={true} onToggle={mockOnToggle} />);
      toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("should associate label with button via htmlFor", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label="Dark Mode"
        />
      );
      const label = screen.getByText("Dark Mode");
      expect(label).toHaveAttribute("for", "toggle-dark-mode");
    });

    it("should have aria-labelledby when label exists", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label="Notifications"
        />
      );
      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute(
        "aria-labelledby",
        "toggle-notifications-label"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined onToggle", () => {
      // @ts-expect-error - Testing runtime behavior
      const { container } = render(<ToggleSwitch enabled={false} />);
      const toggle = container.querySelector("button");
      expect(() => fireEvent.click(toggle!)).not.toThrow();
    });

    it("should handle null label", () => {
      // @ts-expect-error - Testing runtime behavior
      render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} label={null} />
      );
      const toggle = screen.getByRole("button");
      expect(toggle).toBeInTheDocument();
    });

    it("should handle empty label", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} label="" />);
      const toggle = screen.getByRole("button");
      expect(toggle).toBeInTheDocument();
    });

    it("should handle label with special characters", () => {
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label="<script>alert('xss')</script>"
        />
      );
      expect(
        screen.getByText("<script>alert('xss')</script>")
      ).toBeInTheDocument();
    });

    it("should handle very long label", () => {
      const longLabel = "A".repeat(200);
      render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          label={longLabel}
        />
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle invalid size gracefully", () => {
      // @ts-expect-error - Testing runtime behavior
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} size="invalid" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle multiple rapid clicks", () => {
      render(<ToggleSwitch enabled={false} onToggle={mockOnToggle} />);
      const toggle = screen.getByRole("button");

      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe("Layout Variants", () => {
    it("should render compact layout without label/description", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} />
      );
      expect(
        container.querySelector(".flex.items-start.justify-between")
      ).not.toBeInTheDocument();
    });

    it("should render extended layout with label", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} label="Test" />
      );
      expect(
        container.querySelector(".flex.items-start.justify-between")
      ).toBeInTheDocument();
    });

    it("should render extended layout with description only", () => {
      const { container } = render(
        <ToggleSwitch
          enabled={false}
          onToggle={mockOnToggle}
          description="Test"
        />
      );
      expect(
        container.querySelector(".flex.items-start.justify-between")
      ).toBeInTheDocument();
    });
  });

  describe("Snapshot Tests", () => {
    it("should match snapshot - enabled", () => {
      const { container } = render(
        <ToggleSwitch enabled={true} onToggle={mockOnToggle} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot - disabled", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot - with label and description", () => {
      const { container } = render(
        <ToggleSwitch
          enabled={true}
          onToggle={mockOnToggle}
          label="Notifications"
          description="Receive notifications"
          size="lg"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot - disabled state", () => {
      const { container } = render(
        <ToggleSwitch enabled={false} onToggle={mockOnToggle} disabled />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
