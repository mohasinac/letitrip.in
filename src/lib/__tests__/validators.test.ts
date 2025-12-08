import {
  validateEmail,
  validateGST,
  validatePAN,
  validatePassword,
  validatePhone,
  validatePincode,
  validateSKU,
  validateSlug,
  validateUrl,
} from "../validators";

describe("Validators", () => {
  describe("validateEmail", () => {
    it("should validate correct email formats", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.in")).toBe(true);
      expect(validateEmail("user+tag@example.com")).toBe(true);
      expect(validateEmail("123@test.com")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user @example.com")).toBe(false);
      expect(validateEmail("user@example")).toBe(false);
    });
  });

  describe("validatePhone", () => {
    it("should validate correct Indian phone numbers", () => {
      expect(validatePhone("9876543210")).toBe(true);
      expect(validatePhone("8765432109")).toBe(true);
      expect(validatePhone("7654321098")).toBe(true);
      expect(validatePhone("6543210987")).toBe(true);
    });

    it("should validate phone numbers with formatting", () => {
      expect(validatePhone("987-654-3210")).toBe(true);
      expect(validatePhone("(987) 654-3210")).toBe(true);
      // Note: +91 prefix makes it 12 digits, fails validation
      expect(validatePhone("+91 9876543210")).toBe(false);
      expect(validatePhone("91-9876543210")).toBe(false);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhone("")).toBe(false);
      expect(validatePhone("123456789")).toBe(false); // Only 9 digits
      expect(validatePhone("12345678901")).toBe(false); // 11 digits
      expect(validatePhone("5876543210")).toBe(false); // Starts with 5
      expect(validatePhone("0876543210")).toBe(false); // Starts with 0
      expect(validatePhone("abcdefghij")).toBe(false); // Letters
    });
  });

  describe("validateUrl", () => {
    it("should validate correct URL formats", () => {
      expect(validateUrl("https://example.com")).toBe(true);
      expect(validateUrl("http://example.com")).toBe(true);
      expect(validateUrl("https://sub.example.com/path")).toBe(true);
      expect(validateUrl("http://localhost:3000")).toBe(true);
      expect(validateUrl("https://example.com/path?query=value")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(validateUrl("")).toBe(false);
      expect(validateUrl("not-a-url")).toBe(false);
      expect(validateUrl("example.com")).toBe(false); // Missing protocol
      expect(validateUrl("//example.com")).toBe(false);
      // javascript: is technically a valid URL protocol
    });
  });

  describe("validatePincode", () => {
    it("should validate correct Indian pincodes", () => {
      expect(validatePincode("110001")).toBe(true);
      expect(validatePincode("400001")).toBe(true);
      expect(validatePincode("560001")).toBe(true);
      expect(validatePincode("700001")).toBe(true);
    });

    it("should accept pincodes with formatting", () => {
      expect(validatePincode("110-001")).toBe(true);
      expect(validatePincode("400 001")).toBe(true);
    });

    it("should reject invalid pincodes", () => {
      expect(validatePincode("")).toBe(false);
      expect(validatePincode("12345")).toBe(false); // Only 5 digits
      expect(validatePincode("1234567")).toBe(false); // 7 digits
      expect(validatePincode("011111")).toBe(false); // Starts with 0
      expect(validatePincode("abcdef")).toBe(false); // Letters
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const result = validatePassword("Test@1234");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate password with all requirements", () => {
      const result = validatePassword("MyP@ssw0rd!");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject password that is too short", () => {
      const result = validatePassword("Test@12");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 8 characters long"
      );
    });

    it("should reject password without uppercase", () => {
      const result = validatePassword("test@1234");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
    });

    it("should reject password without lowercase", () => {
      const result = validatePassword("TEST@1234");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one lowercase letter"
      );
    });

    it("should reject password without number", () => {
      const result = validatePassword("Test@word");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
    });

    it("should reject password without special character", () => {
      const result = validatePassword("Test1234");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
    });

    it("should return multiple errors for weak password", () => {
      const result = validatePassword("test");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain(
        "Password must be at least 8 characters long"
      );
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
    });
  });

  describe("validateSKU", () => {
    it("should validate correct SKU formats", () => {
      expect(validateSKU("ABC123")).toBe(true);
      expect(validateSKU("PROD-001")).toBe(true);
      expect(validateSKU("TEST_SKU")).toBe(true);
      expect(validateSKU("SKU-123-ABC")).toBe(true);
      expect(validateSKU("123")).toBe(true); // Minimum 3 characters
    });

    it("should reject invalid SKUs", () => {
      expect(validateSKU("")).toBe(false);
      expect(validateSKU("AB")).toBe(false); // Too short
      expect(validateSKU("SKU 123")).toBe(false); // Contains space
      expect(validateSKU("SKU@123")).toBe(false); // Special char not allowed
      expect(validateSKU("SKU.123")).toBe(false); // Period not allowed
    });
  });

  describe("validateSlug", () => {
    it("should validate correct slug formats", () => {
      expect(validateSlug("product-name")).toBe(true);
      expect(validateSlug("test-product-123")).toBe(true);
      expect(validateSlug("slug")).toBe(true);
      expect(validateSlug("my-awesome-product-2024")).toBe(true);
    });

    it("should reject invalid slugs", () => {
      expect(validateSlug("")).toBe(false);
      expect(validateSlug("Product-Name")).toBe(false); // Uppercase
      expect(validateSlug("product name")).toBe(false); // Space
      expect(validateSlug("-product")).toBe(false); // Leading hyphen
      expect(validateSlug("product-")).toBe(false); // Trailing hyphen
      expect(validateSlug("product_name")).toBe(false); // Underscore
      expect(validateSlug("product@name")).toBe(false); // Special char
    });
  });

  describe("validateGST", () => {
    it("should validate correct GST numbers", () => {
      expect(validateGST("22AAAAA0000A1Z5")).toBe(true);
      expect(validateGST("29ABCDE1234F1Z2")).toBe(true);
      expect(validateGST("27AAPFU0939F1ZV")).toBe(true);
    });

    it("should handle case insensitivity", () => {
      expect(validateGST("22aaaaa0000a1z5")).toBe(true);
      expect(validateGST("29AbCdE1234F1z2")).toBe(true);
    });

    it("should reject invalid GST numbers", () => {
      expect(validateGST("")).toBe(false);
      expect(validateGST("22AAAAA0000A1Z")).toBe(false); // Too short
      expect(validateGST("22AAAAA0000A1Z55")).toBe(false); // Too long
      expect(validateGST("2AAAAAA0000A1Z5")).toBe(false); // Wrong state code
      expect(validateGST("22AAAA00000A1Z5")).toBe(false); // Wrong PAN format
      expect(validateGST("22AAAAA0000A1Y5")).toBe(false); // Missing Z
    });
  });

  describe("validatePAN", () => {
    it("should validate correct PAN numbers", () => {
      expect(validatePAN("ABCDE1234F")).toBe(true);
      expect(validatePAN("AAAAA1111A")).toBe(true);
      expect(validatePAN("BBBBB9999Z")).toBe(true);
    });

    it("should handle case insensitivity", () => {
      expect(validatePAN("abcde1234f")).toBe(true);
      expect(validatePAN("AbCdE1234F")).toBe(true);
    });

    it("should reject invalid PAN numbers", () => {
      expect(validatePAN("")).toBe(false);
      expect(validatePAN("ABCDE1234")).toBe(false); // Too short
      expect(validatePAN("ABCDE12345F")).toBe(false); // Too long
      expect(validatePAN("1BCDE1234F")).toBe(false); // Starts with number
      expect(validatePAN("ABCDE123AF")).toBe(false); // Wrong format
      expect(validatePAN("ABCD1234F")).toBe(false); // Only 4 letters at start
    });
  });
});
