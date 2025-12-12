import { render, screen } from "@testing-library/react";
import AnalyticsOverview from "../AnalyticsOverview";

// Mock StatsCard component
jest.mock("@/components/common/StatsCard", () => ({
  StatsCard: ({ title, value, icon, description, trend }: any) => (
    <div data-testid="stats-card">
      <div data-testid="stats-title">{title}</div>
      <div data-testid="stats-value">{value}</div>
      {description && <div data-testid="stats-description">{description}</div>}
      {trend && (
        <div data-testid="stats-trend">
          {trend.isPositive ? "+" : "-"}
          {trend.value}
        </div>
      )}
      {icon}
    </div>
  ),
}));

const mockData = {
  revenue: { total: 150000, average: 5000, trend: 12.5 },
  orders: {
    total: 125,
    pending: 15,
    completed: 100,
    cancelled: 10,
  },
  products: { total: 50, active: 45, outOfStock: 5 },
  customers: { total: 80, new: 20, returning: 60 },
  conversionRate: 3.5,
  averageOrderValue: 1200,
};

describe("AnalyticsOverview", () => {
  describe("Rendering", () => {
    it("renders all four stats cards", () => {
      render(<AnalyticsOverview data={mockData} />);
      const cards = screen.getAllByTestId("stats-card");
      expect(cards).toHaveLength(4);
    });

    it("renders revenue card", () => {
      render(<AnalyticsOverview data={mockData} />);
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    it("renders orders card", () => {
      render(<AnalyticsOverview data={mockData} />);
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
    });

    it("renders products card", () => {
      render(<AnalyticsOverview data={mockData} />);
      expect(screen.getByText("Active Products")).toBeInTheDocument();
    });

    it("renders customers card", () => {
      render(<AnalyticsOverview data={mockData} />);
      expect(screen.getByText("Total Customers")).toBeInTheDocument();
    });

    it("applies grid layout classes", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-4",
        "gap-6"
      );
    });
  });

  describe("Revenue Card", () => {
    it("formats revenue in INR currency", () => {
      render(<AnalyticsOverview data={mockData} />);
      const revenueValue = screen.getAllByTestId("stats-value")[0];
      expect(revenueValue.textContent).toMatch(/₹.*1,50,000/);
    });

    it("displays positive trend", () => {
      render(<AnalyticsOverview data={mockData} />);
      const trends = screen.getAllByTestId("stats-trend");
      expect(trends[0].textContent).toContain("+");
      expect(trends[0].textContent).toContain("12.5");
    });

    it("displays negative trend", () => {
      const negativeData = {
        ...mockData,
        revenue: { total: 150000, average: 5000, trend: -5.2 },
      };
      render(<AnalyticsOverview data={negativeData} />);
      const trend = screen.getByTestId("stats-trend");
      expect(trend.textContent).toContain("-");
      expect(trend.textContent).toContain("5.2");
    });

    it("does not display trend when zero", () => {
      const zeroTrendData = {
        ...mockData,
        revenue: { total: 150000, average: 5000, trend: 0 },
      };
      render(<AnalyticsOverview data={zeroTrendData} />);
      expect(screen.queryByTestId("stats-trend")).not.toBeInTheDocument();
    });

    it("renders DollarSign icon", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const cards = container.querySelectorAll('[data-testid="stats-card"]');
      const revenueIcon = cards[0].querySelector("svg");
      expect(revenueIcon).toBeInTheDocument();
      expect(revenueIcon).toHaveClass("w-6", "h-6");
    });
  });

  describe("Orders Card", () => {
    it("displays total orders count", () => {
      render(<AnalyticsOverview data={mockData} />);
      const ordersValue = screen.getAllByTestId("stats-value")[1];
      expect(ordersValue.textContent).toBe("125");
    });

    it("displays completed and pending orders in description", () => {
      render(<AnalyticsOverview data={mockData} />);
      const descriptions = screen.getAllByTestId("stats-description");
      expect(descriptions[0].textContent).toBe("100 completed, 15 pending");
    });

    it("handles zero orders", () => {
      const zeroOrdersData = {
        ...mockData,
        orders: { total: 0, pending: 0, completed: 0, cancelled: 0 },
      };
      render(<AnalyticsOverview data={zeroOrdersData} />);
      const ordersValue = screen.getAllByTestId("stats-value")[1];
      expect(ordersValue.textContent).toBe("0");
    });

    it("renders ShoppingBag icon", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const cards = container.querySelectorAll('[data-testid="stats-card"]');
      const ordersIcon = cards[1].querySelector("svg");
      expect(ordersIcon).toBeInTheDocument();
    });
  });

  describe("Products Card", () => {
    it("displays active products count", () => {
      render(<AnalyticsOverview data={mockData} />);
      const productsValue = screen.getAllByTestId("stats-value")[2];
      expect(productsValue.textContent).toBe("45");
    });

    it("displays out of stock count in description", () => {
      render(<AnalyticsOverview data={mockData} />);
      const descriptions = screen.getAllByTestId("stats-description");
      expect(descriptions[1].textContent).toBe("5 out of stock");
    });

    it("handles no out of stock products", () => {
      const noOutOfStockData = {
        ...mockData,
        products: { total: 50, active: 50, outOfStock: 0 },
      };
      render(<AnalyticsOverview data={noOutOfStockData} />);
      const descriptions = screen.getAllByTestId("stats-description");
      expect(descriptions[1].textContent).toBe("0 out of stock");
    });

    it("renders Package icon", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const cards = container.querySelectorAll('[data-testid="stats-card"]');
      const productsIcon = cards[2].querySelector("svg");
      expect(productsIcon).toBeInTheDocument();
    });
  });

  describe("Customers Card", () => {
    it("displays total customers count", () => {
      render(<AnalyticsOverview data={mockData} />);
      const customersValue = screen.getAllByTestId("stats-value")[3];
      expect(customersValue.textContent).toBe("80");
    });

    it("displays conversion rate in description", () => {
      render(<AnalyticsOverview data={mockData} />);
      const descriptions = screen.getAllByTestId("stats-description");
      expect(descriptions[2].textContent).toBe("3.5% conversion rate");
    });

    it("formats conversion rate to one decimal", () => {
      const preciseData = {
        ...mockData,
        conversionRate: 3.456789,
      };
      render(<AnalyticsOverview data={preciseData} />);
      const descriptions = screen.getAllByTestId("stats-description");
      expect(descriptions[2].textContent).toBe("3.5% conversion rate");
    });

    it("handles zero conversion rate", () => {
      const zeroConversionData = {
        ...mockData,
        conversionRate: 0,
      };
      render(<AnalyticsOverview data={zeroConversionData} />);
      const descriptions = screen.getAllByTestId("stats-description");
      expect(descriptions[2].textContent).toBe("0.0% conversion rate");
    });

    it("renders Users icon", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const cards = container.querySelectorAll('[data-testid="stats-card"]');
      const customersIcon = cards[3].querySelector("svg");
      expect(customersIcon).toBeInTheDocument();
    });
  });

  describe("Currency Formatting", () => {
    it("formats large numbers correctly", () => {
      const largeRevenueData = {
        ...mockData,
        revenue: { total: 1500000, average: 50000, trend: 10 },
      };
      render(<AnalyticsOverview data={largeRevenueData} />);
      const revenueValue = screen.getAllByTestId("stats-value")[0];
      expect(revenueValue.textContent).toMatch(/₹.*15,00,000/);
    });

    it("formats small numbers correctly", () => {
      const smallRevenueData = {
        ...mockData,
        revenue: { total: 999, average: 100, trend: 5 },
      };
      render(<AnalyticsOverview data={smallRevenueData} />);
      const revenueValue = screen.getAllByTestId("stats-value")[0];
      expect(revenueValue.textContent).toMatch(/₹.*999/);
    });

    it("formats zero revenue", () => {
      const zeroRevenueData = {
        ...mockData,
        revenue: { total: 0, average: 0, trend: 0 },
      };
      render(<AnalyticsOverview data={zeroRevenueData} />);
      const revenueValue = screen.getAllByTestId("stats-value")[0];
      expect(revenueValue.textContent).toMatch(/₹.*0/);
    });

    it("uses INR currency format", () => {
      render(<AnalyticsOverview data={mockData} />);
      const revenueValue = screen.getAllByTestId("stats-value")[0];
      expect(revenueValue.textContent).toContain("₹");
    });

    it("rounds to zero decimal places", () => {
      const decimalRevenueData = {
        ...mockData,
        revenue: { total: 150000.99, average: 5000.55, trend: 10 },
      };
      render(<AnalyticsOverview data={decimalRevenueData} />);
      const revenueValue = screen.getAllByTestId("stats-value")[0];
      expect(revenueValue.textContent).not.toContain(".");
    });
  });

  describe("Responsive Design", () => {
    it("applies mobile-first grid layout", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass("grid-cols-1");
    });

    it("applies tablet grid layout classes", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass("md:grid-cols-2");
    });

    it("applies desktop grid layout classes", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass("lg:grid-cols-4");
    });

    it("applies consistent gap between cards", () => {
      const { container } = render(<AnalyticsOverview data={mockData} />);
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass("gap-6");
    });
  });

  describe("Edge Cases", () => {
    it("handles very large numbers", () => {
      const largeData = {
        revenue: { total: 99999999, average: 100000, trend: 50 },
        orders: { total: 10000, pending: 500, completed: 9000, cancelled: 500 },
        products: { total: 1000, active: 900, outOfStock: 100 },
        customers: { total: 5000, new: 1000, returning: 4000 },
        conversionRate: 99.9,
        averageOrderValue: 50000,
      };
      render(<AnalyticsOverview data={largeData} />);
      expect(screen.getAllByTestId("stats-card")).toHaveLength(4);
    });

    it("handles all zero values", () => {
      const zeroData = {
        revenue: { total: 0, average: 0, trend: 0 },
        orders: { total: 0, pending: 0, completed: 0, cancelled: 0 },
        products: { total: 0, active: 0, outOfStock: 0 },
        customers: { total: 0, new: 0, returning: 0 },
        conversionRate: 0,
        averageOrderValue: 0,
      };
      render(<AnalyticsOverview data={zeroData} />);
      expect(screen.getAllByTestId("stats-card")).toHaveLength(4);
    });

    it("handles negative trend values", () => {
      const negativeData = {
        ...mockData,
        revenue: { total: 150000, average: 5000, trend: -25.5 },
      };
      render(<AnalyticsOverview data={negativeData} />);
      const trend = screen.getByTestId("stats-trend");
      expect(trend.textContent).toContain("-25.5");
    });
  });
});
