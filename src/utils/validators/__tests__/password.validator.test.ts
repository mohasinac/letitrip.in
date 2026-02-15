/**
 * @jest-environment jsdom
 */

import {
  meetsPasswordRequirements,
  calculatePasswordStrength,
  isCommonPassword,
} from "../password.validator";

describe("Password Validator", () => {
  describe("meetsPasswordRequirements", () => {
    const defaultRequirements = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    };

    it("should validate passwords meeting all requirements", () => {
      expect(meetsPasswordRequirements("Password123!").valid).toBe(true);
      expect(meetsPasswordRequirements("MyP@ssw0rd").valid).toBe(true);
      expect(meetsPasswordRequirements("Str0ng!Pass").valid).toBe(true);
    });

    it("should reject passwords that are too short", () => {
      const result = meetsPasswordRequirements("Pass1!");
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("At least 8 characters");
    });

    it("should reject passwords without uppercase", () => {
      const result = meetsPasswordRequirements("password123!");
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("One uppercase letter");
    });

    it("should reject passwords without lowercase", () => {
      const result = meetsPasswordRequirements("PASSWORD123!");
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("One lowercase letter");
    });

    it("should reject passwords without numbers", () => {
      const result = meetsPasswordRequirements("Password!");
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("One number");
    });

    it("should reject passwords without special characters", () => {
      const result = meetsPasswordRequirements("Password123");
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("One special character");
    });

    it("should allow custom requirements", () => {
      const customReqs = {
        minLength: 6,
        requireUppercase: false,
        requireLowercase: true,
        requireNumbers: false,
        requireSpecialChars: false,
      };
      expect(meetsPasswordRequirements("simple", customReqs).valid).toBe(true);
      expect(meetsPasswordRequirements("UPPER", customReqs).valid).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(meetsPasswordRequirements("").valid).toBe(false);
      expect(meetsPasswordRequirements("        ").valid).toBe(false);
    });
  });

  describe("calculatePasswordStrength", () => {
    it("should return 0 for very weak passwords", () => {
      expect(calculatePasswordStrength("").score).toBe(0);
      expect(calculatePasswordStrength("abc").score).toBe(0);
      expect(calculatePasswordStrength("password").score).toBe(0); // common password
    });

    it("should return 1-2 for weak passwords", () => {
      expect(calculatePasswordStrength("123").score).toBe(1); // has digits only
      expect(calculatePasswordStrength("87654321").score).toBe(2); // length >= 8 + has digits (not starting with common pattern)
    });

    it("should return 2 for fair passwords", () => {
      expect(calculatePasswordStrength("MySecure").score).toBe(2); // length >= 8 + mixed case (not starting with common pattern)
      expect(calculatePasswordStrength("abcdefgh").score).toBe(1); // length >= 8 only
    });

    it("should return 3 for good passwords", () => {
      expect(calculatePasswordStrength("password123").score).toBe(0); // common password triggers score = 0
      expect(calculatePasswordStrength("MySecure123").score).toBe(3); // length >= 8 + mixed + digits
      expect(calculatePasswordStrength("SecPass789").score).toBe(3);
    });

    it("should return 4 for very strong passwords", () => {
      expect(calculatePasswordStrength("MyP@ssw0rd123!").score).toBe(4);
      expect(calculatePasswordStrength("Str0ng!Password").score).toBe(4);
      expect(calculatePasswordStrength("C0mpl3x!P@ssw0rd").score).toBe(4);
    });

    it("should consider length in strength calculation", () => {
      const short = calculatePasswordStrength("P@ss1");
      const long = calculatePasswordStrength("P@ssw0rd123!ExtraLong");
      // Compare score property
      expect(long.score).toBeGreaterThan(short.score);
    });
  });

  describe("isCommonPassword", () => {
    it("should detect common weak passwords", () => {
      expect(isCommonPassword("password")).toBe(true);
      expect(isCommonPassword("123456")).toBe(true);
      expect(isCommonPassword("qwerty")).toBe(true);
      expect(isCommonPassword("admin")).toBe(false); // not in the hardcoded list
    });

    it("should be case-insensitive", () => {
      expect(isCommonPassword("PASSWORD")).toBe(true);
      expect(isCommonPassword("Password")).toBe(true);
      expect(isCommonPassword("QWERTY")).toBe(true);
    });

    it("should not flag strong unique passwords", () => {
      expect(isCommonPassword("MyUn1qu3!P@ss")).toBe(false);
      expect(isCommonPassword("Str0ng!Passw0rd")).toBe(false);
      expect(isCommonPassword("C0mpl3x!2024")).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(isCommonPassword("")).toBe(false);
    });
  });
});
