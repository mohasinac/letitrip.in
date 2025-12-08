import { apiService } from "../api.service";
import { locationService } from "../location.service";

jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
  },
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("LocationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("lookupPincode", () => {
    it("should fetch location data for valid pincode", async () => {
      const mockResponse = {
        success: true,
        data: {
          pincode: "110001",
          areas: ["Connaught Place", "Janpath"],
          city: "New Delhi",
          district: "Central Delhi",
          state: "Delhi",
          country: "India",
          isValid: true,
          hasMultipleAreas: true,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await locationService.lookupPincode("110001");

      expect(apiService.get).toHaveBeenCalledWith("/location/pincode/110001");
      expect(result.isValid).toBe(true);
      expect(result.hasMultipleAreas).toBe(true);
    });

    it("should clean pincode before lookup", async () => {
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

      await locationService.lookupPincode("11-00 01");

      expect(apiService.get).toHaveBeenCalledWith("/location/pincode/110001");
    });

    it("should return invalid result for short pincode", async () => {
      const result = await locationService.lookupPincode("12345");

      expect(apiService.get).not.toHaveBeenCalled();
      expect(result.isValid).toBe(false);
    });
  });

  describe("isValidPincode", () => {
    it("should return true for valid 6-digit pincode", () => {
      expect(locationService.isValidPincode("110001")).toBe(true);
      expect(locationService.isValidPincode("560001")).toBe(true);
    });

    it("should return false for pincode starting with 0", () => {
      expect(locationService.isValidPincode("010001")).toBe(false);
    });

    it("should return false for invalid length", () => {
      expect(locationService.isValidPincode("12345")).toBe(false);
      expect(locationService.isValidPincode("1234567")).toBe(false);
    });

    it("should handle pincodes with spaces or dashes", () => {
      expect(locationService.isValidPincode("11 00 01")).toBe(true);
      expect(locationService.isValidPincode("11-00-01")).toBe(true);
    });
  });

  describe("getCurrentPosition", () => {
    let mockGeolocation: any;

    beforeEach(() => {
      mockGeolocation = {
        getCurrentPosition: jest.fn(),
      };
      Object.defineProperty(global.navigator, "geolocation", {
        value: mockGeolocation,
        configurable: true,
      });
    });

    it("should return coordinates on success", async () => {
      const mockPosition = {
        coords: {
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
        success(mockPosition);
      });

      const result = await locationService.getCurrentPosition();

      expect(result).toEqual({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 10,
      });
    });

    it("should reject when geolocation not supported", async () => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: undefined,
        configurable: true,
      });

      await expect(locationService.getCurrentPosition()).rejects.toEqual({
        code: "NOT_SUPPORTED",
        message: "Geolocation is not supported by your browser",
      });
    });

    it("should handle permission denied error", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(
        (_: any, error: any) => {
          error({ code: 1, PERMISSION_DENIED: 1 });
        }
      );

      await expect(locationService.getCurrentPosition()).rejects.toEqual({
        code: "PERMISSION_DENIED",
        message: "Location permission denied. Please enable location access.",
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
  });

  describe("reverseGeocode", () => {
    it("should fetch location from coordinates", async () => {
      const mockResponse = {
        success: true,
        data: {
          address: "Connaught Place, New Delhi",
          city: "New Delhi",
          pincode: "110001",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await locationService.reverseGeocode({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 10,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/location/geocode?lat=28.6139&lng=77.209"
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should return null on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await locationService.reverseGeocode({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 10,
      });

      expect(result).toBeNull();
    });
  });

  describe("formatCoordinates", () => {
    it("should format coordinates", () => {
      const formatted = locationService.formatCoordinates({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 10,
      });

      expect(formatted).toBe("28.613900, 77.209000");
    });
  });

  describe("calculateDistance", () => {
    it("should calculate distance between coordinates", () => {
      const distance = locationService.calculateDistance(
        { latitude: 28.6139, longitude: 77.209, accuracy: 10 },
        { latitude: 28.7041, longitude: 77.1025, accuracy: 10 }
      );

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20);
    });

    it("should return 0 for same coordinates", () => {
      const distance = locationService.calculateDistance(
        { latitude: 28.6139, longitude: 77.209, accuracy: 10 },
        { latitude: 28.6139, longitude: 77.209, accuracy: 10 }
      );

      expect(distance).toBeCloseTo(0, 5);
    });
  });

  describe("formatPhoneWithCode", () => {
    it("should format 10-digit phone number", () => {
      const formatted = locationService.formatPhoneWithCode("9876543210");

      expect(formatted).toBe("+91 98765-43210");
    });

    it("should return as-is for non-10-digit numbers", () => {
      const formatted = locationService.formatPhoneWithCode("123");

      expect(formatted).toBe("123");
    });

    it("should use custom country code", () => {
      const formatted = locationService.formatPhoneWithCode("1234567890", "+1");

      expect(formatted).toBe("+1 12345-67890");
    });
  });

  describe("getWhatsAppLink", () => {
    it("should generate WhatsApp link", () => {
      const link = locationService.getWhatsAppLink("9876543210");

      expect(link).toBe("https://wa.me/919876543210");
    });

    it("should handle custom country code", () => {
      const link = locationService.getWhatsAppLink("1234567890", "+1");

      expect(link).toBe("https://wa.me/11234567890");
    });
  });

  describe("getTelLink", () => {
    it("should generate tel link", () => {
      const link = locationService.getTelLink("9876543210");

      expect(link).toBe("tel:+919876543210");
    });

    it("should handle custom country code", () => {
      const link = locationService.getTelLink("1234567890", "+1");

      expect(link).toBe("tel:+11234567890");
    });

    it("should handle phone with spaces and dashes", () => {
      const link = locationService.getTelLink("987-654-3210");

      expect(link).toBe("tel:+919876543210");
    });

    it("should handle phone with parentheses", () => {
      const link = locationService.getTelLink("(987) 654-3210");

      expect(link).toBe("tel:+919876543210");
    });
  });

  describe("edge cases", () => {
    describe("calculateDistance edge cases", () => {
      it("should handle negative coordinates", () => {
        const distance = locationService.calculateDistance(
          { latitude: -33.8688, longitude: 151.2093, accuracy: 10 }, // Sydney
          { latitude: -37.8136, longitude: 144.9631, accuracy: 10 } // Melbourne
        );

        expect(distance).toBeGreaterThan(700);
        expect(distance).toBeLessThan(800);
      });

      it("should handle coordinates at equator", () => {
        const distance = locationService.calculateDistance(
          { latitude: 0, longitude: 0, accuracy: 10 },
          { latitude: 0, longitude: 1, accuracy: 10 }
        );

        expect(distance).toBeGreaterThan(0);
      });

      it("should handle coordinates at poles", () => {
        const distance = locationService.calculateDistance(
          { latitude: 90, longitude: 0, accuracy: 10 },
          { latitude: 89, longitude: 0, accuracy: 10 }
        );

        expect(distance).toBeGreaterThan(0);
      });

      it("should handle very close coordinates", () => {
        const distance = locationService.calculateDistance(
          { latitude: 28.6139, longitude: 77.209, accuracy: 10 },
          { latitude: 28.614, longitude: 77.209, accuracy: 10 }
        );

        expect(distance).toBeLessThan(0.2);
      });

      it("should handle maximum distance (antipodal points)", () => {
        const distance = locationService.calculateDistance(
          { latitude: 0, longitude: 0, accuracy: 10 },
          { latitude: 0, longitude: 180, accuracy: 10 }
        );

        // Half Earth's circumference at equator
        expect(distance).toBeGreaterThan(19000);
        expect(distance).toBeLessThan(21000);
      });
    });

    describe("pincode edge cases", () => {
      it("should handle pincode with leading zeros after first digit", () => {
        expect(locationService.isValidPincode("400001")).toBe(true);
      });

      it("should reject empty string", () => {
        expect(locationService.isValidPincode("")).toBe(false);
      });

      it("should reject only spaces", () => {
        expect(locationService.isValidPincode("      ")).toBe(false);
      });

      it("should handle pincode with special characters", () => {
        expect(locationService.isValidPincode("11@00#01")).toBe(true);
      });

      it("should handle very long pincode", () => {
        expect(locationService.isValidPincode("1234567890123")).toBe(false);
      });
    });

    describe("phone formatting edge cases", () => {
      it("should handle empty phone number", () => {
        const formatted = locationService.formatPhoneWithCode("");

        expect(formatted).toBe("");
      });

      it("should handle phone with only special characters", () => {
        const formatted = locationService.formatPhoneWithCode("----()()");

        expect(formatted).toBe("----()()");
      });

      it("should handle 11-digit phone number", () => {
        const formatted = locationService.formatPhoneWithCode("19876543210");

        expect(formatted).toBe("19876543210");
      });

      it("should handle single digit", () => {
        const formatted = locationService.formatPhoneWithCode("1");

        expect(formatted).toBe("1");
      });
    });

    describe("formatCoordinates precision", () => {
      it("should format with 6 decimal places", () => {
        const formatted = locationService.formatCoordinates({
          latitude: 28.123456789,
          longitude: 77.987654321,
          accuracy: 10,
        });

        expect(formatted).toBe("28.123457, 77.987654");
      });

      it("should handle zero coordinates", () => {
        const formatted = locationService.formatCoordinates({
          latitude: 0,
          longitude: 0,
          accuracy: 10,
        });

        expect(formatted).toBe("0.000000, 0.000000");
      });

      it("should handle negative coordinates", () => {
        const formatted = locationService.formatCoordinates({
          latitude: -33.8688,
          longitude: -151.2093,
          accuracy: 10,
        });

        expect(formatted).toBe("-33.868800, -151.209300");
      });
    });

    describe("WhatsApp link edge cases", () => {
      it("should handle phone with country code already", () => {
        const link = locationService.getWhatsAppLink("+919876543210");

        expect(link).toBe("https://wa.me/91919876543210");
      });

      it("should handle empty phone", () => {
        const link = locationService.getWhatsAppLink("");

        expect(link).toBe("https://wa.me/91");
      });

      it("should handle country code with plus", () => {
        const link = locationService.getWhatsAppLink("1234567890", "+44");

        expect(link).toBe("https://wa.me/441234567890");
      });

      it("should handle country code without plus", () => {
        const link = locationService.getWhatsAppLink("1234567890", "44");

        expect(link).toBe("https://wa.me/441234567890");
      });
    });
  });
});
