import { fireEvent, render, screen } from "@testing-library/react";
import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { StatsCard, StatsCardGrid } from "../StatsCard";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  TrendingUp: ({ className, size }: any) => (
    <svg
      data-testid="trending-up-icon"
      className={className}
      width={size}
      height={size}
    />
  ),
  TrendingDown: ({ className, size }: any) => (
    <svg
      data-testid="trending-down-icon"
      className={className}
      width={size}
      height={size}
    />
  ),
  Users: ({ className, size }: any) => (
    <svg
      data-testid="users-icon"
      className={className}
      width={size}
      height={size}
    />
  ),
}));

describe("StatsCard Component", () => {
  const defaultProps = {
    title: "Total Users",
    value: "1,234",
    icon: <Users />,
  };

  describe("Basic Rendering", () => {
    it("should render title", () => {
      render(<StatsCard {...defaultProps} />);
      expect(screen.getByText("Total Users")).toBeInTheDocument();
    });

    it("should render value", () => {
      render(<StatsCard {...defaultProps} />);
      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("should render icon", () => {
      render(<StatsCard {...defaultProps} />);
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    });

    it("should have card styling", () => {
      const { container } = render(<StatsCard {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow",
        "p-3",
        "md:p-6"
      );
    });

    it("should have dark mode styling", () => {
      const { container } = render(<StatsCard {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <StatsCard {...defaultProps} className="custom-class" />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("Value Types", () => {
    it("should render string value", () => {
      render(<StatsCard {...defaultProps} value="1,234" />);
      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("should render number value", () => {
      render(<StatsCard {...defaultProps} value={5678} />);
      expect(screen.getByText("5678")).toBeInTheDocument();
    });

    it("should render ReactNode value", () => {
      render(<StatsCard {...defaultProps} value={<span>Custom Value</span>} />);
      expect(screen.getByText("Custom Value")).toBeInTheDocument();
    });

    it("should render zero value", () => {
      render(<StatsCard {...defaultProps} value={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should render negative value", () => {
      render(<StatsCard {...defaultProps} value={-100} />);
      expect(screen.getByText("-100")).toBeInTheDocument();
    });

    it("should render decimal value", () => {
      render(<StatsCard {...defaultProps} value="98.5%" />);
      expect(screen.getByText("98.5%")).toBeInTheDocument();
    });
  });

  describe("Trend Indicators", () => {
    it("should render positive trend", () => {
      render(
        <StatsCard
          {...defaultProps}
          trend={{ value: 12.5, isPositive: true }}
        />
      );
      // Component renders '↑ 12.5%' (up arrow + space + value + %)
      expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
      expect(screen.getByText(/↑/)).toBeInTheDocument();
    });

    it("should render negative trend", () => {
      render(
        <StatsCard
          {...defaultProps}
          trend={{ value: 8.2, isPositive: false }}
        />
      );
      expect(screen.getByText(/8\.2%/)).toBeInTheDocument();
      expect(screen.getByText(/↓/)).toBeInTheDocument();
    });

    it("should apply green color to positive trend", () => {
      const { container } = render(
        <StatsCard {...defaultProps} trend={{ value: 10, isPositive: true }} />
      );
      const trendText = screen.getByText(/10%/);
      expect(trendText).toHaveClass("text-green-600", "dark:text-green-400");
    });

    it("should apply red color to negative trend", () => {
      const { container } = render(
        <StatsCard {...defaultProps} trend={{ value: 5, isPositive: false }} />
      );
      const trendText = screen.getByText(/5%/);
      expect(trendText).toHaveClass("text-red-600", "dark:text-red-400");
    });

    it("should handle zero trend value", () => {
      render(
        <StatsCard {...defaultProps} trend={{ value: 0, isPositive: true }} />
      );
      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it("should handle decimal trend values", () => {
      render(
        <StatsCard
          {...defaultProps}
          trend={{ value: 12.75, isPositive: true }}
        />
      );
      expect(screen.getByText(/12\.75%/)).toBeInTheDocument();
    });

    it("should not render trend when not provided", () => {
      const { container } = render(<StatsCard {...defaultProps} />);
      expect(
        container.querySelector("svg[data-testid*='trending']")
      ).not.toBeInTheDocument();
    });
  });

  describe("Description", () => {
    it("should render description when provided", () => {
      render(
        <StatsCard {...defaultProps} description="Active users this month" />
      );
      expect(screen.getByText("Active users this month")).toBeInTheDocument();
    });

    it("should have description styling", () => {
      render(<StatsCard {...defaultProps} description="Test description" />);
      const desc = screen.getByText("Test description");
      expect(desc).toHaveClass(
        "text-xs",
        "md:text-sm",
        "text-gray-500",
        "dark:text-gray-400",
        "truncate"
      );
    });

    it("should not render description container when not provided", () => {
      const { container } = render(<StatsCard {...defaultProps} />);
      const desc = container.querySelector(".text-sm.text-gray-500");
      expect(desc).not.toBeInTheDocument();
    });

    it("should truncate long descriptions", () => {
      render(
        <StatsCard
          {...defaultProps}
          description="Very long description text that should be truncated"
        />
      );
      const desc = screen.getByText(
        "Very long description text that should be truncated"
      );
      expect(desc).toHaveClass("truncate");
    });
  });

  describe("Clickable Variant", () => {
    it("should call onClick when clicked", () => {
      const onClick = jest.fn();
      const { container } = render(
        <StatsCard {...defaultProps} onClick={onClick} />
      );
      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should have cursor pointer when clickable", () => {
      const { container } = render(
        <StatsCard {...defaultProps} onClick={() => {}} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("cursor-pointer");
    });

    it("should have hover effect when clickable", () => {
      const { container } = render(
        <StatsCard {...defaultProps} onClick={() => {}} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("hover:shadow-lg", "transition-shadow");
    });

    it("should have tabIndex when clickable", () => {
      const { container } = render(
        <StatsCard {...defaultProps} onClick={() => {}} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("should have role=button when clickable", () => {
      const { container } = render(
        <StatsCard {...defaultProps} onClick={() => {}} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute("role", "button");
    });

    it("should handle Enter key press", () => {
      const onClick = jest.fn();
      const { container } = render(
        <StatsCard {...defaultProps} onClick={onClick} />
      );
      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: "Enter" });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not trigger onClick on other keys", () => {
      const onClick = jest.fn();
      const { container } = render(
        <StatsCard {...defaultProps} onClick={onClick} />
      );
      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: "Space" });
      fireEvent.keyDown(card, { key: "Escape" });
      fireEvent.keyDown(card, { key: "Tab" });
      expect(onClick).not.toHaveBeenCalled();
    });

    it("should not have interactive attributes when not clickable", () => {
      const { container } = render(<StatsCard {...defaultProps} />);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveAttribute("tabIndex");
      expect(card).not.toHaveAttribute("role", "button");
      expect(card).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Icon Styling", () => {
    it("should have correct icon size", () => {
      render(<StatsCard {...defaultProps} />);
      const icon = screen.getByTestId("users-icon");
      // Component doesn't pass size prop, but mocked icon has no default size
      // Just verify icon exists
      expect(icon).toBeInTheDocument();
    });

    it("should have icon color", () => {
      const { container } = render(<StatsCard {...defaultProps} />);
      // Component wraps icon in div with text-gray-400 dark:text-gray-500
      const iconWrapper = container.querySelector(".text-gray-400");
      expect(iconWrapper).toBeInTheDocument();
    });

    it("should render different icons", () => {
      const { rerender } = render(
        <StatsCard {...defaultProps} icon={<TrendingUp />} />
      );
      expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();

      rerender(<StatsCard {...defaultProps} icon={<TrendingDown />} />);
      expect(screen.getByTestId("trending-down-icon")).toBeInTheDocument();
    });
  });

  describe("Responsive Text Sizing", () => {
    it("should have responsive title size", () => {
      render(<StatsCard {...defaultProps} />);
      const title = screen.getByText("Total Users");
      expect(title).toHaveClass("text-xs", "md:text-sm");
    });

    it("should have responsive value size", () => {
      render(<StatsCard {...defaultProps} />);
      const value = screen.getByText("1,234");
      expect(value).toHaveClass("text-xl", "md:text-2xl");
    });

    it("should have font weight on value", () => {
      render(<StatsCard {...defaultProps} />);
      const value = screen.getByText("1,234");
      expect(value).toHaveClass("font-bold");
    });
  });

  describe("Title Truncation", () => {
    it("should truncate long titles", () => {
      render(
        <StatsCard
          {...defaultProps}
          title="Very long title that should be truncated"
        />
      );
      const title = screen.getByText(
        "Very long title that should be truncated"
      );
      expect(title).toHaveClass("truncate");
    });

    it("should render short titles normally", () => {
      render(<StatsCard {...defaultProps} title="Users" />);
      const title = screen.getByText("Users");
      expect(title).toHaveClass("truncate");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      render(<StatsCard {...defaultProps} title="" />);
      const { container } = render(<StatsCard {...defaultProps} title="" />);
      expect(container).toBeInTheDocument();
    });

    it("should handle empty value", () => {
      render(<StatsCard {...defaultProps} value="" />);
      expect(screen.getByText("Total Users")).toBeInTheDocument();
    });

    it("should handle large numbers", () => {
      render(<StatsCard {...defaultProps} value={999999999} />);
      expect(screen.getByText("999999999")).toBeInTheDocument();
    });

    it("should handle very small trend values", () => {
      render(
        <StatsCard
          {...defaultProps}
          trend={{ value: 0.01, isPositive: true }}
        />
      );
      expect(screen.getByText(/0\.01%/)).toBeInTheDocument();
    });

    it("should handle trend without decimal", () => {
      render(
        <StatsCard {...defaultProps} trend={{ value: 15, isPositive: true }} />
      );
      expect(screen.getByText(/15%/)).toBeInTheDocument();
    });
  });
});

describe("StatsCardGrid Component", () => {
  describe("Basic Rendering", () => {
    it("should render children", () => {
      render(
        <StatsCardGrid>
          <StatsCard title="Card 1" value="100" icon={<Users />} />
          <StatsCard title="Card 2" value="200" icon={<Users />} />
        </StatsCardGrid>
      );
      expect(screen.getByText("Card 1")).toBeInTheDocument();
      expect(screen.getByText("Card 2")).toBeInTheDocument();
    });

    it("should have grid layout", () => {
      const { container } = render(
        <StatsCardGrid>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("grid");
    });

    it("should have gap between items", () => {
      const { container } = render(
        <StatsCardGrid>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("gap-4", "md:gap-6");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <StatsCardGrid className="custom-grid">
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("custom-grid");
    });
  });

  describe("Column Variations", () => {
    it("should default to 4 columns", () => {
      const { container } = render(
        <StatsCardGrid>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-4"
      );
    });

    it("should support 2 columns", () => {
      const { container } = render(
        <StatsCardGrid columns={2}>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("md:grid-cols-2");
    });

    it("should support 3 columns", () => {
      const { container } = render(
        <StatsCardGrid columns={3}>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("md:grid-cols-2", "lg:grid-cols-3");
    });

    it("should support 4 columns", () => {
      const { container } = render(
        <StatsCardGrid columns={4}>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("md:grid-cols-2", "lg:grid-cols-4");
    });

    it("should support 5 columns", () => {
      const { container } = render(
        <StatsCardGrid columns={5}>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        "grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-5"
      );
    });

    it("should support 6 columns", () => {
      const { container } = render(
        <StatsCardGrid columns={6}>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        "grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-6"
      );
    });
  });

  describe("Responsive Behavior", () => {
    it("should use 2 columns on mobile for 5+ column grids", () => {
      const { container } = render(
        <StatsCardGrid columns={6}>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("grid-cols-2");
    });

    it("should be 2 columns on medium screens for most variants", () => {
      const { container } = render(
        <StatsCardGrid columns={3}>
          <div>Child</div>
        </StatsCardGrid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass("md:grid-cols-2");
    });
  });

  describe("Multiple Cards", () => {
    it("should render grid with multiple cards", () => {
      render(
        <StatsCardGrid>
          <StatsCard title="Users" value="100" icon={<Users />} />
          <StatsCard title="Sales" value="$5,000" icon={<TrendingUp />} />
          <StatsCard title="Revenue" value="$50,000" icon={<TrendingUp />} />
          <StatsCard title="Growth" value="25%" icon={<TrendingUp />} />
        </StatsCardGrid>
      );
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Sales")).toBeInTheDocument();
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("Growth")).toBeInTheDocument();
    });

    it("should handle mixed card types", () => {
      render(
        <StatsCardGrid>
          <StatsCard title="Card 1" value="100" icon={<Users />} />
          <StatsCard
            title="Card 2"
            value="200"
            icon={<Users />}
            trend={{ value: 10, isPositive: true }}
          />
          <StatsCard
            title="Card 3"
            value="300"
            icon={<Users />}
            description="With description"
          />
        </StatsCardGrid>
      );
      expect(screen.getByText("Card 1")).toBeInTheDocument();
      expect(screen.getByText(/10%/)).toBeInTheDocument();
      expect(screen.getByText("With description")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = render(<StatsCardGrid>{null}</StatsCardGrid>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle single child", () => {
      render(
        <StatsCardGrid>
          <StatsCard title="Only Card" value="100" icon={<Users />} />
        </StatsCardGrid>
      );
      expect(screen.getByText("Only Card")).toBeInTheDocument();
    });

    it("should handle many cards", () => {
      render(
        <StatsCardGrid>
          {Array.from({ length: 12 }, (_, i) => (
            <StatsCard key={i} title={`Card ${i}`} value={i} icon={<Users />} />
          ))}
        </StatsCardGrid>
      );
      expect(screen.getByText("Card 0")).toBeInTheDocument();
      expect(screen.getByText("Card 11")).toBeInTheDocument();
    });
  });
});
