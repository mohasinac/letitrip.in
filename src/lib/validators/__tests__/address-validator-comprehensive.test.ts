/**
 * Comprehensive Tests for Address Validator
 * Testing international address validation with country-specific rules
 */

import {
  type Address,
  isInternationalAddress,
  isPayPalEligibleCountry,
  PAYPAL_SUPPORTED_COUNTRIES,
  SPECIAL_HANDLING_COUNTRIES,
  validateInternationalAddress,
} from "../address.validator";

describe("address.validator - Country Constants", () => {
  describe("PAYPAL_SUPPORTED_COUNTRIES", () => {
    it("should have exactly 28 supported countries", () => {
      expect(PAYPAL_SUPPORTED_COUNTRIES).toHaveLength(28);
    });

    it("should include major markets", () => {
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("IN");
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("US");
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("GB");
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("CA");
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("AU");
    });

    it("should include European countries", () => {
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("FR");
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("DE");
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("IT");
      expect(PAYPAL_SUPPORTED_COUNTRIES).toContain("ES");
    });

    it("should have valid ISO 3166-1 alpha-2 codes", () => {
      PAYPAL_SUPPORTED_COUNTRIES.forEach((code) => {
        expect(code).toHaveLength(2);
        expect(code).toMatch(/^[A-Z]{2}$/);
      });
    });
  });

  describe("SPECIAL_HANDLING_COUNTRIES", () => {
    it("should have special handling countries", () => {
      expect(SPECIAL_HANDLING_COUNTRIES).toHaveProperty("IN");
      expect(SPECIAL_HANDLING_COUNTRIES).toHaveProperty("US");
      expect(SPECIAL_HANDLING_COUNTRIES).toHaveProperty("CA");
      expect(SPECIAL_HANDLING_COUNTRIES).toHaveProperty("GB");
      expect(SPECIAL_HANDLING_COUNTRIES).toHaveProperty("AU");
    });
  });
});

describe("address.validator - isInternationalAddress", () => {
  it("should return true for non-IN address", () => {
    const address: Address = {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      country: "US",
      postalCode: "10001",
    };

    expect(isInternationalAddress(address)).toBe(true);
  });

  it("should return false for IN address", () => {
    const address: Address = {
      line1: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      country: "IN",
      postalCode: "400001",
    };

    expect(isInternationalAddress(address)).toBe(false);
  });

  it("should be case insensitive", () => {
    const address: Address = {
      line1: "Test",
      city: "Test",
      state: "Test",
      country: "in",
      postalCode: "400001",
    };

    expect(isInternationalAddress(address)).toBe(false);
  });

  it("should handle missing country", () => {
    const address = {
      line1: "Test",
      city: "Test",
      state: "Test",
      postalCode: "400001",
    } as Address;

    expect(isInternationalAddress(address)).toBe(false);
  });
});

describe("address.validator - isPayPalEligibleCountry", () => {
  it("should return true for supported countries", () => {
    expect(isPayPalEligibleCountry("IN")).toBe(true);
    expect(isPayPalEligibleCountry("US")).toBe(true);
    expect(isPayPalEligibleCountry("GB")).toBe(true);
    expect(isPayPalEligibleCountry("FR")).toBe(true);
  });

  it("should return false for unsupported countries", () => {
    expect(isPayPalEligibleCountry("XX")).toBe(false);
    expect(isPayPalEligibleCountry("ZZ")).toBe(false);
  });

  it("should be case insensitive", () => {
    expect(isPayPalEligibleCountry("in")).toBe(true);
    expect(isPayPalEligibleCountry("us")).toBe(true);
    expect(isPayPalEligibleCountry("gb")).toBe(true);
  });

  it("should throw error for empty string", () => {
    expect(() => isPayPalEligibleCountry("")).toThrow(
      "Country code is required and must be a string"
    );
  });

  it("should handle invalid codes", () => {
    expect(isPayPalEligibleCountry("USA")).toBe(false);
    expect(isPayPalEligibleCountry("A")).toBe(false);
  });
});

describe("address.validator - validateInternationalAddress", () => {
  describe("US Addresses", () => {
    it("should validate correct US address", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        country: "US",
        postalCode: "10001",
      };

      const result = validateInternationalAddress(address);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate US zip code format", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        country: "US",
        postalCode: "12345-6789",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid US zip code", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        country: "US",
        postalCode: "1234",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("ZIP Code"))).toBe(
        true
      );
    });

    it("should require state for US", () => {
      const address: Address = {
        line1: "123 Main St",
        city: "New York",
        state: "",
        country: "US",
        postalCode: "10001",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.message === "State/Province is required")
      ).toBe(true);
    });
  });

  describe("CA Addresses", () => {
    it("should validate correct CA address", () => {
      const address: Address = {
        line1: "456 Maple St",
        city: "Toronto",
        state: "ON",
        country: "CA",
        postalCode: "M5H 2N2",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should validate CA postal code format", () => {
      const validCodes = ["K1A 0B1", "M5H 2N2", "V6B 1A1"];

      validCodes.forEach((code) => {
        const address: Address = {
          line1: "Test St",
          city: "Toronto",
          state: "ON",
          country: "CA",
          postalCode: code,
        };

        const result = validateInternationalAddress(address);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject invalid CA postal code", () => {
      const address: Address = {
        line1: "Test St",
        city: "Toronto",
        state: "ON",
        country: "CA",
        postalCode: "12345",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
    });

    it("should require state for CA", () => {
      const address: Address = {
        line1: "Test St",
        city: "Toronto",
        state: "",
        country: "CA",
        postalCode: "M5H 2N2",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
    });
  });

  describe("GB Addresses", () => {
    it("should validate correct GB address", () => {
      const address: Address = {
        line1: "10 Downing St",
        city: "London",
        state: "",
        country: "GB",
        postalCode: "SW1A 2AA",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should validate GB postcode formats", () => {
      const validCodes = [
        "SW1A 2AA",
        "EC1A 1BB",
        "W1A 0AX",
        "M1 1AE",
        "B33 8TH",
      ];

      validCodes.forEach((code) => {
        const address: Address = {
          line1: "Test St",
          city: "London",
          state: "",
          country: "GB",
          postalCode: code,
        };

        const result = validateInternationalAddress(address);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject invalid GB postcode", () => {
      const address: Address = {
        line1: "Test St",
        city: "London",
        state: "",
        country: "GB",
        postalCode: "INVALID",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
    });
  });

  describe("AU Addresses", () => {
    it("should validate correct AU address", () => {
      const address: Address = {
        line1: "123 George St",
        city: "Sydney",
        state: "NSW",
        country: "AU",
        postalCode: "2000",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should validate AU postcode format", () => {
      const validCodes = ["2000", "3000", "4000", "0800"];

      validCodes.forEach((code) => {
        const address: Address = {
          line1: "Test St",
          city: "Sydney",
          state: "NSW",
          country: "AU",
          postalCode: code,
        };

        const result = validateInternationalAddress(address);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject invalid AU postcode", () => {
      const address: Address = {
        line1: "Test St",
        city: "Sydney",
        state: "NSW",
        country: "AU",
        postalCode: "12345",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
    });

    it("should require state for AU", () => {
      const address: Address = {
        line1: "Test St",
        city: "Sydney",
        state: "",
        country: "AU",
        postalCode: "2000",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
    });
  });

  describe("IN Addresses", () => {
    it("should validate correct IN address", () => {
      const address: Address = {
        line1: "123 MG Road",
        city: "Mumbai",
        state: "Maharashtra",
        country: "IN",
        postalCode: "400001",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should validate IN PIN code format", () => {
      const validCodes = ["110001", "400001", "560001", "700001"];

      validCodes.forEach((code) => {
        const address: Address = {
          line1: "Test St",
          city: "Mumbai",
          state: "Maharashtra",
          country: "IN",
          postalCode: code,
        };

        const result = validateInternationalAddress(address);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject invalid IN PIN code", () => {
      const address: Address = {
        line1: "Test St",
        city: "Mumbai",
        state: "Maharashtra",
        country: "IN",
        postalCode: "1234",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
    });

    it("should require state for IN", () => {
      const address: Address = {
        line1: "Test St",
        city: "Mumbai",
        state: "",
        country: "IN",
        postalCode: "400001",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
    });
  });

  describe("General International Addresses", () => {
    it("should validate address without special handling country", () => {
      const address: Address = {
        line1: "123 Rue de la Paix",
        city: "Paris",
        state: "",
        country: "FR",
        postalCode: "75001",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should accept any country code", () => {
      const address: Address = {
        line1: "Test St",
        city: "Test City",
        state: "",
        country: "XX",
        postalCode: "12345",
      };

      const result = validateInternationalAddress(address);
      // Validator doesn't check country support, only validates fields
      expect(result.isValid).toBe(true);
    });

    it("should validate address without fullName field", () => {
      const address: Address = {
        line1: "123 Rue de la Paix",
        city: "Paris",
        state: "",
        country: "FR",
        postalCode: "75001",
      };

      const result = validateInternationalAddress(address);
      // Validator doesn't require fullName - only core address fields
      expect(result.isValid).toBe(true);
    });

    it("should require address line 1", () => {
      const address: Address = {
        line1: "",
        city: "Paris",
        state: "",
        country: "FR",
        postalCode: "75001",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.message === "Address line 1 is required")
      ).toBe(true);
    });

    it("should require city", () => {
      const address: Address = {
        line1: "Test St",
        city: "",
        state: "",
        country: "FR",
        postalCode: "75001",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message === "City is required")).toBe(
        true
      );
    });

    it("should require postal code", () => {
      const address: Address = {
        line1: "Test St",
        city: "Paris",
        state: "",
        country: "FR",
        postalCode: "",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.message === "Postal Code is required")
      ).toBe(true);
    });

    it("should validate without phone field", () => {
      const address: Address = {
        line1: "Test St",
        city: "Paris",
        state: "",
        country: "FR",
        postalCode: "75001",
      };

      const result = validateInternationalAddress(address);
      // Validator doesn't require phone - only core address fields
      expect(result.isValid).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle address with all optional fields", () => {
      const address: Address = {
        line1: "Test St",
        addressLine2: "Apt 123",
        city: "Paris",
        state: "Ile-de-France",
        country: "FR",
        postalCode: "75001",
        landmark: "Near Eiffel Tower",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should trim whitespace from fields", () => {
      const address: Address = {
        line1: "  Test St  ",
        city: "  Paris  ",
        state: "",
        country: "  FR  ",
        postalCode: "  75001  ",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should handle lowercase country codes", () => {
      const address: Address = {
        line1: "Test St",
        city: "Paris",
        state: "",
        country: "fr",
        postalCode: "75001",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });

    it("should accumulate multiple errors", () => {
      const address: Address = {
        line1: "",
        city: "",
        state: "",
        country: "XX",
        postalCode: "",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it("should handle very long field values", () => {
      const longString = "a".repeat(1000);
      const address: Address = {
        line1: longString,
        city: longString,
        state: "",
        country: "FR",
        postalCode: "75001",
      };

      const result = validateInternationalAddress(address);
      // Validator checks max length for address fields
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes("must be no more than"))
      ).toBe(true);
    });

    it("should handle special characters in fields", () => {
      const address: Address = {
        line1: "123 Rue de l'Église",
        city: "Saint-Étienne",
        state: "",
        country: "FR",
        postalCode: "42000",
      };

      const result = validateInternationalAddress(address);
      expect(result.isValid).toBe(true);
    });
  });
});

describe("address.validator - Integration Tests", () => {
  it("should validate multiple addresses from different countries", () => {
    const addresses: Address[] = [
      {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        country: "US",
        postalCode: "10001",
      },
      {
        line1: "10 Downing St",
        city: "London",
        state: "",
        country: "GB",
        postalCode: "SW1A 2AA",
      },
      {
        line1: "123 MG Road",
        city: "Mumbai",
        state: "Maharashtra",
        country: "IN",
        postalCode: "400001",
      },
    ];

    addresses.forEach((addr) => {
      const result = validateInternationalAddress(addr);
      expect(result.isValid).toBe(true);
    });
  });

  it("should correctly categorize addresses as international or domestic", () => {
    const usAddress: Address = {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      country: "US",
      postalCode: "10001",
    };

    const inAddress: Address = {
      line1: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      country: "IN",
      postalCode: "400001",
    };

    expect(isInternationalAddress(usAddress)).toBe(true);
    expect(isInternationalAddress(inAddress)).toBe(false);
  });
});
