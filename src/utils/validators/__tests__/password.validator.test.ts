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
      expect(calculatePasswordStrength("")).toBe(0);
      expect(calculatePasswordStrength("123")).toBe(0);
      expect(calculatePasswordStrength("abc")).toBe(0);
    });

    it("should return 1 for weak passwords", () => {
      expect(calculatePasswordStrength("password")).toBe(1);
      expect(calculatePasswordStrength("12345678")).toBe(1);
    });

    it("should return 2 for fair passwords", () => {
      expect(calculatePasswordStrength("password123")).toBe(2);
      expect(calculatePasswordStrength("Password")).toBe(2);
    });

    it("should return 3 for good passwords", () => {
      expect(calculatePasswordStrength("Password123")).toBe(3);
      expect(calculatePasswordStrength("MyPass123")).toBe(3);
    });

    it("should return 4 for strong passwords", () => {
      expect(calculatePasswordStrength("MyP@ssw0rd123!")).toBe(4);
      expect(calculatePasswordStrength("Str0ng!Password")).toBe(4);
      expect(calculatePasswordStrength("C0mpl3x!P@ssw0rd")).toBe(4);
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
      expect(isCommonPassword("admin")).toBe(true);
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
