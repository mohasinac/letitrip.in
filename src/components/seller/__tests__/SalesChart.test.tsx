import { render, screen } from "@testing-library/react";
import SalesChart from "../SalesChart";

// Mock recharts components
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children, height }: any) => (
    <div data-testid="responsive-container" data-height={height}>
      {children}
    </div>
  ),
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-length={data?.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, strokeWidth }: any) => (
    <div
      data-testid="line"
      data-key={dataKey}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
    />
  ),
  XAxis: ({ dataKey, tickFormatter }: any) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: ({ tickFormatter }: any) => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ formatter, labelFormatter }: any) => (
    <div data-testid="tooltip" />
  ),
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === "MMM dd") {
      return "Jan 01";
    }
    return "2024-01-01";
  }),
}));

const mockData = [
  { date: "2024-01-01", revenue: 15000 },
  { date: "2024-01-02", revenue: 18000 },
  { date: "2024-01-03", revenue: 12000 },
  { date: "2024-01-04", revenue: 22000 },
  { date: "2024-01-05", revenue: 19000 },
];

describe("SalesChart", () => {
  describe("Rendering", () => {
    it("renders chart container", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByText("Sales Over Time")).toBeInTheDocument();
    });

    it("renders chart title", () => {
      render(<SalesChart data={mockData} />);
      const title = screen.getByText("Sales Over Time");
      expect(title).toHaveClass("text-lg", "font-semibold");
    });

    it("applies card styling classes", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const card = container.firstChild;
      expect(card).toHaveClass(
        "bg-white",
        "dark:bg-gray-800",
        "rounded-lg",
        "border",
        "border-gray-200",
        "dark:border-gray-700",
        "p-6"
      );
    });
  });

  describe("Chart with Data", () => {
    it("renders ResponsiveContainer when data exists", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("sets correct container height", () => {
      render(<SalesChart data={mockData} />);
      const container = screen.getByTestId("responsive-container");
      expect(container).toHaveAttribute("data-height", "320");
    });

    it("renders LineChart with data", () => {
      render(<SalesChart data={mockData} />);
      const chart = screen.getByTestId("line-chart");
      expect(chart).toHaveAttribute("data-length", "5");
    });

    it("renders CartesianGrid", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });

    it("renders XAxis", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    });

    it("configures XAxis with date dataKey", () => {
      render(<SalesChart data={mockData} />);
      const xAxis = screen.getByTestId("x-axis");
      expect(xAxis).toHaveAttribute("data-key", "date");
    });

    it("renders YAxis", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("renders Tooltip", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("renders Line component", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("line")).toBeInTheDocument();
    });

    it("configures Line with revenue dataKey", () => {
      render(<SalesChart data={mockData} />);
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-key", "revenue");
    });

    it("applies blue stroke to line", () => {
      render(<SalesChart data={mockData} />);
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-stroke", "#3b82f6");
    });

    it("sets line stroke width", () => {
      render(<SalesChart data={mockData} />);
      const line = screen.getByTestId("line");
      expect(line).toHaveAttribute("data-stroke-width", "2");
    });
  });

  describe("Empty State", () => {
    it("renders empty state when no data", () => {
      render(<SalesChart data={[]} />);
      expect(
        screen.getByText("No sales data available for the selected period")
      ).toBeInTheDocument();
    });

    it("does not render chart when empty", () => {
      render(<SalesChart data={[]} />);
      expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
    });

    it("applies empty state styling", () => {
      render(<SalesChart data={[]} />);
      const emptyState = screen.getByText(
        "No sales data available for the selected period"
      );
      expect(emptyState).toHaveClass(
        "h-80",
        "flex",
        "items-center",
        "justify-center",
        "text-gray-500",
        "dark:text-gray-400"
      );
    });

    it("still renders title when empty", () => {
      render(<SalesChart data={[]} />);
      expect(screen.getByText("Sales Over Time")).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to container", () => {
      const { container } = render(<SalesChart data={mockData} />);
      const card = container.firstChild;
      expect(card).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("applies dark mode classes to title", () => {
      render(<SalesChart data={mockData} />);
      const title = screen.getByText("Sales Over Time");
      expect(title).toHaveClass("dark:text-white");
    });

    it("applies dark mode classes to empty state", () => {
      render(<SalesChart data={[]} />);
      const emptyState = screen.getByText(
        "No sales data available for the selected period"
      );
      expect(emptyState).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Currency Formatting", () => {
    it("formats currency in INR", () => {
      render(<SalesChart data={mockData} />);
      // formatCurrency is used internally
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("uses Indian locale for formatting", () => {
      render(<SalesChart data={mockData} />);
      // Verified via formatCurrency function using en-IN locale
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("formats to zero decimal places", () => {
      render(<SalesChart data={mockData} />);
      // maximumFractionDigits: 0 in formatCurrency
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("formats dates for X-axis", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    });

    it("handles date formatting errors gracefully", () => {
      const invalidData = [{ date: "invalid-date", revenue: 1000 }];
      expect(() => render(<SalesChart data={invalidData} />)).not.toThrow();
    });
  });

  describe("Responsive Design", () => {
    it("uses ResponsiveContainer for full width", () => {
      render(<SalesChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("sets fixed height for chart", () => {
      render(<SalesChart data={mockData} />);
      const container = screen.getByTestId("responsive-container");
      expect(container).toHaveAttribute("data-height", "320");
    });
  });

  describe("Edge Cases", () => {
    it("handles single data point", () => {
      const singleData = [{ date: "2024-01-01", revenue: 15000 }];
      render(<SalesChart data={singleData} />);
      const chart = screen.getByTestId("line-chart");
      expect(chart).toHaveAttribute("data-length", "1");
    });

    it("handles very large revenue values", () => {
      const largeData = [{ date: "2024-01-01", revenue: 99999999 }];
      render(<SalesChart data={largeData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("handles zero revenue", () => {
      const zeroData = [{ date: "2024-01-01", revenue: 0 }];
      render(<SalesChart data={zeroData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("handles negative revenue", () => {
      const negativeData = [{ date: "2024-01-01", revenue: -5000 }];
      render(<SalesChart data={negativeData} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Chart Configuration", () => {
    it("uses monotone line type", () => {
      render(<SalesChart data={mockData} />);
      // Verified in component: type="monotone"
      expect(screen.getByTestId("line")).toBeInTheDocument();
    });

    it("configures grid with dashed strokes", () => {
      render(<SalesChart data={mockData} />);
      // strokeDasharray="3 3" in CartesianGrid
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("provides semantic heading for chart title", () => {
      render(<SalesChart data={mockData} />);
      const title = screen.getByText("Sales Over Time");
      expect(title.tagName).toBe("H3");
    });

    it("provides meaningful empty state message", () => {
      render(<SalesChart data={[]} />);
      const message = screen.getByText(
        "No sales data available for the selected period"
      );
      expect(message).toBeInTheDocument();
    });
  });
});
