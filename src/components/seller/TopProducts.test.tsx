import React from "react";
import { render, screen } from "@testing-library/react";
import TopProducts from "./TopProducts";
import "@testing-library/jest-dom";

// Mock recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-items={data?.length}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill }: any) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} />
  ),
  XAxis: ({ tickFormatter, type }: any) => (
    <div data-testid="x-axis" data-type={type} />
  ),
  YAxis: ({ dataKey, type, width }: any) => (
    <div
      data-testid="y-axis"
      data-key={dataKey}
      data-type={type}
      data-width={width}
    />
  ),
  CartesianGrid: ({ strokeDasharray }: any) => (
    <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} />
  ),
  Tooltip: ({ formatter }: any) => <div data-testid="tooltip" />,
}));

describe("TopProducts", () => {
  const mockData = [
    { id: "1", name: "Product A", revenue: 50000, quantity: 100 },
    { id: "2", name: "Product B", revenue: 40000, quantity: 80 },
    { id: "3", name: "Product C", revenue: 30000, quantity: 60 },
    { id: "4", name: "Product D", revenue: 20000, quantity: 40 },
    { id: "5", name: "Product E", revenue: 10000, quantity: 20 },
    { id: "6", name: "Product F", revenue: 5000, quantity: 10 },
  ];

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("should render with title", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByText("Top Products by Revenue")).toBeInTheDocument();
    });

    it("should render container with styling", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const wrapper = container.querySelector(".bg-white.rounded-lg.border");
      expect(wrapper).toBeInTheDocument();
    });

    it("should render bar chart when data is provided", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("should render data table when data is provided", () => {
      render(<TopProducts data={mockData} />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should render responsive container", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  // Empty State
  describe("Empty State", () => {
    it("should render empty state when data is empty", () => {
      render(<TopProducts data={[]} />);
      expect(
        screen.getByText("No product sales data available"),
      ).toBeInTheDocument();
    });

    it("should not render chart when data is empty", () => {
      render(<TopProducts data={[]} />);
      expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
    });

    it("should not render table when data is empty", () => {
      render(<TopProducts data={[]} />);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("should have centered empty state styling", () => {
      const { container } = render(<TopProducts data={[]} />);
      const emptyState = container.querySelector(".h-80.flex.items-center");
      expect(emptyState).toBeInTheDocument();
    });
  });

  // Chart Components
  describe("Chart Components", () => {
    it("should render BarChart component", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("should render Bar with revenue dataKey", () => {
      render(<TopProducts data={mockData} />);
      const bar = screen.getByTestId("bar");
      expect(bar).toHaveAttribute("data-key", "revenue");
    });

    it("should render Bar with blue fill color", () => {
      render(<TopProducts data={mockData} />);
      const bar = screen.getByTestId("bar");
      expect(bar).toHaveAttribute("data-fill", "#3b82f6");
    });

    it("should render XAxis", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    });

    it("should render XAxis with number type", () => {
      render(<TopProducts data={mockData} />);
      const xAxis = screen.getByTestId("x-axis");
      expect(xAxis).toHaveAttribute("data-type", "number");
    });

    it("should render YAxis", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("should render YAxis with category type", () => {
      render(<TopProducts data={mockData} />);
      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toHaveAttribute("data-type", "category");
    });

    it("should render YAxis with name dataKey", () => {
      render(<TopProducts data={mockData} />);
      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toHaveAttribute("data-key", "name");
    });

    it("should render YAxis with 150px width", () => {
      render(<TopProducts data={mockData} />);
      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toHaveAttribute("data-width", "150");
    });

    it("should render CartesianGrid", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });

    it("should render Tooltip", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("should only show top 5 products in chart", () => {
      render(<TopProducts data={mockData} />);
      const barChart = screen.getByTestId("bar-chart");
      expect(barChart).toHaveAttribute("data-items", "5");
    });
  });

  // Table Rendering
  describe("Table Rendering", () => {
    it("should render table headers", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByText("Product")).toBeInTheDocument();
      expect(screen.getByText("Quantity Sold")).toBeInTheDocument();
      expect(screen.getByText("Revenue")).toBeInTheDocument();
    });

    it("should render all products in table", () => {
      render(<TopProducts data={mockData} />);
      mockData.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });

    it("should render quantity values", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("80")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument();
    });

    it("should format revenue as currency", () => {
      render(<TopProducts data={mockData} />);
      // Indian format: ₹50,000
      expect(screen.getByText(/₹50,000/)).toBeInTheDocument();
    });

    it("should have hover effect on table rows", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        expect(row).toHaveClass("hover:bg-gray-50");
      });
    });

    it("should right-align quantity and revenue columns", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const quantityCells = container.querySelectorAll("tbody td:nth-child(2)");
      quantityCells.forEach((cell) => {
        expect(cell).toHaveClass("text-right");
      });
    });

    it("should have font-medium on revenue values", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const revenueCells = container.querySelectorAll("tbody td:nth-child(3)");
      revenueCells.forEach((cell) => {
        expect(cell).toHaveClass("font-medium");
      });
    });
  });

  // Currency Formatting
  describe("Currency Formatting", () => {
    it("should format large numbers with Indian formatting", () => {
      const largeData = [
        { id: "1", name: "Expensive Item", revenue: 9999999, quantity: 1 },
      ];
      render(<TopProducts data={largeData} />);
      // Indian format uses lakhs: ₹99,99,999
      expect(screen.getByText(/₹99,99,999/)).toBeInTheDocument();
    });

    it("should format small numbers correctly", () => {
      const smallData = [
        { id: "1", name: "Cheap Item", revenue: 100, quantity: 10 },
      ];
      render(<TopProducts data={smallData} />);
      expect(screen.getByText(/₹100/)).toBeInTheDocument();
    });

    it("should format zero revenue", () => {
      const zeroData = [
        { id: "1", name: "Free Item", revenue: 0, quantity: 5 },
      ];
      render(<TopProducts data={zeroData} />);
      expect(screen.getByText(/₹0/)).toBeInTheDocument();
    });

    it("should not show decimal places", () => {
      const decimalData = [
        { id: "1", name: "Item", revenue: 1234.56, quantity: 5 },
      ];
      render(<TopProducts data={decimalData} />);
      // Should round to ₹1,235 (no decimals)
      const text = screen.getByText(/₹1,23[45]/);
      expect(text).toBeInTheDocument();
      expect(text.textContent).not.toContain(".");
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("should handle single product", () => {
      const singleData = [
        { id: "1", name: "Only Product", revenue: 10000, quantity: 50 },
      ];
      render(<TopProducts data={singleData} />);
      expect(screen.getByText("Only Product")).toBeInTheDocument();
    });

    it("should handle product with very long name", () => {
      const longNameData = [
        {
          id: "1",
          name: "This is a very long product name that should be displayed properly",
          revenue: 5000,
          quantity: 10,
        },
      ];
      render(<TopProducts data={longNameData} />);
      expect(
        screen.getByText(
          "This is a very long product name that should be displayed properly",
        ),
      ).toBeInTheDocument();
    });

    it("should handle product with special characters in name", () => {
      const specialData = [
        { id: "1", name: "Product & Co. (2024)", revenue: 5000, quantity: 10 },
      ];
      render(<TopProducts data={specialData} />);
      expect(screen.getByText("Product & Co. (2024)")).toBeInTheDocument();
    });

    it("should handle zero quantity", () => {
      const zeroQtyData = [
        { id: "1", name: "No Sales", revenue: 0, quantity: 0 },
      ];
      render(<TopProducts data={zeroQtyData} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle exactly 5 products (no slicing needed)", () => {
      const fiveProducts = mockData.slice(0, 5);
      render(<TopProducts data={fiveProducts} />);
      const barChart = screen.getByTestId("bar-chart");
      expect(barChart).toHaveAttribute("data-items", "5");
    });

    it("should handle more than 5 products (should slice for chart)", () => {
      render(<TopProducts data={mockData} />); // 6 products
      const barChart = screen.getByTestId("bar-chart");
      expect(barChart).toHaveAttribute("data-items", "5");
      // But table should show all 6
      expect(screen.getByText("Product F")).toBeInTheDocument();
    });
  });

  // Styling
  describe("Styling", () => {
    it("should have white background", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const wrapper = container.querySelector(".bg-white");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have rounded corners", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const wrapper = container.querySelector(".rounded-lg");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have border", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const wrapper = container.querySelector(".border");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have padding", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const wrapper = container.querySelector(".p-6");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have semibold title", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const title = container.querySelector(".font-semibold");
      expect(title).toHaveTextContent("Top Products by Revenue");
    });

    it("should have proper spacing between chart and table", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const tableWrapper = container.querySelector(".mt-6.overflow-x-auto");
      expect(tableWrapper).toBeInTheDocument();
    });

    it("should have uppercase headers in table", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const headers = container.querySelectorAll("thead th");
      headers.forEach((header) => {
        expect(header).toHaveClass("uppercase");
      });
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("should use semantic table elements", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should have table headers", () => {
      render(<TopProducts data={mockData} />);
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(3);
    });

    it("should have table rows", () => {
      render(<TopProducts data={mockData} />);
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });

    it("should have proper heading hierarchy", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const heading = container.querySelector("h3");
      expect(heading).toHaveTextContent("Top Products by Revenue");
    });
  });

  // Data Integrity
  describe("Data Integrity", () => {
    it("should preserve product IDs as keys", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(mockData.length);
    });

    it("should display products in order provided", () => {
      render(<TopProducts data={mockData} />);
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Product A");
      expect(rows[1]).toHaveTextContent("Product B");
      expect(rows[2]).toHaveTextContent("Product C");
    });

    it("should correctly map all data fields", () => {
      const testData = [
        { id: "test-1", name: "Test Product", revenue: 12345, quantity: 67 },
      ];
      render(<TopProducts data={testData} />);
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("67")).toBeInTheDocument();
      expect(screen.getByText(/₹12,345/)).toBeInTheDocument();
    });
  });
});
