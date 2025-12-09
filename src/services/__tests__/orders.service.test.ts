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

  describe("createShipment", () => {
    it("creates shipment with tracking details", async () => {
      const mockOrder = {
        id: "order1",
        status: "shipped",
        trackingNumber: "TRACK123",
        shippingProvider: "BlueDart",
        items: [],
        itemCount: 0,
        subtotal: 1000,
        shippingCost: 50,
        tax: 0,
        discount: 0,
        totalAmount: 1050,
        shippingAddress: {
          addressLine1: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const result = await ordersService.createShipment(
        "order1",
        "TRACK123",
        "BlueDart",
        new Date("2024-12-25")
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/order1/shipment",
        expect.objectContaining({
          trackingNumber: "TRACK123",
          carrier: "BlueDart",
        })
      );
      expect(result).toBeDefined();
    });

    it("creates shipment without estimated delivery", async () => {
      const mockOrder = {
        id: "order1",
        status: "shipped",
        trackingNumber: "TRACK456",
        items: [],
        itemCount: 0,
        subtotal: 1000,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        totalAmount: 1000,
        shippingAddress: {
          addressLine1: "456 Park Ave",
          city: "Delhi",
          state: "Delhi",
          postalCode: "110001",
          country: "IN",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      await ordersService.createShipment("order1", "TRACK456", "Delhivery");

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/order1/shipment",
        expect.any(Object)
      );
    });
  });

  describe("track", () => {
    it("tracks shipment status", async () => {
      const mockTracking = {
        trackingNumber: "TRACK123",
        shippingProvider: "BlueDart",
        currentStatus: "in-transit",
        estimatedDelivery: new Date("2024-12-25"),
        trackingUrl: "https://example.com/track/TRACK123",
        events: [
          {
            status: "picked-up",
            location: "Mumbai",
            timestamp: new Date("2024-12-20"),
            description: "Package picked up",
          },
          {
            status: "in-transit",
            location: "Pune",
            timestamp: new Date("2024-12-21"),
            description: "Package in transit",
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockTracking);

      const result = await ordersService.track("order1");

      expect(apiService.get).toHaveBeenCalledWith("/orders/order1/tracking");
      expect(result.trackingNumber).toBe("TRACK123");
      expect(result.events).toHaveLength(2);
    });
  });

  describe("downloadInvoice", () => {
    it("downloads invoice as PDF blob using apiService.getBlob", async () => {
      const mockBlob = new Blob(["PDF content"], { type: "application/pdf" });

      (apiService.getBlob as jest.Mock).mockResolvedValue(mockBlob);

      const result = await ordersService.downloadInvoice("order1");

      expect(apiService.getBlob).toHaveBeenCalledWith("/orders/order1/invoice");
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("application/pdf");
    });

    it("handles download errors", async () => {
      (apiService.getBlob as jest.Mock).mockRejectedValue(
        new Error("Invoice not found")
      );

      await expect(ordersService.downloadInvoice("order1")).rejects.toThrow(
        "Invoice not found"
      );
    });
  });

  describe("bulk operations", () => {
    it("bulk confirms orders", async () => {
      const mockResponse = {
        success: true,
        results: {
          success: ["order1", "order2"],
          failed: [],
        },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ordersService.bulkConfirm(["order1", "order2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({
          action: "confirm",
          orderIds: ["order1", "order2"],
        })
      );
      expect(result.summary.succeeded).toBe(2);
    });

    it("bulk processes orders", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ordersService.bulkProcess(["order1"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({ action: "process" })
      );
    });

    it("bulk ships orders with tracking number", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1", "order2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ordersService.bulkShip(["order1", "order2"], "BULK-TRACK-123");

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({
          action: "ship",
          data: { trackingNumber: "BULK-TRACK-123" },
        })
      );
    });

    it("bulk delivers orders", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ordersService.bulkDeliver(["order1"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({ action: "deliver" })
      );
    });

    it("bulk cancels orders with reason", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1", "order2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ordersService.bulkCancel(["order1", "order2"], "Out of stock");

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({
          action: "cancel",
          data: { reason: "Out of stock" },
        })
      );
    });

    it("bulk refunds orders with amount and reason", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ordersService.bulkRefund(["order1"], 1000, "Product damaged");

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({
          action: "refund",
          data: { refundAmount: 1000, reason: "Product damaged" },
        })
      );
    });

    it("bulk deletes orders", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1", "order2"], failed: [] },
        summary: { total: 2, succeeded: 2, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ordersService.bulkDelete(["order1", "order2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({ action: "delete" })
      );
    });

    it("bulk updates orders with custom data", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ordersService.bulkUpdate(["order1"], {
        status: "processing",
        internalNotes: "Priority order",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/orders/bulk",
        expect.objectContaining({
          action: "update",
          data: expect.objectContaining({ internalNotes: "Priority order" }),
        })
      );
    });

    it("handles partial failures in bulk operations", async () => {
      const mockResponse = {
        success: false,
        results: {
          success: ["order1"],
          failed: [{ id: "order2", error: "Order already shipped" }],
        },
        summary: { total: 2, succeeded: 1, failed: 1 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ordersService.bulkCancel(["order1", "order2"]);

      expect(result.summary.succeeded).toBe(1);
      expect(result.summary.failed).toBe(1);
      expect(result.results.failed).toHaveLength(1);
    });
  });

  describe("edge cases", () => {
    it("handles orders with special characters in notes", async () => {
      const mockFormData = {
        cartId: "cart1",
        shippingAddressId: "addr1",
        billingAddressId: "addr1",
        paymentMethod: "cod",
        notes: "Special chars: @#$%^&*() and unicode: 😊 नमस्ते",
      };

      const mockOrder = {
        id: "order1",
        notes: mockFormData.notes,
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

      const result = await ordersService.create(mockFormData as any);

      expect(result).toBeDefined();
    });

    it("handles concurrent bulk operations", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["order1"], failed: [] },
        summary: { total: 1, succeeded: 1, failed: 0 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        ordersService.bulkConfirm(["order1"]),
        ordersService.bulkProcess(["order2"]),
        ordersService.bulkShip(["order3"], "TRACK123"),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.post).toHaveBeenCalledTimes(3);
    });

    it("handles stats with date filters", async () => {
      const mockStats = {
        totalOrders: 50,
        pendingOrders: 5,
        completedOrders: 40,
        cancelledOrders: 5,
        totalRevenue: 25000,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      await ordersService.getStats({
        shopId: "shop1",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shopId=shop1")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-01-01")
      );
    });
  });
});
