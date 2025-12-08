import { apiService } from "../api.service";
import { ordersService } from "../orders.service";

jest.mock("../api.service");
jest.mock("@/lib/error-logger");

describe("OrdersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("lists orders with filters", async () => {
      const mockResponse = {
        data: [
          {
            id: "order1",
            orderNumber: "ORD-001",
            status: "pending",
            totalAmount: 1000,
          },
        ],
        count: 1,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ordersService.list({ status: "pending" });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/orders")
      );
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("handles empty order list", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10 },
      });

      const result = await ordersService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getSellerOrders", () => {
    it("gets seller orders using list method", async () => {
      const mockResponse = {
        data: [
          {
            id: "order1",
            orderNumber: "ORD-001",
            shopId: "shop1",
          },
        ],
        count: 1,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ordersService.getSellerOrders({ shopId: "shop1" });

      expect(apiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getById", () => {
    it("gets order by ID", async () => {
      const mockOrder = {
        id: "order1",
        orderNumber: "ORD-001",
        status: "pending",
        totalAmount: 1000,
        items: [],
        shippingAddress: {},
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.getById("order1");

      expect(apiService.get).toHaveBeenCalledWith("/orders/order1");
      expect(result).toBeDefined();
    });
  });

  describe("create", () => {
    it("creates a new order", async () => {
      const mockFormData = {
        cartId: "cart1",
        shippingAddressId: "addr1",
        billingAddressId: "addr1",
        paymentMethod: "cod",
        notes: "Test order",
      };

      const mockOrder = {
        id: "order1",
        orderNumber: "ORD-001",
        status: "pending",
        totalAmount: 1000,
        items: [],
        itemCount: 0,
        subtotal: 1000,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        shippingAddress: {
          addressLine1: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.create(mockFormData as any);

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders",
        expect.any(Object)
      );
      expect(result).toBeDefined();
    });
  });

  describe("updateStatus", () => {
    it("updates order status", async () => {
      const mockOrder = {
        id: "order1",
        orderNumber: "ORD-001",
        status: "confirmed",
        totalAmount: 1000,
        items: [],
        itemCount: 0,
        subtotal: 1000,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        shippingAddress: {
          addressLine1: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.updateStatus(
        "order1",
        "confirmed",
        "Order confirmed by seller"
      );

      expect(apiService.patch).toHaveBeenCalledWith(
        "/orders/order1",
        expect.objectContaining({
          status: "confirmed",
        })
      );
      expect(result).toBeDefined();
    });

    it("updates status without notes", async () => {
      const mockOrder = {
        id: "order1",
        status: "shipped",
        items: [],
        itemCount: 0,
        subtotal: 1000,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        totalAmount: 1000,
        shippingAddress: {
          addressLine1: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockOrder);

      await ordersService.updateStatus("order1", "shipped");

      expect(apiService.patch).toHaveBeenCalledWith(
        "/orders/order1",
        expect.any(Object)
      );
    });
  });

  describe("cancel", () => {
    it("cancels an order", async () => {
      const mockOrder = {
        id: "order1",
        status: "cancelled",
        cancellationReason: "Customer request",
        items: [],
        itemCount: 0,
        subtotal: 1000,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        totalAmount: 1000,
        shippingAddress: {
          addressLine1: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.cancel("order1", "Customer request");

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/order1/cancel",
        expect.objectContaining({
          reason: "Customer request",
        })
      );
      expect(result).toBeDefined();
    });
  });

  // Note: refund method doesn't exist in orders.service - skipping test

  describe("getStats", () => {
    it("gets order statistics", async () => {
      const mockStats = {
        totalOrders: 100,
        pendingOrders: 10,
        completedOrders: 80,
        cancelledOrders: 10,
        totalRevenue: 50000,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await ordersService.getStats();

      expect(apiService.get).toHaveBeenCalledWith("/orders/stats");
      expect(result.totalOrders).toBe(100);
      expect(result.totalRevenue).toBe(50000);
    });
  });

  describe("error handling", () => {
    it("handles API errors in list", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(ordersService.list()).rejects.toThrow("Network error");
    });

    it("handles API errors in create", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      await expect(ordersService.create({} as any)).rejects.toThrow(
        "Validation failed"
      );
    });
  });
});
