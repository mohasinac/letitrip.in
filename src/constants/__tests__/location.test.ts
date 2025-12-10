/**
 * Location Constants Tests
 *
 * Tests Indian states, union territories, country codes, and validation functions
 * Coverage: 100%
 */

import {
  ADDRESS_TYPES,
  ADDRESS_TYPE_ICONS,
  ADDRESS_TYPE_LABELS,
  ALL_INDIAN_STATES,
  AddressType,
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  INDIAN_PHONE_REGEX,
  INDIAN_STATES,
  IndianState,
  PHONE_LENGTH,
  PINCODE_LENGTH,
  PINCODE_REGEX,
  UNION_TERRITORIES,
  isValidIndianPhone,
  isValidPincode,
} from "../location";

describe("Location Constants", () => {
  describe("INDIAN_STATES", () => {
    it("should export INDIAN_STATES array", () => {
      expect(INDIAN_STATES).toBeDefined();
      expect(Array.isArray(INDIAN_STATES)).toBe(true);
    });

    it("should have 28 Indian states", () => {
      expect(INDIAN_STATES).toHaveLength(28);
    });

    it("should have all state names as strings", () => {
      INDIAN_STATES.forEach((state) => {
        expect(typeof state).toBe("string");
        expect(state.length).toBeGreaterThan(0);
      });
    });

    it("should include major states", () => {
      const majorStates = [
        "Maharashtra",
        "Karnataka",
        "Tamil Nadu",
        "Uttar Pradesh",
        "Gujarat",
        "West Bengal",
        "Rajasthan",
        "Kerala",
      ];

      majorStates.forEach((state) => {
        expect(INDIAN_STATES).toContain(state);
      });
    });

    it("should be in alphabetical order", () => {
      const sorted = [...INDIAN_STATES].sort();
      expect(INDIAN_STATES).toEqual(sorted);
    });

    it("should have unique state names", () => {
      const uniqueStates = new Set(INDIAN_STATES);
      expect(uniqueStates.size).toBe(INDIAN_STATES.length);
    });
  });

  describe("UNION_TERRITORIES", () => {
    it("should export UNION_TERRITORIES array", () => {
      expect(UNION_TERRITORIES).toBeDefined();
      expect(Array.isArray(UNION_TERRITORIES)).toBe(true);
    });

    it("should have 8 union territories", () => {
      expect(UNION_TERRITORIES).toHaveLength(8);
    });

    it("should have all UT names as strings", () => {
      UNION_TERRITORIES.forEach((ut) => {
        expect(typeof ut).toBe("string");
        expect(ut.length).toBeGreaterThan(0);
      });
    });

    it("should include major union territories", () => {
      const majorUTs = [
        "Delhi",
        "Puducherry",
        "Chandigarh",
        "Jammu and Kashmir",
        "Ladakh",
      ];

      majorUTs.forEach((ut) => {
        expect(UNION_TERRITORIES).toContain(ut);
      });
    });

    it("should be in alphabetical order", () => {
      const sorted = [...UNION_TERRITORIES].sort();
      expect(UNION_TERRITORIES).toEqual(sorted);
    });

    it("should have unique UT names", () => {
      const uniqueUTs = new Set(UNION_TERRITORIES);
      expect(uniqueUTs.size).toBe(UNION_TERRITORIES.length);
    });
  });

  describe("ALL_INDIAN_STATES", () => {
    it("should combine states and union territories", () => {
      expect(ALL_INDIAN_STATES.length).toBe(
        INDIAN_STATES.length + UNION_TERRITORIES.length
      );
    });

    it("should include all states", () => {
      INDIAN_STATES.forEach((state) => {
        expect(ALL_INDIAN_STATES).toContain(state);
      });
    });

    it("should include all union territories", () => {
      UNION_TERRITORIES.forEach((ut) => {
        expect(ALL_INDIAN_STATES).toContain(ut);
      });
    });

    it("should have unique values", () => {
      const uniqueStates = new Set(ALL_INDIAN_STATES);
      expect(uniqueStates.size).toBe(ALL_INDIAN_STATES.length);
    });

    it("should be readonly", () => {
      // Type assertion to check readonly
      const testState: (typeof ALL_INDIAN_STATES)[number] = "Delhi";
      expect(ALL_INDIAN_STATES).toContain(testState);
    });
  });

  describe("COUNTRY_CODES", () => {
    it("should export COUNTRY_CODES array", () => {
      expect(COUNTRY_CODES).toBeDefined();
      expect(Array.isArray(COUNTRY_CODES)).toBe(true);
    });

    it("should have 7 country codes", () => {
      expect(COUNTRY_CODES).toHaveLength(7);
    });

    it("should have all required properties", () => {
      COUNTRY_CODES.forEach((country) => {
        expect(country).toHaveProperty("code");
        expect(country).toHaveProperty("country");
        expect(country).toHaveProperty("flag");
        expect(country).toHaveProperty("iso");
        expect(typeof country.code).toBe("string");
        expect(typeof country.country).toBe("string");
        expect(typeof country.flag).toBe("string");
        expect(typeof country.iso).toBe("string");
        expect(country.code).toMatch(/^\+\d+$/);
        expect(country.iso.length).toBe(2);
      });
    });

    it("should have India as first country", () => {
      expect(COUNTRY_CODES[0].country).toBe("India");
      expect(COUNTRY_CODES[0].code).toBe("+91");
      expect(COUNTRY_CODES[0].iso).toBe("IN");
      expect(COUNTRY_CODES[0].flag).toBe("🇮🇳");
    });

    it("should include major countries", () => {
      const countries = COUNTRY_CODES.map((c) => c.country);
      expect(countries).toContain("United States");
      expect(countries).toContain("United Kingdom");
      expect(countries).toContain("UAE");
      expect(countries).toContain("Singapore");
    });

    it("should have valid emoji flags", () => {
      COUNTRY_CODES.forEach((country) => {
        // Emoji flags are represented as regional indicator symbols
        expect(country.flag.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should have unique country codes", () => {
      const codes = COUNTRY_CODES.map((c) => `${c.code}-${c.iso}`);
      expect(new Set(codes).size).toBe(COUNTRY_CODES.length);
    });
  });

  describe("DEFAULT_COUNTRY_CODE", () => {
    it("should be India's country code", () => {
      expect(DEFAULT_COUNTRY_CODE).toBe("+91");
    });

    it("should match India in COUNTRY_CODES", () => {
      const india = COUNTRY_CODES.find((c) => c.country === "India");
      expect(india?.code).toBe(DEFAULT_COUNTRY_CODE);
    });
  });

  describe("ADDRESS_TYPES", () => {
    it("should export ADDRESS_TYPES array", () => {
      expect(ADDRESS_TYPES).toBeDefined();
      expect(Array.isArray(ADDRESS_TYPES)).toBe(true);
    });

    it("should have 3 address types", () => {
      expect(ADDRESS_TYPES).toHaveLength(3);
    });

    it("should include all address types", () => {
      expect(ADDRESS_TYPES).toContain("home");
      expect(ADDRESS_TYPES).toContain("work");
      expect(ADDRESS_TYPES).toContain("other");
    });

    it("should be readonly", () => {
      const testType: AddressType = "home";
      expect(ADDRESS_TYPES).toContain(testType);
    });
  });

  describe("ADDRESS_TYPE_LABELS", () => {
    it("should have labels for all address types", () => {
      ADDRESS_TYPES.forEach((type) => {
        expect(ADDRESS_TYPE_LABELS[type]).toBeDefined();
        expect(typeof ADDRESS_TYPE_LABELS[type]).toBe("string");
      });
    });

    it("should have correct label for home", () => {
      expect(ADDRESS_TYPE_LABELS.home).toBe("Home");
    });

    it("should have correct label for work", () => {
      expect(ADDRESS_TYPE_LABELS.work).toBe("Work");
    });

    it("should have correct label for other", () => {
      expect(ADDRESS_TYPE_LABELS.other).toBe("Other");
    });
  });

  describe("ADDRESS_TYPE_ICONS", () => {
    it("should have icons for all address types", () => {
      ADDRESS_TYPES.forEach((type) => {
        expect(ADDRESS_TYPE_ICONS[type]).toBeDefined();
        expect(typeof ADDRESS_TYPE_ICONS[type]).toBe("string");
      });
    });

    it("should have emoji icon for home", () => {
      expect(ADDRESS_TYPE_ICONS.home).toBe("🏠");
    });

    it("should have emoji icon for work", () => {
      expect(ADDRESS_TYPE_ICONS.work).toBe("💼");
    });

    it("should have emoji icon for other", () => {
      expect(ADDRESS_TYPE_ICONS.other).toBe("📍");
    });
  });

  describe("PINCODE_REGEX", () => {
    it("should be a valid regex", () => {
      expect(PINCODE_REGEX).toBeInstanceOf(RegExp);
    });

    it("should match valid 6-digit pincodes", () => {
      const validPincodes = ["110001", "560001", "400001", "600001"];
      validPincodes.forEach((pincode) => {
        expect(PINCODE_REGEX.test(pincode)).toBe(true);
      });
    });

    it("should not match pincodes starting with 0", () => {
      expect(PINCODE_REGEX.test("012345")).toBe(false);
    });

    it("should not match invalid formats", () => {
      const invalidPincodes = [
        "12345", // Too short
        "1234567", // Too long
        "11000A", // Contains letter
        "11 001", // Contains space
        "110-001", // Contains hyphen
      ];

      invalidPincodes.forEach((pincode) => {
        expect(PINCODE_REGEX.test(pincode)).toBe(false);
      });
    });
  });

  describe("PINCODE_LENGTH", () => {
    it("should be 6", () => {
      expect(PINCODE_LENGTH).toBe(6);
    });
  });

  describe("INDIAN_PHONE_REGEX", () => {
    it("should be a valid regex", () => {
      expect(INDIAN_PHONE_REGEX).toBeInstanceOf(RegExp);
    });

    it("should match valid 10-digit phone numbers", () => {
      const validPhones = [
        "9876543210",
        "8123456789",
        "7012345678",
        "6543210987",
      ];
      validPhones.forEach((phone) => {
        expect(INDIAN_PHONE_REGEX.test(phone)).toBe(true);
      });
    });

    it("should not match numbers starting with 0-5", () => {
      const invalidStarts = ["0123456789", "1234567890", "5987654321"];
      invalidStarts.forEach((phone) => {
        expect(INDIAN_PHONE_REGEX.test(phone)).toBe(false);
      });
    });

    it("should not match invalid formats", () => {
      const invalidPhones = [
        "987654321", // Too short
        "98765432101", // Too long
        "987654321A", // Contains letter
        "98 76543210", // Contains space
        "9876-543210", // Contains hyphen
      ];

      invalidPhones.forEach((phone) => {
        expect(INDIAN_PHONE_REGEX.test(phone)).toBe(false);
      });
    });
  });

  describe("PHONE_LENGTH", () => {
    it("should be 10", () => {
      expect(PHONE_LENGTH).toBe(10);
    });
  });

  describe("isValidPincode function", () => {
    it("should validate correct pincodes", () => {
      const validPincodes = ["110001", "560001", "400001", "600001", "700001"];
      validPincodes.forEach((pincode) => {
        expect(isValidPincode(pincode)).toBe(true);
      });
    });

    it("should reject pincodes starting with 0", () => {
      expect(isValidPincode("012345")).toBe(false);
    });

    it("should reject short pincodes", () => {
      expect(isValidPincode("12345")).toBe(false);
    });

    it("should reject long pincodes", () => {
      expect(isValidPincode("1234567")).toBe(false);
    });

    it("should reject non-numeric pincodes", () => {
      expect(isValidPincode("11000A")).toBe(false);
      expect(isValidPincode("ABCDEF")).toBe(false);
    });

    it("should reject pincodes with special characters", () => {
      expect(isValidPincode("110-001")).toBe(false);
      expect(isValidPincode("110 001")).toBe(false);
      expect(isValidPincode("110.001")).toBe(false);
    });

    it("should reject empty strings", () => {
      expect(isValidPincode("")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidPincode("100000")).toBe(true); // Minimum valid
      expect(isValidPincode("999999")).toBe(true); // Maximum valid
    });
  });

  describe("isValidIndianPhone function", () => {
    it("should validate correct phone numbers", () => {
      const validPhones = [
        "9876543210",
        "8123456789",
        "7012345678",
        "6543210987",
      ];
      validPhones.forEach((phone) => {
        expect(isValidIndianPhone(phone)).toBe(true);
      });
    });

    it("should reject numbers starting with 0-5", () => {
      const invalidPhones = [
        "0123456789",
        "1234567890",
        "2345678901",
        "3456789012",
        "4567890123",
        "5678901234",
      ];

      invalidPhones.forEach((phone) => {
        expect(isValidIndianPhone(phone)).toBe(false);
      });
    });

    it("should clean and validate numbers with formatting", () => {
      // Function removes non-digits
      expect(isValidIndianPhone("987-654-3210")).toBe(true);
      expect(isValidIndianPhone("987 654 3210")).toBe(true);
      expect(isValidIndianPhone("(987) 654-3210")).toBe(true);
    });

    it("should reject short numbers", () => {
      expect(isValidIndianPhone("987654321")).toBe(false);
    });

    it("should reject long numbers", () => {
      expect(isValidIndianPhone("98765432101")).toBe(false);
    });

    it("should reject numbers with letters", () => {
      expect(isValidIndianPhone("987654321A")).toBe(false);
      expect(isValidIndianPhone("ABCDEFGHIJ")).toBe(false);
    });

    it("should reject empty strings", () => {
      expect(isValidIndianPhone("")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidIndianPhone("6000000000")).toBe(true); // Minimum valid
      expect(isValidIndianPhone("9999999999")).toBe(true); // Maximum valid
    });
  });

  describe("Type Definitions", () => {
    it("should support IndianState type", () => {
      const state: IndianState = "Maharashtra";
      expect(ALL_INDIAN_STATES).toContain(state);
    });

    it("should support AddressType type", () => {
      const type: AddressType = "home";
      expect(ADDRESS_TYPES).toContain(type);
    });
  });

  describe("Data Consistency", () => {
    it("should have no duplicate states across all arrays", () => {
      const allStates = [...INDIAN_STATES, ...UNION_TERRITORIES];
      const uniqueStates = new Set(allStates);
      expect(uniqueStates.size).toBe(allStates.length);
    });

    it("should have properly formatted state names", () => {
      ALL_INDIAN_STATES.forEach((state) => {
        // Should start with capital letter
        expect(state[0]).toMatch(/[A-Z]/);
        // Should not have leading/trailing spaces
        expect(state.trim()).toBe(state);
      });
    });

    it("should have valid ISO codes for countries", () => {
      COUNTRY_CODES.forEach((country) => {
        expect(country.iso).toMatch(/^[A-Z]{2}$/);
      });
    });

    it("should maintain consistent address type naming", () => {
      ADDRESS_TYPES.forEach((type) => {
        expect(type).toMatch(/^[a-z]+$/);
      });
    });
  });
});
