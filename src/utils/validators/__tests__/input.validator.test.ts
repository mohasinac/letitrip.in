/**
 * @jest-environment jsdom
 */

import {
  isRequired,
  minLength,
  maxLength,
  exactLength,
  isNumeric,
  isAlphabetic,
  isAlphanumeric,
  inRange,
  matchesPattern,
  isInList,
  isValidCreditCard,
  isValidPostalCode,
} from "../input.validator";

describe("Input Validator", () => {
  describe("isRequired", () => {
    it("should validate required strings", () => {
      expect(isRequired("value")).toBe(true);
      expect(isRequired("   value   ")).toBe(true);
    });

    it("should reject empty strings", () => {
      expect(isRequired("")).toBe(false);
      expect(isRequired("   ")).toBe(false);
    });

    it("should validate required arrays", () => {
      expect(isRequired([1, 2, 3])).toBe(true);
      expect(isRequired([])).toBe(false);
    });

    it("should handle null and undefined", () => {
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });

    it("should validate other types", () => {
      expect(isRequired(0)).toBe(true);
      expect(isRequired(false)).toBe(true);
      expect(isRequired({})).toBe(true);
    });
  });

  describe("minLength", () => {
    it("should validate minimum length", () => {
      expect(minLength("hello", 5)).toBe(true);
      expect(minLength("hello", 3)).toBe(true);
      expect(minLength("hello", 6)).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(minLength("", 0)).toBe(true);
      expect(minLength("", 1)).toBe(false);
    });
  });

  describe("maxLength", () => {
    it("should validate maximum length", () => {
      expect(maxLength("hello", 5)).toBe(true);
      expect(maxLength("hello", 10)).toBe(true);
      expect(maxLength("hello", 3)).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(maxLength("", 0)).toBe(true);
      expect(maxLength("", 5)).toBe(true);
    });
  });

  describe("exactLength", () => {
    it("should validate exact length", () => {
      expect(exactLength("hello", 5)).toBe(true);
      expect(exactLength("hello", 4)).toBe(false);
      expect(exactLength("hello", 6)).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(exactLength("", 0)).toBe(true);
      expect(exactLength("", 1)).toBe(false);
    });
  });

  describe("isNumeric", () => {
    it("should validate numeric values", () => {
      expect(isNumeric("123")).toBe(true);
      expect(isNumeric("123.45")).toBe(true);
      expect(isNumeric("-123")).toBe(true);
      expect(isNumeric("0")).toBe(true);
    });

    it("should reject non-numeric values", () => {
      expect(isNumeric("abc")).toBe(false);
      expect(isNumeric("12a")).toBe(false);
      expect(isNumeric("")).toBe(false);
    });
  });

  describe("isAlphabetic", () => {
    it("should validate alphabetic values", () => {
      expect(isAlphabetic("hello")).toBe(true);
      expect(isAlphabetic("WORLD")).toBe(true);
      expect(isAlphabetic("aBcDeF")).toBe(true);
    });

    it("should reject non-alphabetic values", () => {
      expect(isAlphabetic("hello123")).toBe(false);
      expect(isAlphabetic("hello-world")).toBe(false);
      expect(isAlphabetic("hello world")).toBe(false);
      expect(isAlphabetic("")).toBe(false);
    });
  });

  describe("isAlphanumeric", () => {
    it("should validate alphanumeric values", () => {
      expect(isAlphanumeric("hello123")).toBe(true);
      expect(isAlphanumeric("ABC123")).toBe(true);
      expect(isAlphanumeric("abc")).toBe(true);
      expect(isAlphanumeric("123")).toBe(true);
    });

    it("should reject non-alphanumeric values", () => {
      expect(isAlphanumeric("hello-world")).toBe(false);
      expect(isAlphanumeric("hello world")).toBe(false);
      expect(isAlphanumeric("hello!")).toBe(false);
      expect(isAlphanumeric("")).toBe(false);
    });
  });

  describe("inRange", () => {
    it("should validate values in range", () => {
      expect(inRange(5, 1, 10)).toBe(true);
      expect(inRange(1, 1, 10)).toBe(true); // Min boundary
      expect(inRange(10, 1, 10)).toBe(true); // Max boundary
    });

    it("should reject values outside range", () => {
      expect(inRange(0, 1, 10)).toBe(false);
      expect(inRange(11, 1, 10)).toBe(false);
      expect(inRange(-5, 1, 10)).toBe(false);
    });
  });

  describe("matchesPattern", () => {
    it("should validate pattern matches", () => {
      expect(matchesPattern("abc123", /^[a-z]+[0-9]+$/)).toBe(true);
      expect(matchesPattern("hello", /^hello$/)).toBe(true);
    });

    it("should reject pattern mismatches", () => {
      expect(matchesPattern("123abc", /^[a-z]+[0-9]+$/)).toBe(false);
      expect(matchesPattern("hello", /^world$/)).toBe(false);
    });
  });

  describe("isInList", () => {
    it("should validate values in list", () => {
      expect(isInList("apple", ["apple", "banana", "orange"])).toBe(true);
      expect(isInList(1, [1, 2, 3])).toBe(true);
    });

    it("should reject values not in list", () => {
      expect(isInList("grape", ["apple", "banana", "orange"])).toBe(false);
      expect(isInList(4, [1, 2, 3])).toBe(false);
    });

    it("should handle empty lists", () => {
      expect(isInList("apple", [])).toBe(false);
    });
  });

  describe("isValidCreditCard", () => {
    it("should validate correct credit card numbers (Luhn algorithm)", () => {
      expect(isValidCreditCard("4532015112830366")).toBe(true); // Valid Visa
      expect(isValidCreditCard("6011111111111117")).toBe(true); // Valid Discover
      expect(isValidCreditCard("5425233430109903")).toBe(true); // Valid Mastercard
    });

    it("should reject invalid credit card numbers", () => {
      expect(isValidCreditCard("4532015112830367")).toBe(false); // Invalid checksum
      expect(isValidCreditCard("1234567890123456")).toBe(false); // Fails Luhn
    });

    it("should handle formatted credit card numbers", () => {
      expect(isValidCreditCard("4532-0151-1283-0366")).toBe(true);
      expect(isValidCreditCard("4532 0151 1283 0366")).toBe(true);
    });

    it("should reject invalid lengths", () => {
      expect(isValidCreditCard("123")).toBe(false); // Too short
      expect(isValidCreditCard("12345678901234567890")).toBe(false); // Too long
    });

    it("should handle edge cases", () => {
      expect(isValidCreditCard("")).toBe(false);
      expect(isValidCreditCard("abcd1234")).toBe(false);
    });
  });

  describe("isValidPostalCode", () => {
    it("should validate US zip codes", () => {
      expect(isValidPostalCode("12345", "US")).toBe(true);
      expect(isValidPostalCode("12345-6789", "US")).toBe(true);
    });

    it("should validate Canadian postal codes", () => {
      expect(isValidPostalCode("K1A 0B1", "CA")).toBe(true);
      expect(isValidPostalCode("M5H 2N2", "CA")).toBe(true);
    });

    it("should validate UK postcodes", () => {
      expect(isValidPostalCode("SW1A 1AA", "UK")).toBe(true);
      expect(isValidPostalCode("EC1A1BB", "UK")).toBe(true);
    });

    it("should validate Indian pin codes", () => {
      expect(isValidPostalCode("110001", "IN")).toBe(true);
      expect(isValidPostalCode("400001", "IN")).toBe(true);
    });

    it("should reject invalid postal codes", () => {
      expect(isValidPostalCode("1234", "US")).toBe(false); // Too short
      expect(isValidPostalCode("12345-678", "US")).toBe(false); // Invalid format
      expect(isValidPostalCode("ABC 123", "UK")).toBe(false); // Invalid format
    });

    it("should return true for unknown country codes", () => {
      expect(isValidPostalCode("12345", "XX")).toBe(true);
    });

    it("should handle edge cases", () => {
      expect(isValidPostalCode("", "US")).toBe(false);
    });
  });
});
