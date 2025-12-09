/**
 * Analytics Service Tests
 *
 * Comprehensive test coverage for analytics service including:
 * - Get overview (dashboard metrics)
 * - Get sales data (time series)
 * - Get top products
 * - Get category performance
 * - Get customer analytics
 * - Get traffic analytics
 * - Export data (CSV, PDF)
 * - Track events (client-side)
 */

import { analyticsService } from "@/services/analytics.service";
import { apiService } from "@/services/api.service";

// Mock apiService
jest.mock("@/services/api.service", () => ({
  apiService: {
    get: jest.fn(),
  },
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleDebug = jest.spyOn(console, "debug").mockImplementation();

// Mock fetch for exportData
global.fetch = jest.fn();

describe("AnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleDebug.mockRestore();
  });

  describe("getOverview", () => {
    const mockOverview = {
      totalRevenue: 50000,
      totalOrders: 150,
      totalCustomers: 80,
      averageOrderValue: 333.33,
      revenueChange: 15.5,
      ordersChange: 10.2,
      customersChange: 8.7,
      topSellingProduct: {
        id: "prod1",
        name: "Top Product",
        sales: 100,
      },
    };

    it("should get analytics overview without filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockOverview);

      const result = await analyticsService.getOverview();

      expect(apiService.get).toHaveBeenCalledWith("/analytics");
      expect(result.totalRevenue).toBe(50000);
      expect(result.totalOrders).toBe(150);
    });

    it("should get analytics overview with date filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockOverview);

      await analyticsService.getOverview({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics?startDate=2024-01-01&endDate=2024-01-31"
      );
    });

    it("should get analytics overview with shop filter", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockOverview);

      await analyticsService.getOverview({ shopId: "shop1" });

      expect(apiService.get).toHaveBeenCalledWith("/analytics?shopId=shop1");
    });

    it("should handle API errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      await expect(analyticsService.getOverview()).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("getSalesData", () => {
    const mockSalesData = [
      { date: "2024-01-01", revenue: 1000, orders: 10 },
      { date: "2024-01-02", revenue: 1500, orders: 15 },
      { date: "2024-01-03", revenue: 1200, orders: 12 },
    ];

    it("should get sales data without filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockSalesData);

      const result = await analyticsService.getSalesData();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/sales");
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe("2024-01-01");
    });

    it("should get sales data with date range", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockSalesData);

      await analyticsService.getSalesData({
        startDate: "2024-01-01",
        endDate: "2024-01-03",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/sales?startDate=2024-01-01&endDate=2024-01-03"
      );
    });

    it("should get sales data with granularity", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockSalesData);

      await analyticsService.getSalesData({ granularity: "daily" });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/sales?granularity=daily"
      );
    });

    it("should handle empty sales data", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      const result = await analyticsService.getSalesData();

      expect(result).toHaveLength(0);
    });
  });

  describe("getTopProducts", () => {
    const mockTopProducts = [
      { id: "prod1", name: "Product 1", sales: 100, revenue: 5000 },
      { id: "prod2", name: "Product 2", sales: 80, revenue: 4000 },
      { id: "prod3", name: "Product 3", sales: 60, revenue: 3000 },
    ];

    it("should get top products without filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockTopProducts);

      const result = await analyticsService.getTopProducts();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/top-products");
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Product 1");
    });

    it("should get top products with limit", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(
        mockTopProducts.slice(0, 2)
      );

      await analyticsService.getTopProducts({ limit: 2 });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/top-products?limit=2"
      );
    });

    it("should get top products with date filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockTopProducts);

      await analyticsService.getTopProducts({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        limit: 5,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/top-products?startDate=2024-01-01&endDate=2024-01-31&limit=5"
      );
    });

    it("should handle empty top products", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      const result = await analyticsService.getTopProducts();

      expect(result).toHaveLength(0);
    });
  });

  describe("getCategoryPerformance", () => {
    const mockCategoryPerformance = [
      {
        categoryId: "cat1",
        categoryName: "Electronics",
        sales: 100,
        revenue: 10000,
      },
      {
        categoryId: "cat2",
        categoryName: "Clothing",
        sales: 80,
        revenue: 8000,
      },
    ];

    it("should get category performance without filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(
        mockCategoryPerformance
      );

      const result = await analyticsService.getCategoryPerformance();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/categories");
      expect(result).toHaveLength(2);
      expect(result[0].categoryName).toBe("Electronics");
    });

    it("should get category performance with filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(
        mockCategoryPerformance
      );

      await analyticsService.getCategoryPerformance({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/categories?startDate=2024-01-01&endDate=2024-01-31"
      );
    });

    it("should handle empty category performance", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      const result = await analyticsService.getCategoryPerformance();

      expect(result).toHaveLength(0);
    });
  });

  describe("getCustomerAnalytics", () => {
    const mockCustomerAnalytics = [
      {
        customerId: "user1",
        totalOrders: 10,
        totalSpent: 5000,
        averageOrderValue: 500,
      },
      {
        customerId: "user2",
        totalOrders: 8,
        totalSpent: 4000,
        averageOrderValue: 500,
      },
    ];

    it("should get customer analytics without filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(
        mockCustomerAnalytics
      );

      const result = await analyticsService.getCustomerAnalytics();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/customers");
      expect(result).toHaveLength(2);
      expect(result[0].totalOrders).toBe(10);
    });

    it("should get customer analytics with filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(
        mockCustomerAnalytics
      );

      await analyticsService.getCustomerAnalytics({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/customers?startDate=2024-01-01&endDate=2024-01-31"
      );
    });

    it("should handle empty customer analytics", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      const result = await analyticsService.getCustomerAnalytics();

      expect(result).toHaveLength(0);
    });
  });

  describe("getTrafficAnalytics", () => {
    const mockTrafficAnalytics = {
      totalPageViews: 10000,
      uniqueVisitors: 2000,
      averageSessionDuration: 300,
      bounceRate: 45.5,
      topPages: [
        { path: "/products", views: 3000 },
        { path: "/shop", views: 2000 },
      ],
    };

    it("should get traffic analytics without filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockTrafficAnalytics);

      const result = await analyticsService.getTrafficAnalytics();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/traffic");
      expect(result.totalPageViews).toBe(10000);
      expect(result.topPages).toHaveLength(2);
    });

    it("should get traffic analytics with filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockTrafficAnalytics);

      await analyticsService.getTrafficAnalytics({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/traffic?startDate=2024-01-01&endDate=2024-01-31"
      );
    });
  });

  describe("exportData", () => {
    const mockBlob = new Blob(["test data"], { type: "text/csv" });

    beforeEach(() => {
      (global.fetch as jest.Mock).mockClear();
    });

    it("should export data as CSV without filters", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await analyticsService.exportData();

      expect(global.fetch).toHaveBeenCalledWith(
        "/analytics/export?format=csv",
        {
          method: "GET",
        }
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it("should export data as PDF", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      await analyticsService.exportData(undefined, "pdf");

      expect(global.fetch).toHaveBeenCalledWith(
        "/analytics/export?format=pdf",
        {
          method: "GET",
        }
      );
    });

    it("should export data with filters", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      await analyticsService.exportData(
        {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          shopId: "shop1",
        },
        "csv"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "/analytics/export?startDate=2024-01-01&endDate=2024-01-31&shopId=shop1&format=csv",
        { method: "GET" }
      );
    });

    it("should handle export failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(analyticsService.exportData()).rejects.toThrow(
        "Failed to export analytics data"
      );
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(analyticsService.exportData()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("trackEvent", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("should log event in development mode", () => {
      process.env.NODE_ENV = "development";

      analyticsService.trackEvent("product_view", { productId: "prod1" });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[Analytics Event] product_view",
        { productId: "prod1" }
      );
    });

    it("should not log event in production mode", () => {
      process.env.NODE_ENV = "production";
      mockConsoleLog.mockClear();

      analyticsService.trackEvent("product_view", { productId: "prod1" });

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it("should track event without data", () => {
      process.env.NODE_ENV = "development";

      analyticsService.trackEvent("page_view");

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[Analytics Event] page_view",
        undefined
      );
    });

    it("should track multiple events", () => {
      process.env.NODE_ENV = "development";
      mockConsoleLog.mockClear();

      analyticsService.trackEvent("add_to_cart", { productId: "prod1" });
      analyticsService.trackEvent("purchase", { orderId: "order1" });

      expect(mockConsoleLog).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null/undefined filters gracefully", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      await analyticsService.getSalesData({
        startDate: undefined,
        endDate: null,
      } as any);

      // Should not include null/undefined in query string
      expect(apiService.get).toHaveBeenCalledWith("/analytics/sales");
    });

    it("should handle multiple filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      await analyticsService.getTopProducts({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        shopId: "shop1",
        limit: 10,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/top-products?startDate=2024-01-01&endDate=2024-01-31&shopId=shop1&limit=10"
      );
    });

    it("should handle concurrent API calls", async () => {
      (apiService.get as jest.Mock)
        .mockResolvedValueOnce({ totalRevenue: 1000 })
        .mockResolvedValueOnce([{ date: "2024-01-01", revenue: 100 }])
        .mockResolvedValueOnce([{ id: "prod1", sales: 10 }]);

      const [overview, sales, products] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getSalesData(),
        analyticsService.getTopProducts(),
      ]);

      expect(overview.totalRevenue).toBe(1000);
      expect(sales).toHaveLength(1);
      expect(products).toHaveLength(1);
    });

    it("should handle special characters in filter values", async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce([]);

      await analyticsService.getCategoryPerformance({
        shopId: "shop&special=chars",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/analytics/categories?shopId=shop%26special%3Dchars"
      );
    });
  });
});
