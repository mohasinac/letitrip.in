import type {
  AnalyticsOverviewFE,
  CategoryPerformanceFE,
  CustomerAnalyticsFE,
  SalesDataPointFE,
  TopProductFE,
  TrafficAnalyticsFE,
} from "@/types/frontend/analytics.types";
import { analyticsService } from "../analytics.service";
import { apiService } from "../api.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("AnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOverview", () => {
    it("gets analytics overview without filters", async () => {
      const mockOverview: AnalyticsOverviewFE = {
        totalRevenue: 50000,
        totalOrders: 100,
        totalProducts: 50,
        totalCustomers: 75,
        averageOrderValue: 500,
        conversionRate: 2.5,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockOverview);

      const result = await analyticsService.getOverview();

      expect(apiService.get).toHaveBeenCalledWith("/analytics");
      expect(result).toEqual(mockOverview);
    });

    it("gets analytics overview with filters", async () => {
      const mockOverview: AnalyticsOverviewFE = {
        totalRevenue: 25000,
        totalOrders: 50,
        totalProducts: 30,
        totalCustomers: 40,
        averageOrderValue: 500,
        conversionRate: 2.0,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockOverview);

      const result = await analyticsService.getOverview({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        shopId: "shop1",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/analytics?")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-01-01")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("endDate=2024-01-31")
      );
      expect(result).toEqual(mockOverview);
    });
  });

  describe("getSalesData", () => {
    it("gets sales data time series", async () => {
      const mockSalesData: SalesDataPointFE[] = [
        { date: "2024-01-01", revenue: 5000, orders: 10 },
        { date: "2024-01-02", revenue: 6000, orders: 12 },
        { date: "2024-01-03", revenue: 4500, orders: 9 },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockSalesData);

      const result = await analyticsService.getSalesData();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/sales");
      expect(result).toEqual(mockSalesData);
      expect(result).toHaveLength(3);
    });

    it("gets sales data with date range filter", async () => {
      const mockSalesData: SalesDataPointFE[] = [
        { date: "2024-01-01", revenue: 5000, orders: 10 },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockSalesData);

      await analyticsService.getSalesData({
        startDate: "2024-01-01",
        endDate: "2024-01-01",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/analytics/sales?")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-01-01")
      );
    });
  });

  describe("getTopProducts", () => {
    it("gets top products without limit", async () => {
      const mockProducts: TopProductFE[] = [
        {
          productId: "prod1",
          name: "Product 1",
          revenue: 10000,
          unitsSold: 50,
          averageRating: 4.5,
        },
        {
          productId: "prod2",
          name: "Product 2",
          revenue: 8000,
          unitsSold: 40,
          averageRating: 4.3,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockProducts);

      const result = await analyticsService.getTopProducts();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/top-products");
      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(2);
    });

    it("gets top products with limit", async () => {
      const mockProducts: TopProductFE[] = [
        {
          productId: "prod1",
          name: "Product 1",
          revenue: 10000,
          unitsSold: 50,
          averageRating: 4.5,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockProducts);

      await analyticsService.getTopProducts({ limit: 5 });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/analytics/top-products?")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=5")
      );
    });

    it("handles empty product list", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getTopProducts();

      expect(result).toEqual([]);
    });
  });

  describe("getCategoryPerformance", () => {
    it("gets category performance data", async () => {
      const mockCategories: CategoryPerformanceFE[] = [
        {
          categoryId: "cat1",
          name: "Electronics",
          revenue: 25000,
          orders: 50,
          products: 20,
          growthRate: 15.5,
        },
        {
          categoryId: "cat2",
          name: "Clothing",
          revenue: 15000,
          orders: 60,
          products: 30,
          growthRate: 10.2,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await analyticsService.getCategoryPerformance();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/categories");
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(2);
    });

    it("gets category performance with filters", async () => {
      const mockCategories: CategoryPerformanceFE[] = [
        {
          categoryId: "cat1",
          name: "Electronics",
          revenue: 25000,
          orders: 50,
          products: 20,
          growthRate: 15.5,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockCategories);

      await analyticsService.getCategoryPerformance({
        startDate: "2024-01-01",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/analytics/categories?")
      );
    });
  });

  describe("getCustomerAnalytics", () => {
    it("gets customer analytics data", async () => {
      const mockCustomers: CustomerAnalyticsFE[] = [
        {
          customerId: "cust1",
          name: "John Doe",
          totalOrders: 10,
          totalSpent: 5000,
          averageOrderValue: 500,
          lastOrderDate: "2024-01-15",
        },
        {
          customerId: "cust2",
          name: "Jane Smith",
          totalOrders: 8,
          totalSpent: 4000,
          averageOrderValue: 500,
          lastOrderDate: "2024-01-20",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockCustomers);

      const result = await analyticsService.getCustomerAnalytics();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/customers");
      expect(result).toEqual(mockCustomers);
      expect(result).toHaveLength(2);
    });
  });

  describe("getTrafficAnalytics", () => {
    it("gets traffic analytics data", async () => {
      const mockTraffic: TrafficAnalyticsFE = {
        totalVisits: 10000,
        uniqueVisitors: 5000,
        pageViews: 25000,
        bounceRate: 45.5,
        averageSessionDuration: 180,
        topPages: [
          { url: "/products", views: 5000 },
          { url: "/", views: 3000 },
        ],
        topReferrers: [
          { source: "google", visits: 2000 },
          { source: "direct", visits: 1500 },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockTraffic);

      const result = await analyticsService.getTrafficAnalytics();

      expect(apiService.get).toHaveBeenCalledWith("/analytics/traffic");
      expect(result).toEqual(mockTraffic);
    });

    it("gets traffic analytics with date filter", async () => {
      const mockTraffic: TrafficAnalyticsFE = {
        totalVisits: 5000,
        uniqueVisitors: 2500,
        pageViews: 12500,
        bounceRate: 40.0,
        averageSessionDuration: 200,
        topPages: [],
        topReferrers: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockTraffic);

      await analyticsService.getTrafficAnalytics({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/analytics/traffic?")
      );
    });
  });

  describe("exportData", () => {
    it("exports analytics data as CSV", async () => {
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await analyticsService.exportData(undefined, "csv");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/analytics/export?format=csv"),
        expect.objectContaining({ method: "GET" })
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it("exports analytics data as PDF", async () => {
      const mockBlob = new Blob(["pdf data"], { type: "application/pdf" });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      await analyticsService.exportData(undefined, "pdf");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("format=pdf"),
        expect.any(Object)
      );
    });

    it("exports with filters", async () => {
      const mockBlob = new Blob(["data"], { type: "text/csv" });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      await analyticsService.exportData(
        {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
        "csv"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-01-01"),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("endDate=2024-01-31"),
        expect.any(Object)
      );
    });

    it("throws error when export fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
      });

      await expect(analyticsService.exportData()).rejects.toThrow(
        "Failed to export analytics data"
      );
    });
  });

  describe("trackEvent", () => {
    const originalEnv = process.env.NODE_ENV;
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const debugSpy = jest.spyOn(console, "debug").mockImplementation();

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockClear();
      debugSpy.mockClear();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
      debugSpy.mockRestore();
    });

    it("logs events in development mode", () => {
      process.env.NODE_ENV = "development";

      analyticsService.trackEvent("test_event", { key: "value" });

      expect(consoleSpy).toHaveBeenCalledWith("[Analytics Event] test_event", {
        key: "value",
      });
    });

    it("does not log in production mode", () => {
      process.env.NODE_ENV = "production";

      analyticsService.trackEvent("test_event");

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("handles events without data", () => {
      process.env.NODE_ENV = "development";

      analyticsService.trackEvent("simple_event");

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Analytics Event] simple_event",
        undefined
      );
    });
  });

  describe("error handling", () => {
    it("handles API errors in getOverview", async () => {
      const error = new Error("Network error");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(analyticsService.getOverview()).rejects.toThrow(
        "Network error"
      );
    });

    it("handles API errors in getSalesData", async () => {
      const error = new Error("Unauthorized");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(analyticsService.getSalesData()).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("handles API errors in getTopProducts", async () => {
      const error = new Error("Server error");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(analyticsService.getTopProducts()).rejects.toThrow(
        "Server error"
      );
    });
  });
});
