/**
 * Address Service Validation Tests
 *
 * Comprehensive tests for PIN code and postal code validation
 * added in Batch 23 code quality improvements.
 */

import { addressService } from "../address.service";
import { apiService } from "../api.service";

jest.mock("../api.service");

describe("AddressService - Validation Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("lookupPincode validation", () => {
    it("should throw error for empty PIN code", async () => {
      await expect(addressService.lookupPincode("")).rejects.toThrow(
        "[Address] PIN code is required"
      );

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should throw error for null PIN code", async () => {
      await expect(addressService.lookupPincode(null as any)).rejects.toThrow(
        "[Address] PIN code is required"
      );
    });

    it("should throw error for undefined PIN code", async () => {
      await expect(
        addressService.lookupPincode(undefined as any)
      ).rejects.toThrow("[Address] PIN code is required");
    });

    it("should throw error for non-string PIN code", async () => {
      await expect(addressService.lookupPincode(400001 as any)).rejects.toThrow(
        "[Address] PIN code is required"
      );
    });

    it("should throw error for PIN code with less than 6 digits", async () => {
      await expect(addressService.lookupPincode("12345")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );

      await expect(addressService.lookupPincode("1234")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );

      await expect(addressService.lookupPincode("123")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );
    });

    it("should throw error for PIN code with more than 6 digits", async () => {
      await expect(addressService.lookupPincode("1234567")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );

      await expect(addressService.lookupPincode("12345678")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );
    });

    it("should throw error for PIN code with letters", async () => {
      await expect(addressService.lookupPincode("40000A")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );

      await expect(addressService.lookupPincode("ABC123")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );
    });

    it("should throw error for PIN code with special characters", async () => {
      await expect(addressService.lookupPincode("400-001")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );

      await expect(addressService.lookupPincode("400 001")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );

      await expect(addressService.lookupPincode("400@001")).rejects.toThrow(
        "[Address] Invalid Indian PIN code format"
      );
    });

    it("should accept valid 6-digit PIN code", async () => {
      const mockDetails = {
        pincode: "400001",
        city: "Mumbai",
        state: "Maharashtra",
        stateCode: "MH",
        district: "Mumbai",
        country: "India",
        countryCode: "IN",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPincode("400001");

      expect(apiService.get).toHaveBeenCalledWith("/address/pincode/400001");
      expect(result).toEqual(mockDetails);
    });

    it("should trim whitespace from PIN code", async () => {
      const mockDetails = {
        pincode: "400001",
        city: "Mumbai",
        state: "Maharashtra",
        stateCode: "MH",
        district: "Mumbai",
        country: "India",
        countryCode: "IN",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPincode("  400001  ");

      expect(apiService.get).toHaveBeenCalledWith("/address/pincode/400001");
      expect(result).toEqual(mockDetails);
    });

    it("should return null on API error even with valid PIN code", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await addressService.lookupPincode("400001");

      expect(result).toBeNull();
    });
  });

  describe("lookupPostalCode validation", () => {
    it("should throw error for empty country code", async () => {
      await expect(
        addressService.lookupPostalCode("", "90210")
      ).rejects.toThrow("[Address] Country code is required");

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should throw error for null country code", async () => {
      await expect(
        addressService.lookupPostalCode(null as any, "90210")
      ).rejects.toThrow("[Address] Country code is required");
    });

    it("should throw error for empty postal code", async () => {
      await expect(addressService.lookupPostalCode("US", "")).rejects.toThrow(
        "[Address] Postal code is required"
      );
    });

    it("should throw error for null postal code", async () => {
      await expect(
        addressService.lookupPostalCode("US", null as any)
      ).rejects.toThrow("[Address] Postal code is required");
    });

    it("should throw error for invalid country code format (1 letter)", async () => {
      await expect(
        addressService.lookupPostalCode("U", "90210")
      ).rejects.toThrow("[Address] Invalid country code format");
    });

    it("should throw error for invalid country code format (4+ letters)", async () => {
      await expect(
        addressService.lookupPostalCode("USA1", "90210")
      ).rejects.toThrow("[Address] Invalid country code format");

      await expect(
        addressService.lookupPostalCode("UNITED", "90210")
      ).rejects.toThrow("[Address] Invalid country code format");
    });

    it("should throw error for country code with numbers", async () => {
      await expect(
        addressService.lookupPostalCode("U2", "90210")
      ).rejects.toThrow("[Address] Invalid country code format");
    });

    it("should throw error for country code with special characters", async () => {
      await expect(
        addressService.lookupPostalCode("U-S", "90210")
      ).rejects.toThrow("[Address] Invalid country code format");
    });

    it("should accept 2-letter country code", async () => {
      const mockDetails = {
        postalCode: "90210",
        city: "Beverly Hills",
        state: "California",
        stateCode: "CA",
        country: "United States",
        countryCode: "US",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPostalCode("US", "90210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/address/postal-code/US/90210"
      );
      expect(result).toEqual(mockDetails);
    });

    it("should accept 3-letter country code", async () => {
      const mockDetails = {
        postalCode: "90210",
        city: "Beverly Hills",
        state: "California",
        country: "United States",
        countryCode: "USA",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPostalCode("USA", "90210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/address/postal-code/USA/90210"
      );
      expect(result).toEqual(mockDetails);
    });

    it("should convert country code to uppercase", async () => {
      const mockDetails = {
        postalCode: "90210",
        city: "Beverly Hills",
        state: "California",
        stateCode: "CA",
        country: "United States",
        countryCode: "US",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      await addressService.lookupPostalCode("us", "90210");

      expect(apiService.get).toHaveBeenCalledWith(
        "/address/postal-code/US/90210"
      );
    });

    it("should trim whitespace from country code and postal code", async () => {
      const mockDetails = {
        postalCode: "90210",
        city: "Beverly Hills",
        state: "California",
        stateCode: "CA",
        country: "United States",
        countryCode: "US",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      await addressService.lookupPostalCode("  us  ", "  90210  ");

      expect(apiService.get).toHaveBeenCalledWith(
        "/address/postal-code/US/90210"
      );
    });

    it("should return null on API error even with valid inputs", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await addressService.lookupPostalCode("US", "90210");

      expect(result).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should handle PIN code starting with zero", async () => {
      const mockDetails = {
        pincode: "012345",
        city: "Test City",
        state: "Test State",
        stateCode: "TS",
        district: "Test District",
        country: "India",
        countryCode: "IN",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPincode("012345");

      expect(apiService.get).toHaveBeenCalledWith("/address/pincode/012345");
      expect(result).toEqual(mockDetails);
    });

    it("should handle postal code with letters (UK format)", async () => {
      const mockDetails = {
        postalCode: "SW1A 1AA",
        city: "London",
        state: "England",
        country: "United Kingdom",
        countryCode: "GB",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPostalCode("GB", "SW1A 1AA");

      expect(apiService.get).toHaveBeenCalledWith(
        "/address/postal-code/GB/SW1A 1AA"
      );
      expect(result).toEqual(mockDetails);
    });

    it("should handle postal code with hyphen (US format)", async () => {
      const mockDetails = {
        postalCode: "90210-1234",
        city: "Beverly Hills",
        state: "California",
        stateCode: "CA",
        country: "United States",
        countryCode: "US",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await addressService.lookupPostalCode("US", "90210-1234");

      expect(apiService.get).toHaveBeenCalledWith(
        "/address/postal-code/US/90210-1234"
      );
      expect(result).toEqual(mockDetails);
    });
  });

  describe("Performance", () => {
    it("should not make API call for invalid PIN code", async () => {
      await expect(addressService.lookupPincode("invalid")).rejects.toThrow();

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should not make API call for invalid country code", async () => {
      await expect(
        addressService.lookupPostalCode("INVALID", "12345")
      ).rejects.toThrow();

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should validate PIN code before API call to save resources", async () => {
      const invalidPins = ["123", "1234567", "ABC123", "400-001"];

      for (const pin of invalidPins) {
        await expect(addressService.lookupPincode(pin)).rejects.toThrow();
      }

      // No API calls should be made
      expect(apiService.get).not.toHaveBeenCalled();
    });
  });
});
