import { checkoutService } from "../checkout.service";

// Mock global fetch
global.fetch = jest.fn();

describe("CheckoutService", () => {
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

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrder,
      });

      const data = {
        shippingAddressId: "addr1",
        billingAddressId: "addr2",
        paymentMethod: "razorpay" as const,
        currency: "INR" as const,
      };

      const result = await checkoutService.createOrder(data);

      expect(global.fetch).toHaveBeenCalledWith("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      expect(result.id).toBe("order123");
    });

    it("creates order with optional fields", async () => {
      const mockOrder = {
        id: "order123",
        amount: 10000,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrder,
      });

      const data = {
        shippingAddressId: "addr1",
        paymentMethod: "cod" as const,
        couponCode: "SAVE10",
        notes: "Gift wrap please",
      };

      await checkoutService.createOrder(data);

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/checkout/create-order",
        expect.objectContaining({
          body: JSON.stringify(data),
        })
      );
    });

    it("handles create order errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Cart is empty" }),
      });

      await expect(
        checkoutService.createOrder({
          shippingAddressId: "addr1",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow("Cart is empty");
    });

    it("handles create order network errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        checkoutService.createOrder({
          shippingAddressId: "addr1",
          paymentMethod: "razorpay",
        })
      ).rejects.toThrow("Failed to create order");
    });
  });

  describe("verifyPayment", () => {
    it("verifies payment successfully", async () => {
      const mockResponse = {
        success: true,
        orderId: "order123",
        paymentId: "pay_123",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const data = {
        order_id: "order123",
        razorpay_order_id: "rzp_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig_123",
      };

      const result = await checkoutService.verifyPayment(data);

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/checkout/verify-payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      expect(result.success).toBe(true);
    });

    it("verifies payment with multiple order IDs", async () => {
      const mockResponse = {
        success: true,
        orders: ["order1", "order2"],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const data = {
        order_ids: ["order1", "order2"],
        razorpay_order_id: "rzp_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig_123",
      };

      await checkoutService.verifyPayment(data);

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/checkout/verify-payment",
        expect.objectContaining({
          body: JSON.stringify(data),
        })
      );
    });

    it("handles verification errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Invalid signature" }),
      });

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
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        checkoutService.verifyPayment({
          order_id: "order123",
          razorpay_order_id: "rzp_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "sig_123",
        })
      ).rejects.toThrow("Failed to verify payment");
    });
  });

  describe("capturePayPalPayment", () => {
    it("captures PayPal payment successfully", async () => {
      const mockResponse = {
        success: true,
        orderId: "order123",
        paypalOrderId: "PAYPAL123",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const data = {
        orderId: "order123",
        payerId: "payer123",
      };

      const result = await checkoutService.capturePayPalPayment(data);

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/payments/paypal/capture",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      expect(result.success).toBe(true);
    });

    it("handles PayPal capture errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Payment declined" }),
      });

      await expect(
        checkoutService.capturePayPalPayment({
          orderId: "order123",
          payerId: "payer123",
        })
      ).rejects.toThrow("Payment declined");
    });

    it("handles PayPal capture network errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        checkoutService.capturePayPalPayment({
          orderId: "order123",
          payerId: "payer123",
        })
      ).rejects.toThrow("Failed to capture PayPal payment");
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

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrder,
      });

      const result = await checkoutService.getOrderDetails("order123");

      expect(global.fetch).toHaveBeenCalledWith("/api/orders/order123", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      expect(result.id).toBe("order123");
    });

    it("handles get order details errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Order not found" }),
      });

      await expect(checkoutService.getOrderDetails("invalid")).rejects.toThrow(
        "Order not found"
      );
    });

    it("handles get order details network errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(checkoutService.getOrderDetails("order123")).rejects.toThrow(
        "Failed to fetch order details"
      );
    });
  });
});
