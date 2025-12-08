/**
 * Tests for Inline Edit Validation Schemas
 */

import { validators } from "../inline-edit-schemas";

describe("Inline Edit Validators", () => {
  describe("required", () => {
    it("should return error for undefined value", () => {
      const result = validators.required(undefined, "Field");

      expect(result).toBe("Field is required");
    });

    it("should return error for null value", () => {
      const result = validators.required(null, "Field");

      expect(result).toBe("Field is required");
    });

    it("should return error for empty string", () => {
      const result = validators.required("", "Field");

      expect(result).toBe("Field is required");
    });

    it("should return null for valid value", () => {
      const result = validators.required("value", "Field");

      expect(result).toBeNull();
    });

    it("should return null for number zero", () => {
      const result = validators.required(0, "Field");

      expect(result).toBeNull();
    });

    it("should return null for boolean false", () => {
      const result = validators.required(false, "Field");

      expect(result).toBeNull();
    });
  });

  describe("email", () => {
    it("should accept valid email", () => {
      const validEmails = [
        "test@example.com",
        "user+tag@domain.co.uk",
        "name.surname@company.com",
      ];

      validEmails.forEach((email) => {
        expect(validators.email(email)).toBeNull();
      });
    });

    it("should reject invalid email", () => {
      const invalidEmails = [
        "invalid",
        "@example.com",
        "test@",
        "test @example.com",
      ];

      invalidEmails.forEach((email) => {
        expect(validators.email(email)).toBe("Invalid email address");
      });
    });

    it("should return null for empty string", () => {
      expect(validators.email("")).toBeNull();
    });
  });

  describe("url", () => {
    it("should accept valid HTTP URLs", () => {
      const validUrls = [
        "https://example.com",
        "http://example.com/path",
        "https://subdomain.example.com",
      ];

      validUrls.forEach((url) => {
        expect(validators.url(url)).toBeNull();
      });
    });

    it("should accept relative paths", () => {
      const validPaths = ["/products", "/categories/electronics", "/"];

      validPaths.forEach((path) => {
        expect(validators.url(path)).toBeNull();
      });
    });

    it("should reject invalid URLs", () => {
      const invalidUrls = ["invalid", "example.com", "ftp://example.com"];

      invalidUrls.forEach((url) => {
        expect(validators.url(url)).toContain("Invalid URL");
      });
    });

    it("should return null for empty string", () => {
      expect(validators.url("")).toBeNull();
    });
  });

  describe("slug", () => {
    it("should accept valid slugs", () => {
      const validSlugs = ["test-slug", "slug123", "my-test-slug-2024"];

      validSlugs.forEach((slug) => {
        expect(validators.slug(slug)).toBeNull();
      });
    });

    it("should reject slugs with uppercase", () => {
      expect(validators.slug("Test-Slug")).toContain("lowercase");
    });

    it("should reject slugs with spaces", () => {
      expect(validators.slug("test slug")).toContain("lowercase");
    });

    it("should reject slugs with underscores", () => {
      expect(validators.slug("test_slug")).toContain("lowercase");
    });

    it("should return null for empty string", () => {
      expect(validators.slug("")).toBeNull();
    });
  });

  describe("minLength", () => {
    it("should accept string meeting minimum length", () => {
      expect(validators.minLength("hello", 5)).toBeNull();
      expect(validators.minLength("hello world", 5)).toBeNull();
    });

    it("should reject string below minimum length", () => {
      const result = validators.minLength("hi", 5);

      expect(result).toBe("Must be at least 5 characters");
    });

    it("should return null for empty string", () => {
      expect(validators.minLength("", 5)).toBeNull();
    });
  });

  describe("maxLength", () => {
    it("should accept string within maximum length", () => {
      expect(validators.maxLength("hello", 10)).toBeNull();
      expect(validators.maxLength("hello", 5)).toBeNull();
    });

    it("should reject string exceeding maximum length", () => {
      const result = validators.maxLength("hello world", 5);

      expect(result).toBe("Must be at most 5 characters");
    });

    it("should return null for empty string", () => {
      expect(validators.maxLength("", 5)).toBeNull();
    });
  });

  describe("min", () => {
    it("should accept number meeting minimum", () => {
      expect(validators.min(10, 5)).toBeNull();
      expect(validators.min(5, 5)).toBeNull();
    });

    it("should reject number below minimum", () => {
      const result = validators.min(3, 5);

      expect(result).toBe("Must be at least 5");
    });

    it("should handle zero", () => {
      expect(validators.min(0, 0)).toBeNull();
      expect(validators.min(0, 5)).toBe("Must be at least 5");
    });

    it("should handle negative numbers", () => {
      expect(validators.min(-5, -10)).toBeNull();
      expect(validators.min(-10, -5)).toBe("Must be at least -5");
    });
  });

  describe("max", () => {
    it("should accept number within maximum", () => {
      expect(validators.max(5, 10)).toBeNull();
      expect(validators.max(10, 10)).toBeNull();
    });

    it("should reject number exceeding maximum", () => {
      const result = validators.max(15, 10);

      expect(result).toBe("Must be at most 10");
    });

    it("should handle zero", () => {
      expect(validators.max(0, 0)).toBeNull();
      expect(validators.max(5, 0)).toBe("Must be at most 0");
    });

    it("should handle negative numbers", () => {
      expect(validators.max(-10, -5)).toBeNull();
      expect(validators.max(-5, -10)).toBe("Must be at most -10");
    });
  });

  describe("pattern", () => {
    it("should accept matching pattern", () => {
      const alphaPattern = /^[A-Za-z]+$/;

      expect(
        validators.pattern("Hello", alphaPattern, "Letters only")
      ).toBeNull();
    });

    it("should reject non-matching pattern", () => {
      const alphaPattern = /^[A-Za-z]+$/;

      const result = validators.pattern(
        "Hello123",
        alphaPattern,
        "Letters only"
      );

      expect(result).toBe("Letters only");
    });

    it("should return null for empty string", () => {
      const pattern = /^\d+$/;

      expect(validators.pattern("", pattern, "Numbers only")).toBeNull();
    });

    it("should validate phone pattern", () => {
      const phonePattern = /^\+?[\d\s()-]{10,}$/;

      expect(
        validators.pattern("+1 (555) 123-4567", phonePattern, "Invalid phone")
      ).toBeNull();
      expect(
        validators.pattern("555-1234", phonePattern, "Invalid phone")
      ).toBe("Invalid phone");
    });
  });

  describe("custom", () => {
    it("should accept valid custom validation", () => {
      const isEven = (val: number) => val % 2 === 0;

      expect(validators.custom(10, isEven, "Must be even")).toBeNull();
    });

    it("should reject invalid custom validation", () => {
      const isEven = (val: number) => val % 2 === 0;

      const result = validators.custom(11, isEven, "Must be even");

      expect(result).toBe("Must be even");
    });

    it("should return null for empty value", () => {
      const validator = (val: any) => val.length > 5;

      expect(validators.custom("", validator, "Too short")).toBeNull();
    });

    it("should work with complex validators", () => {
      const isValidPassword = (val: string) =>
        val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val);

      expect(
        validators.custom("Password123", isValidPassword, "Weak password")
      ).toBeNull();
      expect(validators.custom("pass", isValidPassword, "Weak password")).toBe(
        "Weak password"
      );
    });
  });

  describe("Combined Validation", () => {
    it("should validate with multiple validators", () => {
      const value = "test@example.com";

      const requiredCheck = validators.required(value, "Email");
      const emailCheck = validators.email(value);

      expect(requiredCheck).toBeNull();
      expect(emailCheck).toBeNull();
    });

    it("should short-circuit on first error", () => {
      const value = "";

      const requiredCheck = validators.required(value, "Email");

      if (requiredCheck) {
        expect(requiredCheck).toBe("Email is required");
        return;
      }

      const emailCheck = validators.email(value);

      expect(emailCheck).toBeNull();
    });

    it("should validate slug with length constraints", () => {
      const value = "test-slug";

      const minCheck = validators.minLength(value, 3);
      const maxCheck = validators.maxLength(value, 50);
      const slugCheck = validators.slug(value);

      expect(minCheck).toBeNull();
      expect(maxCheck).toBeNull();
      expect(slugCheck).toBeNull();
    });

    it("should validate price with range", () => {
      const value = 100;

      const minCheck = validators.min(value, 1);
      const maxCheck = validators.max(value, 10000000);

      expect(minCheck).toBeNull();
      expect(maxCheck).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle whitespace-only strings", () => {
      // Whitespace-only strings are truthy and pass the empty check
      expect(validators.required("   ", "Field")).toBeNull();
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(10000);

      expect(validators.maxLength(longString, 100)).toContain("at most 100");
    });

    it("should handle special characters in email", () => {
      expect(validators.email("user+tag@example.com")).toBeNull();
      expect(validators.email("user.name@example.com")).toBeNull();
    });

    it("should handle international characters in slug", () => {
      expect(validators.slug("café")).toContain("lowercase");
      expect(validators.slug("naïve")).toContain("lowercase");
    });

    it("should handle boundary values for numbers", () => {
      expect(
        validators.min(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER)
      ).toBeNull();
      expect(
        validators.max(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
      ).toBeNull();
    });

    it("should handle undefined vs null correctly", () => {
      expect(validators.required(undefined, "Field")).toBe("Field is required");
      expect(validators.required(null, "Field")).toBe("Field is required");
      expect(validators.min(undefined as any, 5)).toBeNull();
    });
  });
});
