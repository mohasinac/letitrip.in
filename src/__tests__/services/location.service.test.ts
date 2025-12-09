/**
 * Location Service Unit Tests
 * Tests GPS, pincode lookup, and geocoding functionality
 */

import { apiService } from "@/services/api.service";
import { locationService } from "@/services/location.service";
import type {
  GeoCoordinates,
  PincodeLookupResult,
  ReverseGeocodeResult,
} from "@/types/shared/location.types";

jest.mock("@/services/api.service");
jest.mock("@/lib/firebase-error-logger");

describe("LocationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("lookupPincode", () => {
    const mockPincodeResult: PincodeLookupResult = {
      pincode: "400001",
      areas: ["Fort", "Churchgate"],
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      country: "India",
      isValid: true,
      hasMultipleAreas: true,
    };

    it("should lookup valid pincode", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPincodeResult,
      });

      const result = await locationService.lookupPincode("400001");

      expect(result).toEqual(mockPincodeResult);
      expect(apiService.get).toHaveBeenCalledWith("/location/pincode/400001");
    });

    it("should handle pincode with spaces and dashes", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPincodeResult,
      });

      const result = await locationService.lookupPincode("400-001");

      expect(apiService.get).toHaveBeenCalledWith("/location/pincode/400001");
    });

    it("should return invalid for short pincode", async () => {
      const result = await locationService.lookupPincode("1234");

      expect(result.isValid).toBe(false);
      expect(result.pincode).toBe("1234");
      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should return invalid for long pincode", async () => {
      const result = await locationService.lookupPincode("1234567");

      expect(result.isValid).toBe(false);
      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should return invalid for empty pincode", async () => {
      const result = await locationService.lookupPincode("");

      expect(result.isValid).toBe(false);
      expect(result.areas).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(locationService.lookupPincode("400001")).rejects.toThrow();
    });
  });

  describe("isValidPincode", () => {
    it("should validate correct pincode", () => {
      expect(locationService.isValidPincode("400001")).toBe(true);
      expect(locationService.isValidPincode("110001")).toBe(true);
      expect(locationService.isValidPincode("560001")).toBe(true);
    });

    it("should reject pincode starting with 0", () => {
      expect(locationService.isValidPincode("000001")).toBe(false);
    });

    it("should reject short pincode", () => {
      expect(locationService.isValidPincode("12345")).toBe(false);
    });

    it("should reject long pincode", () => {
      expect(locationService.isValidPincode("1234567")).toBe(false);
    });

    it("should handle pincode with spaces", () => {
      expect(locationService.isValidPincode("400 001")).toBe(true);
    });

    it("should handle pincode with dashes", () => {
      expect(locationService.isValidPincode("400-001")).toBe(true);
    });

    it("should reject non-numeric characters", () => {
      expect(locationService.isValidPincode("40000A")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(locationService.isValidPincode("")).toBe(false);
    });
  });

  describe("getCurrentPosition", () => {
    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 19.076,
        longitude: 72.8777,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    beforeEach(() => {
      // Mock navigator.geolocation
      Object.defineProperty(global.navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn(),
        },
        writable: true,
        configurable: true,
      });
    });

    it("should get current GPS position", async () => {
      (
        navigator.geolocation.getCurrentPosition as jest.Mock
      ).mockImplementation((success) => success(mockPosition));

      const result = await locationService.getCurrentPosition();

      expect(result.latitude).toBe(19.076);
      expect(result.longitude).toBe(72.8777);
      expect(result.accuracy).toBe(10);
    });

    it("should handle permission denied error", async () => {
      const error: GeolocationPositionError = {
        code: 1,
        message: "User denied geolocation",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      (
        navigator.geolocation.getCurrentPosition as jest.Mock
      ).mockImplementation((success, error_callback) => error_callback(error));

      await expect(locationService.getCurrentPosition()).rejects.toMatchObject({
        code: "PERMISSION_DENIED",
        message: expect.stringContaining("permission denied"),
      });
    });

    it("should handle position unavailable error", async () => {
      const error: GeolocationPositionError = {
        code: 2,
        message: "Position unavailable",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      (
        navigator.geolocation.getCurrentPosition as jest.Mock
      ).mockImplementation((success, error_callback) => error_callback(error));

      await expect(locationService.getCurrentPosition()).rejects.toMatchObject({
        code: "POSITION_UNAVAILABLE",
      });
    });

    it("should handle timeout error", async () => {
      const error: GeolocationPositionError = {
        code: 3,
        message: "Timeout",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      (
        navigator.geolocation.getCurrentPosition as jest.Mock
      ).mockImplementation((success, error_callback) => error_callback(error));

      await expect(locationService.getCurrentPosition()).rejects.toMatchObject({
        code: "TIMEOUT",
      });
    });

    it("should handle missing geolocation support", async () => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: undefined,
        writable: true,
      });

      await expect(locationService.getCurrentPosition()).rejects.toMatchObject({
        code: "NOT_SUPPORTED",
        message: expect.stringContaining("not supported"),
      });
    });

    it("should use correct geolocation options", async () => {
      (
        navigator.geolocation.getCurrentPosition as jest.Mock
      ).mockImplementation((success) => success(mockPosition));

      await locationService.getCurrentPosition();

      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  });

  describe("checkGeolocationPermission", () => {
    it("should return granted permission", async () => {
      const mockQuery = jest.fn().mockResolvedValue({ state: "granted" });
      Object.defineProperty(global.navigator, "permissions", {
        value: { query: mockQuery },
        writable: true,
        configurable: true,
      });

      const result = await locationService.checkGeolocationPermission();

      expect(result).toBe("granted");
      expect(mockQuery).toHaveBeenCalledWith({ name: "geolocation" });
    });

    it("should return denied permission", async () => {
      const mockQuery = jest.fn().mockResolvedValue({ state: "denied" });
      Object.defineProperty(global.navigator, "permissions", {
        value: { query: mockQuery },
        writable: true,
      });

      const result = await locationService.checkGeolocationPermission();

      expect(result).toBe("denied");
    });

    it("should return prompt when permission not decided", async () => {
      const mockQuery = jest.fn().mockResolvedValue({ state: "prompt" });
      Object.defineProperty(global.navigator, "permissions", {
        value: { query: mockQuery },
        writable: true,
      });

      const result = await locationService.checkGeolocationPermission();

      expect(result).toBe("prompt");
    });

    it("should fallback to prompt when permissions API unavailable", async () => {
      Object.defineProperty(global.navigator, "permissions", {
        value: undefined,
        writable: true,
      });

      const result = await locationService.checkGeolocationPermission();

      expect(result).toBe("prompt");
    });

    it("should handle query errors", async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error("Query failed"));
      Object.defineProperty(global.navigator, "permissions", {
        value: { query: mockQuery },
        writable: true,
      });

      const result = await locationService.checkGeolocationPermission();

      expect(result).toBe("prompt");
    });
  });

  describe("reverseGeocode", () => {
    const mockCoords: GeoCoordinates = {
      latitude: 19.076,
      longitude: 72.8777,
      accuracy: 10,
    };

    const mockGeocodeResult: ReverseGeocodeResult = {
      formattedAddress: "Fort, Mumbai, Maharashtra, India",
      locality: "Fort",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001",
    };

    it("should reverse geocode coordinates", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockGeocodeResult,
      });

      const result = await locationService.reverseGeocode(mockCoords);

      expect(result).toEqual(mockGeocodeResult);
      expect(apiService.get).toHaveBeenCalledWith(
        "/location/geocode?lat=19.076&lng=72.8777"
      );
    });

    it("should return null on API error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await locationService.reverseGeocode(mockCoords);

      expect(result).toBeNull();
    });

    it("should handle invalid coordinates", async () => {
      const invalidCoords: GeoCoordinates = {
        latitude: 999,
        longitude: 999,
        accuracy: 0,
      };

      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Invalid coordinates")
      );

      const result = await locationService.reverseGeocode(invalidCoords);

      expect(result).toBeNull();
    });
  });

  describe("formatCoordinates", () => {
    it("should format coordinates correctly", () => {
      const coords: GeoCoordinates = {
        latitude: 19.07609,
        longitude: 72.877656,
        accuracy: 10,
      };

      const formatted = locationService.formatCoordinates(coords);

      expect(formatted).toBe("19.076090, 72.877656");
    });

    it("should round to 6 decimal places", () => {
      const coords: GeoCoordinates = {
        latitude: 19.0760901234,
        longitude: 72.877656789,
        accuracy: 10,
      };

      const formatted = locationService.formatCoordinates(coords);

      expect(formatted).toBe("19.076090, 72.877657");
    });

    it("should handle negative coordinates", () => {
      const coords: GeoCoordinates = {
        latitude: -19.07609,
        longitude: -72.877656,
        accuracy: 10,
      };

      const formatted = locationService.formatCoordinates(coords);

      expect(formatted).toBe("-19.076090, -72.877656");
    });
  });

  describe("calculateDistance", () => {
    it("should calculate distance between two points", () => {
      const from: GeoCoordinates = {
        latitude: 19.076,
        longitude: 72.8777,
        accuracy: 10,
      };

      const to: GeoCoordinates = {
        latitude: 28.7041,
        longitude: 77.1025,
        accuracy: 10,
      };

      const distance = locationService.calculateDistance(from, to);

      expect(distance).toBeGreaterThan(1100); // Approx Mumbai to Delhi
      expect(distance).toBeLessThan(1400);
    });

    it("should return 0 for same coordinates", () => {
      const coords: GeoCoordinates = {
        latitude: 19.076,
        longitude: 72.8777,
        accuracy: 10,
      };

      const distance = locationService.calculateDistance(coords, coords);

      expect(distance).toBe(0);
    });

    it("should handle coordinates at equator", () => {
      const from: GeoCoordinates = {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
      };

      const to: GeoCoordinates = {
        latitude: 0,
        longitude: 1,
        accuracy: 10,
      };

      const distance = locationService.calculateDistance(from, to);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(120); // Approx 111 km per degree at equator
    });

    it("should handle polar coordinates", () => {
      const from: GeoCoordinates = {
        latitude: 90,
        longitude: 0,
        accuracy: 10,
      };

      const to: GeoCoordinates = {
        latitude: -90,
        longitude: 0,
        accuracy: 10,
      };

      const distance = locationService.calculateDistance(from, to);

      expect(distance).toBeGreaterThan(19000); // Half of Earth's circumference
      expect(distance).toBeLessThan(21000);
    });
  });

  describe("formatPhoneWithCode", () => {
    it("should format valid 10-digit phone", () => {
      const formatted = locationService.formatPhoneWithCode("9876543210");

      expect(formatted).toBe("+91 98765-43210");
    });

    it("should format phone with spaces", () => {
      const formatted = locationService.formatPhoneWithCode("98765 43210");

      expect(formatted).toBe("+91 98765-43210");
    });

    it("should format phone with dashes", () => {
      const formatted = locationService.formatPhoneWithCode("98765-43210");

      expect(formatted).toBe("+91 98765-43210");
    });

    it("should use custom country code", () => {
      const formatted = locationService.formatPhoneWithCode("9876543210", "+1");

      expect(formatted).toBe("+1 98765-43210");
    });

    it("should return original for invalid length", () => {
      const input = "98765";
      const formatted = locationService.formatPhoneWithCode(input);

      expect(formatted).toBe(input);
    });

    it("should handle phone with country code already", () => {
      const formatted = locationService.formatPhoneWithCode("+919876543210");

      // Function only formats 10-digit numbers, returns cleaned digits for other lengths
      // After fix: "+919876543210" has 12 digits after cleaning, so returns cleaned string
      expect(formatted).toBe("919876543210");
    });
  });

  describe("getWhatsAppLink", () => {
    it("should generate WhatsApp link", () => {
      const link = locationService.getWhatsAppLink("9876543210");

      expect(link).toBe("https://wa.me/919876543210");
    });

    it("should handle phone with spaces", () => {
      const link = locationService.getWhatsAppLink("98765 43210");

      expect(link).toBe("https://wa.me/919876543210");
    });

    it("should use custom country code", () => {
      const link = locationService.getWhatsAppLink("9876543210", "+1");

      expect(link).toBe("https://wa.me/19876543210");
    });

    it("should handle phone with special characters", () => {
      const link = locationService.getWhatsAppLink("(987) 654-3210");

      expect(link).toBe("https://wa.me/919876543210");
    });
  });

  describe("getTelLink", () => {
    it("should generate tel link", () => {
      const link = locationService.getTelLink("9876543210");

      expect(link).toBe("tel:+919876543210");
    });

    it("should handle phone with spaces", () => {
      const link = locationService.getTelLink("98765 43210");

      expect(link).toBe("tel:+919876543210");
    });

    it("should use custom country code", () => {
      const link = locationService.getTelLink("9876543210", "+1");

      expect(link).toBe("tel:+19876543210");
    });

    it("should handle phone with dashes and parentheses", () => {
      const link = locationService.getTelLink("(987)-654-3210");

      expect(link).toBe("tel:+919876543210");
    });
  });

  describe("Edge Cases", () => {
    it("should handle extremely long pincode input", async () => {
      const longInput = "1234567890123456";
      const result = await locationService.lookupPincode(longInput);

      expect(result.isValid).toBe(false);
    });

    it("should handle special characters in pincode", () => {
      expect(locationService.isValidPincode("@#$%^&")).toBe(false);
    });

    it("should handle coordinates at boundaries", () => {
      const maxCoords: GeoCoordinates = {
        latitude: 90,
        longitude: 180,
        accuracy: 100,
      };

      const formatted = locationService.formatCoordinates(maxCoords);
      expect(formatted).toBe("90.000000, 180.000000");
    });

    it("should handle zero distance calculation", () => {
      const point: GeoCoordinates = {
        latitude: 0,
        longitude: 0,
        accuracy: 1,
      };

      const distance = locationService.calculateDistance(point, point);
      expect(distance).toBe(0);
    });
  });
});
