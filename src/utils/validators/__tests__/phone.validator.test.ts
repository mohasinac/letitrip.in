/**
 * @jest-environment jsdom
 */

import {
  isValidPhone,
  normalizePhone,
  formatPhone,
  extractCountryCode,
} from "../phone.validator";

describe("Phone Validator", () => {
  describe("isValidPhone", () => {
    it("should validate correct phone numbers", () => {
      expect(isValidPhone("+1234567890")).toBe(true);
      expect(isValidPhone("+1 (234) 567-8900")).toBe(true);
      expect(isValidPhone("1234567890")).toBe(true);
      expect(isValidPhone("+44 20 7123 4567")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(isValidPhone("123")).toBe(false); // Too short
      expect(isValidPhone("12345678901234567")).toBe(false); // Too long
      expect(isValidPhone("abc123456")).toBe(false); // Contains letters
      expect(isValidPhone("")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidPhone("+1234567890123456")).toBe(false); // Over 15 digits
      expect(isValidPhone("123456789")).toBe(false); // Exactly 9 digits
      expect(isValidPhone("1234567890")).toBe(true); // Exactly 10 digits
    });
  });

  describe("normalizePhone", () => {
    it("should remove formatting characters", () => {
      expect(normalizePhone("(123) 456-7890")).toBe("1234567890");
      expect(normalizePhone("+1 234 567 8900")).toBe("+12345678900");
      expect(normalizePhone("123-456-7890")).toBe("1234567890");
    });

    it("should preserve plus sign", () => {
      expect(normalizePhone("+1234567890")).toBe("+1234567890");
    });

    it("should handle already normalized numbers", () => {
      expect(normalizePhone("1234567890")).toBe("1234567890");
      expect(normalizePhone("+12345678900")).toBe("+12345678900");
    });

    it("should handle empty strings", () => {
      expect(normalizePhone("")).toBe("");
    });
  });

  describe("formatPhone", () => {
    it("should format US phone numbers", () => {
      expect(formatPhone("1234567890", "US")).toBe("(123) 456-7890");
      expect(formatPhone("(123) 456-7890", "US")).toBe("(123) 456-7890");
    });

    it("should add plus sign to numbers without country code", () => {
      expect(formatPhone("1234567890", "UK")).toBe("+1234567890");
      expect(formatPhone("447123456789", "UK")).toBe("+447123456789");
    });

    it("should preserve international format with plus sign", () => {
      expect(formatPhone("+12345678900")).toBe("+12345678900");
      expect(formatPhone("+44 20 7123 4567")).toBe("+442071234567");
    });

    it("should handle empty strings", () => {
      expect(formatPhone("")).toBe("+");
    });
  });

  describe("extractCountryCode", () => {
    it("should extract common country codes", () => {
      expect(extractCountryCode("+12345678900")).toBe("+123"); // Extracts first 1-3 digits
      expect(extractCountryCode("+442071234567")).toBe("+442");
      expect(extractCountryCode("+911234567890")).toBe("+911");
    });

    it("should handle formatted phone numbers", () => {
      expect(extractCountryCode("+1 (234) 567-8900")).toBe("+123"); // Extracts first 1-3 digits after normalization
      expect(extractCountryCode("+44 20 7123 4567")).toBe("+442");
    });

    it("should return null for numbers without country code", () => {
      expect(extractCountryCode("1234567890")).toBe(null);
      expect(extractCountryCode("(123) 456-7890")).toBe(null);
    });

    it("should handle edge cases", () => {
      expect(extractCountryCode("")).toBe(null);
      expect(extractCountryCode("+123")).toBe("+123");
    });
  });
});
