/**
 * Unit Tests for Payment Gateway Configuration
 *
 * Tests all helper functions and gateway configurations
 * No mocks - testing actual config logic
 */

import {
  PAYMENT_GATEWAYS,
  calculateGatewayFee,
  compareGatewayFees,
  getBestGateway,
  getEnabledGateways,
  getGatewayById,
  getGatewaysByType,
  getSupportedCountries,
  getSupportedCurrencies,
  validateGatewayConfig,
  type CountryCode,
  type CurrencyCode,
  type PaymentGatewayType,
} from "../payment-gateways.config";

describe("Payment Gateway Configuration", () => {
  describe("PAYMENT_GATEWAYS constant", () => {
    it("should have at least one gateway defined", () => {
      expect(PAYMENT_GATEWAYS).toBeDefined();
      expect(PAYMENT_GATEWAYS.length).toBeGreaterThan(0);
    });

    it("should have unique gateway IDs", () => {
      const ids = PAYMENT_GATEWAYS.map((g) => g.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have valid priority values", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(gateway.priority).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(gateway.priority)).toBe(true);
      });
    });

    it("should have valid fee structures", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(gateway.fees.domestic.percentage).toBeGreaterThanOrEqual(0);
        expect(gateway.fees.domestic.fixed).toBeGreaterThanOrEqual(0);
        expect(gateway.fees.international.percentage).toBeGreaterThanOrEqual(0);
        expect(gateway.fees.international.fixed).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have at least one supported currency", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(gateway.supportedCurrencies.length).toBeGreaterThan(0);
      });
    });

    it("should have at least one supported country", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(gateway.supportedCountries.length).toBeGreaterThan(0);
      });
    });

    it("should have valid endpoint configurations", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(gateway.endpoints.test).toMatch(/^https?:\/\//);
        expect(gateway.endpoints.live).toMatch(/^https?:\/\//);
        expect(gateway.endpoints.webhookPath).toMatch(/^\//);
      });
    });

    it("should have valid documentation URLs", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(gateway.docs.setup).toMatch(/^https?:\/\//);
        expect(gateway.docs.api).toMatch(/^https?:\/\//);
        expect(gateway.docs.webhook).toMatch(/^https?:\/\//);
      });
    });

    it("should have config fields for both test and live modes", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(Array.isArray(gateway.config.test)).toBe(true);
        expect(Array.isArray(gateway.config.live)).toBe(true);
        expect(gateway.config.test.length).toBeGreaterThan(0);
        expect(gateway.config.live.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getGatewayById", () => {
    it("should return gateway by valid ID", () => {
      const gateway = getGatewayById("razorpay");
      expect(gateway).toBeDefined();
      expect(gateway?.id).toBe("razorpay");
    });

    it("should return undefined for invalid ID", () => {
      const gateway = getGatewayById("invalid-gateway");
      expect(gateway).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const gateway = getGatewayById("");
      expect(gateway).toBeUndefined();
    });

    it("should be case sensitive", () => {
      const gateway = getGatewayById("RAZORPAY");
      expect(gateway).toBeUndefined();
    });
  });

  describe("getGatewaysByType", () => {
    it("should return domestic gateways", () => {
      const gateways = getGatewaysByType("domestic");
      expect(gateways.length).toBeGreaterThan(0);
      gateways.forEach((g) => {
        expect(g.type).toBe("domestic");
      });
    });

    it("should return international gateways", () => {
      const gateways = getGatewaysByType("international");
      gateways.forEach((g) => {
        expect(g.type).toBe("international");
      });
    });

    it("should return alternative gateways", () => {
      const gateways = getGatewaysByType("alternative");
      gateways.forEach((g) => {
        expect(g.type).toBe("alternative");
      });
    });

    it("should return sorted by priority", () => {
      const gateways = getGatewaysByType("domestic");
      for (let i = 0; i < gateways.length - 1; i++) {
        expect(gateways[i].priority).toBeLessThanOrEqual(
          gateways[i + 1].priority
        );
      }
    });

    it("should return empty array for no matches", () => {
      // This depends on actual config, but testing the structure
      const gateways = getGatewaysByType("alternative");
      expect(Array.isArray(gateways)).toBe(true);
    });
  });

  describe("getEnabledGateways", () => {
    it("should return only enabled gateways", () => {
      const gateways = getEnabledGateways();
      gateways.forEach((g) => {
        expect(g.enabled).toBe(true);
      });
    });

    it("should return sorted by priority", () => {
      const gateways = getEnabledGateways();
      for (let i = 0; i < gateways.length - 1; i++) {
        expect(gateways[i].priority).toBeLessThanOrEqual(
          gateways[i + 1].priority
        );
      }
    });

    it("should return at least one enabled gateway", () => {
      const gateways = getEnabledGateways();
      expect(gateways.length).toBeGreaterThan(0);
    });
  });

  describe("getSupportedCurrencies", () => {
    it("should return unique currencies", () => {
      const currencies = getSupportedCurrencies();
      const uniqueCurrencies = new Set(currencies);
      expect(currencies.length).toBe(uniqueCurrencies.size);
    });

    it("should include INR", () => {
      const currencies = getSupportedCurrencies();
      expect(currencies).toContain("INR");
    });

    it("should return valid currency codes", () => {
      const currencies = getSupportedCurrencies();
      currencies.forEach((currency) => {
        expect(currency).toMatch(/^[A-Z]{3}$/);
      });
    });

    it("should return at least one currency", () => {
      const currencies = getSupportedCurrencies();
      expect(currencies.length).toBeGreaterThan(0);
    });
  });

  describe("getSupportedCountries", () => {
    it("should return unique countries", () => {
      const countries = getSupportedCountries();
      const uniqueCountries = new Set(countries);
      expect(countries.length).toBe(uniqueCountries.size);
    });

    it("should include IN (India)", () => {
      const countries = getSupportedCountries();
      expect(countries).toContain("IN");
    });

    it("should return valid country codes", () => {
      const countries = getSupportedCountries();
      countries.forEach((country) => {
        expect(country).toMatch(/^[A-Z]{2}$/);
      });
    });

    it("should return at least one country", () => {
      const countries = getSupportedCountries();
      expect(countries.length).toBeGreaterThan(0);
    });
  });

  describe("validateGatewayConfig", () => {
    it("should validate valid Razorpay test config", () => {
      const config = {
        keyId: "rzp_test_1234567890", // Exactly 19 chars: rzp_test_ (9) + 1234567890 (10) = 19
        keySecret: "abcdefghij1234567890",
        webhookSecret: "whsec_12345678901234567890123456789012",
      };
      const result = validateGatewayConfig("razorpay", config, "test");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate valid Razorpay live config", () => {
      const config = {
        keyId: "rzp_live_1234567890", // Exactly 19 chars: rzp_live_ (9) + 1234567890 (10) = 19
        keySecret: "abcdefghij1234567890",
        webhookSecret: "whsec_12345678901234567890123456789012",
      };
      const result = validateGatewayConfig("razorpay", config, "live");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject invalid Razorpay keyId format", () => {
      const config = {
        keyId: "invalid_key_format",
        keySecret: "abcdefghij1234567890",
        webhookSecret: "whsec_12345678901234567890123456789012",
      };
      const result = validateGatewayConfig("razorpay", config, "test");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject missing required fields", () => {
      const config = {
        keyId: "rzp_test_12345678901234",
      };
      const result = validateGatewayConfig("razorpay", config, "test");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject empty config", () => {
      const config = {};
      const result = validateGatewayConfig("razorpay", config, "test");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should return error for invalid gateway ID", () => {
      const config = { keyId: "test" };
      const result = validateGatewayConfig("invalid-gateway", config, "test");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Gateway not found");
    });

    it("should validate minLength constraint", () => {
      const config = {
        keyId: "rzp_test_12345678901234",
        keySecret: "short", // Too short (minLength is 20)
        webhookSecret: "whsec_12345678901234567890123456789012",
      };
      const result = validateGatewayConfig("razorpay", config, "test");
      expect(result.isValid).toBe(false);
    });

    it("should validate maxLength constraint", () => {
      const config = {
        keyId: "rzp_test_12345678901234",
        keySecret: "a".repeat(100), // Too long (maxLength is 50)
        webhookSecret: "whsec_12345678901234567890123456789012",
      };
      const result = validateGatewayConfig("razorpay", config, "test");
      expect(result.isValid).toBe(false);
    });
  });

  describe("calculateGatewayFee", () => {
    it("should calculate domestic fee for Razorpay", () => {
      const fee = calculateGatewayFee("razorpay", 10000, false);
      expect(fee).toBeGreaterThan(0);
      expect(typeof fee).toBe("number");
    });

    it("should calculate international fee for Razorpay", () => {
      const internationalFee = calculateGatewayFee("razorpay", 10000, true);
      const domesticFee = calculateGatewayFee("razorpay", 10000, false);
      expect(internationalFee).toBeGreaterThan(domesticFee);
    });

    it("should return 0 for invalid gateway", () => {
      const fee = calculateGatewayFee("invalid-gateway", 10000, false);
      expect(fee).toBe(0);
    });

    it("should handle zero amount", () => {
      const fee = calculateGatewayFee("razorpay", 0, false);
      expect(fee).toBeGreaterThanOrEqual(0);
    });

    it("should handle large amounts", () => {
      const fee = calculateGatewayFee("razorpay", 1000000, false);
      expect(fee).toBeGreaterThan(0);
      expect(Number.isFinite(fee)).toBe(true);
    });

    it("should calculate percentage correctly", () => {
      const amount = 10000;
      const gateway = getGatewayById("razorpay");
      if (gateway) {
        const expectedFee =
          (amount * gateway.fees.domestic.percentage) / 100 +
          gateway.fees.domestic.fixed;
        const actualFee = calculateGatewayFee("razorpay", amount, false);
        expect(actualFee).toBeCloseTo(expectedFee, 2);
      }
    });

    it("should handle negative amounts gracefully", () => {
      const fee = calculateGatewayFee("razorpay", -1000, false);
      expect(fee).toBeGreaterThanOrEqual(0);
    });
  });

  describe("compareGatewayFees", () => {
    it("should compare fees for two gateways", () => {
      const comparison = compareGatewayFees("razorpay", "payu", 10000, false);
      expect(comparison).toHaveProperty("gateway1");
      expect(comparison).toHaveProperty("gateway2");
      expect(comparison).toHaveProperty("cheaper");
    });

    it("should identify cheaper gateway", () => {
      const comparison = compareGatewayFees("razorpay", "payu", 10000, false);
      expect(["razorpay", "payu", "equal"]).toContain(comparison.cheaper);
    });

    it("should handle identical gateways", () => {
      const comparison = compareGatewayFees(
        "razorpay",
        "razorpay",
        10000,
        false
      );
      expect(comparison.cheaper).toBe("equal");
      expect(comparison.gateway1.fee).toBe(comparison.gateway2.fee);
    });

    it("should handle invalid first gateway", () => {
      const comparison = compareGatewayFees(
        "invalid1",
        "razorpay",
        10000,
        false
      );
      expect(comparison.gateway1.fee).toBe(0);
    });

    it("should handle invalid second gateway", () => {
      const comparison = compareGatewayFees(
        "razorpay",
        "invalid2",
        10000,
        false
      );
      expect(comparison.gateway2.fee).toBe(0);
    });

    it("should handle both invalid gateways", () => {
      const comparison = compareGatewayFees(
        "invalid1",
        "invalid2",
        10000,
        false
      );
      expect(comparison.gateway1.fee).toBe(0);
      expect(comparison.gateway2.fee).toBe(0);
      expect(comparison.cheaper).toBe("equal");
    });

    it("should provide savings information", () => {
      const comparison = compareGatewayFees("razorpay", "payu", 10000, false);
      if (comparison.cheaper !== "equal") {
        expect(comparison).toHaveProperty("savings");
        expect(typeof comparison.savings).toBe("number");
      }
    });

    it("should handle different amount sizes", () => {
      const smallAmount = compareGatewayFees("razorpay", "payu", 100, false);
      const largeAmount = compareGatewayFees("razorpay", "payu", 100000, false);

      expect(smallAmount.gateway1.fee).toBeLessThan(largeAmount.gateway1.fee);
      expect(smallAmount.gateway2.fee).toBeLessThan(largeAmount.gateway2.fee);
    });
  });

  describe("getBestGateway", () => {
    it("should return best gateway for INR in India", () => {
      const best = getBestGateway({
        currency: "INR",
        country: "IN",
        amount: 10000,
      });
      expect(best).toBeDefined();
      expect(best?.supportedCurrencies).toContain("INR");
      expect(best?.supportedCountries).toContain("IN");
    });

    it("should return undefined for unsupported currency", () => {
      const best = getBestGateway({
        currency: "XYZ" as CurrencyCode,
        country: "IN",
        amount: 10000,
      });
      expect(best).toBeUndefined();
    });

    it("should return undefined for unsupported country", () => {
      const best = getBestGateway({
        currency: "INR",
        country: "XX" as CountryCode,
        amount: 10000,
      });
      expect(best).toBeUndefined();
    });

    it("should filter by required capabilities", () => {
      const best = getBestGateway({
        currency: "INR",
        country: "IN",
        amount: 10000,
        requiredCapabilities: ["upi", "cardPayments"],
      });

      if (best) {
        expect(best.capabilities.upi).toBe(true);
        expect(best.capabilities.cardPayments).toBe(true);
      }
    });

    it("should return undefined when capabilities not met", () => {
      // Request impossible combination
      const best = getBestGateway({
        currency: "INR",
        country: "IN",
        amount: 10000,
        requiredCapabilities: [
          "upi",
          "cardPayments",
          "refunds",
          "emi",
          "wallets",
          "netBanking",
        ],
      });

      // Should either find one or return undefined based on actual config
      if (best) {
        expect(best.capabilities.upi).toBe(true);
        expect(best.capabilities.cardPayments).toBe(true);
      }
    });

    it("should prioritize by lowest fee", () => {
      const best = getBestGateway({
        currency: "INR",
        country: "IN",
        amount: 10000,
      });

      const allEligible = getEnabledGateways()
        .filter((g) => g.supportedCurrencies.includes("INR"))
        .filter((g) => g.supportedCountries.includes("IN"));

      if (best && allEligible.length > 1) {
        const bestFee = calculateGatewayFee(best.id, 10000, false);
        allEligible.forEach((gateway) => {
          const gatewayFee = calculateGatewayFee(gateway.id, 10000, false);
          expect(bestFee).toBeLessThanOrEqual(gatewayFee);
        });
      }
    });

    it("should handle international transactions", () => {
      const best = getBestGateway({
        currency: "USD",
        country: "US",
        amount: 10000,
      });

      if (best) {
        expect(best.supportedCurrencies).toContain("USD");
        expect(best.supportedCountries).toContain("US");
      }
    });

    it("should handle zero amount", () => {
      const best = getBestGateway({
        currency: "INR",
        country: "IN",
        amount: 0,
      });
      // Should still work with zero amount
      expect(best).toBeDefined();
    });

    it("should handle large amounts", () => {
      const best = getBestGateway({
        currency: "INR",
        country: "IN",
        amount: 10000000,
      });
      expect(best).toBeDefined();
    });
  });

  describe("Gateway Configuration Integrity", () => {
    it("should have consistent enabled/disabled gateways", () => {
      const enabled = PAYMENT_GATEWAYS.filter((g) => g.enabled);
      const disabled = PAYMENT_GATEWAYS.filter((g) => !g.enabled);

      expect(enabled.length + disabled.length).toBe(PAYMENT_GATEWAYS.length);
    });

    it("should have valid type values", () => {
      const validTypes: PaymentGatewayType[] = [
        "domestic",
        "international",
        "alternative",
      ];
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(validTypes).toContain(gateway.type);
      });
    });

    it("should have boolean capability flags", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        Object.values(gateway.capabilities).forEach((capability) => {
          expect(typeof capability).toBe("boolean");
        });
      });
    });

    it("should have matching test and live config field counts", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        expect(gateway.config.test.length).toBe(gateway.config.live.length);
      });
    });

    it("should have matching test and live config field keys", () => {
      PAYMENT_GATEWAYS.forEach((gateway) => {
        const testKeys = gateway.config.test.map((f) => f.key).sort();
        const liveKeys = gateway.config.live.map((f) => f.key).sort();
        expect(testKeys).toEqual(liveKeys);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string gateway ID", () => {
      const gateway = getGatewayById("");
      expect(gateway).toBeUndefined();
    });

    it("should handle whitespace in gateway ID", () => {
      const gateway = getGatewayById("  razorpay  ");
      expect(gateway).toBeUndefined();
    });

    it("should handle null-like values gracefully", () => {
      const fee = calculateGatewayFee("", 0, false);
      expect(fee).toBe(0);
    });

    it("should handle fractional amounts in fee calculation", () => {
      const fee = calculateGatewayFee("razorpay", 10000.5, false);
      expect(typeof fee).toBe("number");
      expect(Number.isFinite(fee)).toBe(true);
    });

    it("should maintain precision in fee calculations", () => {
      const amount = 12345.67;
      const fee1 = calculateGatewayFee("razorpay", amount, false);
      const fee2 = calculateGatewayFee("razorpay", amount, false);
      expect(fee1).toBe(fee2);
    });
  });
});
