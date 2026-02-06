/**
 * @jest-environment jsdom
 */

import {
  isValidEmail,
  isValidEmailDomain,
  normalizeEmail,
  isDisposableEmail,
} from "../email.validator";

describe("Email Validator", () => {
  describe("isValidEmail", () => {
    it("should validate correct email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.com")).toBe(true);
      expect(isValidEmail("user_name@example-domain.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("invalid@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user @example.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidEmail("a@b.c")).toBe(true); // Minimum valid email
      expect(isValidEmail("user@localhost")).toBe(false); // No TLD - requires period
      expect(isValidEmail("user@domain..com")).toBe(false); // Double dot
    });
  });

  describe("isValidEmailDomain", () => {
    it("should validate emails with valid domains", () => {
      expect(isValidEmailDomain("user@gmail.com")).toBe(true);
      expect(isValidEmailDomain("user@company.co.uk")).toBe(true);
      expect(isValidEmailDomain("user@subdomain.example.com")).toBe(true);
    });

    it("should reject emails with invalid domains", () => {
      expect(isValidEmailDomain("user@")).toBe(false);
      expect(isValidEmailDomain("user@.com")).toBe(false);
      expect(isValidEmailDomain("user@domain")).toBe(false);
      expect(isValidEmailDomain("invalid")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("should convert email to lowercase", () => {
      expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
      expect(normalizeEmail("TEST@DOMAIN.COM")).toBe("test@domain.com");
    });

    it("should trim whitespace", () => {
      expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
      expect(normalizeEmail("\tuser@example.com\n")).toBe("user@example.com");
    });

    it("should handle already normalized emails", () => {
      expect(normalizeEmail("user@example.com")).toBe("user@example.com");
    });

    it("should handle empty strings", () => {
      expect(normalizeEmail("")).toBe("");
      expect(normalizeEmail("   ")).toBe("");
    });
  });

  describe("isDisposableEmail", () => {
    it("should detect common disposable email domains", () => {
      expect(isDisposableEmail("user@tempmail.com")).toBe(true);
      expect(isDisposableEmail("user@guerrillamail.com")).toBe(true);
      expect(isDisposableEmail("user@10minutemail.com")).toBe(true);
    });

    it("should not flag legitimate email domains", () => {
      expect(isDisposableEmail("user@gmail.com")).toBe(false);
      expect(isDisposableEmail("user@outlook.com")).toBe(false);
      expect(isDisposableEmail("user@company.com")).toBe(false);
    });

    it("should be case-insensitive", () => {
      expect(isDisposableEmail("user@TEMPMAIL.COM")).toBe(true);
      expect(isDisposableEmail("user@TempMail.Com")).toBe(true);
    });

    it("should handle invalid emails", () => {
      expect(isDisposableEmail("invalid")).toBe(false);
      expect(isDisposableEmail("")).toBe(false);
    });
  });
});
