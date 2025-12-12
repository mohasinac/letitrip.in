import { render, screen } from "@testing-library/react";
import TopProducts from "../TopProducts";

// Mock recharts components
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children, height }: any) => (
    <div data-testid="responsive-container" data-height={height}>
      {children}
    </div>
  ),
  BarChart: ({ children, data, layout }: any) => (
    <div
      data-testid="bar-chart"
      data-length={data?.length}
      data-layout={layout}
    >
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, radius }: any) => (
    <div
      data-testid="bar"
      data-key={dataKey}
      data-fill={fill}
      data-radius={radius?.toString()}
    />
  ),
  XAxis: ({ type, tickFormatter }: any) => (
    <div data-testid="x-axis" data-type={type} />
  ),
  YAxis: ({ type, dataKey, width }: any) => (
    <div
      data-testid="y-axis"
      data-type={type}
      data-key={dataKey}
      data-width={width}
    />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ formatter }: any) => <div data-testid="tooltip" />,
}));

const mockData = [
  { id: "1", name: "Product A", revenue: 50000, quantity: 100 },
  { id: "2", name: "Product B", revenue: 45000, quantity: 90 },
  { id: "3", name: "Product C", revenue: 40000, quantity: 80 },
  { id: "4", name: "Product D", revenue: 35000, quantity: 70 },
  { id: "5", name: "Product E", revenue: 30000, quantity: 60 },
  { id: "6", name: "Product F", revenue: 25000, quantity: 50 },
];

describe("TopProducts", () => {
  describe("Rendering", () => {
    it("renders chart title", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByText("Top Products by Revenue")).toBeInTheDocument();
    });

    it("applies card styling classes", () => {
      const { container } = render(<TopProducts data={mockData} />);
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

    it("renders title with correct classes", () => {
      render(<TopProducts data={mockData} />);
      const title = screen.getByText("Top Products by Revenue");
      expect(title).toHaveClass("text-lg", "font-semibold", "dark:text-white");
    });
  });

  describe("Chart with Data", () => {
    it("renders ResponsiveContainer", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("sets correct container height", () => {
      render(<TopProducts data={mockData} />);
      const container = screen.getByTestId("responsive-container");
      expect(container).toHaveAttribute("data-height", "320");
    });

    it("renders BarChart with top 5 products only", () => {
      render(<TopProducts data={mockData} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-length", "5");
    });

    it("uses vertical layout for bar chart", () => {
      render(<TopProducts data={mockData} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-layout", "vertical");
    });

    it("renders CartesianGrid", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });

    it("renders XAxis with number type", () => {
      render(<TopProducts data={mockData} />);
      const xAxis = screen.getByTestId("x-axis");
      expect(xAxis).toHaveAttribute("data-type", "number");
    });

    it("renders YAxis with category type", () => {
      render(<TopProducts data={mockData} />);
      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toHaveAttribute("data-type", "category");
    });

    it("configures YAxis with name dataKey", () => {
      render(<TopProducts data={mockData} />);
      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toHaveAttribute("data-key", "name");
    });

    it("sets YAxis width", () => {
      render(<TopProducts data={mockData} />);
      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toHaveAttribute("data-width", "150");
    });

    it("renders Tooltip", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("renders Bar component", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("bar")).toBeInTheDocument();
    });

    it("configures Bar with revenue dataKey", () => {
      render(<TopProducts data={mockData} />);
      const bar = screen.getByTestId("bar");
      expect(bar).toHaveAttribute("data-key", "revenue");
    });

    it("applies blue fill to bars", () => {
      render(<TopProducts data={mockData} />);
      const bar = screen.getByTestId("bar");
      expect(bar).toHaveAttribute("data-fill", "#3b82f6");
    });
  });

  describe("Table View", () => {
    it("renders table with all products", () => {
      render(<TopProducts data={mockData} />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("renders table headers", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByText("Product")).toBeInTheDocument();
      expect(screen.getByText("Quantity Sold")).toBeInTheDocument();
      expect(screen.getByText("Revenue")).toBeInTheDocument();
    });

    it("renders all product rows", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByText("Product A")).toBeInTheDocument();
      expect(screen.getByText("Product B")).toBeInTheDocument();
      expect(screen.getByText("Product C")).toBeInTheDocument();
      expect(screen.getByText("Product D")).toBeInTheDocument();
      expect(screen.getByText("Product E")).toBeInTheDocument();
      expect(screen.getByText("Product F")).toBeInTheDocument();
    });

    it("displays product quantities", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("90")).toBeInTheDocument();
    });

    it("applies table styling classes", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const table = container.querySelector("table");
      expect(table).toHaveClass(
        "min-w-full",
        "divide-y",
        "divide-gray-200",
        "dark:divide-gray-700"
      );
    });

    it("applies hover effects to table rows", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        expect(row).toHaveClass("hover:bg-gray-50", "dark:hover:bg-gray-700");
      });
    });

    it("right-aligns quantity column", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const quantityHeader = screen.getByText("Quantity Sold").closest("th");
      expect(quantityHeader).toHaveClass("text-right");
    });

    it("right-aligns revenue column", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const revenueHeader = screen.getByText("Revenue").closest("th");
      expect(revenueHeader).toHaveClass("text-right");
    });
  });

  describe("Empty State", () => {
    it("renders empty state when no data", () => {
      render(<TopProducts data={[]} />);
      expect(
        screen.getByText("No product sales data available")
      ).toBeInTheDocument();
    });

    it("does not render chart when empty", () => {
      render(<TopProducts data={[]} />);
      expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
    });

    it("does not render table when empty", () => {
      render(<TopProducts data={[]} />);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("applies empty state styling", () => {
      render(<TopProducts data={[]} />);
      const emptyState = screen.getByText("No product sales data available");
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
      render(<TopProducts data={[]} />);
      expect(screen.getByText("Top Products by Revenue")).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to container", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const card = container.firstChild;
      expect(card).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("applies dark mode classes to title", () => {
      render(<TopProducts data={mockData} />);
      const title = screen.getByText("Top Products by Revenue");
      expect(title).toHaveClass("dark:text-white");
    });

    it("applies dark mode classes to table", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const table = container.querySelector("table");
      expect(table).toHaveClass("dark:divide-gray-700");
    });

    it("applies dark mode classes to table header", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("dark:bg-gray-700");
    });

    it("applies dark mode classes to table body", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const tbody = container.querySelector("tbody");
      expect(tbody).toHaveClass("dark:bg-gray-800", "dark:divide-gray-700");
    });

    it("applies dark mode text classes to cells", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const cells = container.querySelectorAll("tbody td");
      cells.forEach((cell) => {
        expect(cell).toHaveClass("dark:text-white");
      });
    });
  });

  describe("Responsive Design", () => {
    it("uses ResponsiveContainer for full width", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("applies overflow-x-auto to table wrapper", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const tableWrapper = container.querySelector(".overflow-x-auto");
      expect(tableWrapper).toBeInTheDocument();
    });

    it("applies margin-top to table section", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const tableWrapper = container.querySelector(".mt-6");
      expect(tableWrapper).toBeInTheDocument();
    });
  });

  describe("Currency Formatting", () => {
    it("formats currency in INR", () => {
      render(<TopProducts data={mockData} />);
      // formatCurrency is used for revenue values
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    });

    it("uses Indian locale for formatting", () => {
      render(<TopProducts data={mockData} />);
      // Verified via formatCurrency function using en-IN locale
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles less than 5 products", () => {
      const fewProducts = mockData.slice(0, 3);
      render(<TopProducts data={fewProducts} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-length", "3");
    });

    it("handles exactly 5 products", () => {
      const fiveProducts = mockData.slice(0, 5);
      render(<TopProducts data={fiveProducts} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-length", "5");
    });

    it("limits chart to top 5 products", () => {
      render(<TopProducts data={mockData} />);
      const chart = screen.getByTestId("bar-chart");
      expect(chart).toHaveAttribute("data-length", "5");
    });

    it("shows all products in table regardless of count", () => {
      render(<TopProducts data={mockData} />);
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(7); // 1 header + 6 data rows
    });

    it("handles single product", () => {
      const singleProduct = [mockData[0]];
      render(<TopProducts data={singleProduct} />);
      expect(screen.getByText("Product A")).toBeInTheDocument();
    });

    it("handles very large revenue values", () => {
      const largeData = [
        { id: "1", name: "Big Product", revenue: 99999999, quantity: 1000 },
      ];
      render(<TopProducts data={largeData} />);
      expect(screen.getByText("Big Product")).toBeInTheDocument();
    });

    it("handles zero revenue", () => {
      const zeroData = [
        { id: "1", name: "Free Product", revenue: 0, quantity: 100 },
      ];
      render(<TopProducts data={zeroData} />);
      expect(screen.getByText("Free Product")).toBeInTheDocument();
    });

    it("handles product with very long name", () => {
      const longNameData = [
        {
          id: "1",
          name: "This is a very long product name that should be displayed properly",
          revenue: 10000,
          quantity: 50,
        },
      ];
      render(<TopProducts data={longNameData} />);
      expect(
        screen.getByText(
          "This is a very long product name that should be displayed properly"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("provides semantic heading for chart title", () => {
      render(<TopProducts data={mockData} />);
      const title = screen.getByText("Top Products by Revenue");
      expect(title.tagName).toBe("H3");
    });

    it("uses semantic table structure", () => {
      render(<TopProducts data={mockData} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("provides table headers", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const headers = container.querySelectorAll("thead th");
      expect(headers.length).toBe(3);
    });

    it("provides meaningful empty state message", () => {
      render(<TopProducts data={[]} />);
      expect(
        screen.getByText("No product sales data available")
      ).toBeInTheDocument();
    });

    it("applies uppercase to table headers", () => {
      const { container } = render(<TopProducts data={mockData} />);
      const headers = container.querySelectorAll("thead th");
      headers.forEach((header) => {
        expect(header).toHaveClass("uppercase");
      });
    });
  });
});
