/**
 * Location Service - Edge Cases and Boundary Tests
 * Tests edge cases, error conditions, and boundary scenarios
 */

import { apiService } from "../api.service";
import { locationService } from "../location.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("LocationService - Edge Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("lookupPincode - Edge Cases", () => {
    it("should handle empty pincode", async () => {
      const result = await locationService.lookupPincode("");
      expect(result.isValid).toBe(false);
      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should handle whitespace-only pincode", async () => {
      const result = await locationService.lookupPincode("   ");
      expect(result.isValid).toBe(false);
    });

    it("should handle pincode with all zeros", async () => {
      const result = await locationService.lookupPincode("000000");
      expect(result.isValid).toBe(false);
    });

    it("should handle pincode with letters", async () => {
      const result = await locationService.lookupPincode("ABC123");
      expect(result.isValid).toBe(false);
    });

    it("should handle very long pincode string", async () => {
      const result = await locationService.lookupPincode("123456789012345");
      expect(result.isValid).toBe(false);
    });

    it("should handle pincode with special characters", async () => {
      const mockResponse = {
        success: true,
        data: {
          pincode: "110001",
          areas: [],
          city: "New Delhi",
          district: "Central Delhi",
          state: "Delhi",
          country: "India",
          isValid: true,
          hasMultipleAreas: false,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await locationService.lookupPincode("!1@1#0$0%0^1&");
      expect(apiService.get).toHaveBeenCalledWith("/location/pincode/110001");
    });

    it("should handle API network errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(locationService.lookupPincode("110001")).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle API timeout", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Timeout"));

      await expect(locationService.lookupPincode("110001")).rejects.toThrow(
        "Timeout"
      );
    });

    it("should handle malformed API response", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        // Missing 'data' field
      });

      const result = await locationService.lookupPincode("110001");
      expect(result.isValid).toBe(false);
      expect(result.pincode).toBe("110001");
    });

    it("should handle API returning null data", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
      });

      const result = await locationService.lookupPincode("110001");
      expect(result.isValid).toBe(false);
      expect(result.pincode).toBe("110001");
    });
  });

  describe("isValidPincode - Edge Cases", () => {
    it("should return false for null input", () => {
      expect(locationService.isValidPincode(null as any)).toBe(false);
    });

    it("should return false for undefined input", () => {
      expect(locationService.isValidPincode(undefined as any)).toBe(false);
    });

    it("should return false for numeric input", () => {
      expect(locationService.isValidPincode(110001 as any)).toBe(false);
    });

    it("should return false for object input", () => {
      expect(locationService.isValidPincode({} as any)).toBe(false);
    });

    it("should return false for array input", () => {
      expect(locationService.isValidPincode([] as any)).toBe(false);
    });

    it("should handle unicode digits", () => {
      expect(locationService.isValidPincode("１１０００１")).toBe(false);
    });

    it("should handle negative number strings", () => {
      // After cleaning, "-110001" becomes "110001" which is valid
      // This is actually correct behavior - we strip non-digits
      expect(locationService.isValidPincode("-110001")).toBe(true);
    });

    it("should handle scientific notation", () => {
      expect(locationService.isValidPincode("1.1e5")).toBe(false);
    });
  });

  describe("getCurrentPosition - Edge Cases", () => {
    let mockGeolocation: any;

    beforeEach(() => {
      mockGeolocation = {
        getCurrentPosition: jest.fn(),
      };
      Object.defineProperty(global.navigator, "geolocation", {
        value: mockGeolocation,
        configurable: true,
        writable: true,
      });
    });

    it("should handle position unavailable error", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(
        (_: any, error: any) => {
          error({ code: 2, POSITION_UNAVAILABLE: 2 });
        }
      );

      await expect(locationService.getCurrentPosition()).rejects.toEqual({
        code: "POSITION_UNAVAILABLE",
        message: "Location information is unavailable.",
      });
    });

    it("should handle timeout error", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(
        (_: any, error: any) => {
          error({ code: 3, TIMEOUT: 3 });
        }
      );

      await expect(locationService.getCurrentPosition()).rejects.toEqual({
        code: "TIMEOUT",
        message: "Location request timed out. Please try again.",
      });
    });

    it("should handle unknown error code", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(
        (_: any, error: any) => {
          error({ code: 99 });
        }
      );

      await expect(locationService.getCurrentPosition()).rejects.toEqual({
        code: "POSITION_UNAVAILABLE",
        message: "An unknown error occurred.",
      });
    });

    it("should handle coordinates at extremes", async () => {
      const mockPosition = {
        coords: {
          latitude: 90,
          longitude: 180,
          accuracy: 0,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
        success(mockPosition);
      });

      const result = await locationService.getCurrentPosition();
      expect(result.latitude).toBe(90);
      expect(result.longitude).toBe(180);
    });

    it("should handle negative coordinates", async () => {
      const mockPosition = {
        coords: {
          latitude: -90,
          longitude: -180,
          accuracy: 1000,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
        success(mockPosition);
      });

      const result = await locationService.getCurrentPosition();
      expect(result.latitude).toBe(-90);
      expect(result.longitude).toBe(-180);
    });

    it("should handle very low accuracy", async () => {
      const mockPosition = {
        coords: {
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 50000, // 50km accuracy
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
        success(mockPosition);
      });

      const result = await locationService.getCurrentPosition();
      expect(result.accuracy).toBe(50000);
    });
  });

  describe("checkGeolocationPermission - Edge Cases", () => {
    it("should return prompt when permissions API not available", async () => {
      Object.defineProperty(global.navigator, "permissions", {
        value: undefined,
        configurable: true,
      });

      const result = await locationService.checkGeolocationPermission();
      expect(result).toBe("prompt");
    });

    it("should handle permissions query error", async () => {
      const mockPermissions = {
        query: jest
          .fn()
          .mockRejectedValue(new Error("Permissions query failed")),
      };

      Object.defineProperty(global.navigator, "permissions", {
        value: mockPermissions,
        configurable: true,
      });

      const result = await locationService.checkGeolocationPermission();
      expect(result).toBe("prompt");
    });

    it("should handle granted permission state", async () => {
      const mockPermissions = {
        query: jest.fn().mockResolvedValue({ state: "granted" }),
      };

      Object.defineProperty(global.navigator, "permissions", {
        value: mockPermissions,
        configurable: true,
      });

      const result = await locationService.checkGeolocationPermission();
      expect(result).toBe("granted");
    });

    it("should handle denied permission state", async () => {
      const mockPermissions = {
        query: jest.fn().mockResolvedValue({ state: "denied" }),
      };

      Object.defineProperty(global.navigator, "permissions", {
        value: mockPermissions,
        configurable: true,
      });

      const result = await locationService.checkGeolocationPermission();
      expect(result).toBe("denied");
    });
  });

  describe("reverseGeocode - Edge Cases", () => {
    it("should handle invalid coordinates (NaN)", async () => {
      const result = await locationService.reverseGeocode({
        latitude: NaN,
        longitude: NaN,
        accuracy: 10,
      });

      expect(result).toBeNull();
    });

    it("should handle coordinates at null island", async () => {
      const mockResponse = {
        success: true,
        data: {
          formattedAddress: "Gulf of Guinea",
          city: null,
          state: null,
          country: null,
          pincode: null,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await locationService.reverseGeocode({
        latitude: 0,
        longitude: 0,
        accuracy: 10,
      });

      expect(apiService.get).toHaveBeenCalled();
    });

    it("should handle API returning no results", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("No results found")
      );

      const result = await locationService.reverseGeocode({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 10,
      });

      expect(result).toBeNull();
    });

    it("should handle extreme coordinates", async () => {
      const result = await locationService.reverseGeocode({
        latitude: 999,
        longitude: 999,
        accuracy: 10,
      });

      expect(result).toBeNull();
    });
  });

  describe("calculateDistance - Edge Cases", () => {
    it("should calculate distance for same coordinates", () => {
      const coords = { latitude: 28.6139, longitude: 77.209, accuracy: 10 };
      const distance = locationService.calculateDistance(coords, coords);
      expect(distance).toBeCloseTo(0, 5);
    });

    it("should calculate distance for antipodal points", () => {
      const from = { latitude: 0, longitude: 0, accuracy: 10 };
      const to = { latitude: 0, longitude: 180, accuracy: 10 };
      const distance = locationService.calculateDistance(from, to);
      expect(distance).toBeGreaterThan(19000); // Half Earth's circumference
    });

    it("should handle north pole to south pole", () => {
      const from = { latitude: 90, longitude: 0, accuracy: 10 };
      const to = { latitude: -90, longitude: 0, accuracy: 10 };
      const distance = locationService.calculateDistance(from, to);
      expect(distance).toBeGreaterThan(19000);
    });

    it("should handle negative coordinates", () => {
      const from = { latitude: -33.8688, longitude: 151.2093, accuracy: 10 };
      const to = { latitude: -37.8136, longitude: 144.9631, accuracy: 10 };
      const distance = locationService.calculateDistance(from, to);
      expect(distance).toBeGreaterThan(700);
    });

    it("should handle very close coordinates", () => {
      const from = { latitude: 28.6139, longitude: 77.209, accuracy: 10 };
      const to = { latitude: 28.614, longitude: 77.2091, accuracy: 10 };
      const distance = locationService.calculateDistance(from, to);
      expect(distance).toBeLessThan(0.02);
    });
  });

  describe("formatCoordinates - Edge Cases", () => {
    it("should format extreme coordinates", () => {
      const result = locationService.formatCoordinates({
        latitude: 90,
        longitude: 180,
        accuracy: 10,
      });
      expect(result).toBe("90.000000, 180.000000");
    });

    it("should format negative coordinates", () => {
      const result = locationService.formatCoordinates({
        latitude: -90,
        longitude: -180,
        accuracy: 10,
      });
      expect(result).toBe("-90.000000, -180.000000");
    });

    it("should handle very precise coordinates", () => {
      const result = locationService.formatCoordinates({
        latitude: 28.613912345,
        longitude: 77.209021456,
        accuracy: 10,
      });
      expect(result).toBe("28.613912, 77.209021");
    });

    it("should handle zero coordinates", () => {
      const result = locationService.formatCoordinates({
        latitude: 0,
        longitude: 0,
        accuracy: 10,
      });
      expect(result).toBe("0.000000, 0.000000");
    });
  });

  describe("formatPhoneWithCode - Edge Cases", () => {
    it("should handle empty string", () => {
      const result = locationService.formatPhoneWithCode("");
      expect(result).toBe("");
    });

    it("should handle phone with existing country code", () => {
      const result = locationService.formatPhoneWithCode("+919876543210");
      // Function strips non-digits, so +91 becomes 91, total 12 digits
      expect(result).toBe("919876543210");
    });

    it("should handle phone with spaces", () => {
      const result = locationService.formatPhoneWithCode("98765 43210");
      expect(result).toBe("+91 98765-43210");
    });

    it("should handle phone with dashes", () => {
      const result = locationService.formatPhoneWithCode("9876-543-210");
      expect(result).toBe("+91 98765-43210");
    });

    it("should handle phone with parentheses", () => {
      const result = locationService.formatPhoneWithCode("(987) 654-3210");
      expect(result).toBe("+91 98765-43210");
    });

    it("should handle too short phone", () => {
      const result = locationService.formatPhoneWithCode("12345");
      expect(result).toBe("12345");
    });

    it("should handle too long phone", () => {
      const result = locationService.formatPhoneWithCode("123456789012");
      expect(result).toBe("123456789012");
    });

    it("should use custom country code", () => {
      const result = locationService.formatPhoneWithCode("9876543210", "+1");
      expect(result).toBe("+1 98765-43210");
    });

    it("should handle phone with letters", () => {
      const result = locationService.formatPhoneWithCode("98765ABC10");
      // Should clean letters and return just digits
      expect(result).toBe("9876510");
    });
  });
});
