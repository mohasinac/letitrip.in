import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatsCard } from "./StatsCard";
import { Package } from "lucide-react";

describe("StatsCard", () => {
  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders title and value", () => {
      render(<StatsCard title="Total Orders" value={150} />);

      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
    });

    it("renders with string value", () => {
      render(<StatsCard title="Revenue" value="₹1,25,000" />);

      expect(screen.getByText("₹1,25,000")).toBeInTheDocument();
    });

    it("renders with number value", () => {
      render(<StatsCard title="Products" value={42} />);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders with large numbers", () => {
      render(<StatsCard title="Views" value={1234567} />);

      expect(screen.getByText("1234567")).toBeInTheDocument();
    });
  });

  // Icon Display
  describe("Icon Display", () => {
    it("renders with icon when provided", () => {
      const { container } = render(
        <StatsCard
          title="Products"
          value={100}
          icon={<Package data-testid="package-icon" />}
        />,
      );

      expect(screen.getByTestId("package-icon")).toBeInTheDocument();
    });

    it("renders without icon when not provided", () => {
      const { container } = render(
        <StatsCard title="Revenue" value="₹50,000" />,
      );

      const icons = container.querySelectorAll("svg");
      expect(icons).toHaveLength(0);
    });

    it("has correct icon styling", () => {
      const { container } = render(
        <StatsCard
          title="Orders"
          value={25}
          icon={<Package className="custom-class" />}
        />,
      );

      const iconWrapper = container.querySelector(".text-gray-400");
      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toHaveClass("flex-shrink-0");
    });
  });

  // Trend Display
  describe("Trend Display", () => {
    it("shows positive trend with up arrow", () => {
      render(
        <StatsCard
          title="Sales"
          value={100}
          trend={{ value: 15, isPositive: true }}
        />,
      );

      const trendElement = screen.getByText(/↑ 15%/);
      expect(trendElement).toBeInTheDocument();
      expect(trendElement).toHaveClass("text-green-600");
    });

    it("shows negative trend with down arrow", () => {
      render(
        <StatsCard
          title="Returns"
          value={5}
          trend={{ value: 10, isPositive: false }}
        />,
      );

      const trendElement = screen.getByText(/↓ 10%/);
      expect(trendElement).toBeInTheDocument();
      expect(trendElement).toHaveClass("text-red-600");
    });

    it("handles zero trend value", () => {
      render(
        <StatsCard
          title="Neutral"
          value={50}
          trend={{ value: 0, isPositive: true }}
        />,
      );

      expect(screen.getByText(/↑ 0%/)).toBeInTheDocument();
    });

    it("handles large trend values", () => {
      render(
        <StatsCard
          title="Growth"
          value={200}
          trend={{ value: 250, isPositive: true }}
        />,
      );

      expect(screen.getByText(/↑ 250%/)).toBeInTheDocument();
    });

    it("does not render trend when not provided", () => {
      const { container } = render(<StatsCard title="Static" value={100} />);

      const trendElements = container.querySelectorAll(
        ".text-green-600, .text-red-600",
      );
      expect(trendElements).toHaveLength(0);
    });
  });

  // Description Display
  describe("Description Display", () => {
    it("renders description when provided", () => {
      render(
        <StatsCard title="Orders" value={50} description="Last 30 days" />,
      );

      expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      const { container } = render(<StatsCard title="Orders" value={50} />);

      const descriptions = container.querySelectorAll(".text-gray-500");
      // Only title should have gray text, no description
      expect(descriptions.length).toBeLessThanOrEqual(1);
    });

    it("truncates long description", () => {
      render(
        <StatsCard
          title="Info"
          value={10}
          description="This is a very long description that should be truncated"
        />,
      );

      const description = screen.getByText(/This is a very long/);
      expect(description).toHaveClass("truncate");
    });
  });

  // Click Handler
  describe("Click Handler", () => {
    it("calls onClick when card is clicked", () => {
      const mockOnClick = jest.fn();
      const { container } = render(
        <StatsCard title="Clickable" value={100} onClick={mockOnClick} />,
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when not provided", () => {
      const { container } = render(<StatsCard title="Static" value={100} />);

      const card = container.firstChild as HTMLElement;
      expect(() => fireEvent.click(card)).not.toThrow();
    });

    it("has cursor pointer when onClick provided", () => {
      const { container } = render(
        <StatsCard title="Clickable" value={100} onClick={jest.fn()} />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("cursor-pointer");
    });

    it("does not have cursor pointer when onClick not provided", () => {
      const { container } = render(<StatsCard title="Static" value={100} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain("cursor-pointer");
    });

    it("has hover effect when onClick provided", () => {
      const { container } = render(
        <StatsCard title="Hoverable" value={100} onClick={jest.fn()} />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("hover:shadow-lg");
    });
  });

  // Custom Styling
  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <StatsCard title="Custom" value={100} className="custom-class" />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });

    it("preserves base classes with custom className", () => {
      const { container } = render(
        <StatsCard title="Custom" value={100} className="extra-class" />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-white", "rounded-lg", "shadow");
      expect(card).toHaveClass("extra-class");
    });

    it("has default padding", () => {
      const { container } = render(<StatsCard title="Test" value={100} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/p-3|p-6/);
    });
  });

  // Layout
  describe("Layout", () => {
    it("has proper title styling", () => {
      render(<StatsCard title="Test Title" value={100} />);

      const title = screen.getByText("Test Title");
      expect(title).toHaveClass("text-gray-500", "truncate");
    });

    it("has proper value styling", () => {
      render(<StatsCard title="Test" value={100} />);

      const value = screen.getByText("100");
      expect(value).toHaveClass("font-bold", "text-gray-900");
    });

    it("arranges title and icon horizontally", () => {
      const { container } = render(
        <StatsCard
          title="Test"
          value={100}
          icon={<Package data-testid="icon" />}
        />,
      );

      const headerDiv = container.querySelector(".flex.items-center");
      expect(headerDiv).toBeInTheDocument();
    });

    it("arranges value and trend horizontally", () => {
      const { container } = render(
        <StatsCard
          title="Test"
          value={100}
          trend={{ value: 10, isPositive: true }}
        />,
      );

      const valueDiv = container.querySelector(".flex.items-baseline");
      expect(valueDiv).toBeInTheDocument();
    });
  });

  // Responsive Design
  describe("Responsive Design", () => {
    it("has responsive text sizes for title", () => {
      render(<StatsCard title="Responsive" value={100} />);

      const title = screen.getByText("Responsive");
      expect(title.className).toMatch(/text-xs.*md:text-sm/);
    });

    it("has responsive text sizes for value", () => {
      render(<StatsCard title="Test" value={100} />);

      const value = screen.getByText("100");
      expect(value.className).toMatch(/text-xl.*md:text-2xl/);
    });

    it("has responsive padding", () => {
      const { container } = render(<StatsCard title="Test" value={100} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/p-3.*md:p-6/);
    });

    it("has responsive gap sizes", () => {
      render(
        <StatsCard
          title="Test"
          value={100}
          trend={{ value: 5, isPositive: true }}
        />,
      );

      const valueContainer = screen.getByText("100").parentElement;
      expect(valueContainer?.className).toMatch(/gap-1.*md:gap-2/);
    });
  });

  // Complete Component
  describe("Complete Component", () => {
    it("renders with all props", () => {
      const mockOnClick = jest.fn();
      render(
        <StatsCard
          title="Complete Stats"
          value="₹1,00,000"
          icon={<Package data-testid="icon" />}
          trend={{ value: 25, isPositive: true }}
          description="Last month"
          className="custom-class"
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("Complete Stats")).toBeInTheDocument();
      expect(screen.getByText("₹1,00,000")).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText(/↑ 25%/)).toBeInTheDocument();
      expect(screen.getByText("Last month")).toBeInTheDocument();
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles empty string value", () => {
      render(<StatsCard title="Empty" value="" />);

      // Empty value should still render, even if not visible
      const card = screen.getByText("Empty").parentElement?.parentElement;
      expect(card).toBeInTheDocument();
    });

    it("handles zero value", () => {
      render(<StatsCard title="Zero" value={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles negative values", () => {
      render(<StatsCard title="Negative" value={-50} />);

      expect(screen.getByText("-50")).toBeInTheDocument();
    });

    it("handles very long titles", () => {
      render(
        <StatsCard
          title="This is a very long title that should be truncated properly"
          value={100}
        />,
      );

      const title = screen.getByText(/This is a very long/);
      expect(title).toHaveClass("truncate");
    });

    it("handles decimal trend values", () => {
      render(
        <StatsCard
          title="Decimal"
          value={100}
          trend={{ value: 12.5, isPositive: true }}
        />,
      );

      expect(screen.getByText(/↑ 12.5%/)).toBeInTheDocument();
    });
  });
});
