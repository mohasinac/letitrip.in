import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { analyticsService } from "@/services/analytics.service";
import { toDateInputValue, getTodayDateInputValue } from "@/lib/date-utils";

// Mock dependencies
jest.mock("@/services/analytics.service");
jest.mock("@/lib/date-utils");

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  Users: () => <div data-testid="users-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
}));

// Mock AuthGuard
jest.mock("@/components/auth/AuthGuard", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}));

// Mock auth context
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock window.URL methods for export functionality
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();

Object.defineProperty(window, "URL", {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

Object.defineProperty(document, "createElement", {
  value: jest.fn(() => ({
    href: "",
    download: "",
    click: mockClick,
  })),
});

Object.defineProperty(document, "body", {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
});

const mockAnalyticsService = analyticsService as jest.Mocked<
  typeof analyticsService
>;
const mockToDateInputValue = toDateInputValue as jest.MockedFunction<
  typeof toDateInputValue
>;
const mockGetTodayDateInputValue =
  getTodayDateInputValue as jest.MockedFunction<typeof getTodayDateInputValue>;

// Import page after mocks
const SellerRevenuePage = require("./page").default;

describe("SellerRevenuePage", () => {
  const mockOverviewData = {
    totalRevenue: 150000,
    revenueGrowth: 12.5,
    totalOrders: 450,
    ordersGrowth: -2.3,
    averageOrderValue: 333,
    totalCustomers: 320,
    conversionRate: 3.45,
    totalProducts: 25,
  };

  const mockSalesData = [
    { date: "2024-01-01", revenue: 5000, orders: 15, customers: 12 },
    { date: "2024-01-02", revenue: 7500, orders: 22, customers: 18 },
    { date: "2024-01-03", revenue: 6200, orders: 18, customers: 15 },
  ];

  const mockTopProducts = [
    {
      productId: "prod-1",
      productName: "Wireless Headphones",
      sales: 45,
      views: 1200,
      revenue: 22500,
    },
    {
      productId: "prod-2",
      productName: "Smart Watch",
      sales: 32,
      views: 980,
      revenue: 19200,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup auth mock
    mockUseAuth.mockReturnValue({
      user: { id: "seller-123", email: "seller@example.com", role: "seller" },
      isAuthenticated: true,
      loading: false,
    });

    // Setup date mocks
    mockToDateInputValue.mockReturnValue("2024-01-01");
    mockGetTodayDateInputValue.mockReturnValue("2024-01-31");

    // Setup analytics service mocks
    mockAnalyticsService.getOverview.mockResolvedValue(mockOverviewData);
    mockAnalyticsService.getSalesData.mockResolvedValue(mockSalesData);
    mockAnalyticsService.getTopProducts.mockResolvedValue(mockTopProducts);
    mockAnalyticsService.exportData.mockResolvedValue(new Blob());

    // Setup URL mocks
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
  });

  it("can be imported", () => {
    expect(SellerRevenuePage).toBeDefined();
  });

  describe("Authentication and Layout", () => {
    it("renders with auth guard", async () => {
      render(<SellerRevenuePage />);

      expect(screen.getByTestId("auth-guard")).toBeInTheDocument();
    });

    it("displays page title and description", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
        expect(
          screen.getByText("Track your sales performance and earnings")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading and Data Fetching", () => {
    it("shows loading spinner initially", () => {
      render(<SellerRevenuePage />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("loads data on mount", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalled();
        expect(mockAnalyticsService.getSalesData).toHaveBeenCalled();
        expect(mockAnalyticsService.getTopProducts).toHaveBeenCalled();
      });
    });

    it("displays overview data", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("₹1,50,000")).toBeInTheDocument(); // Total Revenue
        expect(screen.getByText("450")).toBeInTheDocument(); // Total Orders
        expect(screen.getByText("₹333")).toBeInTheDocument(); // Average Order Value
        expect(screen.getByText("320")).toBeInTheDocument(); // Total Customers
      });
    });

    it("handles API error gracefully", async () => {
      mockAnalyticsService.getOverview.mockRejectedValue(
        new Error("API Error")
      );

      render(<SellerRevenuePage />);

      // Component should not crash and should show empty state or loading
      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalled();
      });

      // Should still render the basic layout
      expect(screen.getByTestId("auth-guard")).toBeInTheDocument();
    });
  });

  describe("Date Range Filtering", () => {
    it("displays date range inputs", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        const dateInputs = screen.getAllByDisplayValue("2024-01-01");
        expect(dateInputs).toHaveLength(2); // start and end date
      });
    });

    it("updates date range and reloads data", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalledTimes(1);
      });

      const endDateInput = screen.getByDisplayValue("2024-01-31");
      fireEvent.change(endDateInput, { target: { value: "2024-02-15" } });

      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Period Selection", () => {
    it("displays period selector", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("day")).toBeInTheDocument();
      });
    });

    it("changes period and reloads data", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalledTimes(1);
      });

      const periodSelect = screen.getByDisplayValue("day");
      fireEvent.change(periodSelect, { target: { value: "week" } });

      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalledTimes(2);
        expect(mockAnalyticsService.getOverview).toHaveBeenLastCalledWith(
          expect.objectContaining({ period: "week" })
        );
      });
    });
  });

  describe("Data Display", () => {
    it("displays growth indicators", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
        expect(screen.getByTestId("trending-down-icon")).toBeInTheDocument();
        expect(screen.getByText("12.5%")).toBeInTheDocument();
        expect(screen.getByText("2.3%")).toBeInTheDocument();
      });
    });

    it("displays sales chart", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("Sales Trend")).toBeInTheDocument();
        // Should show dates from mock data
        expect(screen.getByText("Jan 1")).toBeInTheDocument();
        expect(screen.getByText("Jan 2")).toBeInTheDocument();
        expect(screen.getByText("Jan 3")).toBeInTheDocument();
      });
    });

    it("displays top products", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("Top Products")).toBeInTheDocument();
        expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
        expect(screen.getByText("Smart Watch")).toBeInTheDocument();
        expect(screen.getByText("₹22,500")).toBeInTheDocument();
        expect(screen.getByText("₹19,200")).toBeInTheDocument();
      });
    });

    it("shows empty states when no data", async () => {
      mockAnalyticsService.getSalesData.mockResolvedValue([]);
      mockAnalyticsService.getTopProducts.mockResolvedValue([]);

      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(
          screen.getByText("No sales data available for the selected period")
        ).toBeInTheDocument();
        expect(
          screen.getByText("No product data available")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Export Functionality", () => {
    it("exports data as CSV", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("Export CSV")).toBeInTheDocument();
      });

      const csvButton = screen.getByText("Export CSV");
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(mockAnalyticsService.exportData).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            period: "day",
          }),
          "csv"
        );
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it("exports data as PDF", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("Export PDF")).toBeInTheDocument();
      });

      const pdfButton = screen.getByText("Export PDF");
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(mockAnalyticsService.exportData).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            period: "day",
          }),
          "pdf"
        );
      });
    });

    it("handles export error gracefully", async () => {
      mockAnalyticsService.exportData.mockRejectedValue(
        new Error("Export failed")
      );

      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("Export CSV")).toBeInTheDocument();
      });

      const csvButton = screen.getByText("Export CSV");
      fireEvent.click(csvButton);

      // Should not crash, error is logged to console
      await waitFor(() => {
        expect(mockAnalyticsService.exportData).toHaveBeenCalled();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to orders page", async () => {
      const mockRouter = require("next/navigation").useRouter();
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("View Orders")).toBeInTheDocument();
      });

      const ordersButton = screen.getByText("View Orders");
      fireEvent.click(ordersButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/seller/orders");
    });

    it("navigates to products page", async () => {
      const mockRouter = require("next/navigation").useRouter();
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("Manage Products")).toBeInTheDocument();
      });

      const productsButton = screen.getByText("Manage Products");
      fireEvent.click(productsButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/seller/products");
    });

    it("navigates to returns page", async () => {
      const mockRouter = require("next/navigation").useRouter();
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("View Returns")).toBeInTheDocument();
      });

      const returnsButton = screen.getByText("View Returns");
      fireEvent.click(returnsButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/seller/returns");
    });
  });

  describe("Additional Stats", () => {
    it("displays conversion rate and total products", async () => {
      render(<SellerRevenuePage />);

      await waitFor(() => {
        expect(screen.getByText("3.45%")).toBeInTheDocument();
        expect(screen.getByText("25")).toBeInTheDocument();
      });
    });
  });
});
