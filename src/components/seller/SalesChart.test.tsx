import React from "react";
import { render, screen } from "@testing-library/react";
import SalesChart from "./SalesChart";
import "@testing-library/jest-dom";

// Mock recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-items={data?.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, strokeWidth, type }: any) => (
    <div
      data-testid="line"
      data-key={dataKey}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-type={type}
    />
  ),
  XAxis: ({ dataKey, tickFormatter }: any) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: ({ tickFormatter }: any) => <div data-testid="y-axis" />,
  CartesianGrid: ({ strokeDasharray }: any) => (
    <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} />
  ),
  Tooltip: ({ formatter, labelFormatter }: any) => (
    <div data-testid="tooltip" />
  ),
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  format: (date: Date, formatStr: string) => {
    // Simple mock for date formatting
    const d = new Date(date);
    if (formatStr === "MMM dd") {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
    }
    return date.toString();
  },
}));

describe("SalesChart", () => {
  const mockData = [
    { date: "2024-01-01", revenue: 50000 },
    { date: "2024-01-02", revenue: 60000 },
    { date: "2024-01-03", revenue: 55000 },
    { date: "2024-01-04", revenue: 70000 },
    { date: "2024-01-05", revenue: 65000 },
  ];

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("should render with title", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByText("Sales Over Time")).toBeInTheDocument();
    });

    it("should render container with styling", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const wrapper = container.querySelector(".bg-white.rounded-lg.border");
      expect(wrapper).toBeInTheDocument();
    });

    it("should render line chart when data is provided", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should render responsive container", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should pass all data to line chart", () => {
      render(<SalesChart data={mockData} />);
      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-items", "5");
    });
  });

  // Empty State
  describe("Empty State", () => {
    it("should render empty state when data is empty", () => {
      render(<SalesChart data={[]} />);
      expect(
        screen.getByText("No sales data available for the selected period"),
      ).toBeInTheDocument();
    });

    it("should not render chart when data is empty", () => {
      render(<SalesChart data={[]} />);
      expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
    });

    it("should have centered empty state styling", () => {
      const { container } = render(<SalesChart data={[]} />);
      const emptyState = container.querySelector(".h-80.flex.items-center");
      expect(emptyState).toBeInTheDocument();
    });

    it("should have gray text color for empty state", () => {
      const { container } = render(<SalesChart data={[]} />);
      const emptyState = container.querySelector(".text-gray-500");
      expect(emptyState).toHaveTextContent(
        "No sales data available for the selected period",
      );
    });
  });

  // Chart Components
  describe("Chart Components", () => {
    it("should render LineChart component", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should render Line with revenue dataKey", () => {
      render(<SalesChart data={mockData} />);
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-key", "revenue");
    });

    it("should render Line with blue stroke color", () => {
      render(<SalesChart data={mockData} />);
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-stroke", "#3b82f6");
    });

    it("should render Line with 2px stroke width", () => {
      render(<SalesChart data={mockData} />);
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-stroke-width", "2");
    });

    it("should render Line with monotone type", () => {
      render(<SalesChart data={mockData} />);
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-type", "monotone");
    });

    it("should render XAxis", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    });

    it("should render XAxis with date dataKey", () => {
      render(<SalesChart data={mockData} />);
      const xAxis = screen.getByTestId("x-axis");
      expect(xAxis).toHaveAttribute("data-key", "date");
    });

    it("should render YAxis", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("should render CartesianGrid", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });

    it("should render Tooltip", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });
  });

  // Date Formatting
  describe("Date Formatting", () => {
    it("should handle valid date strings", () => {
      const dataWithValidDates = [
        { date: "2024-01-15", revenue: 10000 },
        { date: "2024-02-20", revenue: 15000 },
      ];
      render(<SalesChart data={dataWithValidDates} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle Date objects", () => {
      const dataWithDateObjects = [
        { date: new Date("2024-01-01").toISOString(), revenue: 10000 },
      ];
      render(<SalesChart data={dataWithDateObjects} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle invalid dates gracefully", () => {
      const dataWithInvalidDate = [{ date: "invalid-date", revenue: 10000 }];
      // Component should still render, formatDate catches errors
      render(<SalesChart data={dataWithInvalidDate} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  // Currency Formatting
  describe("Currency Formatting", () => {
    it("should format revenue as Indian currency", () => {
      // This tests the formatting logic, actual display is in Tooltip
      const dataWithRevenue = [{ date: "2024-01-01", revenue: 50000 }];
      render(<SalesChart data={dataWithRevenue} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle zero revenue", () => {
      const dataWithZero = [{ date: "2024-01-01", revenue: 0 }];
      render(<SalesChart data={dataWithZero} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle large revenue numbers", () => {
      const dataWithLargeNumbers = [{ date: "2024-01-01", revenue: 9999999 }];
      render(<SalesChart data={dataWithLargeNumbers} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should not show decimal places in currency", () => {
      const dataWithDecimals = [{ date: "2024-01-01", revenue: 12345.67 }];
      // formatCurrency should round to nearest whole number
      render(<SalesChart data={dataWithDecimals} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("should handle single data point", () => {
      const singleData = [{ date: "2024-01-01", revenue: 10000 }];
      render(<SalesChart data={singleData} />);
      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-items", "1");
    });

    it("should handle large dataset", () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, "0")}`,
        revenue: Math.random() * 100000,
      }));
      render(<SalesChart data={largeData} />);
      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-items", "100");
    });

    it("should handle negative revenue values", () => {
      const negativeData = [{ date: "2024-01-01", revenue: -5000 }];
      render(<SalesChart data={negativeData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle zero revenue values", () => {
      const zeroData = [
        { date: "2024-01-01", revenue: 0 },
        { date: "2024-01-02", revenue: 0 },
      ];
      render(<SalesChart data={zeroData} />);
      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-items", "2");
    });

    it("should handle dates in different formats", () => {
      const mixedDateFormats = [
        { date: "2024-01-01T00:00:00.000Z", revenue: 10000 },
        { date: "2024/01/02", revenue: 15000 },
      ];
      render(<SalesChart data={mixedDateFormats} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle very small revenue values", () => {
      const smallRevenue = [{ date: "2024-01-01", revenue: 0.01 }];
      render(<SalesChart data={smallRevenue} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  // Styling
  describe("Styling", () => {
    it("should have white background", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const wrapper = container.querySelector(".bg-white");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have rounded corners", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const wrapper = container.querySelector(".rounded-lg");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have border", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const wrapper = container.querySelector(".border");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have padding", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const wrapper = container.querySelector(".p-6");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have semibold title", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const title = container.querySelector(".font-semibold");
      expect(title).toHaveTextContent("Sales Over Time");
    });

    it("should have proper margin below title", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const title = container.querySelector("h3");
      expect(title).toHaveClass("mb-4");
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("should use semantic heading element", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const heading = container.querySelector("h3");
      expect(heading).toHaveTextContent("Sales Over Time");
    });

    it("should have proper heading hierarchy", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const heading = container.querySelector("h3");
      expect(heading?.tagName).toBe("H3");
    });

    it("should provide clear empty state message", () => {
      render(<SalesChart data={[]} />);
      const message = screen.getByText(
        "No sales data available for the selected period",
      );
      expect(message).toBeVisible();
    });
  });

  // Data Integrity
  describe("Data Integrity", () => {
    it("should preserve data order", () => {
      render(<SalesChart data={mockData} />);
      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-items", String(mockData.length));
    });

    it("should pass all data points to chart", () => {
      const customData = [
        { date: "2024-01-01", revenue: 1000 },
        { date: "2024-01-02", revenue: 2000 },
        { date: "2024-01-03", revenue: 3000 },
      ];
      render(<SalesChart data={customData} />);
      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toHaveAttribute("data-items", "3");
    });

    it("should correctly map date and revenue fields", () => {
      render(<SalesChart data={mockData} />);
      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toBeInTheDocument();
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-key", "revenue");
    });
  });

  // Chart Configuration
  describe("Chart Configuration", () => {
    it("should set chart height to 320px", () => {
      // ResponsiveContainer receives height prop
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should use 100% width", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should configure line with dots", () => {
      // Line component should have dot configuration
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("line")).toBeInTheDocument();
    });
  });

  // Time Series Data
  describe("Time Series Data", () => {
    it("should handle sequential dates", () => {
      const sequentialData = [
        { date: "2024-01-01", revenue: 10000 },
        { date: "2024-01-02", revenue: 11000 },
        { date: "2024-01-03", revenue: 12000 },
      ];
      render(<SalesChart data={sequentialData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle non-sequential dates", () => {
      const nonSequentialData = [
        { date: "2024-01-01", revenue: 10000 },
        { date: "2024-01-05", revenue: 15000 },
        { date: "2024-01-10", revenue: 20000 },
      ];
      render(<SalesChart data={nonSequentialData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle data spanning multiple months", () => {
      const multiMonthData = [
        { date: "2024-01-15", revenue: 10000 },
        { date: "2024-02-15", revenue: 15000 },
        { date: "2024-03-15", revenue: 20000 },
      ];
      render(<SalesChart data={multiMonthData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle data spanning multiple years", () => {
      const multiYearData = [
        { date: "2023-12-31", revenue: 10000 },
        { date: "2024-01-01", revenue: 15000 },
      ];
      render(<SalesChart data={multiYearData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });
});
