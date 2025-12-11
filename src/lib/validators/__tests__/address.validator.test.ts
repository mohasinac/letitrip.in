import type { Address } from "../address.validator";
import {
  formatPostalCode,
  getPostalCodeName,
  isInternationalAddress,
  isPayPalEligibleCountry,
  isValidCanadianPostalCode,
  isValidIndianPincode,
  isValidUKPostcode,
  isValidUSZipCode,
  normalizeAddress,
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

    it("throws error for empty string", () => {
      expect(() => isPayPalEligibleCountry("")).toThrow(
        "Country code is required and must be a string"
      );
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

  // BUG FIX #33: Comprehensive input validation edge case tests
  describe("BUG FIX #33: Input Validation Edge Cases", () => {
    describe("isInternationalAddress validation", () => {
      it("should throw error for null address", () => {
        expect(() => isInternationalAddress(null as any)).toThrow(
          "Address is required"
        );
      });

      it("should throw error for undefined address", () => {
        expect(() => isInternationalAddress(undefined as any)).toThrow(
          "Address is required"
        );
      });

      it("should handle address object with no country", () => {
        const address = {
          line1: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
        } as Address;
        expect(isInternationalAddress(address)).toBe(false);
      });

      it("should handle string country code", () => {
        expect(isInternationalAddress("US")).toBe(true);
        expect(isInternationalAddress("IN")).toBe(false);
      });

      it("should handle empty string country", () => {
        expect(() => isInternationalAddress("")).toThrow();
      });
    });

    describe("isPayPalEligibleCountry validation", () => {
      it("should throw error for null country code", () => {
        expect(() => isPayPalEligibleCountry(null as any)).toThrow(
          "Country code is required and must be a string"
        );
      });

      it("should throw error for undefined country code", () => {
        expect(() => isPayPalEligibleCountry(undefined as any)).toThrow(
          "Country code is required and must be a string"
        );
      });

      it("should throw error for non-string country code", () => {
        expect(() => isPayPalEligibleCountry(123 as any)).toThrow(
          "Country code is required and must be a string"
        );
      });

      it("should throw error for empty string", () => {
        expect(() => isPayPalEligibleCountry("")).toThrow();
      });

      it("should handle valid country codes", () => {
        expect(isPayPalEligibleCountry("US")).toBe(true);
        expect(isPayPalEligibleCountry("GB")).toBe(true);
      });

      it("should return false for unsupported countries", () => {
        expect(isPayPalEligibleCountry("XX")).toBe(false);
      });
    });

    describe("validateAddress validation", () => {
      it("should throw error for null address", () => {
        expect(() => validateAddress(null as any)).toThrow(
          "Address is required"
        );
      });

      it("should throw error for undefined address", () => {
        expect(() => validateAddress(undefined as any)).toThrow(
          "Address is required"
        );
      });

      it("should throw error for non-object address", () => {
        expect(() => validateAddress("address" as any)).toThrow(
          "Address must be an object"
        );
      });

      it("should validate valid address", () => {
        const address: Address = {
          line1: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        };
        const result = validateAddress(address);
        expect(result.isValid).toBe(true);
      });

      it("should detect missing required fields", () => {
        const address = {
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        } as Address;
        const result = validateAddress(address);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.field === "line1")).toBe(true);
      });
    });

    describe("isValidIndianPincode validation", () => {
      it("should return false for null pincode", () => {
        expect(isValidIndianPincode(null as any)).toBe(false);
      });

      it("should return false for undefined pincode", () => {
        expect(isValidIndianPincode(undefined as any)).toBe(false);
      });

      it("should return false for non-string pincode", () => {
        expect(isValidIndianPincode(123456 as any)).toBe(false);
      });

      it("should return false for empty string", () => {
        expect(isValidIndianPincode("")).toBe(false);
      });

      it("should validate valid PIN codes", () => {
        expect(isValidIndianPincode("110001")).toBe(true);
        expect(isValidIndianPincode("400001")).toBe(true);
      });

      it("should reject invalid PIN codes", () => {
        expect(isValidIndianPincode("11001")).toBe(false); // Too short
        expect(isValidIndianPincode("1100011")).toBe(false); // Too long
        expect(isValidIndianPincode("abcdef")).toBe(false); // Letters
      });
    });

    describe("isValidUSZipCode validation", () => {
      it("should return false for null zip code", () => {
        expect(isValidUSZipCode(null as any)).toBe(false);
      });

      it("should return false for undefined zip code", () => {
        expect(isValidUSZipCode(undefined as any)).toBe(false);
      });

      it("should return false for non-string zip code", () => {
        expect(isValidUSZipCode(90210 as any)).toBe(false);
      });

      it("should return false for empty string", () => {
        expect(isValidUSZipCode("")).toBe(false);
      });

      it("should validate 5-digit ZIP codes", () => {
        expect(isValidUSZipCode("90210")).toBe(true);
        expect(isValidUSZipCode("10001")).toBe(true);
      });

      it("should validate ZIP+4 codes", () => {
        expect(isValidUSZipCode("90210-1234")).toBe(true);
        expect(isValidUSZipCode("10001-5678")).toBe(true);
      });

      it("should reject invalid ZIP codes", () => {
        expect(isValidUSZipCode("9021")).toBe(false); // Too short
        expect(isValidUSZipCode("902101")).toBe(false); // Too long
        expect(isValidUSZipCode("abcde")).toBe(false); // Letters
      });
    });

    describe("isValidCanadianPostalCode validation", () => {
      it("should return false for null postal code", () => {
        expect(isValidCanadianPostalCode(null as any)).toBe(false);
      });

      it("should return false for undefined postal code", () => {
        expect(isValidCanadianPostalCode(undefined as any)).toBe(false);
      });

      it("should return false for non-string postal code", () => {
        expect(isValidCanadianPostalCode(123456 as any)).toBe(false);
      });

      it("should return false for empty string", () => {
        expect(isValidCanadianPostalCode("")).toBe(false);
      });

      it("should validate valid postal codes", () => {
        expect(isValidCanadianPostalCode("K1A 0B1")).toBe(true);
        expect(isValidCanadianPostalCode("M5W 1E6")).toBe(true);
      });

      it("should handle lowercase", () => {
        expect(isValidCanadianPostalCode("k1a 0b1")).toBe(true);
      });

      it("should reject invalid postal codes", () => {
        expect(isValidCanadianPostalCode("K1A0B1")).toBe(false); // No space
        expect(isValidCanadianPostalCode("K1A 0B")).toBe(false); // Too short
        expect(isValidCanadianPostalCode("123 456")).toBe(false); // All digits
      });
    });

    describe("isValidUKPostcode validation", () => {
      it("should return false for null postcode", () => {
        expect(isValidUKPostcode(null as any)).toBe(false);
      });

      it("should return false for undefined postcode", () => {
        expect(isValidUKPostcode(undefined as any)).toBe(false);
      });

      it("should return false for non-string postcode", () => {
        expect(isValidUKPostcode(12345 as any)).toBe(false);
      });

      it("should return false for empty string", () => {
        expect(isValidUKPostcode("")).toBe(false);
      });

      it("should validate valid postcodes", () => {
        expect(isValidUKPostcode("SW1A 1AA")).toBe(true);
        expect(isValidUKPostcode("EC1A 1BB")).toBe(true);
        expect(isValidUKPostcode("W1A 0AX")).toBe(true);
      });

      it("should handle lowercase", () => {
        expect(isValidUKPostcode("sw1a 1aa")).toBe(true);
      });

      it("should validate without space", () => {
        expect(isValidUKPostcode("SW1A1AA")).toBe(true);
      });

      it("should reject invalid postcodes", () => {
        expect(isValidUKPostcode("123 456")).toBe(false); // All digits
        expect(isValidUKPostcode("ABCD EFG")).toBe(false); // Invalid format
      });
    });

    describe("formatPostalCode validation", () => {
      it("should throw error for null postal code", () => {
        expect(() => formatPostalCode(null as any, "US")).toThrow(
          "Postal code is required and must be a string"
        );
      });

      it("should throw error for undefined postal code", () => {
        expect(() => formatPostalCode(undefined as any, "US")).toThrow(
          "Postal code is required and must be a string"
        );
      });

      it("should throw error for non-string postal code", () => {
        expect(() => formatPostalCode(12345 as any, "US")).toThrow(
          "Postal code is required and must be a string"
        );
      });

      it("should throw error for null country", () => {
        expect(() => formatPostalCode("12345", null as any)).toThrow(
          "Country is required and must be a string"
        );
      });

      it("should throw error for undefined country", () => {
        expect(() => formatPostalCode("12345", undefined as any)).toThrow(
          "Country is required and must be a string"
        );
      });

      it("should format Indian PIN code", () => {
        expect(formatPostalCode("110001", "IN")).toBe("110001");
        expect(formatPostalCode(" 110001 ", "IN")).toBe("110001");
      });

      it("should format US ZIP code", () => {
        expect(formatPostalCode("90210", "US")).toBe("90210");
        expect(formatPostalCode("902101234", "US")).toBe("90210-1234");
      });

      it("should format Canadian postal code", () => {
        expect(formatPostalCode("K1A0B1", "CA")).toBe("K1A 0B1");
        expect(formatPostalCode("k1a0b1", "CA")).toBe("K1A 0B1");
      });
    });

    describe("getPostalCodeName validation", () => {
      it("should throw error for null country", () => {
        expect(() => getPostalCodeName(null as any)).toThrow(
          "Country is required and must be a string"
        );
      });

      it("should throw error for undefined country", () => {
        expect(() => getPostalCodeName(undefined as any)).toThrow(
          "Country is required and must be a string"
        );
      });

      it("should throw error for non-string country", () => {
        expect(() => getPostalCodeName(123 as any)).toThrow(
          "Country is required and must be a string"
        );
      });

      it("should return correct names for countries", () => {
        expect(getPostalCodeName("IN")).toBe("PIN Code");
        expect(getPostalCodeName("US")).toBe("ZIP Code");
        expect(getPostalCodeName("CA")).toBe("Postal Code");
        expect(getPostalCodeName("GB")).toBe("Postcode");
      });

      it("should return default for unknown countries", () => {
        expect(getPostalCodeName("XX")).toBe("Postal Code");
      });
    });

    describe("normalizeAddress validation", () => {
      it("should throw error for null address", () => {
        expect(() => normalizeAddress(null as any)).toThrow(
          "Address is required"
        );
      });

      it("should throw error for undefined address", () => {
        expect(() => normalizeAddress(undefined as any)).toThrow(
          "Address is required"
        );
      });

      it("should throw error for non-object address", () => {
        expect(() => normalizeAddress("address" as any)).toThrow(
          "Address must be an object"
        );
      });

      it("should normalize valid address", () => {
        const address: Address = {
          line1: " 123 Main St ",
          line2: " Apt 4 ",
          city: " New York ",
          state: " ny ",
          postalCode: "10001",
          country: "us",
          landmark: " Near Park ",
        };
        const normalized = normalizeAddress(address);
        expect(normalized.line1).toBe("123 Main St");
        expect(normalized.city).toBe("New York");
        expect(normalized.country).toBe("US");
      });
    });

    describe("Edge cases and boundary testing", () => {
      it("should handle very long address fields", () => {
        const longString = "A".repeat(500);
        const address: Address = {
          line1: longString,
          city: "City",
          state: "ST",
          postalCode: "12345",
          country: "US",
        };
        const result = validateAddress(address);
        expect(result.isValid).toBe(false);
      });

      it("should handle whitespace-only fields", () => {
        const address: Address = {
          line1: "   ",
          city: "   ",
          state: "ST",
          postalCode: "12345",
          country: "US",
        };
        const result = validateAddress(address);
        expect(result.isValid).toBe(false);
      });

      it("should handle special characters in country code", () => {
        expect(() => isPayPalEligibleCountry("U$")).not.toThrow();
      });

      it("should handle mixed case in postal codes", () => {
        expect(isValidCanadianPostalCode("K1a 0B1")).toBe(true);
        expect(isValidUKPostcode("Sw1A 1aA")).toBe(true);
      });
    });

    describe("Combined validation scenarios", () => {
      it("should validate complete valid address", () => {
        const address: Address = {
          line1: "123 Main Street",
          line2: "Apartment 4B",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
          landmark: "Near Central Park",
        };
        const result = validateAddress(address);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should collect multiple errors", () => {
        const address: Address = {
          line1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "US",
        };
        const result = validateAddress(address);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
      });

      it("should validate and normalize in sequence", () => {
        const address: Address = {
          line1: " 123 Main ",
          city: " NYC ",
          state: " ny ",
          postalCode: "10001",
          country: "us",
        };
        const validation = validateAddress(address);
        if (validation.isValid) {
          const normalized = normalizeAddress(address);
          expect(normalized.country).toBe("US");
        }
      });
    });
  });
});
