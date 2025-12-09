/* eslint-disable @typescript-eslint/no-explicit-any */
import { logServiceError } from "@/lib/error-logger";
import { apiService } from "@/services/api.service";
import { ordersService } from "@/services/orders.service";
import type { OrderBE } from "@/types/backend/order.types";
import { Timestamp } from "firebase/firestore";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/error-logger");

describe("OrdersService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;
  const mockLogServiceError = logServiceError as jest.Mock;

  const now = Timestamp.now();

  // Mock data
  const mockOrderBE: OrderBE = {
    id: "order123",
    orderNumber: "ORD-2024-001",
    userId: "user123",
    userEmail: "test@example.com",
    userName: "Test User",
    shopId: "shop123",
    shopName: "Test Shop",
    sellerId: "seller123",
    items: [
      {
        id: "item1",
        productId: "product1",
        productName: "Test Product",
        productSlug: "test-product",
        productImage: "https://example.com/product.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU001",
        price: 100,
        quantity: 2,
        subtotal: 200,
        discount: 10,
        tax: 20,
        total: 210,
      },
    ],
    itemCount: 2,
    subtotal: 200,
    discount: 10,
    tax: 20,
    shippingCost: 50,
    total: 260,
    couponId: null,
    couponCode: null,
    couponDiscount: 0,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    paymentId: "payment123",
    paymentGateway: "razorpay",
    paidAt: now,
    shippingMethod: "standard",
    shippingAddress: {
      id: "addr123",
      fullName: "Test User",
      phoneNumber: "1234567890",
      addressLine1: "123 Main St",
      addressLine2: null,
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
      isDefault: true,
    },
    billingAddress: null,
    shippingProvider: null,
    trackingNumber: null,
    estimatedDelivery: null,
    deliveredAt: null,
    status: "confirmed",
    statusHistory: [
      {
        status: "pending",
        timestamp: now,
        updatedBy: "system",
        notes: "Order created",
      },
    ],
    internalNotes: null,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list orders with filters", async () => {
      const mockResponse = {
        data: [mockOrderBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await ordersService.list({
        status: "confirmed",
        page: 1,
        limit: 10,
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("should list orders without filters", async () => {
      const mockResponse = {
        data: [mockOrderBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await ordersService.list();

      expect(result.data).toHaveLength(1);
    });

    it("should handle empty order list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await ordersService.list();

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getSellerOrders", () => {
    it("should get seller orders", async () => {
      const mockResponse = {
        data: [mockOrderBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await ordersService.getSellerOrders({
        shopId: "shop123",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].shopName).toBe("Test Shop");
    });
  });

  describe("getById", () => {
    it("should get order by ID", async () => {
      mockApiService.get.mockResolvedValue(mockOrderBE);

      const result = await ordersService.getById("order123");

      expect(mockApiService.get).toHaveBeenCalledWith("/orders/order123");
      expect(result.id).toBe("order123");
      expect(result.orderNumber).toBe("ORD-2024-001");
    });

    it("should throw error if order not found", async () => {
      mockApiService.get.mockRejectedValue(new Error("Order not found"));

      await expect(ordersService.getById("invalid")).rejects.toThrow(
        "Order not found"
      );
    });
  });

  describe("create", () => {
    it("should create order successfully", async () => {
      const formData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      mockApiService.post.mockResolvedValue(mockOrderBE);

      const result = await ordersService.create(formData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/orders",
        expect.any(Object)
      );
      expect(result.id).toBe("order123");
    });

    it("should throw error on creation failure", async () => {
      const formData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      mockApiService.post.mockRejectedValue(new Error("Cart is empty"));

      await expect(ordersService.create(formData)).rejects.toThrow(
        "Cart is empty"
      );
    });
  });

  describe("updateStatus", () => {
    it("should update order status", async () => {
      mockApiService.patch.mockResolvedValue({
        ...mockOrderBE,
        status: "shipped",
      });

      const result = await ordersService.updateStatus(
        "order123",
        "shipped",
        "Ready for delivery"
      );

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/orders/order123",
        expect.any(Object)
      );
      expect(result.status).toBe("shipped");
    });

    it("should update status without internal notes", async () => {
      mockApiService.patch.mockResolvedValue({
        ...mockOrderBE,
        status: "delivered",
      });

      const result = await ordersService.updateStatus("order123", "delivered");

      expect(result.status).toBe("delivered");
    });
  });

  describe("createShipment", () => {
    it("should create shipment successfully", async () => {
      mockApiService.post.mockResolvedValue({
        ...mockOrderBE,
        trackingNumber: "TRACK123",
        shippingProvider: "FedEx",
      });

      const result = await ordersService.createShipment(
        "order123",
        "TRACK123",
        "FedEx"
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/orders/order123/shipment",
        expect.any(Object)
      );
      expect(result.trackingNumber).toBe("TRACK123");
      expect(result.shippingProvider).toBe("FedEx");
    });

    it("should create shipment with estimated delivery", async () => {
      const estimatedDate = new Date("2024-12-20");

      mockApiService.post.mockResolvedValue({
        ...mockOrderBE,
        trackingNumber: "TRACK456",
        shippingProvider: "DHL",
        estimatedDelivery: Timestamp.fromDate(estimatedDate),
      });

      const result = await ordersService.createShipment(
        "order123",
        "TRACK456",
        "DHL",
        estimatedDate
      );

      expect(result.trackingNumber).toBe("TRACK456");
    });
  });

  describe("cancel", () => {
    it("should cancel order successfully", async () => {
      mockApiService.post.mockResolvedValue({
        ...mockOrderBE,
        status: "cancelled",
      });

      const result = await ordersService.cancel("order123", "Changed my mind");

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/orders/order123/cancel",
        { reason: "Changed my mind" }
      );
      expect(result.status).toBe("cancelled");
    });

    it("should throw error if order cannot be cancelled", async () => {
      mockApiService.post.mockRejectedValue(new Error("Order already shipped"));

      await expect(
        ordersService.cancel("order123", "Cancel reason")
      ).rejects.toThrow("Order already shipped");
    });
  });

  describe("track", () => {
    it("should get tracking information", async () => {
      const mockTracking = {
        trackingNumber: "TRACK123",
        shippingProvider: "FedEx",
        currentStatus: "in_transit",
        estimatedDelivery: new Date("2024-12-20"),
        trackingUrl: "https://fedex.com/track/TRACK123",
        events: [
          {
            status: "picked_up",
            location: "Mumbai",
            timestamp: new Date(),
            description: "Package picked up",
          },
          {
            status: "in_transit",
            location: "Delhi",
            timestamp: new Date(),
            description: "In transit",
          },
        ],
      };

      mockApiService.get.mockResolvedValue(mockTracking);

      const result = await ordersService.track("order123");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/orders/order123/tracking"
      );
      expect(result.trackingNumber).toBe("TRACK123");
      expect(result.events).toHaveLength(2);
    });

    it("should throw error if tracking not available", async () => {
      mockApiService.get.mockRejectedValue(new Error("Tracking not available"));

      await expect(ordersService.track("order123")).rejects.toThrow(
        "Tracking not available"
      );
    });
  });

  describe("downloadInvoice", () => {
    it("should download invoice as blob", async () => {
      const mockBlob = new Blob(["invoice content"], {
        type: "application/pdf",
      });

      mockApiService.getBlob.mockResolvedValue(mockBlob);

      const result = await ordersService.downloadInvoice("order123");

      expect(mockApiService.getBlob).toHaveBeenCalledWith(
        "/orders/order123/invoice"
      );
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("application/pdf");
    });

    it("should throw error if invoice not available", async () => {
      mockApiService.getBlob.mockRejectedValue(new Error("Invoice not found"));

      await expect(ordersService.downloadInvoice("order123")).rejects.toThrow(
        "Invoice not found"
      );
    });
  });

  describe("getStats", () => {
    it("should get order statistics", async () => {
      const mockStats = {
        totalOrders: 100,
        totalRevenue: 50000,
        averageOrderValue: 500,
        pendingOrders: 10,
        confirmedOrders: 30,
        shippedOrders: 40,
        deliveredOrders: 20,
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await ordersService.getStats();

      expect(mockApiService.get).toHaveBeenCalledWith("/orders/stats");
      expect(result.totalOrders).toBe(100);
    });

    it("should get stats with filters", async () => {
      const mockStats = {
        totalOrders: 50,
        totalRevenue: 25000,
        averageOrderValue: 500,
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await ordersService.getStats({
        shopId: "shop123",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.totalOrders).toBe(50);
    });
  });

  describe("bulkAction", () => {
    it("should perform bulk action successfully", async () => {
      const mockResponse = {
        success: true,
        successCount: 3,
        failureCount: 0,
        results: [
          { id: "order1", success: true },
          { id: "order2", success: true },
          { id: "order3", success: true },
        ],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkAction("confirm", [
        "order1",
        "order2",
        "order3",
      ]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "confirm",
        orderIds: ["order1", "order2", "order3"],
        data: undefined,
      });
      expect(result.successCount).toBe(3);
    });

    it("should handle partial bulk action failure", async () => {
      const mockResponse = {
        success: false,
        successCount: 2,
        failureCount: 1,
        results: [
          { id: "order1", success: true },
          { id: "order2", success: true },
          { id: "order3", success: false, error: "Already shipped" },
        ],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkAction("ship", [
        "order1",
        "order2",
        "order3",
      ]);

      expect(result.failureCount).toBe(1);
    });

    it("should log error on bulk action failure", async () => {
      const error = new Error("Bulk action failed");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        ordersService.bulkAction("confirm", ["order1"])
      ).rejects.toThrow("Bulk action failed");

      expect(mockLogServiceError).toHaveBeenCalledWith(
        "OrdersService",
        "bulkAction",
        error
      );
    });
  });

  describe("bulkConfirm", () => {
    it("should bulk confirm orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkConfirm(["order1", "order2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "confirm",
        orderIds: ["order1", "order2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkProcess", () => {
    it("should bulk process orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkProcess(["order1", "order2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "process",
        orderIds: ["order1", "order2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkShip", () => {
    it("should bulk ship orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkShip(
        ["order1", "order2"],
        "TRACK123"
      );

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "ship",
        orderIds: ["order1", "order2"],
        data: { trackingNumber: "TRACK123" },
      });
      expect(result.success).toBe(true);
    });

    it("should bulk ship without tracking number", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkShip(["order1", "order2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "ship",
        orderIds: ["order1", "order2"],
        data: { trackingNumber: undefined },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkDeliver", () => {
    it("should bulk deliver orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkDeliver(["order1", "order2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "deliver",
        orderIds: ["order1", "order2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkCancel", () => {
    it("should bulk cancel orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkCancel(
        ["order1", "order2"],
        "Out of stock"
      );

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "cancel",
        orderIds: ["order1", "order2"],
        data: { reason: "Out of stock" },
      });
      expect(result.success).toBe(true);
    });

    it("should bulk cancel without reason", async () => {
      const mockResponse = {
        success: true,
        successCount: 1,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkCancel(["order1"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "cancel",
        orderIds: ["order1"],
        data: { reason: undefined },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkRefund", () => {
    it("should bulk refund orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkRefund(
        ["order1", "order2"],
        500,
        "Product defective"
      );

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "refund",
        orderIds: ["order1", "order2"],
        data: { refundAmount: 500, reason: "Product defective" },
      });
      expect(result.success).toBe(true);
    });

    it("should bulk refund without amount and reason", async () => {
      const mockResponse = {
        success: true,
        successCount: 1,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkRefund(["order1"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "refund",
        orderIds: ["order1"],
        data: { refundAmount: undefined, reason: undefined },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkDelete", () => {
    it("should bulk delete orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkDelete(["order1", "order2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "delete",
        orderIds: ["order1", "order2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkUpdate", () => {
    it("should bulk update orders", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
        results: [],
      };

      const updates = {
        status: "shipped",
        internalNotes: "Bulk shipped",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await ordersService.bulkUpdate(
        ["order1", "order2"],
        updates
      );

      expect(mockApiService.post).toHaveBeenCalledWith("/orders/bulk", {
        action: "update",
        orderIds: ["order1", "order2"],
        data: updates,
      });
      expect(result.success).toBe(true);
    });
  });
});
