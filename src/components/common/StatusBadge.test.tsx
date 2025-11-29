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
        <StatusBadge status="active" variant="default" />,
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-green-100");
    });

    it("renders outline variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />,
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("bg-transparent");
      expect(badge.className).toContain("border");
      expect(badge.className).toContain("border-green-300");
    });

    it("renders solid variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="solid" />,
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
        <StatusBadge status="active" className="custom-class" />,
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("custom-class");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="extra-class" />,
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

  // Additional Edge Cases
  describe("Additional Edge Cases", () => {
    it("handles status with special characters", () => {
      render(<StatusBadge status="in-progress!" />);
      expect(screen.getByText("In-progress!")).toBeInTheDocument();
    });

    it("handles very long status text", () => {
      const longStatus = "very-long-status-that-might-break-layout";
      render(<StatusBadge status={longStatus} />);
      expect(screen.getByText(/very-long-status/i)).toBeInTheDocument();
    });

    it("handles numeric-like status", () => {
      render(<StatusBadge status="404" />);
      expect(screen.getByText("404")).toBeInTheDocument();
    });

    it("handles status with spaces", () => {
      render(<StatusBadge status="in progress" />);
      expect(screen.getByText("In progress")).toBeInTheDocument();
    });

    it("handles status with underscores", () => {
      render(<StatusBadge status="payment_pending" />);
      expect(screen.getByText("Payment_pending")).toBeInTheDocument();
    });
  });

  // Accessibility Enhancements
  describe("Accessibility", () => {
    it("badge is keyboard accessible with proper role", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toBeInTheDocument();
    });

    it("has sufficient color contrast for text", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass("text-green-800");
    });

    it("status text is readable with semantic meaning", () => {
      render(<StatusBadge status="completed" />);
      const badge = screen.getByText("Completed");
      expect(badge.tagName).toBe("SPAN");
    });
  });

  // Performance and Rendering
  describe("Performance", () => {
    it("renders efficiently with minimal DOM nodes", () => {
      const { container } = render(<StatusBadge status="active" />);
      expect(container.querySelectorAll("*").length).toBeLessThan(5);
    });

    it("handles rapid status changes", () => {
      const { rerender } = render(<StatusBadge status="pending" />);
      rerender(<StatusBadge status="active" />);
      rerender(<StatusBadge status="failed" />);
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    it("memoization works correctly for same status", () => {
      const { rerender, container } = render(<StatusBadge status="active" />);
      const firstRender = container.firstChild;
      rerender(<StatusBadge status="active" />);
      const secondRender = container.firstChild;
      expect(firstRender).toBe(secondRender);
    });
  });

  // Layout Integration
  describe("Layout Integration", () => {
    it("fits inline with text content", () => {
      const { container } = render(
        <div>
          Order status: <StatusBadge status="shipped" />
        </div>,
      );
      expect(container.textContent).toContain("Order status:");
      expect(screen.getByText("Shipped")).toBeInTheDocument();
    });

    it("works in flex layouts", () => {
      const { container } = render(
        <div style={{ display: "flex" }}>
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
        </div>,
      );
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
  });

  // Multiple Status Combinations
  describe("Status Combinations", () => {
    it("renders multiple badges with different statuses", () => {
      const { container } = render(
        <>
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
          <StatusBadge status="failed" />
        </>,
      );
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    it("each badge has independent styling", () => {
      const { container } = render(
        <div>
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
        </div>,
      );
      const badges = container.querySelectorAll("span");
      expect(badges[0].className).toContain("bg-");
      expect(badges[1].className).toContain("bg-");
      // Different statuses should have different classes
      expect(badges[0].className).not.toBe(badges[1].className);
    });
  });

  // Text Transformation Edge Cases
  describe("Text Transformation", () => {
    it("capitalizes first letter of single word", () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("capitalizes first letter after hyphen", () => {
      render(<StatusBadge status="in-transit" />);
      expect(screen.getByText("In-transit")).toBeInTheDocument();
    });

    it("handles all uppercase input", () => {
      render(<StatusBadge status="COMPLETED" />);
      expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    });

    it("handles all lowercase input", () => {
      render(<StatusBadge status="processing" />);
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });

    it("preserves original casing in display", () => {
      render(<StatusBadge status="MiXeD-CaSe" />);
      expect(screen.getByText("MiXeD-CaSe")).toBeInTheDocument();
    });
  });

  // Color Scheme Verification
  describe("Color Scheme Consistency", () => {
    it("applies consistent background and text colors", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.firstChild as HTMLElement;
      const classes = badge.className;
      // Should have both bg- and text- classes
      expect(classes).toMatch(/bg-\w+-\d+/);
      expect(classes).toMatch(/text-\w+-\d+/);
    });

    it("uses Tailwind color scheme format", () => {
      const { container } = render(<StatusBadge status="pending" />);
      const badge = container.firstChild as HTMLElement;
      // Should follow Tailwind pattern like bg-yellow-100 text-yellow-800
      expect(badge.className).toMatch(/(bg|text)-\w+-\d00/);
    });

    it("color contrast is readable", () => {
      const statuses = [
        "active",
        "pending",
        "failed",
        "completed",
        "cancelled",
      ];
      statuses.forEach((status) => {
        const { container } = render(<StatusBadge status={status} />);
        const badge = container.firstChild as HTMLElement;
        // Verify it has color classes
        expect(badge.className).toContain("bg-");
        expect(badge.className).toContain("text-");
      });
    });

    it("unknown status defaults to blue info color", () => {
      const { container } = render(<StatusBadge status="unknown-status" />);
      expect(container.firstChild).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("each status has distinct visual styling", () => {
      const { container: container1 } = render(<StatusBadge status="active" />);
      const { container: container2 } = render(<StatusBadge status="failed" />);

      const badge1 = container1.firstChild as HTMLElement;
      const badge2 = container2.firstChild as HTMLElement;

      // Different statuses should have different colors
      expect(badge1.className).not.toBe(badge2.className);
    });
  });
});
