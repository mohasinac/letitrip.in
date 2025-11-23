import React from "react";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders status text", () => {
      render(<StatusBadge status="active" />);

      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("capitalizes first letter of status", () => {
      render(<StatusBadge status="pending" />);

      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders with lowercase input", () => {
      render(<StatusBadge status="approved" />);

      expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("renders with uppercase input", () => {
      render(<StatusBadge status="REJECTED" />);

      expect(screen.getByText("REJECTED")).toBeInTheDocument();
    });
  });

  // Status Variants
  describe("Status Variants", () => {
    it("renders active status with green styling", () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
      expect(badge.className).toContain("text-green-800");
    });

    it("renders inactive status with gray styling", () => {
      const { container } = render(<StatusBadge status="inactive" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-gray-100");
      expect(badge.className).toContain("text-gray-800");
    });

    it("renders pending status with yellow styling", () => {
      const { container } = render(<StatusBadge status="pending" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-yellow-100");
      expect(badge.className).toContain("text-yellow-800");
    });

    it("renders approved status with green styling", () => {
      const { container } = render(<StatusBadge status="approved" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
    });

    it("renders rejected status with red styling", () => {
      const { container } = render(<StatusBadge status="rejected" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-red-100");
      expect(badge.className).toContain("text-red-800");
    });

    it("renders banned status with red styling", () => {
      const { container } = render(<StatusBadge status="banned" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-red-100");
    });

    it("renders verified status with blue styling", () => {
      const { container } = render(<StatusBadge status="verified" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-blue-100");
      expect(badge.className).toContain("text-blue-800");
    });

    it("renders unverified status with gray styling", () => {
      const { container } = render(<StatusBadge status="unverified" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-gray-100");
    });

    it("renders featured status with purple styling", () => {
      const { container } = render(<StatusBadge status="featured" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-purple-100");
      expect(badge.className).toContain("text-purple-800");
    });

    it("renders draft status with gray styling", () => {
      const { container } = render(<StatusBadge status="draft" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-gray-100");
    });

    it("renders published status with green styling", () => {
      const { container } = render(<StatusBadge status="published" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
    });

    it("renders archived status with gray styling", () => {
      const { container } = render(<StatusBadge status="archived" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-gray-100");
    });

    it("renders success status with green styling", () => {
      const { container } = render(<StatusBadge status="success" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
    });

    it("renders error status with red styling", () => {
      const { container } = render(<StatusBadge status="error" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-red-100");
    });

    it("renders warning status with yellow styling", () => {
      const { container } = render(<StatusBadge status="warning" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-yellow-100");
    });

    it("renders info status with blue styling", () => {
      const { container } = render(<StatusBadge status="info" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-blue-100");
    });
  });

  // Variant Prop
  describe("Variant Prop", () => {
    it("renders default variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="default" />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
    });

    it("renders outline variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-transparent");
      expect(badge.className).toContain("border");
      expect(badge.className).toContain("border-green-300");
    });

    it("renders solid variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="solid" />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
    });
  });

  // Size Prop
  describe("Size Prop", () => {
    it("renders small size", () => {
      const { container } = render(<StatusBadge status="active" size="sm" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("px-2");
      expect(badge.className).toContain("py-0.5");
      expect(badge.className).toContain("text-xs");
    });

    it("renders medium size (default)", () => {
      const { container } = render(<StatusBadge status="active" size="md" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("px-2.5");
      expect(badge.className).toContain("py-1");
      expect(badge.className).toContain("text-sm");
    });

    it("renders large size", () => {
      const { container } = render(<StatusBadge status="active" size="lg" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("px-3");
      expect(badge.className).toContain("py-1.5");
      expect(badge.className).toContain("text-base");
    });

    it("uses medium size by default", () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("text-sm");
    });
  });

  // Custom Styling
  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="custom-class" />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("custom-class");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="extra-class" />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("inline-flex", "rounded-full", "extra-class");
    });

    it("has rounded-full styling", () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("rounded-full");
    });

    it("has font-medium styling", () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("font-medium");
    });
  });

  // Unknown Status
  describe("Unknown Status", () => {
    it("handles unknown status with info styling", () => {
      const { container } = render(<StatusBadge status="unknown-status" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-blue-100");
      expect(badge.className).toContain("text-blue-800");
    });

    it("displays unknown status text correctly", () => {
      render(<StatusBadge status="custom-status" />);

      expect(screen.getByText("Custom-status")).toBeInTheDocument();
    });

    it("handles empty string status", () => {
      const { container } = render(<StatusBadge status="" />);

      // Should render empty badge with info styling
      const badge = container.firstChild as HTMLElement;
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-blue-100");
    });
  });

  // Case Sensitivity
  describe("Case Sensitivity", () => {
    it("handles mixed case status", () => {
      render(<StatusBadge status="AcTiVe" />);

      expect(screen.getByText("AcTiVe")).toBeInTheDocument();
    });

    it("normalizes status for styling lookup", () => {
      const { container } = render(<StatusBadge status="ACTIVE" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
    });

    it("normalizes pending in any case", () => {
      const { container } = render(<StatusBadge status="PENDING" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-yellow-100");
    });
  });

  // Combined Props
  describe("Combined Props", () => {
    it("works with all props together", () => {
      const { container } = render(
        <StatusBadge
          status="verified"
          variant="outline"
          size="lg"
          className="custom-badge"
        />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("custom-badge");
      expect(badge.className).toContain("border");
      expect(badge.className).toContain("text-base");
      expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    it("maintains styling with multiple props", () => {
      const { container } = render(
        <StatusBadge
          status="rejected"
          variant="solid"
          size="sm"
          className="ml-2"
        />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("ml-2");
      expect(badge.className).toContain("bg-red-100");
      expect(badge.className).toContain("text-xs");
    });
  });

  // Layout
  describe("Layout", () => {
    it("uses inline-flex display", () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("inline-flex");
    });

    it("centers items", () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("items-center");
    });

    it("renders as span element", () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.tagName).toBe("SPAN");
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles very long status text", () => {
      render(
        <StatusBadge status="this-is-a-very-long-status-text-that-should-still-work" />
      );

      expect(
        screen.getByText(/This-is-a-very-long-status-text/)
      ).toBeInTheDocument();
    });

    it("handles status with special characters", () => {
      render(<StatusBadge status="pending-review" />);

      expect(screen.getByText("Pending-review")).toBeInTheDocument();
    });

    it("handles status with numbers", () => {
      render(<StatusBadge status="level-1" />);

      expect(screen.getByText("Level-1")).toBeInTheDocument();
    });

    it("handles status with spaces", () => {
      render(<StatusBadge status="not found" />);

      expect(screen.getByText("Not found")).toBeInTheDocument();
    });
  });
});
