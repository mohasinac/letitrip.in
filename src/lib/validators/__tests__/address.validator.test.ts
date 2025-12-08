import type { Address } from "../address.validator";
import {
  isInternationalAddress,
  isPayPalEligibleCountry,
  PAYPAL_SUPPORTED_COUNTRIES,
  validateAddress,
  validatePostalCode,
} from "../address.validator";

describe("Address Validator", () => {
  describe("isInternationalAddress", () => {
    it("returns false for Indian addresses", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      expect(isInternationalAddress(address)).toBe(false);
    });

    it("returns true for US addresses", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
      };

      expect(isInternationalAddress(address)).toBe(true);
    });

    it("returns true for UK addresses", () => {
      const address: Address = {
        line1: "10 Downing Street",
        city: "London",
        state: "England",
        postalCode: "SW1A 2AA",
        country: "GB",
      };

      expect(isInternationalAddress(address)).toBe(true);
    });

    it("handles lowercase country codes", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "Paris",
        state: "Ile-de-France",
        postalCode: "75001",
        country: "fr",
      };

      expect(isInternationalAddress(address)).toBe(true);
    });
  });

  describe("isPayPalEligibleCountry", () => {
    it("returns true for supported countries", () => {
      expect(isPayPalEligibleCountry("US")).toBe(true);
      expect(isPayPalEligibleCountry("GB")).toBe(true);
      expect(isPayPalEligibleCountry("CA")).toBe(true);
      expect(isPayPalEligibleCountry("IN")).toBe(true);
    });

    it("returns false for unsupported countries", () => {
      expect(isPayPalEligibleCountry("XX")).toBe(false);
      expect(isPayPalEligibleCountry("ZZ")).toBe(false);
    });

    it("handles lowercase country codes", () => {
      expect(isPayPalEligibleCountry("us")).toBe(true);
      expect(isPayPalEligibleCountry("gb")).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isPayPalEligibleCountry("")).toBe(false);
    });

    it("includes all major markets", () => {
      const majorMarkets = ["US", "GB", "CA", "AU", "DE", "FR", "IT", "ES"];
      majorMarkets.forEach((country) => {
        expect(isPayPalEligibleCountry(country)).toBe(true);
      });
    });
  });

  describe("validatePostalCode", () => {
    describe("India (IN)", () => {
      it("validates correct Indian PIN codes", () => {
        expect(validatePostalCode("400001", "IN").isValid).toBe(true);
        expect(validatePostalCode("110001", "IN").isValid).toBe(true);
        expect(validatePostalCode("560001", "IN").isValid).toBe(true);
      });

      it("rejects invalid Indian PIN codes", () => {
        expect(validatePostalCode("40001", "IN").isValid).toBe(false); // Too short
        expect(validatePostalCode("4000011", "IN").isValid).toBe(false); // Too long
        expect(validatePostalCode("ABCDEF", "IN").isValid).toBe(false); // Non-numeric
        expect(validatePostalCode("400-001", "IN").isValid).toBe(false); // With separator
      });
    });

    describe("United States (US)", () => {
      it("validates correct US ZIP codes", () => {
        expect(validatePostalCode("10001", "US").isValid).toBe(true);
        expect(validatePostalCode("90210", "US").isValid).toBe(true);
        expect(validatePostalCode("10001-1234", "US").isValid).toBe(true); // ZIP+4
      });

      it("rejects invalid US ZIP codes", () => {
        expect(validatePostalCode("1001", "US").isValid).toBe(false); // Too short
        expect(validatePostalCode("ABCDE", "US").isValid).toBe(false); // Non-numeric
        expect(validatePostalCode("10001-", "US").isValid).toBe(false); // Incomplete ZIP+4
      });
    });

    describe("United Kingdom (GB)", () => {
      it("validates correct UK postcodes", () => {
        expect(validatePostalCode("SW1A 2AA", "GB").isValid).toBe(true);
        expect(validatePostalCode("W1A 1AA", "GB").isValid).toBe(true);
        expect(validatePostalCode("EC1A 1BB", "GB").isValid).toBe(true);
      });

      it("accepts UK postcodes without space", () => {
        expect(validatePostalCode("SW1A2AA", "GB").isValid).toBe(true);
      });

      it("rejects invalid UK postcodes", () => {
        expect(validatePostalCode("123456", "GB").isValid).toBe(false);
        expect(validatePostalCode("ABCD", "GB").isValid).toBe(false);
      });
    });

    describe("Canada (CA)", () => {
      it("validates correct Canadian postal codes", () => {
        expect(validatePostalCode("K1A 0B1", "CA").isValid).toBe(true);
        expect(validatePostalCode("M5W 1E6", "CA").isValid).toBe(true);
      });

      it("rejects invalid Canadian postal codes", () => {
        expect(validatePostalCode("K1A0B1", "CA").isValid).toBe(false); // Missing space
        expect(validatePostalCode("123 456", "CA").isValid).toBe(false); // All numeric
        expect(validatePostalCode("AAA BBB", "CA").isValid).toBe(false); // All letters
      });
    });

    it("returns true for countries without specific validation", () => {
      expect(validatePostalCode("12345", "FR").isValid).toBe(true);
      expect(validatePostalCode("ABC123", "DE").isValid).toBe(true);
    });

    it("handles empty postal code", () => {
      expect(validatePostalCode("", "US").isValid).toBe(false);
      expect(validatePostalCode("", "IN").isValid).toBe(false);
    });
  });

  describe("validateAddress", () => {
    it("validates complete valid address", () => {
      const address: Address = {
        line1: "123 Main Street",
        line2: "Apt 4B",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("requires line1", () => {
      const address: Address = {
        line1: "",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "line1")).toBe(true);
    });

    it("requires city", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "city")).toBe(true);
    });

    it("requires state", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "Mumbai",
        state: "",
        postalCode: "400001",
        country: "IN",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "state")).toBe(true);
    });

    it("requires country", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "country")).toBe(true);
    });

    it("validates postal code format", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "invalid",
        country: "IN",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "postalCode")).toBe(true);
    });

    it("allows optional line2", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(true);
    });

    it("allows optional landmark", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
        landmark: "Near Central Park",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(true);
    });

    it("collects multiple errors", () => {
      const address: Address = {
        line1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      };

      const result = validateAddress(address);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("PAYPAL_SUPPORTED_COUNTRIES", () => {
    it("includes major countries", () => {
      const majorCountries = ["US", "GB", "CA", "AU", "DE", "FR", "IT", "ES"];
      majorCountries.forEach((country) => {
        expect(PAYPAL_SUPPORTED_COUNTRIES).toContain(country);
      });
    });

    it("includes India", () => {
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("IN");
    });

    it("is a non-empty array", () => {
      expect(PAYPAL_SUPPORTED_COUNTRIES.length).toBeGreaterThan(0);
    });
  });
});
