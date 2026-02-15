/**
 * @jest-environment jsdom
 */

import { validateAddressForm, AddressFormData } from "../address.helper";
import { ERROR_MESSAGES } from "@/constants";

describe("Address Helper", () => {
  describe("validateAddressForm()", () => {
    const validAddressData: AddressFormData = {
      fullName: "John Doe",
      phoneNumber: "9876543210",
      pincode: "110001",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      landmark: "Near Central Park",
      city: "Delhi",
      state: "Delhi",
      addressType: "home",
      isDefault: true,
    };

    it("should validate complete address form", () => {
      const errors = validateAddressForm(validAddressData);
      expect(Object.keys(errors).length).toBe(0);
    });

    it("should validate address without optional fields", () => {
      const data: AddressFormData = {
        fullName: "Jane Smith",
        phoneNumber: "9876543210",
        pincode: "110001",
        addressLine1: "456 Oak Avenue",
        city: "Mumbai",
        state: "Maharashtra",
        addressType: "work",
        isDefault: false,
      };

      const errors = validateAddressForm(data);
      expect(Object.keys(errors).length).toBe(0);
    });

    describe("fullName validation", () => {
      it("should require full name", () => {
        const data = { ...validAddressData, fullName: "" };
        const errors = validateAddressForm(data);

        expect(errors.fullName).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      });

      it("should accept valid full name", () => {
        const data = { ...validAddressData, fullName: "John Doe" };
        const errors = validateAddressForm(data);

        expect(errors.fullName).toBeUndefined();
      });
    });

    describe("phoneNumber validation", () => {
      it("should require phone number", () => {
        const data = { ...validAddressData, phoneNumber: "" };
        const errors = validateAddressForm(data);

        expect(errors.phoneNumber).toBe(
          ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      });

      it("should validate 10-digit Indian mobile number", () => {
        const data = { ...validAddressData, phoneNumber: "9876543210" };
        const errors = validateAddressForm(data);

        expect(errors.phoneNumber).toBeUndefined();
      });

      it("should reject invalid phone number", () => {
        const data = { ...validAddressData, phoneNumber: "12345" };
        const errors = validateAddressForm(data);

        expect(errors.phoneNumber).toBe(
          ERROR_MESSAGES.VALIDATION.INVALID_INDIAN_MOBILE,
        );
      });

      it("should reject non-numeric phone number", () => {
        const data = { ...validAddressData, phoneNumber: "abcd efghij" };
        const errors = validateAddressForm(data);

        expect(errors.phoneNumber).toBe(
          ERROR_MESSAGES.VALIDATION.INVALID_INDIAN_MOBILE,
        );
      });
    });

    describe("pincode validation", () => {
      it("should require pincode", () => {
        const data = { ...validAddressData, pincode: "" };
        const errors = validateAddressForm(data);

        expect(errors.pincode).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      });

      it("should validate 6-digit Indian pincode", () => {
        const data = { ...validAddressData, pincode: "110001" };
        const errors = validateAddressForm(data);

        expect(errors.pincode).toBeUndefined();
      });

      it("should reject invalid pincode", () => {
        const data = { ...validAddressData, pincode: "12345" };
        const errors = validateAddressForm(data);

        expect(errors.pincode).toBe(ERROR_MESSAGES.VALIDATION.INVALID_PINCODE);
      });

      it("should reject non-numeric pincode", () => {
        const data = { ...validAddressData, pincode: "abcdef" };
        const errors = validateAddressForm(data);

        expect(errors.pincode).toBe(ERROR_MESSAGES.VALIDATION.INVALID_PINCODE);
      });

      it("should reject pincode with less than 6 digits", () => {
        const data = { ...validAddressData, pincode: "11000" };
        const errors = validateAddressForm(data);

        expect(errors.pincode).toBe(ERROR_MESSAGES.VALIDATION.INVALID_PINCODE);
      });
    });

    describe("addressLine1 validation", () => {
      it("should require address line 1", () => {
        const data = { ...validAddressData, addressLine1: "" };
        const errors = validateAddressForm(data);

        expect(errors.addressLine1).toBe(
          ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      });

      it("should accept valid address line 1", () => {
        const data = { ...validAddressData, addressLine1: "123 Main Street" };
        const errors = validateAddressForm(data);

        expect(errors.addressLine1).toBeUndefined();
      });
    });

    describe("city validation", () => {
      it("should require city", () => {
        const data = { ...validAddressData, city: "" };
        const errors = validateAddressForm(data);

        expect(errors.city).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      });

      it("should accept valid city", () => {
        const data = { ...validAddressData, city: "Delhi" };
        const errors = validateAddressForm(data);

        expect(errors.city).toBeUndefined();
      });
    });

    describe("state validation", () => {
      it("should require state", () => {
        const data = { ...validAddressData, state: "" };
        const errors = validateAddressForm(data);

        expect(errors.state).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      });

      it("should accept valid state", () => {
        const data = { ...validAddressData, state: "Maharashtra" };
        const errors = validateAddressForm(data);

        expect(errors.state).toBeUndefined();
      });
    });

    describe("multiple validation errors", () => {
      it("should return multiple errors", () => {
        const data: AddressFormData = {
          fullName: "",
          phoneNumber: "",
          pincode: "",
          addressLine1: "",
          city: "",
          state: "",
          addressType: "home",
          isDefault: false,
        };

        const errors = validateAddressForm(data);

        expect(errors.fullName).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
        expect(errors.phoneNumber).toBe(
          ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
        expect(errors.pincode).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
        expect(errors.addressLine1).toBe(
          ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
        expect(errors.city).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
        expect(errors.state).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      });

      it("should validate while allowing optional fields to be empty", () => {
        const data: AddressFormData = {
          fullName: "John Doe",
          phoneNumber: "9876543210",
          pincode: "110001",
          addressLine1: "123 Main Street",
          addressLine2: "", // Optional, empty
          landmark: "", // Optional, empty
          city: "Delhi",
          state: "Delhi",
          addressType: "home",
          isDefault: false,
        };

        const errors = validateAddressForm(data);
        expect(Object.keys(errors).length).toBe(0);
      });
    });

    describe("edge cases", () => {
      it("should handle whitespace-only values as invalid", () => {
        const data: AddressFormData = {
          fullName: "   ",
          phoneNumber: "9876543210",
          pincode: "110001",
          addressLine1: "   ",
          city: "Delhi",
          state: "Delhi",
          addressType: "home",
          isDefault: false,
        };

        const errors = validateAddressForm(data);
        // Whitespace-only values are considered empty by isRequired
        expect(errors.fullName).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
        expect(errors.addressLine1).toBe(
          ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      });

      it("should handle special characters in name", () => {
        const data = {
          ...validAddressData,
          fullName: "José García-López",
        };
        const errors = validateAddressForm(data);

        expect(errors.fullName).toBeUndefined();
      });

      it("should handle leading zeros in phone number", () => {
        const data = { ...validAddressData, phoneNumber: "09876543210" };
        const errors = validateAddressForm(data);

        // 11 digits, should be invalid
        expect(errors.phoneNumber).toBe(
          ERROR_MESSAGES.VALIDATION.INVALID_INDIAN_MOBILE,
        );
      });
    });

    describe("return value structure", () => {
      it("should return empty object for valid data", () => {
        const errors = validateAddressForm(validAddressData);

        expect(errors).toEqual({});
        expect(typeof errors).toBe("object");
      });

      it("should have error keys matching field names", () => {
        const data: AddressFormData = {
          fullName: "",
          phoneNumber: "",
          pincode: "",
          addressLine1: "",
          city: "",
          state: "",
          addressType: "home",
          isDefault: false,
        };

        const errors = validateAddressForm(data);

        expect(errors).toHaveProperty("fullName");
        expect(errors).toHaveProperty("phoneNumber");
        expect(errors).toHaveProperty("pincode");
        expect(errors).toHaveProperty("addressLine1");
        expect(errors).toHaveProperty("city");
        expect(errors).toHaveProperty("state");
      });

      it("should not have keys for valid fields", () => {
        const data = {
          ...validAddressData,
          fullName: "", // Invalid
        };

        const errors = validateAddressForm(data);

        expect(errors).toHaveProperty("fullName");
        expect(errors).not.toHaveProperty("phoneNumber");
        expect(errors).not.toHaveProperty("pincode");
      });
    });
  });
});
