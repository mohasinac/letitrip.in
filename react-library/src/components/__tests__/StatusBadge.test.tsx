import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../tables/StatusBadge";

describe("StatusBadge", () => {
  describe("Rendering", () => {
    it("renders with status text", () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("capitalizes status text", () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("handles uppercase status", () => {
      render(<StatusBadge status="ACTIVE" />);
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    });

    it("handles mixed case status", () => {
      render(<StatusBadge status="FeAtUrEd" />);
      expect(screen.getByText("FeAtUrEd")).toBeInTheDocument();
    });
  });

  describe("Status Types", () => {
    it("renders active status with correct styles", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("renders inactive status with correct styles", () => {
      const { container } = render(<StatusBadge status="inactive" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
    });

    it("renders pending status with correct styles", () => {
      const { container } = render(<StatusBadge status="pending" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-yellow-100");
      expect(badge).toHaveClass("text-yellow-800");
    });

    it("renders approved status with correct styles", () => {
      const { container } = render(<StatusBadge status="approved" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("renders rejected status with correct styles", () => {
      const { container } = render(<StatusBadge status="rejected" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-red-100");
      expect(badge).toHaveClass("text-red-800");
    });

    it("renders banned status with correct styles", () => {
      const { container } = render(<StatusBadge status="banned" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-red-100");
      expect(badge).toHaveClass("text-red-800");
    });

    it("renders verified status with correct styles", () => {
      const { container } = render(<StatusBadge status="verified" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-blue-100");
      expect(badge).toHaveClass("text-blue-800");
    });

    it("renders unverified status with correct styles", () => {
      const { container } = render(<StatusBadge status="unverified" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
    });

    it("renders featured status with correct styles", () => {
      const { container } = render(<StatusBadge status="featured" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-purple-100");
      expect(badge).toHaveClass("text-purple-800");
    });

    it("renders draft status with correct styles", () => {
      const { container } = render(<StatusBadge status="draft" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
    });

    it("renders published status with correct styles", () => {
      const { container } = render(<StatusBadge status="published" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("renders archived status with correct styles", () => {
      const { container } = render(<StatusBadge status="archived" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
    });

    it("renders success status with correct styles", () => {
      const { container } = render(<StatusBadge status="success" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("renders error status with correct styles", () => {
      const { container } = render(<StatusBadge status="error" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-red-100");
      expect(badge).toHaveClass("text-red-800");
    });

    it("renders warning status with correct styles", () => {
      const { container } = render(<StatusBadge status="warning" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-yellow-100");
      expect(badge).toHaveClass("text-yellow-800");
    });

    it("renders info status with correct styles", () => {
      const { container } = render(<StatusBadge status="info" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-blue-100");
      expect(badge).toHaveClass("text-blue-800");
    });

    it("falls back to info style for unknown status", () => {
      const { container } = render(<StatusBadge status="custom-unknown" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-blue-100");
      expect(badge).toHaveClass("text-blue-800");
    });
  });

  describe("Variants", () => {
    it("renders default variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="default" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
      expect(badge).not.toHaveClass("border");
    });

    it("renders outline variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-transparent");
      expect(badge).toHaveClass("text-green-800");
      expect(badge).toHaveClass("border");
      expect(badge).toHaveClass("border-green-300");
    });

    it("renders solid variant", () => {
      const { container } = render(
        <StatusBadge status="active" variant="solid" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });
  });

  describe("Sizes", () => {
    it("renders small size", () => {
      const { container } = render(<StatusBadge status="active" size="sm" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("py-0.5");
      expect(badge).toHaveClass("text-xs");
    });

    it("renders medium size (default)", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("px-2.5");
      expect(badge).toHaveClass("py-1");
      expect(badge).toHaveClass("text-sm");
    });

    it("renders large size", () => {
      const { container } = render(<StatusBadge status="active" size="lg" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("px-3");
      expect(badge).toHaveClass("py-1.5");
      expect(badge).toHaveClass("text-base");
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="custom-badge" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("custom-badge");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="custom-badge" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("items-center");
      expect(badge).toHaveClass("font-medium");
      expect(badge).toHaveClass("rounded-full");
      expect(badge).toHaveClass("custom-badge");
    });

    it("supports custom status styles", () => {
      const customStyles = {
        custom: {
          bg: "bg-custom-100",
          text: "text-custom-800",
          border: "border-custom-300",
        },
      };
      const { container } = render(
        <StatusBadge status="custom" statusStyles={customStyles} />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-custom-100");
      expect(badge).toHaveClass("text-custom-800");
    });

    it("allows overriding default status styles", () => {
      const customStyles = {
        active: {
          bg: "bg-custom-active",
          text: "text-custom-active",
          border: "border-custom-active",
        },
      };
      const { container } = render(
        <StatusBadge status="active" statusStyles={customStyles} />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-custom-active");
      expect(badge).toHaveClass("text-custom-active");
      expect(badge).not.toHaveClass("bg-green-100");
    });
  });

  describe("Case Handling", () => {
    it("normalizes status to lowercase for style matching", () => {
      const { container: container1 } = render(<StatusBadge status="ACTIVE" />);
      const { container: container2 } = render(<StatusBadge status="active" />);

      const badge1 = container1.querySelector("span");
      const badge2 = container2.querySelector("span");

      // Both should have same styles (normalized to lowercase)
      expect(badge1?.className).toContain("bg-green-100");
      expect(badge2?.className).toContain("bg-green-100");
    });

    it("preserves original case in displayed text", () => {
      render(<StatusBadge status="ACTIVE" />);
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
      expect(screen.queryByText("Active")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string status", () => {
      const { container } = render(<StatusBadge status="" />);
      const badge = container.querySelector("span");
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe("");
    });

    it("handles status with spaces", () => {
      render(<StatusBadge status="in progress" />);
      expect(screen.getByText("In progress")).toBeInTheDocument();
    });

    it("handles status with special characters", () => {
      render(<StatusBadge status="step-1" />);
      expect(screen.getByText("Step-1")).toBeInTheDocument();
    });

    it("handles status with numbers", () => {
      render(<StatusBadge status="level-5" />);
      expect(screen.getByText("Level-5")).toBeInTheDocument();
    });
  });
});
