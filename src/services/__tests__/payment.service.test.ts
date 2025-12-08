import { apiService } from "../api.service";
import type {
  CapturePaymentParams,
  CapturePaymentResponse,
  CreateOrderParams,
  CreateOrderResponse,
  CreatePayPalOrderParams,
  CreatePayPalOrderResponse,
  RefundPaymentParams,
  RefundPaymentResponse,
  VerifyPaymentParams,
  VerifyPaymentResponse,
} from "../payment.service";
import { paymentService } from "../payment.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("PaymentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Razorpay", () => {
    describe("createOrder", () => {
      it("creates a Razorpay order successfully", async () => {
        const params: CreateOrderParams = {
          amount: 50000,
          currency: "INR",
          orderId: "order123",
          receipt: "receipt123",
        };

        const mockResponse: CreateOrderResponse = {
          id: "rzp_order_123",
          amount: 50000,
          currency: "INR",
          receipt: "receipt123",
          status: "created",
          createdAt: "2024-01-15T10:00:00Z",
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.razorpay.createOrder(params);

        expect(apiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/orders",
          params
        );
        expect(result).toEqual(mockResponse);
        expect(result.id).toBe("rzp_order_123");
        expect(result.amount).toBe(50000);
      });

      it("creates order with notes", async () => {
        const params: CreateOrderParams = {
          amount: 30000,
          currency: "INR",
          notes: { customerId: "cust123", planType: "premium" },
        };

        const mockResponse: CreateOrderResponse = {
          id: "rzp_order_456",
          amount: 30000,
          currency: "INR",
          status: "created",
          createdAt: "2024-01-15T10:00:00Z",
          notes: { customerId: "cust123", planType: "premium" },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.razorpay.createOrder(params);

        expect(result.notes).toEqual({
          customerId: "cust123",
          planType: "premium",
        });
      });

      it("handles API errors", async () => {
        const params: CreateOrderParams = {
          amount: 50000,
          currency: "INR",
        };

        const error = new Error("Invalid amount");
        (apiService.post as jest.Mock).mockRejectedValue(error);

        await expect(
          paymentService.razorpay.createOrder(params)
        ).rejects.toThrow("Invalid amount");
      });
    });

    describe("verifyPayment", () => {
      it("verifies payment signature successfully", async () => {
        const params: VerifyPaymentParams = {
          orderId: "rzp_order_123",
          paymentId: "rzp_payment_456",
          signature: "valid_signature_hash",
        };

        const mockResponse: VerifyPaymentResponse = {
          success: true,
          orderId: "rzp_order_123",
          paymentId: "rzp_payment_456",
          amount: 50000,
          currency: "INR",
          status: "captured",
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.razorpay.verifyPayment(params);

        expect(apiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/verify",
          params
        );
        expect(result.success).toBe(true);
        expect(result.paymentId).toBe("rzp_payment_456");
      });

      it("fails verification with invalid signature", async () => {
        const params: VerifyPaymentParams = {
          orderId: "rzp_order_123",
          paymentId: "rzp_payment_456",
          signature: "invalid_signature",
        };

        const mockResponse: VerifyPaymentResponse = {
          success: false,
          orderId: "rzp_order_123",
          paymentId: "rzp_payment_456",
          amount: 50000,
          currency: "INR",
          status: "failed",
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.razorpay.verifyPayment(params);

        expect(result.success).toBe(false);
        expect(result.status).toBe("failed");
      });

      it("handles verification errors", async () => {
        const params: VerifyPaymentParams = {
          orderId: "rzp_order_123",
          paymentId: "rzp_payment_456",
          signature: "signature",
        };

        const error = new Error("Verification failed");
        (apiService.post as jest.Mock).mockRejectedValue(error);

        await expect(
          paymentService.razorpay.verifyPayment(params)
        ).rejects.toThrow("Verification failed");
      });
    });

    describe("capturePayment", () => {
      it("captures authorized payment successfully", async () => {
        const params: CapturePaymentParams = {
          paymentId: "rzp_payment_123",
          amount: 50000,
          currency: "INR",
        };

        const mockResponse: CapturePaymentResponse = {
          id: "rzp_payment_123",
          amount: 50000,
          currency: "INR",
          status: "captured",
          capturedAt: "2024-01-15T10:30:00Z",
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.razorpay.capturePayment(params);

        expect(apiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/capture",
          params
        );
        expect(result.status).toBe("captured");
        expect(result.amount).toBe(50000);
      });

      it("handles capture errors", async () => {
        const params: CapturePaymentParams = {
          paymentId: "rzp_payment_123",
          amount: 50000,
          currency: "INR",
        };

        const error = new Error("Payment already captured");
        (apiService.post as jest.Mock).mockRejectedValue(error);

        await expect(
          paymentService.razorpay.capturePayment(params)
        ).rejects.toThrow("Payment already captured");
      });
    });

    describe("refundPayment", () => {
      it("creates full refund successfully", async () => {
        const params: RefundPaymentParams = {
          paymentId: "rzp_payment_123",
        };

        const mockResponse: RefundPaymentResponse = {
          id: "rfnd_123",
          paymentId: "rzp_payment_123",
          amount: 50000,
          currency: "INR",
          status: "processed",
          createdAt: "2024-01-15T11:00:00Z",
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.razorpay.refundPayment(params);

        expect(apiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/refund",
          params
        );
        expect(result.id).toBe("rfnd_123");
        expect(result.status).toBe("processed");
      });

      it("creates partial refund successfully", async () => {
        const params: RefundPaymentParams = {
          paymentId: "rzp_payment_123",
          amount: 25000,
          notes: { reason: "Partial item return" },
        };

        const mockResponse: RefundPaymentResponse = {
          id: "rfnd_456",
          paymentId: "rzp_payment_123",
          amount: 25000,
          currency: "INR",
          status: "processed",
          createdAt: "2024-01-15T11:00:00Z",
          notes: { reason: "Partial item return" },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.razorpay.refundPayment(params);

        expect(result.amount).toBe(25000);
        expect(result.notes?.reason).toBe("Partial item return");
      });

      it("handles refund errors", async () => {
        const params: RefundPaymentParams = {
          paymentId: "rzp_payment_123",
        };

        const error = new Error("Insufficient balance");
        (apiService.post as jest.Mock).mockRejectedValue(error);

        await expect(
          paymentService.razorpay.refundPayment(params)
        ).rejects.toThrow("Insufficient balance");
      });
    });

    describe("getPaymentDetails", () => {
      it("gets payment details successfully", async () => {
        const mockDetails = {
          id: "rzp_payment_123",
          orderId: "rzp_order_456",
          amount: 50000,
          currency: "INR",
          status: "captured",
          method: "card",
          email: "test@example.com",
          contact: "+919876543210",
          createdAt: "2024-01-15T10:00:00Z",
          capturedAt: "2024-01-15T10:05:00Z",
        };

        (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

        const result = await paymentService.razorpay.getPaymentDetails(
          "rzp_payment_123"
        );

        expect(apiService.get).toHaveBeenCalledWith(
          "/api/payments/razorpay/payments/rzp_payment_123"
        );
        expect(result).toEqual(mockDetails);
        expect(result.method).toBe("card");
      });

      it("handles not found errors", async () => {
        const error = new Error("Payment not found");
        (apiService.get as jest.Mock).mockRejectedValue(error);

        await expect(
          paymentService.razorpay.getPaymentDetails("invalid_id")
        ).rejects.toThrow("Payment not found");
      });
    });
  });

  describe("PayPal", () => {
    describe("createOrder", () => {
      it("creates PayPal order successfully", async () => {
        const params: CreatePayPalOrderParams = {
          amount: 100,
          currency: "USD",
          orderId: "order123",
          description: "Test order",
          returnUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel",
        };

        const mockResponse: CreatePayPalOrderResponse = {
          id: "PAYPAL123",
          status: "CREATED",
          approvalUrl: "https://paypal.com/approve?token=xyz",
          createdAt: "2024-01-15T10:00:00Z",
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.paypal.createOrder(params);

        expect(apiService.post).toHaveBeenCalledWith(
          "/api/payments/paypal/orders",
          params
        );
        expect(result.id).toBe("PAYPAL123");
        expect(result.approvalUrl).toContain("paypal.com");
      });

      it("handles PayPal API errors", async () => {
        const params: CreatePayPalOrderParams = {
          amount: 100,
          currency: "USD",
          orderId: "order123",
          returnUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel",
        };

        const error = new Error("PayPal API error");
        (apiService.post as jest.Mock).mockRejectedValue(error);

        await expect(paymentService.paypal.createOrder(params)).rejects.toThrow(
          "PayPal API error"
        );
      });
    });

    describe("captureOrder", () => {
      it("captures PayPal order successfully", async () => {
        const params = { orderId: "PAYPAL123" };

        const mockResponse = {
          id: "PAYPAL123",
          status: "COMPLETED",
          captureId: "CAP123",
          amount: 100,
          currency: "USD",
          capturedAt: "2024-01-15T10:30:00Z",
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.paypal.captureOrder(params);

        expect(apiService.post).toHaveBeenCalledWith(
          "/api/payments/paypal/capture",
          params
        );
        expect(result.status).toBe("COMPLETED");
        expect(result.captureId).toBe("CAP123");
      });

      it("handles capture errors", async () => {
        const params = { orderId: "PAYPAL123" };

        const error = new Error("Order not approved");
        (apiService.post as jest.Mock).mockRejectedValue(error);

        await expect(
          paymentService.paypal.captureOrder(params)
        ).rejects.toThrow("Order not approved");
      });
    });

    describe("refundPayment", () => {
      it("refunds PayPal payment successfully", async () => {
        const params: RefundPaymentParams = {
          paymentId: "CAP123",
          amount: 50,
          notes: { reason: "Customer request" },
        };

        const mockResponse: RefundPaymentResponse = {
          id: "REFUND123",
          paymentId: "CAP123",
          amount: 50,
          currency: "USD",
          status: "COMPLETED",
          createdAt: "2024-01-15T11:00:00Z",
          notes: { reason: "Customer request" },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await paymentService.paypal.refundPayment(params);

        expect(apiService.post).toHaveBeenCalledWith(
          "/api/payments/paypal/refund",
          params
        );
        expect(result.status).toBe("COMPLETED");
        expect(result.amount).toBe(50);
      });
    });
  });

  describe("Currency Conversion", () => {
    it("converts from INR to foreign currency", async () => {
      const mockResponse = {
        amount: 100,
        fromCurrency: "INR",
        toCurrency: "USD",
        convertedAmount: 120,
        rate: 1.2,
        timestamp: "2024-01-15T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.convertFromINR(100, "USD");

      expect(result).toBe(120);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/convert-currency",
        {
          amount: 100,
          fromCurrency: "INR",
          toCurrency: "USD",
        }
      );
    });

    it("converts from foreign currency to INR", async () => {
      const mockResponse = {
        amount: 100,
        fromCurrency: "USD",
        toCurrency: "INR",
        convertedAmount: 8300,
        rate: 83.0,
        timestamp: "2024-01-15T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.convertToINR(100, "USD");

      expect(result).toBe(8300);
    });

    it("handles same currency (INR to INR)", async () => {
      const result = await paymentService.convertToINR(100, "INR");

      expect(result).toBe(100);
      expect(apiService.post).not.toHaveBeenCalled();
    });
  });

  describe("Payment Validation", () => {
    it("validates payment amount successfully", async () => {
      const mockResponse = {
        isValid: true,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.validatePaymentAmount(
        1000,
        "INR",
        "razorpay"
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects amount below minimum", async () => {
      const mockResponse = {
        isValid: false,
        error: "Amount below minimum",
        minAmount: 100,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.validatePaymentAmount(
        50,
        "INR",
        "razorpay"
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("minimum");
    });

    it("rejects amount above maximum", async () => {
      const mockResponse = {
        isValid: false,
        error: "Amount exceeds maximum",
        maxAmount: 500000,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentService.validatePaymentAmount(
        1000000,
        "INR",
        "razorpay"
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("maximum");
    });
  });
});
