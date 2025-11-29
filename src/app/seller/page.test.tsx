import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock auth context
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock analytics service
jest.mock("@/services/analytics.service");
const mockAnalyticsService =
  require("@/services/analytics.service").analyticsService;

// Mock StatsCard
jest.mock("@/components/common/StatsCard", () => ({
  StatsCard: ({ title, value, description, icon }: any) => (
    <div data-testid={`stats-card-${title}`}>
      {icon}
      <h3>{title}</h3>
      <p>{value}</p>
      <p>{description}</p>
    </div>
  ),
}));

// Import page after mocks
const SellerDashboardPage = require("./page").default;

describe("SellerDashboardPage", () => {
  const mockUser = {
    id: "seller-123",
    email: "seller@example.com",
  };

  const mockAnalyticsData = {
    totalShops: 2,
    activeShops: 2,
    totalProducts: 15,
    activeProducts: 12,
    pendingOrders: 3,
    totalOrders: 45,
    totalRevenue: 150000,
    lastMonthRevenue: 120000,
    recentOrders: [
      {
        id: "order-1",
        orderNumber: "ORD-001",
        customer: "John Doe",
        amount: 2500,
        status: "pending",
        date: "2024-01-15",
      },
    ],
    topProducts: [
      {
        id: "prod-1",
        name: "Test Product",
        sales: 10,
        revenue: 25000,
        views: 100,
      },
    ],
    shopPerformance: {
      averageRating: 4.5,
      totalRatings: 20,
      orderFulfillment: 95,
      responseTime: "2 hours",
    },
    alerts: {
      lowStock: 2,
      pendingShipment: 3,
      newReviews: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading and Data Fetching", () => {
    it("shows loading spinner initially", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<SellerDashboardPage />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("loads dashboard data on mount", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockResolvedValue(mockAnalyticsData);

      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalled();
      });
    });

    it("displays dashboard data", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockResolvedValue(mockAnalyticsData);

      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      expect(screen.getByTestId("stats-card-Active Shops")).toBeInTheDocument();
      expect(screen.getByTestId("stats-card-Products")).toBeInTheDocument();
      expect(
        screen.getByTestId("stats-card-Pending Orders"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("stats-card-Revenue (This Month)"),
      ).toBeInTheDocument();
    });

    it("handles API error gracefully", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockRejectedValue(
        new Error("API Error"),
      );

      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("API Error")).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });
  });

  describe("Quick Actions", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockResolvedValue(mockAnalyticsData);
    });

    it("renders quick action links", async () => {
      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("link", { name: /create shop/i }),
      ).toHaveAttribute("href", "/seller/my-shops/create");
      expect(
        screen.getByRole("link", { name: /add product/i }),
      ).toHaveAttribute("href", "/seller/my-shops");
      expect(
        screen.getByRole("link", { name: /view orders/i }),
      ).toHaveAttribute("href", "/seller/orders");
      expect(
        screen.getByRole("link", { name: /view analytics/i }),
      ).toHaveAttribute("href", "/seller/revenue");
    });
  });

  describe("Recent Orders", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockResolvedValue(mockAnalyticsData);
    });

    it("displays recent orders", async () => {
      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Recent Orders")).toBeInTheDocument();
      });

      expect(screen.getByText("ORD-001")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("₹2,500")).toBeInTheDocument();
    });

    it("links to order detail", async () => {
      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("ORD-001")).toBeInTheDocument();
      });

      const orderLink = screen.getByRole("link", {
        name: /ORD-001.*John Doe.*2024-01-15.*₹2,500.*pending/,
      });
      expect(orderLink).toHaveAttribute("href", "/seller/orders/order-1");
    });
  });

  describe("Top Products", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockResolvedValue(mockAnalyticsData);
    });

    it("displays top products", async () => {
      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Top Products")).toBeInTheDocument();
      });

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("10 sales")).toBeInTheDocument();
      expect(screen.getByText("₹25.0K")).toBeInTheDocument();
    });
  });

  describe("Alerts and Performance", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockResolvedValue(mockAnalyticsData);
    });

    it("displays alerts", async () => {
      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Alerts & Notifications")).toBeInTheDocument();
      });

      expect(screen.getByText("Low Stock Alert")).toBeInTheDocument();
      expect(screen.getByText("Pending Actions")).toBeInTheDocument();
      expect(screen.getByText("New Reviews")).toBeInTheDocument();
    });

    it("displays shop performance", async () => {
      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Shop Performance")).toBeInTheDocument();
      });

      expect(screen.getByText("4.5 / 5.0")).toBeInTheDocument();
      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("2 hours")).toBeInTheDocument();
    });
  });

  describe("Retry Functionality", () => {
    it("retries loading on button click", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockAnalyticsService.getOverview.mockRejectedValueOnce(
        new Error("API Error"),
      );
      mockAnalyticsService.getOverview.mockResolvedValueOnce(mockAnalyticsData);

      render(<SellerDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("API Error")).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: "Retry" });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockAnalyticsService.getOverview).toHaveBeenCalledTimes(2);
      });
    });
  });
});
