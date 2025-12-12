import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  describe("Basic Rendering", () => {
    it("renders with status prop", () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("capitalizes first letter of status", () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders default variant", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("dark:bg-green-900/30");
    });

    it("renders medium size by default", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("px-2.5");
      expect(badge).toHaveClass("py-1");
      expect(badge).toHaveClass("text-sm");
    });

    it("has inline-flex display", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("inline-flex");
    });

    it("has items-center class", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("items-center");
    });

    it("has font-medium class", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("font-medium");
    });

    it("has rounded-full class", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("rounded-full");
    });
  });

  describe("Status Types - Active/Inactive", () => {
    it("renders active status with green colors", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
      expect(badge).toHaveClass("dark:bg-green-900/30");
      expect(badge).toHaveClass("dark:text-green-400");
    });

    it("renders inactive status with gray colors", () => {
      const { container } = render(<StatusBadge status="inactive" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
      expect(badge).toHaveClass("dark:bg-gray-700");
    });
  });

  describe("Status Types - Approval States", () => {
    it("renders pending status with yellow colors", () => {
      const { container } = render(<StatusBadge status="pending" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-yellow-100");
      expect(badge).toHaveClass("text-yellow-800");
      expect(badge).toHaveClass("dark:bg-yellow-900/30");
    });

    it("renders approved status with green colors", () => {
      const { container } = render(<StatusBadge status="approved" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("renders rejected status with red colors", () => {
      const { container } = render(<StatusBadge status="rejected" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-red-100");
      expect(badge).toHaveClass("text-red-800");
      expect(badge).toHaveClass("dark:bg-red-900/30");
    });

    it("renders banned status with red colors", () => {
      const { container } = render(<StatusBadge status="banned" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-red-100");
      expect(badge).toHaveClass("text-red-800");
    });
  });

  describe("Status Types - Verification", () => {
    it("renders verified status with blue colors", () => {
      const { container } = render(<StatusBadge status="verified" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-blue-100");
      expect(badge).toHaveClass("text-blue-800");
      expect(badge).toHaveClass("dark:bg-blue-900/30");
    });

    it("renders unverified status with gray colors", () => {
      const { container } = render(<StatusBadge status="unverified" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
    });
  });

  describe("Status Types - Content States", () => {
    it("renders featured status with purple colors", () => {
      const { container } = render(<StatusBadge status="featured" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-purple-100");
      expect(badge).toHaveClass("text-purple-800");
      expect(badge).toHaveClass("dark:bg-purple-900/30");
    });

    it("renders draft status with gray colors", () => {
      const { container } = render(<StatusBadge status="draft" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
    });

    it("renders published status with green colors", () => {
      const { container } = render(<StatusBadge status="published" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("renders archived status with gray colors", () => {
      const { container } = render(<StatusBadge status="archived" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-gray-100");
      expect(badge).toHaveClass("text-gray-800");
    });
  });

  describe("Status Types - General States", () => {
    it("renders success status with green colors", () => {
      const { container } = render(<StatusBadge status="success" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("renders error status with red colors", () => {
      const { container } = render(<StatusBadge status="error" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-red-100");
      expect(badge).toHaveClass("text-red-800");
    });

    it("renders warning status with yellow colors", () => {
      const { container } = render(<StatusBadge status="warning" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-yellow-100");
      expect(badge).toHaveClass("text-yellow-800");
    });

    it("renders info status with blue colors", () => {
      const { container } = render(<StatusBadge status="info" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-blue-100");
      expect(badge).toHaveClass("text-blue-800");
    });
  });

  describe("Variant Styles - Default", () => {
    it("default variant uses background and text colors", () => {
      const { container } = render(
        <StatusBadge status="active" variant="default" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("text-green-800");
    });

    it("default variant does not have border", () => {
      const { container } = render(
        <StatusBadge status="active" variant="default" />
      );
      const badge = container.querySelector("span");
      expect(badge?.className).not.toMatch(/border-green/);
    });
  });

  describe("Variant Styles - Outline", () => {
    it("outline variant has transparent background", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-transparent");
    });

    it("outline variant has border", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("border");
      expect(badge).toHaveClass("border-green-300");
      expect(badge).toHaveClass("dark:border-green-700");
    });

    it("outline variant has text color", () => {
      const { container } = render(
        <StatusBadge status="active" variant="outline" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("text-green-800");
      expect(badge).toHaveClass("dark:text-green-400");
    });
  });

  describe("Variant Styles - Solid", () => {
    it("solid variant uses background colors", () => {
      const { container } = render(
        <StatusBadge status="active" variant="solid" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("dark:bg-green-900/30");
    });

    it("solid variant has text color", () => {
      const { container } = render(
        <StatusBadge status="active" variant="solid" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("text-green-800");
      expect(badge).toHaveClass("dark:text-green-400");
    });
  });

  describe("Size Variants", () => {
    it("small size has correct padding and text", () => {
      const { container } = render(<StatusBadge status="active" size="sm" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("px-2");
      expect(badge).toHaveClass("py-0.5");
      expect(badge).toHaveClass("text-xs");
    });

    it("medium size has correct padding and text", () => {
      const { container } = render(<StatusBadge status="active" size="md" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("px-2.5");
      expect(badge).toHaveClass("py-1");
      expect(badge).toHaveClass("text-sm");
    });

    it("large size has correct padding and text", () => {
      const { container } = render(<StatusBadge status="active" size="lg" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("px-3");
      expect(badge).toHaveClass("py-1.5");
      expect(badge).toHaveClass("text-base");
    });
  });

  describe("Custom className", () => {
    it("applies custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="custom-badge" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("custom-badge");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(
        <StatusBadge status="active" className="ml-2" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("ml-2");
      expect(badge).toHaveClass("inline-flex");
      expect(badge).toHaveClass("rounded-full");
    });
  });

  describe("Case Insensitivity", () => {
    it("handles uppercase status", () => {
      render(<StatusBadge status="ACTIVE" />);
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    });

    it("normalizes status to lowercase for styling", () => {
      const { container } = render(<StatusBadge status="ACTIVE" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-green-100");
    });

    it("handles mixed case status", () => {
      render(<StatusBadge status="AcTiVe" />);
      expect(screen.getByText("AcTiVe")).toBeInTheDocument();
    });

    it("normalizes mixed case for styling", () => {
      const { container } = render(<StatusBadge status="PenDing" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-yellow-100");
    });
  });

  describe("Unknown Status Handling", () => {
    it("renders unknown status text", () => {
      render(<StatusBadge status="custom-status" />);
      expect(screen.getByText("Custom-status")).toBeInTheDocument();
    });

    it("falls back to info styles for unknown status", () => {
      const { container } = render(<StatusBadge status="unknown" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-blue-100");
      expect(badge).toHaveClass("text-blue-800");
    });

    it("handles empty string status", () => {
      const { container } = render(<StatusBadge status="" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("bg-blue-100"); // fallback to info
    });
  });

  describe("Dark Mode Support", () => {
    it("has dark mode classes for active", () => {
      const { container } = render(<StatusBadge status="active" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("dark:bg-green-900/30");
      expect(badge).toHaveClass("dark:text-green-400");
    });

    it("has dark mode classes for pending", () => {
      const { container } = render(<StatusBadge status="pending" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("dark:bg-yellow-900/30");
      expect(badge).toHaveClass("dark:text-yellow-400");
    });

    it("has dark mode classes for rejected", () => {
      const { container } = render(<StatusBadge status="rejected" />);
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("dark:bg-red-900/30");
      expect(badge).toHaveClass("dark:text-red-400");
    });

    it("has dark mode classes for outline variant", () => {
      const { container } = render(
        <StatusBadge status="verified" variant="outline" />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("dark:border-blue-700");
      expect(badge).toHaveClass("dark:text-blue-400");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long status text", () => {
      const longStatus = "ThisIsAVeryLongStatusNameForTesting";
      render(<StatusBadge status={longStatus} />);
      expect(screen.getByText(longStatus)).toBeInTheDocument();
    });

    it("handles status with spaces", () => {
      render(<StatusBadge status="in progress" />);
      expect(screen.getByText("In progress")).toBeInTheDocument();
    });

    it("handles status with special characters", () => {
      render(<StatusBadge status="status-with-dashes" />);
      expect(screen.getByText("Status-with-dashes")).toBeInTheDocument();
    });

    it("handles numeric status", () => {
      render(<StatusBadge status="123" />);
      expect(screen.getByText("123")).toBeInTheDocument();
    });

    it("maintains structure with all props", () => {
      const { container } = render(
        <StatusBadge
          status="active"
          variant="outline"
          size="lg"
          className="custom"
        />
      );
      const badge = container.querySelector("span");
      expect(badge).toHaveClass("custom");
      expect(badge).toHaveClass("px-3");
      expect(badge).toHaveClass("border");
    });
  });

  describe("Multiple Instances", () => {
    it("renders multiple badges independently", () => {
      render(
        <>
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
          <StatusBadge status="rejected" />
        </>
      );
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("applies different variants independently", () => {
      const { container } = render(
        <>
          <StatusBadge status="active" variant="default" />
          <StatusBadge status="pending" variant="outline" />
          <StatusBadge status="error" variant="solid" />
        </>
      );
      const badges = container.querySelectorAll("span");
      expect(badges[0]).toHaveClass("bg-green-100");
      expect(badges[1]).toHaveClass("bg-transparent");
      expect(badges[2]).toHaveClass("bg-red-100");
    });

    it("applies different sizes independently", () => {
      const { container } = render(
        <>
          <StatusBadge status="active" size="sm" />
          <StatusBadge status="pending" size="md" />
          <StatusBadge status="error" size="lg" />
        </>
      );
      const badges = container.querySelectorAll("span");
      expect(badges[0]).toHaveClass("text-xs");
      expect(badges[1]).toHaveClass("text-sm");
      expect(badges[2]).toHaveClass("text-base");
    });
  });

  describe("Text Capitalization", () => {
    it("capitalizes first letter only", () => {
      render(<StatusBadge status="active" />);
      const text = screen.getByText("Active");
      expect(text).toBeInTheDocument();
      expect(text).not.toHaveTextContent("ACTIVE");
    });

    it("preserves rest of string casing", () => {
      render(<StatusBadge status="myCustomStatus" />);
      expect(screen.getByText("MyCustomStatus")).toBeInTheDocument();
    });
  });
});
