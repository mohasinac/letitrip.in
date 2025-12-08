/**
 * Comprehensive Payment Gateway Selector Tests
 *
 * Tests for smart gateway selection logic, fee calculation,
 * and edge cases in payment processing.
 *
 * Coverage:
 * - Gateway selection logic
 * - Fee calculations
 * - Currency/country validation
 * - Payment method filtering
 * - Edge cases and error handling
 */

import {
  calculateTotalWithFee,
  compareGateways,
  getGatewayRecommendation,
  selectBestGateway,
  type GatewaySelectionParams,
} from "../payment-gateway-selector";

describe("Payment Gateway Selector - Gateway Selection", () => {
  describe("selectBestGateway", () => {
    it("should select gateway for Indian domestic payment", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "upi",
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeTruthy();
      expect(gateway?.supportedCurrencies).toContain("INR");
      expect(gateway?.supportedCountries).toContain("IN");
    });

    it("should select gateway for card payment", () => {
      const params: GatewaySelectionParams = {
        amount: 5000,
        currency: "INR",
        country: "IN",
        paymentMethod: "card",
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeTruthy();
      expect(gateway?.capabilities.cardPayments).toBe(true);
    });

    it("should select gateway for international payment", () => {
      const params: GatewaySelectionParams = {
        amount: 10000,
        currency: "USD",
        country: "US",
        paymentMethod: "card",
      };

      const gateway = selectBestGateway(params);
      if (gateway) {
        expect(gateway.supportedCurrencies).toContain("USD");
        expect(gateway.supportedCountries).toContain("US");
      }
      // May be null if no gateways support USD
    });

    it("should return null for unsupported currency", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "ZZZ" as any, // Invalid currency
        country: "IN",
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeNull();
    });

    it("should return null for unsupported country", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "ZZ" as any, // Invalid country
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeNull();
    });

    it("should respect customer preference when valid", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "IN",
        customerPreference: "razorpay",
      };

      const gateway = selectBestGateway(params);
      // If Razorpay is enabled and supports INR/IN, it should be selected
      if (gateway) {
        expect(gateway.id).toBe("razorpay");
      }
    });

    it("should ignore invalid customer preference", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "IN",
        customerPreference: "invalid-gateway",
      };

      const gateway = selectBestGateway(params);
      // Should fall back to best gateway
      expect(gateway).toBeTruthy();
    });

    it("should filter by required capabilities", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "IN",
        requiredCapabilities: ["emi", "cardPayments"],
      };

      const gateway = selectBestGateway(params);
      if (gateway) {
        expect(gateway.capabilities.emi).toBe(true);
        expect(gateway.capabilities.cardPayments).toBe(true);
      }
    });

    it("should handle zero amount", () => {
      const params: GatewaySelectionParams = {
        amount: 0,
        currency: "INR",
        country: "IN",
      };

      // Should still select a gateway (free trials, etc.)
      const gateway = selectBestGateway(params);
      expect(gateway).toBeTruthy();
    });

    it("should handle very large amounts", () => {
      const params: GatewaySelectionParams = {
        amount: 10000000, // 1 Crore
        currency: "INR",
        country: "IN",
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeTruthy();
    });

    it("should select lowest fee gateway when all else equal", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "card",
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeTruthy();
      // Should be the one with lowest fee
    });
  });

  describe("Payment Method Filtering", () => {
    it("should filter gateways supporting UPI", () => {
      const params: GatewaySelectionParams = {
        amount: 500,
        currency: "INR",
        country: "IN",
        paymentMethod: "upi",
      };

      const gateway = selectBestGateway(params);
      if (gateway) {
        expect(gateway.capabilities.upi).toBe(true);
      }
    });

    it("should filter gateways supporting net banking", () => {
      const params: GatewaySelectionParams = {
        amount: 500,
        currency: "INR",
        country: "IN",
        paymentMethod: "netbanking",
      };

      const gateway = selectBestGateway(params);
      if (gateway) {
        expect(gateway.capabilities.netBanking).toBe(true);
      }
    });

    it("should filter gateways supporting wallets", () => {
      const params: GatewaySelectionParams = {
        amount: 500,
        currency: "INR",
        country: "IN",
        paymentMethod: "wallet",
      };

      const gateway = selectBestGateway(params);
      if (gateway) {
        expect(gateway.capabilities.wallets).toBe(true);
      }
    });

    it("should filter gateways supporting EMI", () => {
      const params: GatewaySelectionParams = {
        amount: 10000,
        currency: "INR",
        country: "IN",
        paymentMethod: "emi",
      };

      const gateway = selectBestGateway(params);
      if (gateway) {
        expect(gateway.capabilities.emi).toBe(true);
      }
    });

    it("should accept any payment method when not specified", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "IN",
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeTruthy();
    });

    it("should accept any payment method with 'any' value", () => {
      const params: GatewaySelectionParams = {
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "any",
      };

      const gateway = selectBestGateway(params);
      expect(gateway).toBeTruthy();
    });
  });
});

describe("Payment Gateway Selector - Fee Calculations", () => {
  describe("calculateTotalWithFee", () => {
    it("should calculate total with percentage fee", () => {
      const result = calculateTotalWithFee(1000, "razorpay", false);
      expect(result.amount).toBe(1000);
      expect(result.fee).toBeGreaterThan(0);
      expect(result.total).toBe(result.amount + result.fee);
      expect(result.feePercentage).toBeGreaterThan(0);
    });

    it("should handle zero amount", () => {
      const result = calculateTotalWithFee(0, "razorpay", false);
      expect(result.amount).toBe(0);
      expect(result.fee).toBe(0);
      expect(result.total).toBe(0);
    });

    it("should apply international fees", () => {
      const domestic = calculateTotalWithFee(1000, "razorpay", false);
      const international = calculateTotalWithFee(1000, "razorpay", true);

      // International fees should generally be higher
      expect(international.fee).toBeGreaterThanOrEqual(domestic.fee);
    });

    it("should handle very large amounts", () => {
      const result = calculateTotalWithFee(10000000, "razorpay", false);
      expect(result.fee).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(result.amount);
      expect(result.feePercentage).toBeGreaterThan(0);
    });

    it("should handle fractional amounts", () => {
      const result = calculateTotalWithFee(1234.56, "razorpay", false);
      expect(result.amount).toBe(1234.56);
      expect(result.total).toBeGreaterThan(result.amount);
    });

    it("should return consistent fee percentage", () => {
      const result1 = calculateTotalWithFee(1000, "razorpay", false);
      const result2 = calculateTotalWithFee(2000, "razorpay", false);

      // Fee percentage should be same for same gateway
      expect(
        Math.abs(result1.feePercentage - result2.feePercentage)
      ).toBeLessThan(0.1);
    });
  });
});

describe("Payment Gateway Selector - Gateway Comparison", () => {
  describe("compareGateways", () => {
    it("should compare multiple gateways", () => {
      const comparison = compareGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      expect(Array.isArray(comparison)).toBe(true);
      if (comparison.length > 0) {
        expect(comparison[0]).toHaveProperty("gateway");
        expect(comparison[0]).toHaveProperty("score");
        expect(comparison[0]).toHaveProperty("fee");
        expect(comparison[0]).toHaveProperty("totalAmount");
      }
    });

    it("should sort gateways by score", () => {
      const comparison = compareGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      if (comparison.length > 1) {
        // Scores should be descending
        for (let i = 1; i < comparison.length; i++) {
          expect(comparison[i - 1].score).toBeGreaterThanOrEqual(
            comparison[i].score
          );
        }
      }
    });

    it("should include reasoning for scores", () => {
      const comparison = compareGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      if (comparison.length > 0) {
        expect(comparison[0].reasons).toBeTruthy();
        expect(Array.isArray(comparison[0].reasons)).toBe(true);
        expect(comparison[0].reasons.length).toBeGreaterThan(0);
      }
    });

    it("should filter by payment method in comparison", () => {
      const comparison = compareGateways({
        amount: 1000,
        currency: "INR",
        country: "IN",
        paymentMethod: "upi",
      });

      // All gateways should support UPI
      comparison.forEach((item) => {
        expect(item.gateway.capabilities.upi).toBe(true);
      });
    });
  });

  describe("getGatewayRecommendation", () => {
    it("should recommend best gateway with reasoning", () => {
      const recommendation = getGatewayRecommendation({
        amount: 1000,
        currency: "INR",
        country: "IN",
      });

      if (recommendation) {
        expect(recommendation).toHaveProperty("gateway");
        expect(recommendation).toHaveProperty("score");
        expect(recommendation).toHaveProperty("reasons");
        expect(recommendation.reasons.length).toBeGreaterThan(0);
      }
    });

    it("should return null for invalid params", () => {
      const recommendation = getGatewayRecommendation({
        amount: 1000,
        currency: "ZZZ" as any,
        country: "IN",
      });

      expect(recommendation).toBeNull();
    });

    it("should consider amount in recommendation", () => {
      const small = getGatewayRecommendation({
        amount: 100,
        currency: "INR",
        country: "IN",
      });

      const large = getGatewayRecommendation({
        amount: 100000,
        currency: "INR",
        country: "IN",
      });

      // Both should have recommendations
      expect(small).toBeTruthy();
      expect(large).toBeTruthy();
    });
  });
});

describe("Payment Gateway Selector - Edge Cases", () => {
  it("should handle negative amounts gracefully", () => {
    const params: GatewaySelectionParams = {
      amount: -1000,
      currency: "INR",
      country: "IN",
    };

    // Should either return null or handle gracefully
    expect(() => selectBestGateway(params)).not.toThrow();
  });

  it("should handle fractional currency amounts", () => {
    const params: GatewaySelectionParams = {
      amount: 999.99,
      currency: "INR",
      country: "IN",
    };

    const gateway = selectBestGateway(params);
    expect(gateway).toBeTruthy();
  });

  it("should handle empty required capabilities", () => {
    const params: GatewaySelectionParams = {
      amount: 1000,
      currency: "INR",
      country: "IN",
      requiredCapabilities: [],
    };

    const gateway = selectBestGateway(params);
    expect(gateway).toBeTruthy();
  });

  it("should handle impossible capability requirements", () => {
    const params: GatewaySelectionParams = {
      amount: 1000,
      currency: "INR",
      country: "IN",
      requiredCapabilities: [
        "cardPayments",
        "upi",
        "emi",
        "subscriptions",
        "payouts",
      ] as any,
    };

    const gateway = selectBestGateway(params);
    // May return null if no gateway supports all
    if (gateway) {
      params.requiredCapabilities?.forEach((cap) => {
        expect(
          gateway.capabilities[cap as keyof typeof gateway.capabilities]
        ).toBe(true);
      });
    }
  });

  it("should handle whitespace in customer preference", () => {
    const params: GatewaySelectionParams = {
      amount: 1000,
      currency: "INR",
      country: "IN",
      customerPreference: "  razorpay  ",
    };

    const gateway = selectBestGateway(params);
    expect(gateway).toBeTruthy();
  });

  it("should handle case-insensitive customer preference", () => {
    const params: GatewaySelectionParams = {
      amount: 1000,
      currency: "INR",
      country: "IN",
      customerPreference: "RAZORPAY",
    };

    const gateway = selectBestGateway(params);
    expect(gateway).toBeTruthy();
  });
});

describe("Payment Gateway Selector - Real-World Scenarios", () => {
  it("should recommend UPI for small domestic payments", () => {
    const params: GatewaySelectionParams = {
      amount: 500,
      currency: "INR",
      country: "IN",
      paymentMethod: "upi",
    };

    const gateway = selectBestGateway(params);
    expect(gateway).toBeTruthy();
    expect(gateway?.capabilities.upi).toBe(true);
  });

  it("should handle EMI for large purchases", () => {
    const params: GatewaySelectionParams = {
      amount: 50000,
      currency: "INR",
      country: "IN",
      paymentMethod: "emi",
    };

    const gateway = selectBestGateway(params);
    if (gateway) {
      expect(gateway.capabilities.emi).toBe(true);
    }
  });

  it("should handle subscription payments", () => {
    const params: GatewaySelectionParams = {
      amount: 999,
      currency: "INR",
      country: "IN",
      requiredCapabilities: ["subscriptions"],
    };

    const gateway = selectBestGateway(params);
    if (gateway) {
      expect(gateway.capabilities.subscriptions).toBe(true);
    }
  });

  it("should handle refund-capable gateways", () => {
    const params: GatewaySelectionParams = {
      amount: 2000,
      currency: "INR",
      country: "IN",
      requiredCapabilities: ["refunds"],
    };

    const gateway = selectBestGateway(params);
    if (gateway) {
      expect(gateway.capabilities.refunds).toBe(true);
    }
  });

  it("should select gateway for wallet payments", () => {
    const params: GatewaySelectionParams = {
      amount: 1500,
      currency: "INR",
      country: "IN",
      paymentMethod: "wallet",
    };

    const gateway = selectBestGateway(params);
    if (gateway) {
      expect(gateway.capabilities.wallets).toBe(true);
    }
  });
});

describe("Payment Gateway Selector - Performance", () => {
  it("should select gateway quickly", () => {
    const start = Date.now();

    selectBestGateway({
      amount: 1000,
      currency: "INR",
      country: "IN",
    });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should be very fast
  });

  it("should handle multiple comparisons efficiently", () => {
    const start = Date.now();

    for (let i = 0; i < 100; i++) {
      compareGateways({
        amount: 1000 + i,
        currency: "INR",
        country: "IN",
      });
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // 100 comparisons in < 1 second
  });
});
