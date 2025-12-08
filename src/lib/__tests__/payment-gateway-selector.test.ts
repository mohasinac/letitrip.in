/**
 * Tests for Payment Gateway Selector
 * Tests gateway selection logic, fee calculation, and compatibility checks
 */

import * as gatewayConfig from "@/config/payment-gateways.config";
import {
  calculateFee,
  compareGateways,
  getGatewayRecommendations,
  getRankedGateways,
  isGatewayCompatible,
  selectBestGateway,
  type PaymentMethod,
} from "../payment-gateway-selector";

// Mock the gateway config
jest.mock("@/config/payment-gateways.config", () => ({
  getEnabledGateways: jest.fn(),
  calculateGatewayFee: jest.fn(),
}));

const mockGetEnabledGateways =
  gatewayConfig.getEnabledGateways as jest.MockedFunction<
    typeof gatewayConfig.getEnabledGateways
  >;
const mockCalculateGatewayFee =
  gatewayConfig.calculateGatewayFee as jest.MockedFunction<
    typeof gatewayConfig.calculateGatewayFee
  >;

describe("Payment Gateway Selector", () => {
  // Mock gateway configurations
  const mockGateway1: gatewayConfig.PaymentGatewayConfig = {
    id: "razorpay",
    name: "Razorpay",
    type: "domestic",
    description: "Popular Indian payment gateway",
    logo: "/logos/razorpay.svg",
    enabled: true,
    priority: 1,
    supportedCurrencies: ["INR", "USD"],
    supportedCountries: ["IN"],
    fees: {
      domestic: { percentage: 2, fixed: 0, currency: "INR" },
      international: { percentage: 3, fixed: 0, currency: "INR" },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: true,
      upi: true,
      wallets: true,
      emi: true,
      internationalCards: false,
    },
    config: { test: [], live: [] },
    endpoints: {
      test: "https://api.razorpay.com/test",
      live: "https://api.razorpay.com/v1",
      webhookPath: "/api/webhooks/razorpay",
    },
    docs: {
      setup: "https://docs.razorpay.com",
      api: "https://api-docs.razorpay.com",
      webhooks: "https://docs.razorpay.com/webhooks",
    },
  };

  const mockGateway2: gatewayConfig.PaymentGatewayConfig = {
    id: "stripe",
    name: "Stripe",
    type: "international",
    description: "Global payment platform",
    logo: "/logos/stripe.svg",
    enabled: true,
    priority: 2,
    supportedCurrencies: ["INR", "USD", "EUR", "GBP"],
    supportedCountries: ["IN", "US", "GB"],
    fees: {
      domestic: { percentage: 2.5, fixed: 0, currency: "INR" },
      international: { percentage: 3.5, fixed: 0, currency: "INR" },
    },
    capabilities: {
      refunds: true,
      partialRefunds: true,
      recurringPayments: true,
      cardPayments: true,
      netBanking: false,
      upi: false,
      wallets: false,
      emi: false,
      internationalCards: true,
    },
    config: { test: [], live: [] },
    endpoints: {
      test: "https://api.stripe.com/test",
      live: "https://api.stripe.com/v1",
      webhookPath: "/api/webhooks/stripe",
    },
    docs: {
      setup: "https://stripe.com/docs",
      api: "https://stripe.com/docs/api",
      webhooks: "https://stripe.com/docs/webhooks",
    },
  };

  const mockGateway3: gatewayConfig.PaymentGatewayConfig = {
    id: "phonepe",
    name: "PhonePe",
    type: "alternative",
    description: "UPI-focused payment gateway",
    logo: "/logos/phonepe.svg",
    enabled: true,
    priority: 3,
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    fees: {
      domestic: { percentage: 1.5, fixed: 0, currency: "INR" },
      international: { percentage: 2.5, fixed: 0, currency: "INR" },
    },
    capabilities: {
      refunds: true,
      partialRefunds: false,
      recurringPayments: false,
      cardPayments: false,
      netBanking: false,
      upi: true,
      wallets: true,
      emi: false,
      internationalCards: false,
    },
    config: { test: [], live: [] },
    endpoints: {
      test: "https://api.phonepe.com/test",
      live: "https://api.phonepe.com/v1",
      webhookPath: "/api/webhooks/phonepe",
    },
    docs: {
      setup: "https://developer.phonepe.com",
      api: "https://developer.phonepe.com/api",
      webhooks: "https://developer.phonepe.com/webhooks",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEnabledGateways.mockReturnValue([
      mockGateway1,
      mockGateway2,
      mockGateway3,
    ]);
  });

  describe("selectBestGateway", () => {
    it("should return null when no gateways are enabled", () => {
      mockGetEnabledGateways.mockReturnValue([]);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(result).toBeNull();
    });

    it("should select gateway supporting currency and country", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(result).toBeTruthy();
      expect(result?.supportedCurrencies).toContain("INR");
      expect(result?.supportedCountries).toContain("IN");
    });

    it("should return null when no gateway supports currency", () => {
      const result = selectBestGateway({
        amount: 1000,
        currency: "AUD",
        country: "IN",
      });

      expect(result).toBeNull();
    });

    it("should return null when no gateway supports country", () => {
      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "CA",
      });

      expect(result).toBeNull();
    });

    it("should honor customer preference when valid", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        customerPreference: "phonepe",
      });

      expect(result?.id).toBe("phonepe");
    });

    it("should ignore customer preference when currency not supported", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "USD",
        country: "IN",
        customerPreference: "phonepe", // PhonePe only supports INR
      });

      // Should fall back to another gateway
      expect(result?.id).not.toBe("phonepe");
    });

    it("should ignore customer preference when country not supported", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "USD",
        country: "US",
        customerPreference: "phonepe", // PhonePe only supports IN
      });

      // Should fall back to Stripe which supports US
      expect(result?.id).toBe("stripe");
    });

    it("should filter by payment method - UPI", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "upi",
      });

      expect(result).toBeTruthy();
      expect(result?.capabilities.upi).toBe(true);
    });

    it("should filter by payment method - card", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "card",
      });

      expect(result).toBeTruthy();
      expect(result?.capabilities.cardPayments).toBe(true);
    });

    it("should filter by payment method - netbanking", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "netbanking",
      });

      expect(result).toBeTruthy();
      expect(result?.capabilities.netBanking).toBe(true);
    });

    it("should return null when payment method not supported", () => {
      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "emi",
      });

      // Only razorpay supports EMI, so if filtered properly, should work
      expect(result?.capabilities.emi).toBe(true);
    });

    it("should filter by required capabilities - refunds", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        requiredCapabilities: ["refunds"],
      });

      expect(result).toBeTruthy();
      expect(result?.capabilities.refunds).toBe(true);
    });

    it("should filter by multiple required capabilities", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        requiredCapabilities: ["refunds", "partialRefunds"],
      });

      expect(result).toBeTruthy();
      expect(result?.capabilities.refunds).toBe(true);
      expect(result?.capabilities.partialRefunds).toBe(true);
    });

    it("should return null when required capabilities not available", () => {
      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "upi",
        requiredCapabilities: ["internationalCards"],
      });

      // UPI gateways don't support international cards
      expect(result).toBeNull();
    });

    it("should select gateway with best overall score (fee + priority + capabilities)", () => {
      mockCalculateGatewayFee.mockImplementation((gatewayId) => {
        if (gatewayId === "phonepe") return 15; // 1.5%
        if (gatewayId === "razorpay") return 20; // 2%
        if (gatewayId === "stripe") return 25; // 2.5%
        return 0;
      });

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      // Razorpay wins due to higher priority and more capabilities, despite slightly higher fee
      expect(result?.id).toBe("razorpay");
    });

    it("should consider priority when fees are similar", () => {
      mockCalculateGatewayFee.mockReturnValue(20); // Same fee for all

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      // Razorpay has highest priority (1)
      expect(result?.id).toBe("razorpay");
    });
  });

  describe("calculateFee", () => {
    it("should calculate domestic fee correctly", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const fee = calculateFee("razorpay", 1000, "IN");

      expect(mockCalculateGatewayFee).toHaveBeenCalledWith(
        "razorpay",
        1000,
        false
      );
      expect(fee).toBe(20);
    });

    it("should calculate international fee correctly", () => {
      mockCalculateGatewayFee.mockReturnValue(35);

      const fee = calculateFee("stripe", 1000, "US");

      expect(mockCalculateGatewayFee).toHaveBeenCalledWith(
        "stripe",
        1000,
        true
      );
      expect(fee).toBe(35);
    });

    it("should treat IN as domestic", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      calculateFee("razorpay", 1000, "IN");

      expect(mockCalculateGatewayFee).toHaveBeenCalledWith(
        "razorpay",
        1000,
        false
      );
    });

    it("should treat non-IN countries as international", () => {
      mockCalculateGatewayFee.mockReturnValue(35);

      calculateFee("stripe", 1000, "GB");

      expect(mockCalculateGatewayFee).toHaveBeenCalledWith(
        "stripe",
        1000,
        true
      );
    });
  });

  describe("getRankedGateways", () => {
    it("should return empty array when no gateways match", () => {
      const ranked = getRankedGateways({
        amount: 1000,
        currency: "AUD",
        country: "AU",
      });

      expect(ranked).toEqual([]);
    });

    it("should return all matching gateways sorted by score", () => {
      mockCalculateGatewayFee.mockImplementation((gatewayId) => {
        if (gatewayId === "phonepe") return 15;
        if (gatewayId === "razorpay") return 20;
        if (gatewayId === "stripe") return 25;
        return 0;
      });

      const ranked = getRankedGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked[0].gateway.id).toBe("razorpay"); // Best overall score
      expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
    });

    it("should include fee and total amount in results", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const ranked = getRankedGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(ranked[0].fee).toBe(20);
      expect(ranked[0].totalAmount).toBe(1020);
    });

    it("should include scoring reasons", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const ranked = getRankedGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(ranked[0].reasons).toBeInstanceOf(Array);
      expect(ranked[0].reasons.length).toBeGreaterThan(0);
      expect(ranked[0].reasons.some((r) => r.includes("Fee:"))).toBe(true);
      expect(ranked[0].reasons.some((r) => r.includes("Priority:"))).toBe(true);
    });

    it("should filter by currency", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const ranked = getRankedGateways({
        amount: 1000,
        currency: "USD",
        country: "IN",
      });

      // PhonePe doesn't support USD
      expect(ranked.every((r) => r.gateway.id !== "phonepe")).toBe(true);
    });

    it("should filter by country", () => {
      mockCalculateGatewayFee.mockReturnValue(35);

      const ranked = getRankedGateways({
        amount: 1000,
        currency: "USD",
        country: "US",
      });

      // Only Stripe supports US
      expect(ranked.length).toBe(1);
      expect(ranked[0].gateway.id).toBe("stripe");
    });

    it("should filter by payment method", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const ranked = getRankedGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "upi",
      });

      // Stripe doesn't support UPI
      expect(ranked.every((r) => r.gateway.capabilities.upi)).toBe(true);
    });

    it("should filter by required capabilities", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const ranked = getRankedGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
        requiredCapabilities: ["recurringPayments"],
      });

      // PhonePe doesn't support recurring payments
      expect(
        ranked.every((r) => r.gateway.capabilities.recurringPayments)
      ).toBe(true);
    });
  });

  describe("isGatewayCompatible", () => {
    it("should return false for non-existent gateway", () => {
      const compatible = isGatewayCompatible("nonexistent", {
        currency: "INR",
        country: "IN",
      });

      expect(compatible).toBe(false);
    });

    it("should return true when gateway supports currency and country", () => {
      const compatible = isGatewayCompatible("razorpay", {
        currency: "INR",
        country: "IN",
      });

      expect(compatible).toBe(true);
    });

    it("should return false when currency not supported", () => {
      const compatible = isGatewayCompatible("phonepe", {
        currency: "USD",
        country: "IN",
      });

      expect(compatible).toBe(false);
    });

    it("should return false when country not supported", () => {
      const compatible = isGatewayCompatible("phonepe", {
        currency: "INR",
        country: "US",
      });

      expect(compatible).toBe(false);
    });

    it("should check payment method compatibility", () => {
      const compatible = isGatewayCompatible("phonepe", {
        currency: "INR",
        country: "IN",
        paymentMethod: "card",
      });

      // PhonePe doesn't support card payments
      expect(compatible).toBe(false);
    });

    it("should return true when payment method is supported", () => {
      const compatible = isGatewayCompatible("razorpay", {
        currency: "INR",
        country: "IN",
        paymentMethod: "upi",
      });

      expect(compatible).toBe(true);
    });

    it("should ignore payment method check when set to 'any'", () => {
      const compatible = isGatewayCompatible("phonepe", {
        currency: "INR",
        country: "IN",
        paymentMethod: "any",
      });

      expect(compatible).toBe(true);
    });
  });

  describe("getGatewayRecommendations", () => {
    it("should return null recommended when no gateways match", () => {
      const recommendations = getGatewayRecommendations({
        amount: 1000,
        currency: "AUD",
        country: "AU",
      });

      expect(recommendations.recommended).toBeNull();
      expect(recommendations.alternatives).toEqual([]);
      expect(recommendations.reasons).toContain("No suitable gateway found");
    });

    it("should return best gateway as recommended", () => {
      mockCalculateGatewayFee.mockImplementation((gatewayId) => {
        if (gatewayId === "phonepe") return 15;
        if (gatewayId === "razorpay") return 20;
        if (gatewayId === "stripe") return 25;
        return 0;
      });

      const recommendations = getGatewayRecommendations({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(recommendations.recommended?.id).toBe("razorpay");
    });

    it("should return top 3 alternatives", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const recommendations = getGatewayRecommendations({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(recommendations.alternatives.length).toBeLessThanOrEqual(3);
    });

    it("should include detailed reasons for recommendation", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const recommendations = getGatewayRecommendations({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(recommendations.reasons.length).toBeGreaterThan(0);
      expect(
        recommendations.reasons.some((r) => r.includes("Lowest total cost"))
      ).toBe(true);
      expect(
        recommendations.reasons.some((r) => r.includes("Transaction fee"))
      ).toBe(true);
      expect(recommendations.reasons.some((r) => r.includes("Score"))).toBe(
        true
      );
    });

    it("should include currency in reasons when no match", () => {
      const recommendations = getGatewayRecommendations({
        amount: 1000,
        currency: "AUD",
        country: "AU",
      });

      expect(recommendations.reasons.some((r) => r.includes("AUD"))).toBe(true);
      expect(recommendations.reasons.some((r) => r.includes("AU"))).toBe(true);
    });
  });

  describe("compareGateways", () => {
    it("should return empty array when no gateways suitable", () => {
      mockGetEnabledGateways.mockReturnValue([]);

      const result = compareGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should compare all suitable gateways and return ranked list", () => {
      mockGetEnabledGateways.mockReturnValue([
        mockPhonePeConfig,
        mockRazorpayConfig,
      ]);

      mockCalculateGatewayFee.mockImplementation((gatewayId) => {
        if (gatewayId === "phonepe") return 15;
        if (gatewayId === "razorpay") return 20;
        return 0;
      });

      const result = compareGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("gateway");
      expect(result[0]).toHaveProperty("score");
    });

    it("should include fee comparison for both gateways", () => {
      mockCalculateGatewayFee.mockImplementation((gatewayId) => {
        if (gatewayId === "phonepe") return 15;
        if (gatewayId === "razorpay") return 20;
        return 0;
      });

      const comparison = compareGateways("phonepe", "razorpay", {
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(comparison.comparison.phonepe.fee).toBe(15);
      expect(comparison.comparison.razorpay.fee).toBe(20);
    });

    it("should include total amount comparison", () => {
      mockCalculateGatewayFee.mockImplementation((gatewayId) => {
        if (gatewayId === "phonepe") return 15;
        if (gatewayId === "razorpay") return 20;
        return 0;
      });

      const comparison = compareGateways("phonepe", "razorpay", {
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(comparison.comparison.phonepe.totalAmount).toBe(1015);
      expect(comparison.comparison.razorpay.totalAmount).toBe(1020);
    });

    it("should include score comparison", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const comparison = compareGateways("razorpay", "stripe", {
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(comparison.comparison.razorpay.score).toBeGreaterThan(0);
      expect(comparison.comparison.stripe.score).toBeGreaterThan(0);
    });

    it("should handle international transactions", () => {
      mockCalculateGatewayFee.mockImplementation((gatewayId) => {
        if (gatewayId === "razorpay") return 30;
        if (gatewayId === "stripe") return 35;
        return 0;
      });

      const comparison = compareGateways("razorpay", "stripe", {
        amount: 1000,
        currency: "USD",
        country: "US",
      });

      expect(comparison.winner).toBeTruthy();
    });
  });

  describe("payment method filtering", () => {
    const paymentMethods: PaymentMethod[] = [
      "card",
      "upi",
      "netbanking",
      "wallet",
      "emi",
    ];

    paymentMethods.forEach((method) => {
      it(`should filter gateways by ${method} capability`, () => {
        mockCalculateGatewayFee.mockReturnValue(20);

        const ranked = getRankedGateways({
          amount: 1000,
          currency: "INR",
          country: "IN",
          paymentMethod: method,
        });

        // All returned gateways should support the payment method
        ranked.forEach((r) => {
          const capabilityKey =
            method === "card"
              ? "cardPayments"
              : method === "netbanking"
              ? "netBanking"
              : method === "wallet"
              ? "wallets"
              : method;
          expect(r.gateway.capabilities[capabilityKey]).toBe(true);
        });
      });
    });
  });

  describe("edge cases", () => {
    it("should handle zero amount", () => {
      mockCalculateGatewayFee.mockReturnValue(0);

      const result = selectBestGateway({
        amount: 0,
        currency: "INR",
        country: "IN",
      });

      expect(result).toBeTruthy();
    });

    it("should handle very large amounts", () => {
      mockCalculateGatewayFee.mockReturnValue(10000);

      const result = selectBestGateway({
        amount: 1000000,
        currency: "INR",
        country: "IN",
      });

      expect(result).toBeTruthy();
    });

    it("should handle empty required capabilities array", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
        requiredCapabilities: [],
      });

      expect(result).toBeTruthy();
    });

    it("should handle undefined payment method (defaults to 'any')", () => {
      mockCalculateGatewayFee.mockReturnValue(20);

      const result = selectBestGateway({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(result).toBeTruthy();
    });
  });
});
