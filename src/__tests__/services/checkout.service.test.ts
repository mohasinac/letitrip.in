/* eslint-disable @typescript-eslint/no-explicit-any */
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import { checkoutService } from "@/services/checkout.service";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/firebase-error-logger");

describe("CheckoutService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;
  const mockLogError = logError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create order successfully with Razorpay", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        billingAddressId: "addr456",
        paymentMethod: "razorpay" as const,
        currency: "INR" as const,
        couponCode: "SUMMER20",
        notes: "Please deliver after 5 PM",
      };

      const mockResponse = {
        success: true,
        orderId: "order123",
        orderNumber: "ORD-2024-001",
        razorpayOrderId: "razorpay_123",
        amount: 1500,
        currency: "INR",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await checkoutService.createOrder(orderData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/create-order",
        orderData
      );
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.orderId).toBe("order123");
    });

    it("should create order with PayPal", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "paypal" as const,
        currency: "USD" as const,
      };

      const mockResponse = {
        success: true,
        orderId: "order456",
        orderNumber: "ORD-2024-002",
        paypalOrderId: "paypal_789",
        amount: 50,
        currency: "USD",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await checkoutService.createOrder(orderData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/create-order",
        orderData
      );
      expect(result.paypalOrderId).toBe("paypal_789");
    });

    it("should create COD order", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "cod" as const,
      };

      const mockResponse = {
        success: true,
        orderId: "order789",
        orderNumber: "ORD-2024-003",
        amount: 1200,
        currency: "INR",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await checkoutService.createOrder(orderData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/create-order",
        orderData
      );
      expect(result.success).toBe(true);
    });

    it("should create order without optional fields", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      const mockResponse = {
        success: true,
        orderId: "order999",
        orderNumber: "ORD-2024-004",
        razorpayOrderId: "razorpay_999",
        amount: 2000,
        currency: "INR",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await checkoutService.createOrder(orderData);

      expect(result).toBeDefined();
      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/create-order",
        orderData
      );
    });

    it("should handle invalid shipping address error", async () => {
      const orderData = {
        shippingAddressId: "invalid",
        paymentMethod: "razorpay" as const,
      };

      const error = new Error("Shipping address not found");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.createOrder(orderData)).rejects.toThrow(
        "Shipping address not found"
      );

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.createOrder",
        paymentMethod: "razorpay",
      });
    });

    it("should handle cart empty error", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      const error = new Error("Cart is empty");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.createOrder(orderData)).rejects.toThrow(
        "Cart is empty"
      );

      expect(mockLogError).toHaveBeenCalled();
    });

    it("should handle out of stock error", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      const error = new Error("Some items are out of stock");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.createOrder(orderData)).rejects.toThrow(
        "Some items are out of stock"
      );
    });

    it("should handle invalid coupon error", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
        couponCode: "INVALID",
      };

      const error = new Error("Invalid coupon code");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.createOrder(orderData)).rejects.toThrow(
        "Invalid coupon code"
      );
    });

    it("should handle network error", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      const error = new Error("Network error");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.createOrder(orderData)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle payment gateway error", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      const error = new Error("Payment gateway unavailable");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.createOrder(orderData)).rejects.toThrow(
        "Payment gateway unavailable"
      );
    });
  });

  describe("verifyPayment", () => {
    it("should verify single order payment successfully", async () => {
      const paymentData = {
        order_id: "order123",
        razorpay_order_id: "razorpay_order_123",
        razorpay_payment_id: "razorpay_payment_456",
        razorpay_signature: "signature789",
      };

      const mockResponse = {
        success: true,
        verified: true,
        orderId: "order123",
        paymentId: "razorpay_payment_456",
        message: "Payment verified successfully",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await checkoutService.verifyPayment(paymentData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/verify-payment",
        paymentData
      );
      expect(result.verified).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should verify multiple order payment", async () => {
      const paymentData = {
        order_ids: ["order123", "order456"],
        razorpay_order_id: "razorpay_order_multi",
        razorpay_payment_id: "razorpay_payment_multi",
        razorpay_signature: "signature_multi",
      };

      const mockResponse = {
        success: true,
        verified: true,
        orderIds: ["order123", "order456"],
        paymentId: "razorpay_payment_multi",
        message: "Payment verified for multiple orders",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await checkoutService.verifyPayment(paymentData);

      expect(result.verified).toBe(true);
      expect(result.orderIds).toHaveLength(2);
    });

    it("should handle invalid signature error", async () => {
      const paymentData = {
        order_id: "order123",
        razorpay_order_id: "razorpay_order_123",
        razorpay_payment_id: "razorpay_payment_456",
        razorpay_signature: "invalid_signature",
      };

      const error = new Error("Invalid payment signature");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.verifyPayment(paymentData)).rejects.toThrow(
        "Invalid payment signature"
      );

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.verifyPayment",
        orderId: "order123",
      });
    });

    it("should handle payment not found error", async () => {
      const paymentData = {
        order_id: "order123",
        razorpay_order_id: "razorpay_order_123",
        razorpay_payment_id: "invalid_payment",
        razorpay_signature: "signature",
      };

      const error = new Error("Payment not found");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.verifyPayment(paymentData)).rejects.toThrow(
        "Payment not found"
      );
    });

    it("should handle order not found error", async () => {
      const paymentData = {
        order_id: "invalid_order",
        razorpay_order_id: "razorpay_order_123",
        razorpay_payment_id: "razorpay_payment_456",
        razorpay_signature: "signature",
      };

      const error = new Error("Order not found");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.verifyPayment(paymentData)).rejects.toThrow(
        "Order not found"
      );
    });

    it("should handle network error during verification", async () => {
      const paymentData = {
        order_id: "order123",
        razorpay_order_id: "razorpay_order_123",
        razorpay_payment_id: "razorpay_payment_456",
        razorpay_signature: "signature",
      };

      const error = new Error("Network timeout");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.verifyPayment(paymentData)).rejects.toThrow(
        "Network timeout"
      );
    });

    it("should log error without order_id when not provided", async () => {
      const paymentData = {
        order_ids: ["order123", "order456"],
        razorpay_order_id: "razorpay_order_multi",
        razorpay_payment_id: "razorpay_payment_multi",
        razorpay_signature: "signature",
      };

      const error = new Error("Verification failed");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.verifyPayment(paymentData)).rejects.toThrow(
        "Verification failed"
      );

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.verifyPayment",
        orderId: undefined,
      });
    });
  });

  describe("capturePayPalPayment", () => {
    it("should capture PayPal payment successfully", async () => {
      const captureData = {
        orderId: "order123",
        payerId: "payer456",
      };

      const mockResponse = {
        success: true,
        captured: true,
        orderId: "order123",
        paymentId: "paypal_payment_789",
        amount: 50,
        currency: "USD",
        message: "Payment captured successfully",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await checkoutService.capturePayPalPayment(captureData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/payments/paypal/capture",
        captureData
      );
      expect(result.captured).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should handle invalid order error", async () => {
      const captureData = {
        orderId: "invalid_order",
        payerId: "payer456",
      };

      const error = new Error("Order not found");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        checkoutService.capturePayPalPayment(captureData)
      ).rejects.toThrow("Order not found");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.capturePayPalPayment",
        orderId: "invalid_order",
      });
    });

    it("should handle invalid payer error", async () => {
      const captureData = {
        orderId: "order123",
        payerId: "invalid_payer",
      };

      const error = new Error("Invalid payer ID");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        checkoutService.capturePayPalPayment(captureData)
      ).rejects.toThrow("Invalid payer ID");
    });

    it("should handle already captured payment error", async () => {
      const captureData = {
        orderId: "order123",
        payerId: "payer456",
      };

      const error = new Error("Payment already captured");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        checkoutService.capturePayPalPayment(captureData)
      ).rejects.toThrow("Payment already captured");
    });

    it("should handle PayPal gateway error", async () => {
      const captureData = {
        orderId: "order123",
        payerId: "payer456",
      };

      const error = new Error("PayPal service unavailable");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        checkoutService.capturePayPalPayment(captureData)
      ).rejects.toThrow("PayPal service unavailable");
    });

    it("should handle network error", async () => {
      const captureData = {
        orderId: "order123",
        payerId: "payer456",
      };

      const error = new Error("Network error");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        checkoutService.capturePayPalPayment(captureData)
      ).rejects.toThrow("Network error");
    });
  });

  describe("getOrderDetails", () => {
    it("should get order details successfully", async () => {
      const orderId = "order123";

      const mockResponse = {
        id: "order123",
        orderNumber: "ORD-2024-001",
        userId: "user123",
        userEmail: "user@example.com",
        userName: "Test User",
        items: [
          {
            id: "item1",
            productId: "product1",
            productName: "Test Product",
            price: 100,
            quantity: 2,
            total: 200,
          },
        ],
        subtotal: 200,
        tax: 20,
        shippingCost: 50,
        total: 270,
        paymentStatus: "paid",
        orderStatus: "processing",
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await checkoutService.getOrderDetails(orderId);

      expect(mockApiService.get).toHaveBeenCalledWith("/orders/order123");
      expect(result.id).toBe("order123");
      expect(result.orderNumber).toBe("ORD-2024-001");
      expect(result.items).toHaveLength(1);
    });

    it("should handle order not found error", async () => {
      const orderId = "invalid_order";

      const error = new Error("Order not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(checkoutService.getOrderDetails(orderId)).rejects.toThrow(
        "Order not found"
      );

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.getOrderDetails",
        orderId: "invalid_order",
      });
    });

    it("should handle unauthorized access error", async () => {
      const orderId = "order123";

      const error = new Error("Unauthorized access");
      mockApiService.get.mockRejectedValue(error);

      await expect(checkoutService.getOrderDetails(orderId)).rejects.toThrow(
        "Unauthorized access"
      );
    });

    it("should handle network error", async () => {
      const orderId = "order123";

      const error = new Error("Network error");
      mockApiService.get.mockRejectedValue(error);

      await expect(checkoutService.getOrderDetails(orderId)).rejects.toThrow(
        "Network error"
      );
    });

    it("should get order with complete details", async () => {
      const orderId = "order123";

      const mockResponse = {
        id: "order123",
        orderNumber: "ORD-2024-001",
        userId: "user123",
        userEmail: "user@example.com",
        userName: "Test User",
        items: [
          {
            id: "item1",
            productId: "product1",
            productName: "Test Product 1",
            price: 100,
            quantity: 2,
            total: 200,
          },
          {
            id: "item2",
            productId: "product2",
            productName: "Test Product 2",
            price: 150,
            quantity: 1,
            total: 150,
          },
        ],
        subtotal: 350,
        discount: 35,
        tax: 35,
        shippingCost: 50,
        total: 400,
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        orderStatus: "processing",
        shippingAddress: {
          fullName: "Test User",
          addressLine1: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India",
        },
        trackingNumber: "TRACK123",
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await checkoutService.getOrderDetails(orderId);

      expect(result.items).toHaveLength(2);
      expect(result.discount).toBe(35);
      expect(result.trackingNumber).toBe("TRACK123");
    });
  });

  describe("Error handling and logging", () => {
    it("should log errors with correct context for createOrder", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "paypal" as const,
      };

      const error = new Error("Test error");
      mockApiService.post.mockRejectedValue(error);

      await expect(checkoutService.createOrder(orderData)).rejects.toThrow();

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.createOrder",
        paymentMethod: "paypal",
      });
    });

    it("should log errors with correct context for verifyPayment", async () => {
      const paymentData = {
        order_id: "order123",
        razorpay_order_id: "razorpay_123",
        razorpay_payment_id: "payment_456",
        razorpay_signature: "sig_789",
      };

      const error = new Error("Test error");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        checkoutService.verifyPayment(paymentData)
      ).rejects.toThrow();

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.verifyPayment",
        orderId: "order123",
      });
    });

    it("should log errors with correct context for capturePayPalPayment", async () => {
      const captureData = {
        orderId: "order456",
        payerId: "payer789",
      };

      const error = new Error("Test error");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        checkoutService.capturePayPalPayment(captureData)
      ).rejects.toThrow();

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.capturePayPalPayment",
        orderId: "order456",
      });
    });

    it("should log errors with correct context for getOrderDetails", async () => {
      const error = new Error("Test error");
      mockApiService.get.mockRejectedValue(error);

      await expect(
        checkoutService.getOrderDetails("order999")
      ).rejects.toThrow();

      expect(mockLogError).toHaveBeenCalledWith(error, {
        service: "CheckoutService.getOrderDetails",
        orderId: "order999",
      });
    });
  });

  describe("API service integration", () => {
    it("should use apiService for automatic retry on createOrder", async () => {
      const orderData = {
        shippingAddressId: "addr123",
        paymentMethod: "razorpay" as const,
      };

      const mockResponse = { success: true, orderId: "order123" };
      mockApiService.post.mockResolvedValue(mockResponse);

      await checkoutService.createOrder(orderData);

      // Verify apiService.post was called (which has retry logic)
      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/create-order",
        orderData
      );
    });

    it("should use apiService for request deduplication on verifyPayment", async () => {
      const paymentData = {
        order_id: "order123",
        razorpay_order_id: "razorpay_123",
        razorpay_payment_id: "payment_456",
        razorpay_signature: "sig_789",
      };

      const mockResponse = { success: true, verified: true };
      mockApiService.post.mockResolvedValue(mockResponse);

      await checkoutService.verifyPayment(paymentData);

      // Verify apiService handles deduplication
      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/verify-payment",
        paymentData
      );
    });

    it("should use apiService caching for getOrderDetails", async () => {
      const orderId = "order123";
      const mockResponse = { id: orderId, orderNumber: "ORD-001" };

      mockApiService.get.mockResolvedValue(mockResponse);

      await checkoutService.getOrderDetails(orderId);

      // Verify apiService.get was called (which has caching)
      expect(mockApiService.get).toHaveBeenCalledWith("/orders/order123");
    });
  });
});
