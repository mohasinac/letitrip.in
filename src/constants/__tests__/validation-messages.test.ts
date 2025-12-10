import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
  getPasswordStrength,
  isValidEmail,
  isValidGST,
  isValidIFSC,
  isValidPAN,
  isValidPassword,
  isValidPhone,
  isValidSlug,
  validateFile,
} from "../validation-messages";

describe("Validation Messages and Rules Constants", () => {
  // ============================================================================
  // VALIDATION_RULES Tests
  // ============================================================================
  describe("VALIDATION_RULES", () => {
    it("should export VALIDATION_RULES object", () => {
      expect(VALIDATION_RULES).toBeDefined();
      expect(typeof VALIDATION_RULES).toBe("object");
    });

    describe("NAME rules", () => {
      it("should have MIN_LENGTH", () => {
        expect(VALIDATION_RULES.NAME.MIN_LENGTH).toBe(2);
      });

      it("should have MAX_LENGTH", () => {
        expect(VALIDATION_RULES.NAME.MAX_LENGTH).toBe(100);
      });

      it("should have PATTERN", () => {
        expect(VALIDATION_RULES.NAME.PATTERN).toBeInstanceOf(RegExp);
      });
    });

    describe("USERNAME rules", () => {
      it("should have MIN_LENGTH", () => {
        expect(VALIDATION_RULES.USERNAME.MIN_LENGTH).toBe(3);
      });

      it("should have MAX_LENGTH", () => {
        expect(VALIDATION_RULES.USERNAME.MAX_LENGTH).toBe(30);
      });

      it("should have PATTERN", () => {
        expect(VALIDATION_RULES.USERNAME.PATTERN).toBeInstanceOf(RegExp);
      });
    });

    describe("EMAIL rules", () => {
      it("should have PATTERN", () => {
        expect(VALIDATION_RULES.EMAIL.PATTERN).toBeInstanceOf(RegExp);
      });

      it("should have MAX_LENGTH", () => {
        expect(VALIDATION_RULES.EMAIL.MAX_LENGTH).toBe(255);
      });
    });

    describe("PHONE rules", () => {
      it("should have PATTERN for Indian numbers", () => {
        expect(VALIDATION_RULES.PHONE.PATTERN).toBeInstanceOf(RegExp);
      });

      it("should have MIN_LENGTH", () => {
        expect(VALIDATION_RULES.PHONE.MIN_LENGTH).toBe(10);
      });

      it("should have MAX_LENGTH", () => {
        expect(VALIDATION_RULES.PHONE.MAX_LENGTH).toBe(10);
      });
    });

    describe("PASSWORD rules", () => {
      it("should have MIN_LENGTH", () => {
        expect(VALIDATION_RULES.PASSWORD.MIN_LENGTH).toBe(8);
      });

      it("should have MAX_LENGTH", () => {
        expect(VALIDATION_RULES.PASSWORD.MAX_LENGTH).toBe(128);
      });

      it("should have complexity requirements", () => {
        expect(VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE).toBe(true);
        expect(VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE).toBe(true);
        expect(VALIDATION_RULES.PASSWORD.REQUIRE_NUMBER).toBe(true);
        expect(VALIDATION_RULES.PASSWORD.REQUIRE_SPECIAL).toBe(true);
      });

      it("should have SPECIAL_CHARS pattern", () => {
        expect(VALIDATION_RULES.PASSWORD.SPECIAL_CHARS).toBeInstanceOf(RegExp);
      });
    });

    describe("ADDRESS rules", () => {
      it("should have LINE1 rules", () => {
        expect(VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH).toBe(5);
        expect(VALIDATION_RULES.ADDRESS.LINE1.MAX_LENGTH).toBe(100);
      });

      it("should have PINCODE pattern", () => {
        expect(VALIDATION_RULES.ADDRESS.PINCODE.PATTERN).toBeInstanceOf(RegExp);
        expect(VALIDATION_RULES.ADDRESS.PINCODE.LENGTH).toBe(6);
      });

      it("should have COUNTRY as India", () => {
        expect(VALIDATION_RULES.ADDRESS.COUNTRY).toBe("India");
      });
    });

    describe("PRODUCT rules", () => {
      it("should have NAME rules", () => {
        expect(VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH).toBe(3);
        expect(VALIDATION_RULES.PRODUCT.NAME.MAX_LENGTH).toBe(200);
      });

      it("should have PRICE rules", () => {
        expect(VALIDATION_RULES.PRODUCT.PRICE.MIN).toBe(1);
        expect(VALIDATION_RULES.PRODUCT.PRICE.MAX).toBeGreaterThan(1000000);
      });

      it("should have IMAGES rules", () => {
        expect(VALIDATION_RULES.PRODUCT.IMAGES.MIN).toBe(1);
        expect(VALIDATION_RULES.PRODUCT.IMAGES.MAX).toBe(10);
      });
    });

    describe("GST rules", () => {
      it("should have PATTERN", () => {
        expect(VALIDATION_RULES.GST.PATTERN).toBeInstanceOf(RegExp);
      });

      it("should have LENGTH", () => {
        expect(VALIDATION_RULES.GST.LENGTH).toBe(15);
      });
    });

    describe("PAN rules", () => {
      it("should have PATTERN", () => {
        expect(VALIDATION_RULES.PAN.PATTERN).toBeInstanceOf(RegExp);
      });

      it("should have LENGTH", () => {
        expect(VALIDATION_RULES.PAN.LENGTH).toBe(10);
      });
    });

    describe("IFSC rules", () => {
      it("should have PATTERN", () => {
        expect(VALIDATION_RULES.IFSC.PATTERN).toBeInstanceOf(RegExp);
      });

      it("should have LENGTH", () => {
        expect(VALIDATION_RULES.IFSC.LENGTH).toBe(11);
      });
    });

    describe("FILE rules", () => {
      it("should have IMAGE rules", () => {
        expect(VALIDATION_RULES.FILE.IMAGE.MAX_SIZE_MB).toBe(5);
        expect(Array.isArray(VALIDATION_RULES.FILE.IMAGE.ALLOWED_TYPES)).toBe(
          true
        );
        expect(
          Array.isArray(VALIDATION_RULES.FILE.IMAGE.ALLOWED_EXTENSIONS)
        ).toBe(true);
      });

      it("should have VIDEO rules", () => {
        expect(VALIDATION_RULES.FILE.VIDEO.MAX_SIZE_MB).toBe(50);
        expect(Array.isArray(VALIDATION_RULES.FILE.VIDEO.ALLOWED_TYPES)).toBe(
          true
        );
      });

      it("should have DOCUMENT rules", () => {
        expect(VALIDATION_RULES.FILE.DOCUMENT.MAX_SIZE_MB).toBe(10);
        expect(
          Array.isArray(VALIDATION_RULES.FILE.DOCUMENT.ALLOWED_TYPES)
        ).toBe(true);
      });
    });
  });

  // ============================================================================
  // VALIDATION_MESSAGES Tests
  // ============================================================================
  describe("VALIDATION_MESSAGES", () => {
    it("should export VALIDATION_MESSAGES object", () => {
      expect(VALIDATION_MESSAGES).toBeDefined();
      expect(typeof VALIDATION_MESSAGES).toBe("object");
    });

    describe("REQUIRED messages", () => {
      it("should have FIELD function", () => {
        expect(typeof VALIDATION_MESSAGES.REQUIRED.FIELD).toBe("function");
        expect(VALIDATION_MESSAGES.REQUIRED.FIELD("Name")).toContain("Name");
      });

      it("should have GENERIC message", () => {
        expect(VALIDATION_MESSAGES.REQUIRED.GENERIC).toBeDefined();
        expect(typeof VALIDATION_MESSAGES.REQUIRED.GENERIC).toBe("string");
      });

      it("should have SELECT message", () => {
        expect(VALIDATION_MESSAGES.REQUIRED.SELECT).toBeDefined();
      });

      it("should have CHECKBOX message", () => {
        expect(VALIDATION_MESSAGES.REQUIRED.CHECKBOX).toBeDefined();
      });

      it("should have FILE message", () => {
        expect(VALIDATION_MESSAGES.REQUIRED.FILE).toBeDefined();
      });
    });

    describe("NAME messages", () => {
      it("should have TOO_SHORT message", () => {
        expect(VALIDATION_MESSAGES.NAME.TOO_SHORT).toContain("2");
      });

      it("should have TOO_LONG message", () => {
        expect(VALIDATION_MESSAGES.NAME.TOO_LONG).toContain("100");
      });

      it("should have INVALID_CHARS message", () => {
        expect(VALIDATION_MESSAGES.NAME.INVALID_CHARS).toBeDefined();
      });
    });

    describe("EMAIL messages", () => {
      it("should have INVALID message", () => {
        expect(VALIDATION_MESSAGES.EMAIL.INVALID).toBeDefined();
      });

      it("should have TAKEN message", () => {
        expect(VALIDATION_MESSAGES.EMAIL.TAKEN).toBeDefined();
      });
    });

    describe("PHONE messages", () => {
      it("should have INVALID message", () => {
        expect(VALIDATION_MESSAGES.PHONE.INVALID).toBeDefined();
      });

      it("should have MUST_START_WITH message", () => {
        expect(VALIDATION_MESSAGES.PHONE.MUST_START_WITH).toContain("6");
      });
    });

    describe("PASSWORD messages", () => {
      it("should have TOO_SHORT message", () => {
        expect(VALIDATION_MESSAGES.PASSWORD.TOO_SHORT).toContain("8");
      });

      it("should have REQUIRE_UPPERCASE message", () => {
        expect(VALIDATION_MESSAGES.PASSWORD.REQUIRE_UPPERCASE).toBeDefined();
      });

      it("should have REQUIRE_NUMBER message", () => {
        expect(VALIDATION_MESSAGES.PASSWORD.REQUIRE_NUMBER).toBeDefined();
      });

      it("should have MISMATCH message", () => {
        expect(VALIDATION_MESSAGES.PASSWORD.MISMATCH).toBeDefined();
      });
    });

    describe("PRODUCT messages", () => {
      it("should have NAME_TOO_SHORT message", () => {
        expect(VALIDATION_MESSAGES.PRODUCT.NAME_TOO_SHORT).toBeDefined();
      });

      it("should have PRICE_TOO_LOW message", () => {
        expect(VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_LOW).toContain("₹");
      });

      it("should have NO_IMAGES message", () => {
        expect(VALIDATION_MESSAGES.PRODUCT.NO_IMAGES).toBeDefined();
      });
    });

    describe("FILE messages", () => {
      it("should have TOO_LARGE function", () => {
        expect(typeof VALIDATION_MESSAGES.FILE.TOO_LARGE).toBe("function");
        expect(VALIDATION_MESSAGES.FILE.TOO_LARGE(5)).toContain("5");
      });

      it("should have INVALID_TYPE function", () => {
        expect(typeof VALIDATION_MESSAGES.FILE.INVALID_TYPE).toBe("function");
        const result = VALIDATION_MESSAGES.FILE.INVALID_TYPE([".jpg", ".png"]);
        expect(result).toContain(".jpg");
      });
    });

    describe("GENERAL messages", () => {
      it("should have INVALID_INPUT message", () => {
        expect(VALIDATION_MESSAGES.GENERAL.INVALID_INPUT).toBeDefined();
      });

      it("should have SERVER_ERROR message", () => {
        expect(VALIDATION_MESSAGES.GENERAL.SERVER_ERROR).toBeDefined();
      });

      it("should have UNAUTHORIZED message", () => {
        expect(VALIDATION_MESSAGES.GENERAL.UNAUTHORIZED).toBeDefined();
      });
    });

    describe("DATE messages", () => {
      it("should have INVALID message", () => {
        expect(VALIDATION_MESSAGES.DATE.INVALID).toBeDefined();
      });

      it("should have BEFORE function", () => {
        expect(typeof VALIDATION_MESSAGES.DATE.BEFORE).toBe("function");
        expect(VALIDATION_MESSAGES.DATE.BEFORE("2024-12-31")).toContain(
          "2024-12-31"
        );
      });

      it("should have AFTER function", () => {
        expect(typeof VALIDATION_MESSAGES.DATE.AFTER).toBe("function");
      });
    });

    describe("NUMBER messages", () => {
      it("should have INVALID message", () => {
        expect(VALIDATION_MESSAGES.NUMBER.INVALID).toBeDefined();
      });

      it("should have TOO_SMALL function", () => {
        expect(typeof VALIDATION_MESSAGES.NUMBER.TOO_SMALL).toBe("function");
        expect(VALIDATION_MESSAGES.NUMBER.TOO_SMALL(10)).toContain("10");
      });

      it("should have TOO_LARGE function", () => {
        expect(typeof VALIDATION_MESSAGES.NUMBER.TOO_LARGE).toBe("function");
        expect(VALIDATION_MESSAGES.NUMBER.TOO_LARGE(100)).toContain("100");
      });
    });
  });

  // ============================================================================
  // Validation Helper Functions Tests
  // ============================================================================
  describe("Validation Helper Functions", () => {
    describe("isValidEmail", () => {
      it("should validate correct email", () => {
        expect(isValidEmail("test@example.com")).toBe(true);
        expect(isValidEmail("user.name@domain.co.in")).toBe(true);
      });

      it("should reject invalid email", () => {
        expect(isValidEmail("notanemail")).toBe(false);
        expect(isValidEmail("@example.com")).toBe(false);
        expect(isValidEmail("test@")).toBe(false);
      });
    });

    describe("isValidPhone", () => {
      it("should validate correct Indian phone number", () => {
        expect(isValidPhone("9876543210")).toBe(true);
        expect(isValidPhone("8123456789")).toBe(true);
        expect(isValidPhone("7012345678")).toBe(true);
        expect(isValidPhone("6543210987")).toBe(true);
      });

      it("should reject invalid phone number", () => {
        expect(isValidPhone("1234567890")).toBe(false); // starts with 1
        expect(isValidPhone("987654321")).toBe(false); // too short
        expect(isValidPhone("98765432100")).toBe(false); // too long
        expect(isValidPhone("abcdefghij")).toBe(false);
      });
    });

    describe("isValidGST", () => {
      it("should validate correct GST format", () => {
        expect(isValidGST("22AAAAA0000A1Z5")).toBe(true);
      });

      it("should reject invalid GST", () => {
        expect(isValidGST("INVALIDGST")).toBe(false);
        expect(isValidGST("22AAAA")).toBe(false);
      });
    });

    describe("isValidPAN", () => {
      it("should validate correct PAN format", () => {
        expect(isValidPAN("ABCDE1234F")).toBe(true);
      });

      it("should reject invalid PAN", () => {
        expect(isValidPAN("INVALID")).toBe(false);
        expect(isValidPAN("12345ABCDE")).toBe(false);
      });
    });

    describe("isValidIFSC", () => {
      it("should validate correct IFSC format", () => {
        expect(isValidIFSC("SBIN0001234")).toBe(true);
        expect(isValidIFSC("HDFC0000123")).toBe(true);
      });

      it("should reject invalid IFSC", () => {
        expect(isValidIFSC("INVALID")).toBe(false);
        expect(isValidIFSC("SBIN123456")).toBe(false);
      });
    });

    describe("isValidSlug", () => {
      it("should validate correct slug", () => {
        expect(isValidSlug("my-product-slug")).toBe(true);
        expect(isValidSlug("product-123")).toBe(true);
      });

      it("should reject invalid slug", () => {
        expect(isValidSlug("My Product")).toBe(false); // spaces
        expect(isValidSlug("My-Product")).toBe(false); // uppercase
        expect(isValidSlug("product_slug")).toBe(false); // underscore
      });
    });

    describe("isValidPassword", () => {
      it("should validate strong password", () => {
        const result = isValidPassword("Test@1234");
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
      });

      it("should detect password too short", () => {
        const result = isValidPassword("Test@1");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(VALIDATION_MESSAGES.PASSWORD.TOO_SHORT);
      });

      it("should detect missing uppercase", () => {
        const result = isValidPassword("test@1234");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          VALIDATION_MESSAGES.PASSWORD.REQUIRE_UPPERCASE
        );
      });

      it("should detect missing lowercase", () => {
        const result = isValidPassword("TEST@1234");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          VALIDATION_MESSAGES.PASSWORD.REQUIRE_LOWERCASE
        );
      });

      it("should detect missing number", () => {
        const result = isValidPassword("Test@Test");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          VALIDATION_MESSAGES.PASSWORD.REQUIRE_NUMBER
        );
      });

      it("should detect missing special character", () => {
        const result = isValidPassword("Test1234");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          VALIDATION_MESSAGES.PASSWORD.REQUIRE_SPECIAL
        );
      });
    });

    describe("validateFile", () => {
      it("should validate image file within size limit", () => {
        const file = new File(["content"], "test.jpg", {
          type: "image/jpeg",
        });
        Object.defineProperty(file, "size", {
          value: 1024 * 1024, // 1MB
        });
        const result = validateFile(file, "image");
        expect(result.valid).toBe(true);
      });

      it("should reject file exceeding size limit", () => {
        const file = new File(["content"], "test.jpg", {
          type: "image/jpeg",
        });
        Object.defineProperty(file, "size", {
          value: 20 * 1024 * 1024, // 20MB
        });
        const result = validateFile(file, "image");
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it("should reject invalid file type", () => {
        const file = new File(["content"], "test.txt", {
          type: "text/plain",
        });
        Object.defineProperty(file, "size", {
          value: 1024,
        });
        const result = validateFile(file, "image");
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe("getPasswordStrength", () => {
      it("should return 0 for very weak password", () => {
        expect(getPasswordStrength("test")).toBe(0);
      });

      it("should return 1 for weak password", () => {
        expect(getPasswordStrength("testtest")).toBe(1);
      });

      it("should return higher score for stronger password", () => {
        const weak = getPasswordStrength("password");
        const medium = getPasswordStrength("Password1");
        const strong = getPasswordStrength("P@ssw0rd123");

        expect(medium).toBeGreaterThan(weak);
        expect(strong).toBeGreaterThan(medium);
      });

      it("should return maximum 4 for very strong password", () => {
        const score = getPasswordStrength("SuperStr0ng!Pass123");
        expect(score).toBeLessThanOrEqual(4);
      });
    });
  });
});
