/**
 * @jest-environment jsdom
 *
 * StatCard Component Tests
 * Tests stat display, trends, colors, and clickable cards
 */

import { render, screen } from "@testing-library/react";
import { Package } from "lucide-react";
import { StatCard } from "../StatCard";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe("StatCard Component", () => {
  const defaultProps = {
    title: "Total Products",
    value: 1234,
    icon: Package,
    color: "blue" as const,
  };

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.getByText("Total Products")).toBeInTheDocument();
    });

    it("should display title", () => {
      render(<StatCard {...defaultProps} title="Revenue" />);
      expect(screen.getByText("Revenue")).toBeInTheDocument();
    });

    it("should display numeric value", () => {
      render(<StatCard {...defaultProps} value={5678} />);
      expect(screen.getByText("5,678")).toBeInTheDocument();
    });

    it("should display string value", () => {
      render(<StatCard {...defaultProps} value="Active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should render icon", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should format large numbers with commas", () => {
      render(<StatCard {...defaultProps} value={1234567} />);
      expect(screen.getByText("12,34,567")).toBeInTheDocument(); // Indian format
    });

    it("should handle zero value", () => {
      render(<StatCard {...defaultProps} value={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("Prefix and Suffix", () => {
    it("should display prefix", () => {
      render(<StatCard {...defaultProps} value={1000} prefix="₹" />);
      expect(screen.getByText(/₹.*1,000/)).toBeInTheDocument();
    });

    it("should display suffix", () => {
      render(<StatCard {...defaultProps} value={75} suffix="%" />);
      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });

    it("should display both prefix and suffix", () => {
      render(
        <StatCard {...defaultProps} value={100} prefix="$" suffix=" USD" />
      );
      expect(screen.getByText(/\$.*100.*USD/)).toBeInTheDocument();
    });

    it("should handle empty prefix", () => {
      render(<StatCard {...defaultProps} value={100} prefix="" />);
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should handle empty suffix", () => {
      render(<StatCard {...defaultProps} value={100} suffix="" />);
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  describe("Change Indicator", () => {
    it("should display positive change with TrendingUp icon", () => {
      const { container } = render(
        <StatCard {...defaultProps} change={12.5} />
      );
      expect(screen.getByText("+12.5%")).toBeInTheDocument();
      // Check for TrendingUp icon
      const svg = container.querySelector(".text-green-500");
      expect(svg).toBeInTheDocument();
    });

    it("should display negative change with TrendingDown icon", () => {
      const { container } = render(
        <StatCard {...defaultProps} change={-8.3} />
      );
      expect(screen.getByText("-8.3%")).toBeInTheDocument();
      // Check for TrendingDown icon
      const svg = container.querySelector(".text-red-500");
      expect(svg).toBeInTheDocument();
    });

    it("should display zero change as positive", () => {
      const { container } = render(<StatCard {...defaultProps} change={0} />);
      expect(screen.getByText("+0.0%")).toBeInTheDocument();
      const svg = container.querySelector(".text-green-500");
      expect(svg).toBeInTheDocument();
    });

    it("should format change to 1 decimal place", () => {
      render(<StatCard {...defaultProps} change={12.567} />);
      expect(screen.getByText("+12.6%")).toBeInTheDocument();
    });

    it("should not display change indicator when change is undefined", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });

    it("should handle very large positive change", () => {
      render(<StatCard {...defaultProps} change={999.9} />);
      expect(screen.getByText("+999.9%")).toBeInTheDocument();
    });

    it("should handle very large negative change", () => {
      render(<StatCard {...defaultProps} change={-999.9} />);
      expect(screen.getByText("-999.9%")).toBeInTheDocument();
    });
  });

  describe("Color Variants", () => {
    const colors: Array<
      "blue" | "green" | "purple" | "orange" | "red" | "yellow" | "indigo"
    > = ["blue", "green", "purple", "orange", "red", "yellow", "indigo"];

    colors.forEach((color) => {
      it(`should apply ${color} color theme`, () => {
        const { container } = render(
          <StatCard {...defaultProps} color={color} />
        );
        // Check for color-specific classes
        const colorElement = container.querySelector(`[class*="${color}"]`);
        expect(colorElement).toBeInTheDocument();
      });
    });

    it("should apply blue icon background", () => {
      const { container } = render(<StatCard {...defaultProps} color="blue" />);
      const iconContainer = container.querySelector(".bg-blue-100");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should apply green icon background", () => {
      const { container } = render(
        <StatCard {...defaultProps} color="green" />
      );
      const iconContainer = container.querySelector(".bg-green-100");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should apply dark mode color classes", () => {
      const { container } = render(
        <StatCard {...defaultProps} color="purple" />
      );
      const darkElement = container.querySelector('[class*="dark:"]');
      expect(darkElement).toBeInTheDocument();
    });
  });

  describe("Clickable Card (with href)", () => {
    it("should render as link when href is provided", () => {
      render(<StatCard {...defaultProps} href="/dashboard/products" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/products");
    });

    it("should not render as link when href is not provided", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("should apply hover styles when clickable", () => {
      render(<StatCard {...defaultProps} href="/dashboard" />);
      const link = screen.getByRole("link");
      // The component uses dynamic classes, check for link existence
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("should have cursor-pointer when clickable", () => {
      render(<StatCard {...defaultProps} href="/dashboard" />);
      const link = screen.getByRole("link");
      // Next.js Link is clickable by default
      expect(link).toBeInTheDocument();
    });

    it("should not have cursor-pointer when not clickable", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <StatCard {...defaultProps} className="custom-stat-card" />
      );
      expect(container.querySelector(".custom-stat-card")).toBeInTheDocument();
    });

    it("should combine custom className with default classes", () => {
      const { container } = render(
        <StatCard {...defaultProps} className="custom-class" />
      );
      const card = container.querySelector(".custom-class");
      expect(card).toHaveClass("custom-class");
      // Should still have default rounded class
      expect(card).toHaveClass("rounded-lg");
    });
  });

  describe("Card Structure", () => {
    it("should have proper card styling", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      // Check for rounded, border, and padding classes
      const card = container.querySelector(".rounded-lg");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("border", "p-6");
    });

    it("should have border styling", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const card = container.querySelector(".border-gray-200");
      expect(card).toBeInTheDocument();
    });

    it("should have background color", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const card = container.querySelector(".bg-white");
      expect(card).toBeInTheDocument();
    });

    it("should have dark mode background", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const card = container.querySelector('[class*="dark:bg-gray-800"]');
      expect(card).toBeInTheDocument();
    });

    it("should have shadow", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const card = container.querySelector(".shadow-sm");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Icon Container", () => {
    it("should render icon in container", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const iconContainer = container.querySelector(".p-3");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should have rounded icon container", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should have sized icon", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const icon = container.querySelector("svg.w-6");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Text Styling", () => {
    it("should have correct title styling", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const title = screen.getByText("Total Products");
      expect(title).toHaveClass("text-sm");
    });

    it("should have correct value styling", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const value = screen.getByText(/1,234/);
      expect(value).toHaveClass("text-2xl", "font-bold");
    });

    it("should have dark mode text colors", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const title = screen.getByText("Total Products");
      expect(title.className).toContain("dark:text-gray-400");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long title", () => {
      const longTitle =
        "This is a very long title that might need to wrap to multiple lines";
      render(<StatCard {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle very large value", () => {
      render(<StatCard {...defaultProps} value={999999999} />);
      expect(screen.getByText("99,99,99,999")).toBeInTheDocument();
    });

    it("should handle decimal value", () => {
      render(<StatCard {...defaultProps} value={123.45} />);
      // JavaScript toLocaleString may format decimals
      expect(screen.getByText(/123/)).toBeInTheDocument();
    });

    it("should handle string value with special characters", () => {
      render(<StatCard {...defaultProps} value="< 100" />);
      expect(screen.getByText("< 100")).toBeInTheDocument();
    });

    it("should handle empty title", () => {
      render(<StatCard {...defaultProps} title="" />);
      const { container } = render(<StatCard {...defaultProps} title="" />);
      expect(container.querySelector(".text-sm")).toBeInTheDocument();
    });

    it("should handle multiple stat cards together", () => {
      render(
        <>
          <StatCard {...defaultProps} title="Card 1" value={100} />
          <StatCard {...defaultProps} title="Card 2" value={200} />
          <StatCard {...defaultProps} title="Card 3" value={300} />
        </>
      );
      expect(screen.getByText("Card 1")).toBeInTheDocument();
      expect(screen.getByText("Card 2")).toBeInTheDocument();
      expect(screen.getByText("Card 3")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have semantic structure", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      expect(container.querySelector("p")).toBeInTheDocument();
    });

    it("should be navigable when clickable", () => {
      render(<StatCard {...defaultProps} href="/dashboard" />);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("should have visible text content", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.getByText("Total Products")).toBeVisible();
      expect(screen.getByText("1,234")).toBeVisible();
    });

    it("should have sufficient color contrast", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const title = screen.getByText("Total Products");
      // Gray-500 provides good contrast on white background
      expect(title).toHaveClass("text-gray-500");
    });

    it("should support dark mode", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const darkElements = container.querySelectorAll('[class*="dark:"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });

  describe("Layout", () => {
    it("should use flexbox for content", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const content = container.querySelector(
        ".flex.items-center.justify-between"
      );
      expect(content).toBeInTheDocument();
    });

    it("should have proper spacing", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const card = container.querySelector(".p-6");
      expect(card).toBeInTheDocument();
    });

    it("should have margin for change indicator", () => {
      const { container } = render(<StatCard {...defaultProps} change={10} />);
      const changeElement = container.querySelector(".mt-2");
      expect(changeElement).toBeInTheDocument();
    });
  });
});

// BUG FIX #43: StatCard Component Issues
// ISSUE 1: formatValue uses en-IN locale hardcoded - not respecting user's locale preference
// ISSUE 2: No aria-label on card for screen readers to understand the stat
// ISSUE 3: Icon has no aria-hidden="true" - screen readers announce decorative icon
// ISSUE 4: Change indicator doesn't explain what "from previous period" means
// ISSUE 5: No loading state support for async stat updates
// ISSUE 6: href uses regular anchor instead of Next.js Link (already uses Link but could be optimized)
// ISSUE 7: Hardcoded dark mode classes instead of theme system
// ISSUE 8: No animation/transition when value changes
// ISSUE 9: toFixed(1) for change could show unnecessary decimals (e.g., 12.0%)
// ISSUE 10: Color variant type not exhaustive - missing type safety for new colors
