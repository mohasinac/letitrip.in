import { addressSchema } from "../address.schema";

describe("Address Validation Schema", () => {
  const validAddressData = {
    fullName: "John Doe",
    phone: "9876543210",
    line1: "123 Main Street, Sector 5",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    type: "home" as const,
  };

  describe("Full address validation", () => {
    it("should accept valid address data", () => {
      const result = addressSchema.safeParse(validAddressData);
      expect(result.success).toBe(true);
    });

    it("should require all mandatory fields", () => {
      const result = addressSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept address with all optional fields", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line2: "Near Central Park",
        landmark: "Opposite Big Bazaar",
        isDefault: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Full Name validation", () => {
    it("should require full name", () => {
      const { fullName, ...data } = validAddressData;
      const result = addressSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid names", () => {
      const validNames = [
        "John Doe",
        "Mary Jane Smith",
        "O'Connor",
        "José García",
      ];

      validNames.forEach((fullName) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          fullName,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject too short names", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        fullName: "A",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long names", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        fullName: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Phone validation", () => {
    it("should require phone", () => {
      const { phone, ...data } = validAddressData;
      const result = addressSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid Indian phone numbers", () => {
      const validPhones = [
        "9876543210",
        "8123456789",
        "7012345678",
        "6543210987",
      ];

      validPhones.forEach((phone) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid phone formats", () => {
      const invalidPhones = [
        "123456789", // too short
        "12345678901", // too long
        "5123456789", // starts with 5
        "abcd123456", // contains letters
      ];

      invalidPhones.forEach((phone) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          phone,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Line1 validation", () => {
    it("should require line1", () => {
      const { line1, ...data } = validAddressData;
      const result = addressSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid addresses", () => {
      const validAddresses = [
        "123 Main St",
        "Flat 101, Building A, Sector 5",
        "House #45, Street 12",
      ];

      validAddresses.forEach((line1) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          line1,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject too short line1", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line1: "123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long line1", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line1: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should accept minimum length line1", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line1: "12345",
      });
      expect(result.success).toBe(true);
    });

    it("should accept maximum length line1", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line1: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Line2 validation", () => {
    it("should handle optional line2", () => {
      const result = addressSchema.safeParse(validAddressData);
      expect(result.success).toBe(true);
    });

    it("should accept valid line2", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line2: "Near Central Park",
      });
      expect(result.success).toBe(true);
    });

    it("should reject too long line2", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line2: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should accept maximum length line2", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line2: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("City validation", () => {
    it("should require city", () => {
      const { city, ...data } = validAddressData;
      const result = addressSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid cities", () => {
      const validCities = [
        "Mumbai",
        "Delhi",
        "Bangalore",
        "Hyderabad",
        "Chennai",
      ];

      validCities.forEach((city) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          city,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject too short city", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        city: "A",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long city", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        city: "A".repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("State validation", () => {
    it("should require state", () => {
      const { state, ...data } = validAddressData;
      const result = addressSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid states", () => {
      const validStates = [
        "Maharashtra",
        "Karnataka",
        "Tamil Nadu",
        "West Bengal",
        "Uttar Pradesh",
      ];

      validStates.forEach((state) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          state,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject too short state", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        state: "A",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long state", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        state: "A".repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Pincode validation", () => {
    it("should require pincode", () => {
      const { pincode, ...data } = validAddressData;
      const result = addressSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid pincodes", () => {
      const validPincodes = ["400001", "110001", "560001", "600001", "700001"];

      validPincodes.forEach((pincode) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          pincode,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid pincode formats", () => {
      const invalidPincodes = [
        "12345", // too short
        "1234567", // too long
        "abcdef", // letters
        "40000A", // alphanumeric
      ];

      invalidPincodes.forEach((pincode) => {
        const result = addressSchema.safeParse({
          ...validAddressData,
          pincode,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Country validation", () => {
    it("should default to India", () => {
      const result = addressSchema.safeParse(validAddressData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe("India");
      }
    });

    it("should accept explicit country", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        country: "India",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Type validation", () => {
    it("should require address type", () => {
      const { type, ...data } = validAddressData;
      const result = addressSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept home type", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        type: "home",
      });
      expect(result.success).toBe(true);
    });

    it("should accept work type", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        type: "work",
      });
      expect(result.success).toBe(true);
    });

    it("should accept other type", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        type: "other",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid types", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        type: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("isDefault validation", () => {
    it("should default to false", () => {
      const result = addressSchema.safeParse(validAddressData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
      }
    });

    it("should accept explicit true", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        isDefault: true,
      });
      expect(result.success).toBe(true);
    });

    it("should accept explicit false", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        isDefault: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Landmark validation", () => {
    it("should handle optional landmark", () => {
      const result = addressSchema.safeParse(validAddressData);
      expect(result.success).toBe(true);
    });

    it("should accept valid landmarks", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        landmark: "Near Central Park",
      });
      expect(result.success).toBe(true);
    });

    it("should reject too long landmarks", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        landmark: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should accept maximum length landmark", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        landmark: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle all optional fields missing", () => {
      const result = addressSchema.safeParse(validAddressData);
      expect(result.success).toBe(true);
    });

    it("should handle special characters in address", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        line1: "Flat #123, A/5, Street-12",
        line2: "Near XYZ & Co.",
      });
      expect(result.success).toBe(true);
    });

    it("should handle Unicode in address", () => {
      const result = addressSchema.safeParse({
        ...validAddressData,
        fullName: "राज कुमार",
        line1: "मुंबई सेंट्रल रोड",
        landmark: "बड़ा बाज़ार के पास",
      });
      expect(result.success).toBe(true);
    });
  });
});
