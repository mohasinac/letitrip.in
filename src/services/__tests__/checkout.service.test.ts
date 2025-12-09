import { apiService } from "../api.service";
import { checkoutService } from "../checkout.service";

// Mock apiService instead of global fetch
jest.mock("../api.service");

describe("CheckoutService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("creates order successfully", async () => {
      const mockOrder = {
        id: "order123",
        amount: 10000,
        currency: "INR",
        razorpay_order_id: "rzp_123",
      };

      mockApiService.post.mockResolvedValue(mockOrder);

      const data = {
        shippingAddressId: "addr1",
        billingAddressId: "addr2",
        paymentMethod: "razorpay" as const,
        currency: "INR" as const,
      };

      const result = await checkoutService.createOrder(data);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/create-order",
        data
      );
      expect(result.id).toBe("order123");
    });

    it("creates order with optional fields", async () => {
      const mockOrder = {
        id: "order123",
        amount: 10000,
      };

      mockApiService.post.mockResolvedValue(mockOrder);

      const data = {
        shippingAddressId: "addr1",
        paymentMethod: "cod" as const,
        couponCode: "SAVE10",
        notes: "Gift wrap please",
      };

      await checkoutService.createOrder(data);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/create-order",
        data
      );
    });

    it("handles create order errors", async () => {
      mockApiService.post.mockRejectedValue(new Error("Cart is empty"));

      await expect(
        checkoutService.createOrder({
          shippingAddressId: "addr1",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow("Cart is empty");
    });

    it("handles create order network errors", async () => {
      mockApiService.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        checkoutService.createOrder({
          shippingAddressId: "addr1",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow();
    });
  });

  describe("verifyPayment", () => {
    it("verifies payment successfully", async () => {
      const mockResponse = {
        success: true,
        orderId: "order123",
        paymentId: "pay_123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const data = {
        order_id: "order123",
        razorpay_order_id: "rzp_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig_123",
      };

      const result = await checkoutService.verifyPayment(data);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/verify-payment",
        data
      );
      expect(result.success).toBe(true);
    });

    it("verifies payment with multiple order IDs", async () => {
      const mockResponse = {
        success: true,
        orders: ["order1", "order2"],
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const data = {
        order_ids: ["order1", "order2"],
        razorpay_order_id: "rzp_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig_123",
      };

      await checkoutService.verifyPayment(data);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/checkout/verify-payment",
        data
      );
    });

    it("handles verification errors", async () => {
      mockApiService.post.mockRejectedValue(new Error("Invalid signature"));

      await expect(
        checkoutService.verifyPayment({
          order_id: "order123",
          razorpay_order_id: "rzp_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "invalid_sig",
        })
      ).rejects.toThrow("Invalid signature");
    });

    it("handles verification network errors", async () => {
      mockApiService.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        checkoutService.verifyPayment({
          order_id: "order123",
          razorpay_order_id: "rzp_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "sig_123",
        })
      ).rejects.toThrow();
    });
  });

  describe("capturePayPalPayment", () => {
    it("captures PayPal payment successfully", async () => {
      const mockResponse = {
        success: true,
        orderId: "order123",
        paypalOrderId: "PAYPAL123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const data = {
        orderId: "order123",
        payerId: "payer123",
      };

      const result = await checkoutService.capturePayPalPayment(data);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/payments/paypal/capture",
        data
      );
      expect(result.success).toBe(true);
    });

    it("handles PayPal capture errors", async () => {
      mockApiService.post.mockRejectedValue(new Error("Payment declined"));

      await expect(
        checkoutService.capturePayPalPayment({
          orderId: "order123",
          payerId: "payer123",
        })
      ).rejects.toThrow("Payment declined");
    });

    it("handles PayPal capture network errors", async () => {
      mockApiService.post.mockRejectedValue(new Error("Request failed"));

      await expect(
        checkoutService.capturePayPalPayment({
          orderId: "order123",
          payerId: "payer123",
        })
      ).rejects.toThrow();
    });
  });

  describe("getOrderDetails", () => {
    it("gets order details successfully", async () => {
      const mockOrder = {
        id: "order123",
        status: "pending",
        total: 10000,
        items: [],
      };

      mockApiService.get.mockResolvedValue(mockOrder);

      const result = await checkoutService.getOrderDetails("order123");

      expect(mockApiService.get).toHaveBeenCalledWith("/orders/order123");
      expect(result.id).toBe("order123");
    });

    it("handles get order details errors", async () => {
      mockApiService.get.mockRejectedValue(new Error("Order not found"));

      await expect(checkoutService.getOrderDetails("invalid")).rejects.toThrow(
        "Order not found"
      );
    });

    it("handles get order details network errors", async () => {
      mockApiService.get.mockRejectedValue(new Error("Request failed"));

      await expect(
        checkoutService.getOrderDetails("order123")
      ).rejects.toThrow();
    });
  });
});
