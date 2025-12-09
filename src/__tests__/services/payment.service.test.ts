/* eslint-disable @typescript-eslint/no-explicit-any */
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import { paymentService } from "@/services/payment.service";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/firebase-error-logger");

describe("PaymentService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;
  const mockLogError = logError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Razorpay Service", () => {
    describe("createOrder", () => {
      it("should create Razorpay order successfully", async () => {
        const mockOrder = {
          id: "order_123",
          amount: 50000,
          currency: "INR" as const,
          status: "created",
          createdAt: "2024-12-09T10:00:00Z",
          receipt: "receipt_123",
        };

        mockApiService.post.mockResolvedValue(mockOrder);

        const result = await paymentService.razorpay.createOrder({
          amount: 50000,
          currency: "INR",
          receipt: "receipt_123",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/orders",
          {
            amount: 50000,
            currency: "INR",
            receipt: "receipt_123",
          }
        );
        expect(result).toEqual(mockOrder);
      });

      it("should create order with notes", async () => {
        const mockOrder = {
          id: "order_456",
          amount: 10000,
          currency: "INR" as const,
          status: "created",
          createdAt: "2024-12-09T10:00:00Z",
          notes: { userId: "user123", orderId: "ord123" },
        };

        mockApiService.post.mockResolvedValue(mockOrder);

        const result = await paymentService.razorpay.createOrder({
          amount: 10000,
          currency: "INR",
          notes: { userId: "user123", orderId: "ord123" },
        });

        expect(result.notes).toEqual({ userId: "user123", orderId: "ord123" });
      });

      it("should throw error on order creation failure", async () => {
        const error = new Error("Invalid amount");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.razorpay.createOrder({
            amount: 0,
            currency: "INR",
          })
        ).rejects.toThrow("Invalid amount");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("verifyPayment", () => {
      it("should verify payment successfully", async () => {
        const mockVerification = {
          success: true,
          orderId: "order_123",
          paymentId: "pay_123",
          amount: 50000,
          currency: "INR" as const,
          status: "captured",
        };

        mockApiService.post.mockResolvedValue(mockVerification);

        const result = await paymentService.razorpay.verifyPayment({
          orderId: "order_123",
          paymentId: "pay_123",
          signature: "valid_signature",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/verify",
          {
            orderId: "order_123",
            paymentId: "pay_123",
            signature: "valid_signature",
          }
        );
        expect(result.success).toBe(true);
      });

      it("should throw error on invalid signature", async () => {
        const error = new Error("Invalid signature");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.razorpay.verifyPayment({
            orderId: "order_123",
            paymentId: "pay_123",
            signature: "invalid_signature",
          })
        ).rejects.toThrow("Invalid signature");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("capturePayment", () => {
      it("should capture payment successfully", async () => {
        const mockCapture = {
          id: "pay_123",
          amount: 50000,
          currency: "INR" as const,
          status: "captured",
          capturedAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockCapture);

        const result = await paymentService.razorpay.capturePayment({
          paymentId: "pay_123",
          amount: 50000,
          currency: "INR",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/capture",
          {
            paymentId: "pay_123",
            amount: 50000,
            currency: "INR",
          }
        );
        expect(result.status).toBe("captured");
      });

      it("should throw error on capture failure", async () => {
        const error = new Error("Payment already captured");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.razorpay.capturePayment({
            paymentId: "pay_123",
            amount: 50000,
            currency: "INR",
          })
        ).rejects.toThrow("Payment already captured");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("refundPayment", () => {
      it("should refund full payment", async () => {
        const mockRefund = {
          id: "rfnd_123",
          paymentId: "pay_123",
          amount: 50000,
          currency: "INR" as const,
          status: "processed",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockRefund);

        const result = await paymentService.razorpay.refundPayment({
          paymentId: "pay_123",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/razorpay/refund",
          {
            paymentId: "pay_123",
          }
        );
        expect(result.id).toBe("rfnd_123");
      });

      it("should refund partial payment", async () => {
        const mockRefund = {
          id: "rfnd_456",
          paymentId: "pay_123",
          amount: 25000,
          currency: "INR" as const,
          status: "processed",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockRefund);

        const result = await paymentService.razorpay.refundPayment({
          paymentId: "pay_123",
          amount: 25000,
        });

        expect(result.amount).toBe(25000);
      });

      it("should refund with notes", async () => {
        const mockRefund = {
          id: "rfnd_789",
          paymentId: "pay_123",
          amount: 50000,
          currency: "INR" as const,
          status: "processed",
          createdAt: "2024-12-09T10:00:00Z",
          notes: { reason: "Product defective" },
        };

        mockApiService.post.mockResolvedValue(mockRefund);

        const result = await paymentService.razorpay.refundPayment({
          paymentId: "pay_123",
          notes: { reason: "Product defective" },
        });

        expect(result.notes).toEqual({ reason: "Product defective" });
      });

      it("should throw error on refund failure", async () => {
        const error = new Error("Insufficient balance");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.razorpay.refundPayment({
            paymentId: "pay_123",
          })
        ).rejects.toThrow("Insufficient balance");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("getPaymentDetails", () => {
      it("should get payment details successfully", async () => {
        const mockDetails = {
          id: "pay_123",
          orderId: "order_123",
          amount: 50000,
          currency: "INR" as const,
          status: "captured",
          method: "card",
          email: "test@example.com",
          contact: "9876543210",
          createdAt: "2024-12-09T10:00:00Z",
          capturedAt: "2024-12-09T10:05:00Z",
        };

        mockApiService.get.mockResolvedValue(mockDetails);

        const result = await paymentService.razorpay.getPaymentDetails(
          "pay_123"
        );

        expect(mockApiService.get).toHaveBeenCalledWith(
          "/api/payments/razorpay/payments/pay_123"
        );
        expect(result.id).toBe("pay_123");
      });

      it("should throw error if payment not found", async () => {
        const error = new Error("Payment not found");
        mockApiService.get.mockRejectedValue(error);

        await expect(
          paymentService.razorpay.getPaymentDetails("invalid")
        ).rejects.toThrow("Payment not found");

        expect(mockLogError).toHaveBeenCalled();
      });
    });
  });

  describe("PayPal Service", () => {
    describe("createOrder", () => {
      it("should create PayPal order successfully", async () => {
        const mockOrder = {
          id: "PAYPAL123",
          status: "CREATED",
          approvalUrl: "https://paypal.com/approve?token=PAYPAL123",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockOrder);

        const result = await paymentService.paypal.createOrder({
          amount: 100,
          currency: "USD",
          orderId: "order_123",
          returnUrl: "https://example.com/return",
          cancelUrl: "https://example.com/cancel",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/paypal/orders",
          expect.objectContaining({
            amount: 100,
            currency: "USD",
            orderId: "order_123",
          })
        );
        expect(result.approvalUrl).toContain("paypal.com");
      });

      it("should create order with description", async () => {
        const mockOrder = {
          id: "PAYPAL456",
          status: "CREATED",
          approvalUrl: "https://paypal.com/approve?token=PAYPAL456",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockOrder);

        const result = await paymentService.paypal.createOrder({
          amount: 50,
          currency: "USD",
          orderId: "order_456",
          description: "Purchase from JustForView",
          returnUrl: "https://example.com/return",
          cancelUrl: "https://example.com/cancel",
        });

        expect(result.id).toBe("PAYPAL456");
      });

      it("should throw error on order creation failure", async () => {
        const error = new Error("Invalid currency");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.paypal.createOrder({
            amount: 100,
            currency: "INR",
            orderId: "order_123",
            returnUrl: "https://example.com/return",
            cancelUrl: "https://example.com/cancel",
          })
        ).rejects.toThrow("Invalid currency");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("captureOrder", () => {
      it("should capture PayPal order successfully", async () => {
        const mockCapture = {
          id: "PAYPAL123",
          status: "COMPLETED",
          captureId: "CAPTURE123",
          amount: 100,
          currency: "USD" as const,
          capturedAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockCapture);

        const result = await paymentService.paypal.captureOrder({
          orderId: "PAYPAL123",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/paypal/capture",
          { orderId: "PAYPAL123" }
        );
        expect(result.status).toBe("COMPLETED");
      });

      it("should throw error on capture failure", async () => {
        const error = new Error("Order not approved");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.paypal.captureOrder({
            orderId: "PAYPAL123",
          })
        ).rejects.toThrow("Order not approved");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("refundPayment", () => {
      it("should refund PayPal payment", async () => {
        const mockRefund = {
          id: "REFUND123",
          paymentId: "CAPTURE123",
          amount: 100,
          currency: "USD" as const,
          status: "COMPLETED",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockRefund);

        const result = await paymentService.paypal.refundPayment({
          paymentId: "CAPTURE123",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/paypal/refund",
          { paymentId: "CAPTURE123" }
        );
        expect(result.status).toBe("COMPLETED");
      });

      it("should throw error on refund failure", async () => {
        const error = new Error("Refund window expired");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.paypal.refundPayment({
            paymentId: "CAPTURE123",
          })
        ).rejects.toThrow("Refund window expired");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("getOrderDetails", () => {
      it("should get PayPal order details", async () => {
        const mockDetails = {
          id: "PAYPAL123",
          orderId: "order_123",
          amount: 100,
          currency: "USD" as const,
          status: "COMPLETED",
          createdAt: "2024-12-09T10:00:00Z",
          capturedAt: "2024-12-09T10:05:00Z",
        };

        mockApiService.get.mockResolvedValue(mockDetails);

        const result = await paymentService.paypal.getOrderDetails("PAYPAL123");

        expect(mockApiService.get).toHaveBeenCalledWith(
          "/api/payments/paypal/orders/PAYPAL123"
        );
        expect(result.id).toBe("PAYPAL123");
      });

      it("should throw error if order not found", async () => {
        const error = new Error("Order not found");
        mockApiService.get.mockRejectedValue(error);

        await expect(
          paymentService.paypal.getOrderDetails("invalid")
        ).rejects.toThrow("Order not found");

        expect(mockLogError).toHaveBeenCalled();
      });
    });
  });

  describe("Generic Payment Service", () => {
    describe("convertCurrency", () => {
      it("should convert INR to USD", async () => {
        const mockConversion = {
          amount: 5000,
          fromCurrency: "INR" as const,
          toCurrency: "USD" as const,
          convertedAmount: 60,
          rate: 0.012,
          timestamp: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockConversion);

        const result = await paymentService.generic.convertCurrency({
          amount: 5000,
          fromCurrency: "INR",
          toCurrency: "USD",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/convert-currency",
          {
            amount: 5000,
            fromCurrency: "INR",
            toCurrency: "USD",
          }
        );
        expect(result.convertedAmount).toBe(60);
      });

      it("should throw error on conversion failure", async () => {
        const error = new Error("Invalid currency code");
        mockApiService.post.mockRejectedValue(error);

        await expect(
          paymentService.generic.convertCurrency({
            amount: 5000,
            fromCurrency: "INR",
            toCurrency: "XYZ" as any,
          })
        ).rejects.toThrow("Invalid currency code");

        expect(mockLogError).toHaveBeenCalled();
      });
    });

    describe("validateAmount", () => {
      it("should validate valid amount", async () => {
        const mockValidation = {
          isValid: true,
        };

        mockApiService.post.mockResolvedValue(mockValidation);

        const result = await paymentService.generic.validateAmount({
          amount: 50000,
          currency: "INR",
          gatewayId: "razorpay",
        });

        expect(result.isValid).toBe(true);
      });

      it("should return error for invalid amount", async () => {
        const mockValidation = {
          isValid: false,
          error: "Amount below minimum",
          minAmount: 100,
        };

        mockApiService.post.mockResolvedValue(mockValidation);

        const result = await paymentService.generic.validateAmount({
          amount: 50,
          currency: "INR",
          gatewayId: "razorpay",
        });

        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Amount below minimum");
      });
    });

    describe("calculateFee", () => {
      it("should calculate payment gateway fee", async () => {
        const mockFee = {
          fee: 1000,
          totalAmount: 51000,
        };

        mockApiService.post.mockResolvedValue(mockFee);

        const result = await paymentService.generic.calculateFee({
          gatewayId: "razorpay",
          amount: 50000,
          currency: "INR",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/calculate-fee",
          {
            gatewayId: "razorpay",
            amount: 50000,
            currency: "INR",
          }
        );
        expect(result.fee).toBe(1000);
        expect(result.totalAmount).toBe(51000);
      });

      it("should calculate fee for international transaction", async () => {
        const mockFee = {
          fee: 1500,
          totalAmount: 51500,
        };

        mockApiService.post.mockResolvedValue(mockFee);

        const result = await paymentService.generic.calculateFee({
          gatewayId: "paypal",
          amount: 50000,
          currency: "INR",
          isInternational: true,
        });

        expect(result.fee).toBe(1500);
      });
    });

    describe("getAvailableGateways", () => {
      it("should get available payment gateways", async () => {
        const mockGateways = [
          { id: "razorpay", name: "Razorpay", fee: 1000, priority: 1 },
          { id: "paypal", name: "PayPal", fee: 1500, priority: 2 },
        ];

        mockApiService.post.mockResolvedValue(mockGateways);

        const result = await paymentService.generic.getAvailableGateways({
          amount: 50000,
          currency: "INR",
          country: "IN",
        });

        expect(mockApiService.post).toHaveBeenCalledWith(
          "/api/payments/available-gateways",
          {
            amount: 50000,
            currency: "INR",
            country: "IN",
          }
        );
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("razorpay");
      });

      it("should return empty array if no gateways available", async () => {
        mockApiService.post.mockResolvedValue([]);

        const result = await paymentService.generic.getAvailableGateways({
          amount: 10,
          currency: "INR",
          country: "IN",
        });

        expect(result).toHaveLength(0);
      });
    });
  });

  describe("PaymentService - Generic Methods", () => {
    describe("createOrder", () => {
      it("should create Razorpay order", async () => {
        const mockOrder = {
          id: "order_123",
          amount: 50000,
          currency: "INR" as const,
          status: "created",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockOrder);

        const result = await paymentService.createOrder("razorpay", {
          amount: 50000,
          currency: "INR",
        });

        expect(result.id).toBe("order_123");
      });

      it("should create PayPal order", async () => {
        const mockOrder = {
          id: "PAYPAL123",
          status: "CREATED",
          approvalUrl: "https://paypal.com/approve",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockOrder);

        const result = await paymentService.createOrder("paypal", {
          amount: 100,
          currency: "USD",
          orderId: "order_123",
          returnUrl: "https://example.com/return",
          cancelUrl: "https://example.com/cancel",
        });

        expect(result.id).toBe("PAYPAL123");
      });

      it("should throw error for unsupported gateway", async () => {
        await expect(
          paymentService.createOrder("stripe" as any, {
            amount: 50000,
            currency: "INR",
          })
        ).rejects.toThrow("Unsupported gateway: stripe");
      });
    });

    describe("verifyPayment", () => {
      it("should verify Razorpay payment", async () => {
        const mockVerification = {
          success: true,
          orderId: "order_123",
          paymentId: "pay_123",
          amount: 50000,
          currency: "INR" as const,
          status: "captured",
        };

        mockApiService.post.mockResolvedValue(mockVerification);

        const result = await paymentService.verifyPayment("razorpay", {
          orderId: "order_123",
          paymentId: "pay_123",
          signature: "valid_signature",
        });

        expect(result.success).toBe(true);
      });

      it("should throw error for unsupported gateway", async () => {
        await expect(
          paymentService.verifyPayment("paypal", {
            orderId: "order_123",
            paymentId: "pay_123",
            signature: "signature",
          })
        ).rejects.toThrow("Unsupported gateway: paypal");
      });
    });

    describe("refundPayment", () => {
      it("should refund Razorpay payment", async () => {
        const mockRefund = {
          id: "rfnd_123",
          paymentId: "pay_123",
          amount: 50000,
          currency: "INR" as const,
          status: "processed",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockRefund);

        const result = await paymentService.refundPayment("razorpay", {
          paymentId: "pay_123",
        });

        expect(result.id).toBe("rfnd_123");
      });

      it("should refund PayPal payment", async () => {
        const mockRefund = {
          id: "REFUND123",
          paymentId: "CAPTURE123",
          amount: 100,
          currency: "USD" as const,
          status: "COMPLETED",
          createdAt: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockRefund);

        const result = await paymentService.refundPayment("paypal", {
          paymentId: "CAPTURE123",
        });

        expect(result.id).toBe("REFUND123");
      });

      it("should throw error for unsupported gateway", async () => {
        await expect(
          paymentService.refundPayment("stripe" as any, {
            paymentId: "pay_123",
          })
        ).rejects.toThrow("Unsupported gateway: stripe");
      });
    });

    describe("convertFromINR", () => {
      it("should convert INR to USD", async () => {
        const mockConversion = {
          amount: 5000,
          fromCurrency: "INR" as const,
          toCurrency: "USD" as const,
          convertedAmount: 60,
          rate: 0.012,
          timestamp: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockConversion);

        const result = await paymentService.convertFromINR(5000, "USD");

        expect(result).toBe(60);
      });

      it("should return same amount for INR to INR", async () => {
        const result = await paymentService.convertFromINR(5000, "INR");

        expect(result).toBe(5000);
        expect(mockApiService.post).not.toHaveBeenCalled();
      });
    });

    describe("convertToINR", () => {
      it("should convert USD to INR", async () => {
        const mockConversion = {
          amount: 100,
          fromCurrency: "USD" as const,
          toCurrency: "INR" as const,
          convertedAmount: 8300,
          rate: 83,
          timestamp: "2024-12-09T10:00:00Z",
        };

        mockApiService.post.mockResolvedValue(mockConversion);

        const result = await paymentService.convertToINR(100, "USD");

        expect(result).toBe(8300);
      });

      it("should return same amount for INR to INR", async () => {
        const result = await paymentService.convertToINR(5000, "INR");

        expect(result).toBe(5000);
        expect(mockApiService.post).not.toHaveBeenCalled();
      });
    });

    describe("validatePaymentAmount", () => {
      it("should validate payment amount", async () => {
        const mockValidation = {
          isValid: true,
        };

        mockApiService.post.mockResolvedValue(mockValidation);

        const result = await paymentService.validatePaymentAmount(
          50000,
          "INR",
          "razorpay"
        );

        expect(result.isValid).toBe(true);
      });

      it("should return validation error", async () => {
        const mockValidation = {
          isValid: false,
          error: "Amount below minimum",
        };

        mockApiService.post.mockResolvedValue(mockValidation);

        const result = await paymentService.validatePaymentAmount(
          50,
          "INR",
          "razorpay"
        );

        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Amount below minimum");
      });
    });
  });
});
