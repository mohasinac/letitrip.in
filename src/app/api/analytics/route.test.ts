/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "../lib/session";
import { Collections } from "../lib/firebase/collections";

// Mock Firebase config BEFORE imports
jest.mock("../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
  getFirestoreAdmin: jest.fn(),
}));

jest.mock("../lib/session");
jest.mock("../lib/firebase/collections");

describe("GET /api/analytics", () => {
  const mockGet = jest.fn();
  const mockWhere = jest.fn();
  const mockLimit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockLimit.mockReturnThis();
    mockWhere.mockReturnThis();
    mockGet.mockResolvedValue({ docs: [] });

    (Collections.orders as jest.Mock).mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    });

    (Collections.orderItems as jest.Mock).mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    });

    (Collections.products as jest.Mock).mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    });
  });

  describe("Authentication", () => {
    it("should return 401 when not authenticated", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/analytics");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 for non-seller/admin users", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        email: "user@example.com",
        role: "user",
      });

      const req = new NextRequest("http://localhost/api/analytics");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });
  });

  describe("Seller Analytics", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        email: "seller@example.com",
        role: "seller",
      });
    });

    it("should require shop_id for sellers", async () => {
      const req = new NextRequest("http://localhost/api/analytics");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("shop_id is required");
    });

    it("should fetch analytics for seller's shop", async () => {
      const mockOrders = [
        {
          id: "order1",
          data: () => ({
            order_id: "order1",
            total: 1000,
            status: "delivered",
            customer_id: "cust1",
            created_at: new Date().toISOString(),
          }),
        },
        {
          id: "order2",
          data: () => ({
            order_id: "order2",
            total: 2000,
            status: "pending",
            customer_id: "cust2",
            created_at: new Date().toISOString(),
          }),
        },
      ];

      const mockOrderItems = [
        {
          id: "item1",
          data: () => ({
            order_id: "order1",
            shop_id: "shop1",
          }),
        },
        {
          id: "item2",
          data: () => ({
            order_id: "order2",
            shop_id: "shop1",
          }),
        },
      ];

      const mockProducts = [
        {
          id: "prod1",
          data: () => ({ status: "published", stock_count: 10 }),
        },
        {
          id: "prod2",
          data: () => ({ status: "draft", stock_count: 0 }),
        },
      ];

      mockGet
        .mockResolvedValueOnce({ docs: mockOrderItems }) // orderItems query
        .mockResolvedValueOnce({ docs: mockOrders }) // orders batch
        .mockResolvedValueOnce({ docs: mockProducts }) // products query
        .mockResolvedValueOnce({ docs: mockOrderItems }); // orderItems for top products

      const req = new NextRequest(
        "http://localhost/api/analytics?shop_id=shop1",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.revenue.total).toBe(3000);
      expect(data.data.orders.total).toBe(2);
      expect(data.data.orders.completed).toBe(1);
      expect(data.data.orders.pending).toBe(1);
      expect(data.data.products.total).toBe(2);
      expect(data.data.products.active).toBe(1);
      expect(data.data.products.outOfStock).toBe(1);
    });

    it("should calculate average order value", async () => {
      const mockOrders = [
        {
          id: "order1",
          data: () => ({
            order_id: "order1",
            total: 1000,
            status: "delivered",
            customer_id: "cust1",
            created_at: new Date().toISOString(),
          }),
        },
        {
          id: "order2",
          data: () => ({
            order_id: "order2",
            total: 2000,
            status: "delivered",
            customer_id: "cust2",
            created_at: new Date().toISOString(),
          }),
        },
      ];

      mockGet
        .mockResolvedValueOnce({
          docs: [
            {
              id: "item1",
              data: () => ({ order_id: "order1", shop_id: "shop1" }),
            },
            {
              id: "item2",
              data: () => ({ order_id: "order2", shop_id: "shop1" }),
            },
          ],
        })
        .mockResolvedValueOnce({ docs: mockOrders })
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/analytics?shop_id=shop1",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.data.averageOrderValue).toBe(1500);
      expect(data.data.revenue.average).toBe(1500);
    });

    it("should calculate top products by revenue", async () => {
      const mockOrderItems = [
        {
          id: "item1",
          data: () => ({
            product_id: "prod1",
            product_name: "Product 1",
            price: 100,
            quantity: 5,
            shop_id: "shop1",
          }),
        },
        {
          id: "item2",
          data: () => ({
            product_id: "prod2",
            product_name: "Product 2",
            price: 200,
            quantity: 2,
            shop_id: "shop1",
          }),
        },
      ];

      mockGet
        .mockResolvedValueOnce({ docs: mockOrderItems }) // orderItems for orders
        .mockResolvedValueOnce({ docs: [] }) // orders batch (no orders)
        .mockResolvedValueOnce({ docs: [] }) // products
        .mockResolvedValueOnce({ docs: mockOrderItems }); // orderItems for top products

      const req = new NextRequest(
        "http://localhost/api/analytics?shop_id=shop1",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.data.topProducts).toHaveLength(2);
      expect(data.data.topProducts[0].id).toBe("prod1");
      expect(data.data.topProducts[0].revenue).toBe(500);
      expect(data.data.topProducts[0].quantity).toBe(5);
    });
  });

  describe("Admin Analytics", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        email: "admin@example.com",
        role: "admin",
      });
    });

    it("should fetch system-wide analytics for admin", async () => {
      const mockOrders = [
        {
          id: "order1",
          data: () => ({
            total: 1000,
            status: "delivered",
            customer_id: "cust1",
            created_at: new Date().toISOString(),
          }),
        },
        {
          id: "order2",
          data: () => ({
            total: 2000,
            status: "pending",
            customer_id: "cust2",
            created_at: new Date().toISOString(),
          }),
        },
      ];

      const mockProducts = [
        {
          id: "prod1",
          data: () => ({ status: "published", stock_count: 10 }),
        },
        {
          id: "prod2",
          data: () => ({ status: "published", stock_count: 0 }),
        },
        {
          id: "prod3",
          data: () => ({ status: "draft", stock_count: 5 }),
        },
      ];

      mockGet
        .mockResolvedValueOnce({ docs: mockOrders }) // orders query
        .mockResolvedValueOnce({ docs: mockProducts }); // products query

      const req = new NextRequest("http://localhost/api/analytics");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.revenue.total).toBe(3000);
      expect(data.data.orders.total).toBe(2);
      expect(data.data.products.total).toBe(3);
      expect(data.data.products.active).toBe(2);
      expect(data.data.products.outOfStock).toBe(1);
    });

    it("should allow admin to filter by shop_id", async () => {
      mockGet
        .mockResolvedValueOnce({ docs: [] }) // orderItems
        .mockResolvedValueOnce({ docs: [] }) // products
        .mockResolvedValueOnce({ docs: [] }); // orderItems for top products

      const req = new NextRequest(
        "http://localhost/api/analytics?shop_id=shop1",
      );
      const response = await GET(req);

      expect(response.status).toBe(200);
      expect(mockWhere).toHaveBeenCalledWith("shop_id", "==", "shop1");
    });

    it("should calculate sales over time", async () => {
      const mockOrders = [
        {
          id: "order1",
          data: () => ({
            total: 1000,
            status: "delivered",
            customer_id: "cust1",
            created_at: "2024-01-01T10:00:00Z",
          }),
        },
        {
          id: "order2",
          data: () => ({
            total: 2000,
            status: "delivered",
            customer_id: "cust2",
            created_at: "2024-01-02T10:00:00Z",
          }),
        },
      ];

      mockGet
        .mockResolvedValueOnce({ docs: mockOrders })
        .mockResolvedValueOnce({ docs: [] });

      const req = new NextRequest("http://localhost/api/analytics");
      const response = await GET(req);
      const data = await response.json();

      expect(data.data.salesOverTime).toHaveLength(2);
      expect(data.data.salesOverTime[0].date).toBe("2024-01-01");
      expect(data.data.salesOverTime[0].revenue).toBe(1000);
      expect(data.data.salesOverTime[1].date).toBe("2024-01-02");
      expect(data.data.salesOverTime[1].revenue).toBe(2000);
    });
  });

  describe("Date Range Filtering", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        email: "admin@example.com",
        role: "admin",
      });
    });

    it("should filter by start_date and end_date", async () => {
      mockGet
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/analytics?start_date=2024-01-01&end_date=2024-12-31",
      );
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith(
        "created_at",
        ">=",
        expect.any(String),
      );
      expect(mockWhere).toHaveBeenCalledWith(
        "created_at",
        "<=",
        expect.any(String),
      );
    });

    it("should default to 30 days when no dates provided", async () => {
      mockGet
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const req = new NextRequest("http://localhost/api/analytics");
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith(
        "created_at",
        ">=",
        expect.any(String),
      );
      expect(mockWhere).toHaveBeenCalledWith(
        "created_at",
        "<=",
        expect.any(String),
      );
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue({
        email: "admin@example.com",
        role: "admin",
      });
    });

    it("should handle database errors", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/analytics");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch analytics");
    });
  });
});
