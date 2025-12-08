import {
  calculateGatewayFee,
  getBestGateway,
  getGatewayById,
} from "@/config/payment-gateways.config";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "../api.service";
import { paymentGatewayService } from "../payment-gateway.service";

jest.mock("../api.service", () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock("@/config/payment-gateways.config", () => ({
  getGatewayById: jest.fn(),
  getBestGateway: jest.fn(),
  calculateGatewayFee: jest.fn(),
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("PaymentGatewayService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create order with specified gateway", async () => {
      const mockGateway = {
        id: "razorpay",
        name: "Razorpay",
        enabled: true,
        type: "razorpay",
      };

      const mockResponse = {
        gateway: {
          id: "razorpay",
          name: "Razorpay",
        },
        order: {
          id: "order_123",
          amount: 10000,
          currency: "INR" as const,
          status: "created",
          createdAt: "2024-12-08T10:00:00Z",
        },
        fee: 236,
        totalAmount: 10236,
      };

      (getGatewayById as jest.Mock).mockReturnValue(mockGateway);
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.createOrder({
        amount: 10000,
        currency: "INR",
        country: "IN",
        gatewayId: "razorpay",
        orderId: "ORD123",
        email: "test@example.com",
      });

      expect(getGatewayById).toHaveBeenCalledWith("razorpay");
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/razorpay/orders",
        {
          amount: 10000,
          currency: "INR",
          orderId: "ORD123",
          customerId: undefined,
          email: "test@example.com",
          phone: undefined,
          notes: undefined,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should auto-select gateway when not specified", async () => {
      const mockGateway = {
        id: "stripe",
        name: "Stripe",
        enabled: true,
        type: "stripe",
      };

      const mockResponse = {
        gateway: {
          id: "stripe",
          name: "Stripe",
        },
        order: {
          id: "order_456",
          amount: 5000,
          currency: "INR" as const,
          status: "created",
          createdAt: "2024-12-08T10:00:00Z",
        },
        fee: 150,
        totalAmount: 5150,
      };

      (getBestGateway as jest.Mock).mockReturnValue(mockGateway);
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.createOrder({
        amount: 5000,
        currency: "INR",
        country: "IN",
      });

      expect(getBestGateway).toHaveBeenCalledWith({
        currency: "INR",
        country: "IN",
        amount: 5000,
      });
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/stripe/orders",
        expect.objectContaining({
          amount: 5000,
          currency: "INR",
        })
      );
      expect(result.gateway.id).toBe("stripe");
    });

    it("should throw error if specified gateway not found", async () => {
      (getGatewayById as jest.Mock).mockReturnValue(null);

      await expect(
        paymentGatewayService.createOrder({
          amount: 10000,
          currency: "INR",
          country: "IN",
          gatewayId: "invalid_gateway",
        })
      ).rejects.toThrow("Gateway invalid_gateway not found");

      expect(logError).toHaveBeenCalled();
    });

    it("should throw error if specified gateway not enabled", async () => {
      (getGatewayById as jest.Mock).mockReturnValue({
        id: "razorpay",
        enabled: false,
      });

      await expect(
        paymentGatewayService.createOrder({
          amount: 10000,
          currency: "INR",
          country: "IN",
          gatewayId: "razorpay",
        })
      ).rejects.toThrow("Gateway razorpay is not enabled");
    });

    it("should throw error if no suitable gateway found", async () => {
      (getBestGateway as jest.Mock).mockReturnValue(null);

      await expect(
        paymentGatewayService.createOrder({
          amount: 10000,
          currency: "USD",
          country: "US",
        })
      ).rejects.toThrow("No suitable gateway found for USD in US");
    });
  });

  describe("verifyPayment", () => {
    it("should verify payment successfully", async () => {
      const mockResponse = {
        success: true,
        gateway: "razorpay",
        orderId: "order_123",
        paymentId: "pay_456",
        amount: 10000,
        currency: "INR" as const,
        status: "captured",
        verifiedAt: "2024-12-08T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.verifyPayment("razorpay", {
        orderId: "order_123",
        paymentId: "pay_456",
        signature: "sig_789",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/razorpay/verify",
        {
          orderId: "order_123",
          paymentId: "pay_456",
          signature: "sig_789",
        }
      );
      expect(result.success).toBe(true);
      expect(result.status).toBe("captured");
    });

    it("should handle verification failure", async () => {
      const mockResponse = {
        success: false,
        gateway: "razorpay",
        orderId: "order_123",
        paymentId: "pay_456",
        amount: 10000,
        currency: "INR" as const,
        status: "failed",
        verifiedAt: "2024-12-08T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.verifyPayment("razorpay", {
        orderId: "order_123",
        paymentId: "pay_456",
        signature: "invalid_sig",
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe("failed");
    });

    it("should handle API errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        paymentGatewayService.verifyPayment("razorpay", {
          orderId: "order_123",
          paymentId: "pay_456",
          signature: "sig_789",
        })
      ).rejects.toThrow("Network error");

      expect(logError).toHaveBeenCalled();
    });
  });

  describe("refundPayment", () => {
    it("should refund payment fully", async () => {
      const mockResponse = {
        gateway: "razorpay",
        refundId: "rfnd_123",
        paymentId: "pay_456",
        amount: 10000,
        currency: "INR" as const,
        status: "processed",
        createdAt: "2024-12-08T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.refundPayment("razorpay", {
        paymentId: "pay_456",
        reason: "Customer request",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/razorpay/refund",
        {
          paymentId: "pay_456",
          reason: "Customer request",
        }
      );
      expect(result.refundId).toBe("rfnd_123");
      expect(result.status).toBe("processed");
    });

    it("should refund payment partially", async () => {
      const mockResponse = {
        gateway: "razorpay",
        refundId: "rfnd_456",
        paymentId: "pay_789",
        amount: 5000,
        currency: "INR" as const,
        status: "processed",
        createdAt: "2024-12-08T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.refundPayment("razorpay", {
        paymentId: "pay_789",
        amount: 5000,
        reason: "Partial refund",
      });

      expect(result.amount).toBe(5000);
    });

    it("should handle refund errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Refund failed")
      );

      await expect(
        paymentGatewayService.refundPayment("razorpay", {
          paymentId: "pay_456",
        })
      ).rejects.toThrow("Refund failed");
    });
  });

  describe("capturePayment", () => {
    it("should capture authorized payment", async () => {
      const mockResponse = {
        gateway: "razorpay",
        paymentId: "pay_123",
        amount: 10000,
        currency: "INR" as const,
        status: "captured",
        capturedAt: "2024-12-08T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.capturePayment("razorpay", {
        paymentId: "pay_123",
        amount: 10000,
        currency: "INR",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/razorpay/capture",
        {
          paymentId: "pay_123",
          amount: 10000,
          currency: "INR",
        }
      );
      expect(result.status).toBe("captured");
    });

    it("should handle capture errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Capture failed")
      );

      await expect(
        paymentGatewayService.capturePayment("razorpay", {
          paymentId: "pay_123",
          amount: 10000,
          currency: "INR",
        })
      ).rejects.toThrow("Capture failed");
    });
  });

  describe("getPaymentDetails", () => {
    it("should fetch payment details", async () => {
      const mockResponse = {
        gateway: "razorpay",
        id: "pay_123",
        orderId: "order_456",
        amount: 10000,
        currency: "INR" as const,
        status: "captured",
        method: "card",
        email: "test@example.com",
        contact: "+919876543210",
        createdAt: "2024-12-08T10:00:00Z",
        capturedAt: "2024-12-08T10:05:00Z",
        refunded: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.getPaymentDetails(
        "razorpay",
        "pay_123"
      );

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/payments/razorpay/payments/pay_123"
      );
      expect(result.id).toBe("pay_123");
      expect(result.status).toBe("captured");
      expect(result.refunded).toBe(false);
    });

    it("should handle errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Payment not found")
      );

      await expect(
        paymentGatewayService.getPaymentDetails("razorpay", "pay_invalid")
      ).rejects.toThrow("Payment not found");
    });
  });

  describe("getAvailableGateways", () => {
    it("should fetch available gateways", async () => {
      const mockResponse = [
        {
          id: "razorpay",
          name: "Razorpay",
          type: "razorpay",
          fee: 236,
          totalAmount: 10236,
          priority: 1,
          capabilities: ["cards", "upi", "netbanking"],
        },
        {
          id: "stripe",
          name: "Stripe",
          type: "stripe",
          fee: 300,
          totalAmount: 10300,
          priority: 2,
          capabilities: ["cards", "wallets"],
        },
      ];

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.getAvailableGateways({
        amount: 10000,
        currency: "INR",
        country: "IN",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/available-gateways",
        {
          amount: 10000,
          currency: "INR",
          country: "IN",
        }
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("razorpay");
    });

    it("should handle errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error("API error"));

      await expect(
        paymentGatewayService.getAvailableGateways({
          amount: 10000,
          currency: "INR",
          country: "IN",
        })
      ).rejects.toThrow("API error");
    });
  });

  describe("getGatewayStatus", () => {
    it("should fetch gateway status", async () => {
      const mockResponse = {
        id: "razorpay",
        name: "Razorpay",
        enabled: true,
        configured: true,
        healthy: true,
        lastCheck: "2024-12-08T10:00:00Z",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.getGatewayStatus("razorpay");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/payments/razorpay/status"
      );
      expect(result.healthy).toBe(true);
      expect(result.configured).toBe(true);
    });

    it("should handle unhealthy gateway", async () => {
      const mockResponse = {
        id: "stripe",
        name: "Stripe",
        enabled: true,
        configured: true,
        healthy: false,
        lastCheck: "2024-12-08T10:00:00Z",
        error: "Connection timeout",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.getGatewayStatus("stripe");

      expect(result.healthy).toBe(false);
      expect(result.error).toBe("Connection timeout");
    });
  });

  describe("testGatewayConnection", () => {
    it("should test gateway connection successfully", async () => {
      const mockResponse = {
        success: true,
        gateway: "razorpay",
        message: "Connection successful",
        testedAt: "2024-12-08T10:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.testGatewayConnection(
        "razorpay"
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/payments/razorpay/test",
        {}
      );
      expect(result.success).toBe(true);
    });

    it("should handle connection failure", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Connection failed")
      );

      await expect(
        paymentGatewayService.testGatewayConnection("razorpay")
      ).rejects.toThrow("Connection failed");
    });
  });

  describe("calculateFee", () => {
    it("should calculate domestic fee", () => {
      (calculateGatewayFee as jest.Mock).mockReturnValue(236);

      const fee = paymentGatewayService.calculateFee("razorpay", 10000, false);

      expect(calculateGatewayFee).toHaveBeenCalledWith(
        "razorpay",
        10000,
        false
      );
      expect(fee).toBe(236);
    });

    it("should calculate international fee", () => {
      (calculateGatewayFee as jest.Mock).mockReturnValue(350);

      const fee = paymentGatewayService.calculateFee("stripe", 10000, true);

      expect(calculateGatewayFee).toHaveBeenCalledWith("stripe", 10000, true);
      expect(fee).toBe(350);
    });
  });

  describe("getGatewayConfig", () => {
    it("should return gateway configuration", () => {
      const mockConfig = {
        id: "razorpay",
        name: "Razorpay",
        enabled: true,
        type: "razorpay",
      };

      (getGatewayById as jest.Mock).mockReturnValue(mockConfig);

      const config = paymentGatewayService.getGatewayConfig("razorpay");

      expect(getGatewayById).toHaveBeenCalledWith("razorpay");
      expect(config).toEqual(mockConfig);
    });

    it("should return undefined for invalid gateway", () => {
      (getGatewayById as jest.Mock).mockReturnValue(undefined);

      const config = paymentGatewayService.getGatewayConfig("invalid");

      expect(config).toBeUndefined();
    });
  });

  describe("getRecommendedGateway", () => {
    it("should get recommended gateway", () => {
      const mockGateway = {
        id: "razorpay",
        name: "Razorpay",
        enabled: true,
        type: "razorpay",
      };

      (getBestGateway as jest.Mock).mockReturnValue(mockGateway);

      const gateway = paymentGatewayService.getRecommendedGateway({
        amount: 10000,
        currency: "INR",
        country: "IN",
        requiredCapabilities: ["upi"],
      });

      expect(getBestGateway).toHaveBeenCalledWith({
        currency: "INR",
        country: "IN",
        amount: 10000,
        requiredCapabilities: ["upi"],
      });
      expect(gateway).toEqual(mockGateway);
    });
  });

  describe("validateGateway", () => {
    it("should validate healthy gateway", async () => {
      const mockGateway = {
        id: "razorpay",
        enabled: true,
      };

      const mockStatus = {
        id: "razorpay",
        name: "Razorpay",
        enabled: true,
        configured: true,
        healthy: true,
      };

      (getGatewayById as jest.Mock).mockReturnValue(mockGateway);
      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await paymentGatewayService.validateGateway("razorpay");

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject non-existent gateway", async () => {
      (getGatewayById as jest.Mock).mockReturnValue(null);

      const result = await paymentGatewayService.validateGateway("invalid");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Gateway invalid not found");
    });

    it("should reject disabled gateway", async () => {
      (getGatewayById as jest.Mock).mockReturnValue({
        id: "razorpay",
        enabled: false,
      });

      const result = await paymentGatewayService.validateGateway("razorpay");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Gateway razorpay is not enabled");
    });

    it("should reject unconfigured gateway", async () => {
      const mockGateway = {
        id: "razorpay",
        enabled: true,
      };

      const mockStatus = {
        id: "razorpay",
        name: "Razorpay",
        enabled: true,
        configured: false,
        healthy: true,
      };

      (getGatewayById as jest.Mock).mockReturnValue(mockGateway);
      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await paymentGatewayService.validateGateway("razorpay");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Gateway razorpay is not configured");
    });

    it("should reject unhealthy gateway", async () => {
      const mockGateway = {
        id: "razorpay",
        enabled: true,
      };

      const mockStatus = {
        id: "razorpay",
        name: "Razorpay",
        enabled: true,
        configured: true,
        healthy: false,
        error: "Connection timeout",
      };

      (getGatewayById as jest.Mock).mockReturnValue(mockGateway);
      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await paymentGatewayService.validateGateway("razorpay");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Connection timeout");
    });
  });

  describe("getAllGatewaysStatus", () => {
    it("should fetch all gateways status", async () => {
      const mockResponse = [
        {
          id: "razorpay",
          name: "Razorpay",
          enabled: true,
          configured: true,
          healthy: true,
        },
        {
          id: "stripe",
          name: "Stripe",
          enabled: true,
          configured: true,
          healthy: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentGatewayService.getAllGatewaysStatus();

      expect(apiService.get).toHaveBeenCalledWith("/api/payments/status");
      expect(result).toHaveLength(2);
    });

    it("should handle errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));

      await expect(
        paymentGatewayService.getAllGatewaysStatus()
      ).rejects.toThrow("API error");
    });
  });
});
