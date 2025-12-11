/**
 * Comprehensive StatusBadge Component Test Suite
 * Tests all status types, variants, sizes, and edge cases
 */

import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge Component - Comprehensive Tests", () => {
  describe("Status Types", () => {
    it("should render active status", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100");
    });

    it("should render inactive status", () => {
      const { container } = render(<StatusBadge status="inactive" />);
      expect(screen.getByText("Inactive")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-gray-100");
    });

    it("should render pending status", () => {
      const { container } = render(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-yellow-100");
    });

    it("should render approved status", () => {
      const { container } = render(<StatusBadge status="approved" />);
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100");
    });

    it("should render rejected status", () => {
      const { container } = render(<StatusBadge status="rejected" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-red-100");
    });

    it("should render banned status", () => {
      const { container } = render(<StatusBadge status="banned" />);
      expect(screen.getByText("Banned")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-red-100");
    });

    it("should render verified status", () => {
      const { container } = render(<StatusBadge status="verified" />);
      expect(screen.getByText("Verified")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-blue-100");
    });

    it("should render unverified status", () => {
      const { container } = render(<StatusBadge status="unverified" />);
      expect(screen.getByText("Unverified")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-gray-100");
    });

    it("should render featured status", () => {
      const { container } = render(<StatusBadge status="featured" />);
      expect(screen.getByText("Featured")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-purple-100");
    });

    it("should render draft status", () => {
      const { container } = render(<StatusBadge status="draft" />);
      expect(screen.getByText("Draft")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-gray-100");
    });

    it("should render published status", () => {
      const { container } = render(<StatusBadge status="published" />);
      expect(screen.getByText("Published")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100");
    });

    it("should render archived status", () => {
      const { container } = render(<StatusBadge status="archived" />);
      expect(screen.getByText("Archived")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-gray-100");
    });

    it("should render success status", () => {
      const { container } = render(<StatusBadge status="success" />);
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100");
    });

    it("should render error status", () => {
      const { container } = render(<StatusBadge status="error" />);
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-red-100");
    });

    it("should render warning status", () => {
      const { container } = render(<StatusBadge status="warning" />);
      expect(screen.getByText("Warning")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-yellow-100");
    });

    it("should render info status", () => {
      const { container } = render(<StatusBadge status="info" />);
      expect(screen.getByText("Info")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-blue-100");
    });
  });

  describe("Case Insensitivity", () => {
    it("should handle uppercase status", () => {
      const { container } = render(<StatusBadge status="ACTIVE" />);
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100");
    });

    it("should handle mixed case status", () => {
      const { container } = render(<StatusBadge status="PeNdInG" />);
      expect(screen.getByText("PeNdInG")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-yellow-100");
    });

    it("should handle lowercase status", () => {
      const { container } = render(<StatusBadge status="success" />);
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100");
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="default" />
      );
      expect(container.firstChild).toHaveClass(
        "bg-green-100",
        "text-green-800"
      );
    });

    it("should render outline variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />
      );
      expect(container.firstChild).toHaveClass(
        "bg-transparent",
        "text-green-800",
        "border",
        "border-green-300"
      );
    });

    it("should render solid variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="solid" />
      );
      expect(container.firstChild).toHaveClass(
        "bg-green-100",
        "text-green-800"
      );
    });

    it("should use default variant when not specified", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.firstChild).toHaveClass("bg-green-100");
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      const { container } = render(<StatusBadge status="active" size="sm" />);
      expect(container.firstChild).toHaveClass("px-2", "py-0.5", "text-xs");
    });

    it("should render medium size", () => {
      const { container } = render(<StatusBadge status="active" size="md" />);
      expect(container.firstChild).toHaveClass("px-2.5", "py-1", "text-sm");
    });

    it("should render large size", () => {
      const { container } = render(<StatusBadge status="active" size="lg" />);
      expect(container.firstChild).toHaveClass("px-3", "py-1.5", "text-base");
    });

    it("should use medium size when not specified", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.firstChild).toHaveClass("px-2.5", "py-1", "text-sm");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="my-custom-class" />
      );
      expect(container.firstChild).toHaveClass("my-custom-class");
    });

    it("should merge custom className with default classes", () => {
      const { container } = render(
        <StatusBadge status="active" className="ml-4" />
      );
      expect(container.firstChild).toHaveClass(
        "ml-4",
        "inline-flex",
        "bg-green-100"
      );
    });
  });

  describe("Unknown Status", () => {
    it("should fall back to info styles for unknown status", () => {
      const { container } = render(<StatusBadge status="unknown-status" />);
      expect(screen.getByText("Unknown-status")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("should capitalize first letter of unknown status", () => {
      render(<StatusBadge status="custom" />);
      expect(screen.getByText("Custom")).toBeInTheDocument();
    });

    it("should handle multi-word unknown status", () => {
      render(<StatusBadge status="in progress" />);
      expect(screen.getByText("In progress")).toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes for active status", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.firstChild).toHaveClass(
        "dark:bg-green-900/30",
        "dark:text-green-400"
      );
    });

    it("should have dark mode classes for inactive status", () => {
      const { container } = render(<StatusBadge status="inactive" />);
      expect(container.firstChild).toHaveClass(
        "dark:bg-gray-700",
        "dark:text-gray-300"
      );
    });

    it("should have dark mode classes for error status", () => {
      const { container } = render(<StatusBadge status="error" />);
      expect(container.firstChild).toHaveClass(
        "dark:bg-red-900/30",
        "dark:text-red-400"
      );
    });

    it("should have dark mode border for outline variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />
      );
      expect(container.firstChild).toHaveClass("dark:border-green-700");
    });
  });

  describe("Base Styling", () => {
    it("should have inline-flex display", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.firstChild).toHaveClass("inline-flex");
    });

    it("should have items-center alignment", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.firstChild).toHaveClass("items-center");
    });

    it("should have font-medium weight", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.firstChild).toHaveClass("font-medium");
    });

    it("should have rounded-full shape", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.firstChild).toHaveClass("rounded-full");
    });
  });

  describe("Text Capitalization", () => {
    it("should capitalize first letter only", () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should preserve case after first letter", () => {
      render(<StatusBadge status="PENDING" />);
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });

    it("should handle empty string status", () => {
      const { container } = render(<StatusBadge status="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle single character status", () => {
      render(<StatusBadge status="a" />);
      expect(screen.getByText("A")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null className", () => {
      const { container } = render(
        <StatusBadge status="active" className={null as any} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle undefined className", () => {
      const { container } = render(
        <StatusBadge status="active" className={undefined} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle very long status text", () => {
      const longStatus = "very-long-status-text-that-keeps-going";
      render(<StatusBadge status={longStatus} />);
      expect(screen.getByText(/Very-long-status/)).toBeInTheDocument();
    });

    it("should handle status with special characters", () => {
      render(<StatusBadge status="status-123" />);
      expect(screen.getByText("Status-123")).toBeInTheDocument();
    });

    it("should handle status with unicode characters", () => {
      render(<StatusBadge status="状態" />);
      expect(screen.getByText("状態")).toBeInTheDocument();
    });
  });

  describe("Combination Tests", () => {
    it("should combine all props correctly - active, outline, small", () => {
      const { container } = render(
        <StatusBadge
          status="active"
          variant="outline"
          size="sm"
          className="custom"
        />
      );
      expect(container.firstChild).toHaveClass(
        "inline-flex",
        "items-center",
        "font-medium",
        "rounded-full",
        "px-2",
        "py-0.5",
        "text-xs",
        "bg-transparent",
        "text-green-800",
        "border",
        "border-green-300",
        "custom"
      );
    });

    it("should combine all props correctly - error, solid, large", () => {
      const { container } = render(
        <StatusBadge status="error" variant="solid" size="lg" />
      );
      expect(container.firstChild).toHaveClass(
        "px-3",
        "py-1.5",
        "text-base",
        "bg-red-100",
        "text-red-800"
      );
    });
  });

  describe("Real-world Scenarios", () => {
    it("should render order status badge", () => {
      const { container } = render(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-yellow-100");
    });

    it("should render user verification badge", () => {
      const { container } = render(
        <StatusBadge status="verified" variant="outline" size="sm" />
      );
      expect(screen.getByText("Verified")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("text-blue-800", "border");
    });

    it("should render product status badge", () => {
      const { container } = render(<StatusBadge status="published" />);
      expect(screen.getByText("Published")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100");
    });

    it("should render payment status badge", () => {
      const { container } = render(<StatusBadge status="success" size="sm" />);
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-green-100", "text-xs");
    });
  });

  describe("Accessibility", () => {
    it("should render as span element", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.querySelector("span")).toBeInTheDocument();
    });

    it("should have readable text", () => {
      render(<StatusBadge status="active" />);
      const badge = screen.getByText("Active");
      expect(badge).toBeVisible();
    });
  });

  describe("Color Consistency", () => {
    it("should use same colors for semantically similar statuses", () => {
      const { container: c1 } = render(<StatusBadge status="active" />);
      const { container: c2 } = render(<StatusBadge status="approved" />);
      const { container: c3 } = render(<StatusBadge status="published" />);
      const { container: c4 } = render(<StatusBadge status="success" />);

      // All should be green
      expect(c1.firstChild).toHaveClass("bg-green-100");
      expect(c2.firstChild).toHaveClass("bg-green-100");
      expect(c3.firstChild).toHaveClass("bg-green-100");
      expect(c4.firstChild).toHaveClass("bg-green-100");
    });

    it("should use same colors for error-related statuses", () => {
      const { container: c1 } = render(<StatusBadge status="rejected" />);
      const { container: c2 } = render(<StatusBadge status="banned" />);
      const { container: c3 } = render(<StatusBadge status="error" />);

      // All should be red
      expect(c1.firstChild).toHaveClass("bg-red-100");
      expect(c2.firstChild).toHaveClass("bg-red-100");
      expect(c3.firstChild).toHaveClass("bg-red-100");
    });
  });
});
