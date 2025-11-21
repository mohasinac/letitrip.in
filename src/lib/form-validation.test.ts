/**
 * Tests for form-validation.ts
 * Testing form validation utilities
 */

import { describe, it, expect } from "@jest/globals";

// Mock validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUsername = (
  username: string
): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters long",
    };
  }

  if (username.length > 20) {
    return {
      isValid: false,
      error: "Username must be at most 20 characters long",
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  return { isValid: true };
};

const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const validatePostalCode = (
  postalCode: string,
  country: string = "IN"
): boolean => {
  switch (country.toUpperCase()) {
    case "IN":
      return /^[1-9][0-9]{5}$/.test(postalCode);
    case "US":
      return /^\d{5}(-\d{4})?$/.test(postalCode);
    case "UK":
      return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(postalCode);
    default:
      return true; // Allow any format for unknown countries
  }
};

const validateField = (
  value: any,
  rules: any[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const rule of rules) {
    switch (rule.type) {
      case "required":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors.push(rule.message || "This field is required");
        }
        break;

      case "minLength":
        if (typeof value === "string" && value.length < rule.value) {
          errors.push(
            rule.message || `Minimum length is ${rule.value} characters`
          );
        }
        break;

      case "maxLength":
        if (typeof value === "string" && value.length > rule.value) {
          errors.push(
            rule.message || `Maximum length is ${rule.value} characters`
          );
        }
        break;

      case "email":
        if (value && !validateEmail(value)) {
          errors.push(rule.message || "Invalid email format");
        }
        break;

      case "phone":
        if (value && !validatePhoneNumber(value)) {
          errors.push(rule.message || "Invalid phone number format");
        }
        break;

      case "url":
        if (value && !validateURL(value)) {
          errors.push(rule.message || "Invalid URL format");
        }
        break;

      case "pattern":
        if (value && !rule.regex.test(value)) {
          errors.push(rule.message || "Invalid format");
        }
        break;

      case "min":
        if (typeof value === "number" && value < rule.value) {
          errors.push(rule.message || `Minimum value is ${rule.value}`);
        }
        break;

      case "max":
        if (typeof value === "number" && value > rule.value) {
          errors.push(rule.message || `Maximum value is ${rule.value}`);
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateForm = (
  formData: Record<string, any>,
  validationRules: Record<string, any[]>
): Record<string, { isValid: boolean; errors: string[] }> => {
  const results: Record<string, { isValid: boolean; errors: string[] }> = {};

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    results[fieldName] = validateField(formData[fieldName], rules);
  }

  return results;
};

describe("Form Validation", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name+tag@example.co.uk")).toBe(true);
      expect(validateEmail("test123@gmail.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test.example.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validatePhoneNumber", () => {
    it("should validate correct Indian phone numbers", () => {
      expect(validatePhoneNumber("9876543210")).toBe(true);
      expect(validatePhoneNumber("6789012345")).toBe(true);
      expect(validatePhoneNumber("9123456789")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhoneNumber("1234567890")).toBe(false); // Starts with 1
      expect(validatePhoneNumber("5678901234")).toBe(false); // Starts with 5
      expect(validatePhoneNumber("987654321")).toBe(false); // Too short
      expect(validatePhoneNumber("98765432101")).toBe(false); // Too long
      expect(validatePhoneNumber("987654321a")).toBe(false); // Contains letter
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const result = validatePassword("StrongPass123!");
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject weak passwords", () => {
      let result = validatePassword("weak");
      expect(result.isValid).toBe(false);
      expect(
        result.errors.includes("Password must be at least 8 characters long")
      ).toBe(true);

      result = validatePassword("weakpassword");
      expect(result.isValid).toBe(false);
      expect(
        result.errors.includes(
          "Password must contain at least one uppercase letter"
        )
      ).toBe(true);

      result = validatePassword("WEAKPASSWORD");
      expect(result.isValid).toBe(false);
      expect(
        result.errors.includes(
          "Password must contain at least one lowercase letter"
        )
      ).toBe(true);

      result = validatePassword("WeakPassword");
      expect(result.isValid).toBe(false);
      expect(
        result.errors.includes("Password must contain at least one number")
      ).toBe(true);

      result = validatePassword("WeakPassword123");
      expect(result.isValid).toBe(false);
      expect(
        result.errors.includes(
          "Password must contain at least one special character"
        )
      ).toBe(true);
    });
  });

  describe("validateUsername", () => {
    it("should validate correct usernames", () => {
      expect(validateUsername("testuser").isValid).toBe(true);
      expect(validateUsername("user123").isValid).toBe(true);
      expect(validateUsername("test_user").isValid).toBe(true);
    });

    it("should reject invalid usernames", () => {
      let result = validateUsername("ab");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username must be at least 3 characters long");

      result = validateUsername("a".repeat(21));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username must be at most 20 characters long");

      result = validateUsername("test user");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Username can only contain letters, numbers, and underscores"
      );

      result = validateUsername("test@user");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Username can only contain letters, numbers, and underscores"
      );
    });
  });

  describe("validateURL", () => {
    it("should validate correct URLs", () => {
      expect(validateURL("https://example.com")).toBe(true);
      expect(validateURL("http://example.com")).toBe(true);
      expect(validateURL("https://example.com/path")).toBe(true);
      expect(validateURL("https://example.com/path?query=value")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(validateURL("not-a-url")).toBe(false);
      expect(validateURL("example.com")).toBe(false);
      expect(validateURL("")).toBe(false);
    });
  });

  describe("validateCreditCard", () => {
    it("should validate correct credit card numbers", () => {
      expect(validateCreditCard("4532015112830366")).toBe(true); // Visa test number
      expect(validateCreditCard("5555555555554444")).toBe(true); // Mastercard test number
    });

    it("should reject invalid credit card numbers", () => {
      expect(validateCreditCard("1234567890123456")).toBe(false);
      expect(validateCreditCard("4532015112830367")).toBe(false); // Valid format but invalid checksum
      expect(validateCreditCard("123")).toBe(false); // Too short
    });
  });

  describe("validatePostalCode", () => {
    it("should validate Indian postal codes", () => {
      expect(validatePostalCode("110001", "IN")).toBe(true);
      expect(validatePostalCode("560001", "IN")).toBe(true);
    });

    it("should reject invalid Indian postal codes", () => {
      expect(validatePostalCode("0110001", "IN")).toBe(false); // Starts with 0
      expect(validatePostalCode("11000", "IN")).toBe(false); // Too short
      expect(validatePostalCode("1100012", "IN")).toBe(false); // Too long
    });

    it("should validate US postal codes", () => {
      expect(validatePostalCode("12345", "US")).toBe(true);
      expect(validatePostalCode("12345-6789", "US")).toBe(true);
    });

    it("should validate UK postal codes", () => {
      expect(validatePostalCode("SW1A 1AA", "UK")).toBe(true);
      expect(validatePostalCode("M1 1AA", "UK")).toBe(true);
    });
  });

  describe("validateField", () => {
    it("should validate required fields", () => {
      let result = validateField("", [{ type: "required" }]);
      expect(result.isValid).toBe(false);
      expect(result.errors.includes("This field is required")).toBe(true);

      result = validateField("test", [{ type: "required" }]);
      expect(result.isValid).toBe(true);
    });

    it("should validate string length", () => {
      let result = validateField("ab", [{ type: "minLength", value: 3 }]);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("Minimum length"))
      ).toBe(true);

      result = validateField("abcd", [{ type: "maxLength", value: 3 }]);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("Maximum length"))
      ).toBe(true);
    });

    it("should validate email format", () => {
      let result = validateField("invalid", [{ type: "email" }]);
      expect(result.isValid).toBe(false);
      expect(result.errors.includes("Invalid email format")).toBe(true);

      result = validateField("test@example.com", [{ type: "email" }]);
      expect(result.isValid).toBe(true);
    });

    it("should validate numeric ranges", () => {
      let result = validateField(5, [{ type: "min", value: 10 }]);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("Minimum value"))
      ).toBe(true);

      result = validateField(15, [{ type: "max", value: 10 }]);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("Maximum value"))
      ).toBe(true);
    });

    it("should handle multiple validation rules", () => {
      const rules = [
        { type: "required" },
        { type: "minLength", value: 3 },
        { type: "email" },
      ];

      let result = validateField("", rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);

      result = validateField("ab", rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);

      result = validateField("invalid", rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);

      result = validateField("test@example.com", rules);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateForm", () => {
    it("should validate entire form", () => {
      const formData = {
        email: "test@example.com",
        phone: "9876543210",
        password: "weak",
      };

      const rules = {
        email: [{ type: "required" }, { type: "email" }],
        phone: [{ type: "required" }, { type: "phone" }],
        password: [{ type: "required" }, { type: "minLength", value: 8 }],
      };

      const result = validateForm(formData, rules);

      expect(result.email.isValid).toBe(true);
      expect(result.phone.isValid).toBe(true);
      expect(result.password.isValid).toBe(false);
      expect(
        result.password.errors.some((error) => error.includes("Minimum length"))
      ).toBe(true);
    });

    it("should handle missing fields", () => {
      const formData = { email: "test@example.com" };
      const rules = {
        email: [{ type: "required" }],
        phone: [{ type: "required" }],
      };

      const result = validateForm(formData, rules);

      expect(result.email.isValid).toBe(true);
      expect(result.phone.isValid).toBe(false);
      expect(result.phone.errors.includes("This field is required")).toBe(true);
    });
  });
});
