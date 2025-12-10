/**
 * Unit Tests for Pincode Location Service
 */

import type { IndiaPostPincodeResponse } from "@/types/shared/location.types";
import {
  fetchPincodeData,
  transformPincodeResponse,
  validatePincode,
} from "../pincode";

// Mock fetch globally
global.fetch = jest.fn();

describe("Location - Pincode Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe("validatePincode", () => {
    it("should validate correct 6-digit pincode", () => {
      expect(validatePincode("110001")).toBe(true);
      expect(validatePincode("400001")).toBe(true);
      expect(validatePincode("560001")).toBe(true);
    });

    it("should reject pincode starting with 0", () => {
      expect(validatePincode("000001")).toBe(false);
      expect(validatePincode("012345")).toBe(false);
    });

    it("should reject pincode with wrong length", () => {
      expect(validatePincode("12345")).toBe(false);
      expect(validatePincode("1234567")).toBe(false);
      expect(validatePincode("")).toBe(false);
    });

    it("should reject pincode with non-numeric characters", () => {
      expect(validatePincode("11000A")).toBe(false);
      expect(validatePincode("ABC123")).toBe(false);
      expect(validatePincode("11-001")).toBe(false);
    });

    it("should handle pincode with spaces and special chars", () => {
      expect(validatePincode("110 001")).toBe(true); // Cleaned to 110001
      expect(validatePincode("110-001")).toBe(true); // Cleaned to 110001
    });

    it("should handle null/undefined gracefully", () => {
      expect(() => validatePincode(null as any)).toThrow();
      expect(() => validatePincode(undefined as any)).toThrow();
    });
  });

  describe("transformPincodeResponse", () => {
    it("should transform valid India Post response", () => {
      const response: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: [
            {
              Name: "Connaught Place",
              Description: "",
              BranchType: "Sub Post Office",
              DeliveryStatus: "Delivery",
              Circle: "Delhi",
              District: "Central Delhi",
              Division: "New Delhi",
              Region: "Delhi",
              Block: "New Delhi",
              State: "Delhi",
              Country: "India",
              Pincode: "110001",
            },
            {
              Name: "Palika Bazar",
              Description: "",
              BranchType: "Sub Post Office",
              DeliveryStatus: "Non-Delivery",
              Circle: "Delhi",
              District: "Central Delhi",
              Division: "New Delhi",
              Region: "Delhi",
              Block: "New Delhi",
              State: "Delhi",
              Country: "India",
              Pincode: "110001",
            },
          ],
        },
      ];

      const result = transformPincodeResponse(response);

      expect(result).toEqual({
        pincode: "110001",
        areas: [
          {
            name: "Connaught Place",
            branchType: "Sub Post Office",
            deliveryStatus: true,
          },
          {
            name: "Palika Bazar",
            branchType: "Sub Post Office",
            deliveryStatus: false,
          },
        ],
        city: "New Delhi",
        district: "Central Delhi",
        state: "Delhi",
        country: "India",
      });
    });

    it("should return null for failed status", () => {
      const response: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "404",
          PostOffice: null,
        },
      ];

      const result = transformPincodeResponse(response);
      expect(result).toBeNull();
    });

    it("should return null for empty PostOffice array", () => {
      const response: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: [],
        },
      ];

      const result = transformPincodeResponse(response);
      expect(result).toBeNull();
    });

    it("should use district as city when division is missing", () => {
      const response: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: [
            {
              Name: "Test Area",
              Description: "",
              BranchType: "Head Post Office",
              DeliveryStatus: "Delivery",
              Circle: "Test Circle",
              District: "Test District",
              Division: "",
              Region: "Test Region",
              Block: "Test Block",
              State: "Test State",
              Country: "India",
              Pincode: "123456",
            },
          ],
        },
      ];

      const result = transformPincodeResponse(response);
      expect(result?.city).toBe("Test District");
    });

    it("should handle null PostOffice", () => {
      const response: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: null as any,
        },
      ];

      const result = transformPincodeResponse(response);
      expect(result).toBeNull();
    });

    it("should handle empty response array", () => {
      const response: IndiaPostPincodeResponse[] = [];

      // Should throw or handle gracefully
      expect(() => transformPincodeResponse(response)).toThrow();
    });
  });

  describe("fetchPincodeData", () => {
    const mockSuccessResponse: IndiaPostPincodeResponse[] = [
      {
        Message: "No records found",
        Status: "Success",
        PostOffice: [
          {
            Name: "Connaught Place",
            Description: "",
            BranchType: "Sub Post Office",
            DeliveryStatus: "Delivery",
            Circle: "Delhi",
            District: "Central Delhi",
            Division: "New Delhi",
            Region: "Delhi",
            Block: "New Delhi",
            State: "Delhi",
            Country: "India",
            Pincode: "110001",
          },
        ],
      },
    ];

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should fetch valid pincode data successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      const result = await fetchPincodeData("110001");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.postalpincode.in/pincode/110001",
        expect.objectContaining({
          headers: { Accept: "application/json" },
          signal: expect.any(AbortSignal),
          next: { revalidate: 86400 },
        })
      );

      expect(result).toEqual({
        pincode: "110001",
        areas: ["Connaught Place"],
        city: "New Delhi",
        district: "Central Delhi",
        state: "Delhi",
        country: "India",
        isValid: true,
        hasMultipleAreas: false,
      });
    });

    it("should handle pincode with multiple areas", async () => {
      const multiAreaResponse: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: [
            {
              Name: "Area One",
              Description: "",
              BranchType: "Sub Post Office",
              DeliveryStatus: "Delivery",
              Circle: "Delhi",
              District: "Central Delhi",
              Division: "New Delhi",
              Region: "Delhi",
              Block: "New Delhi",
              State: "Delhi",
              Country: "India",
              Pincode: "110001",
            },
            {
              Name: "Area Two",
              Description: "",
              BranchType: "Sub Post Office",
              DeliveryStatus: "Delivery",
              Circle: "Delhi",
              District: "Central Delhi",
              Division: "New Delhi",
              Region: "Delhi",
              Block: "New Delhi",
              State: "Delhi",
              Country: "India",
              Pincode: "110001",
            },
          ],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => multiAreaResponse,
      });

      const result = await fetchPincodeData("110001");

      expect(result.hasMultipleAreas).toBe(true);
      expect(result.areas).toEqual(["Area One", "Area Two"]);
    });

    it("should deduplicate area names", async () => {
      const duplicateResponse: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: [
            {
              Name: "Same Area",
              Description: "",
              BranchType: "Sub Post Office",
              DeliveryStatus: "Delivery",
              Circle: "Delhi",
              District: "Central Delhi",
              Division: "New Delhi",
              Region: "Delhi",
              Block: "New Delhi",
              State: "Delhi",
              Country: "India",
              Pincode: "110001",
            },
            {
              Name: "Same Area",
              Description: "",
              BranchType: "Head Post Office",
              DeliveryStatus: "Delivery",
              Circle: "Delhi",
              District: "Central Delhi",
              Division: "New Delhi",
              Region: "Delhi",
              Block: "New Delhi",
              State: "Delhi",
              Country: "India",
              Pincode: "110001",
            },
          ],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => duplicateResponse,
      });

      const result = await fetchPincodeData("110001");

      expect(result.areas).toEqual(["Same Area"]);
      expect(result.hasMultipleAreas).toBe(false);
    });

    it("should return invalid result for malformed pincode", async () => {
      const result = await fetchPincodeData("12345"); // 5 digits

      expect(result).toEqual({
        pincode: "12345",
        areas: [],
        city: "",
        district: "",
        state: "",
        country: "India",
        isValid: false,
        hasMultipleAreas: false,
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return invalid result for pincode starting with 0", async () => {
      const result = await fetchPincodeData("012345");

      expect(result.isValid).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should clean pincode before validation", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      const result = await fetchPincodeData("110-001");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.postalpincode.in/pincode/110001",
        expect.any(Object)
      );
      expect(result.pincode).toBe("110001");
    });

    it("should handle 404 response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchPincodeData("999999")).rejects.toThrow(
        "Pincode not found: 999999"
      );
    });

    it("should handle API error status", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchPincodeData("110001")).rejects.toThrow(
        "India Post API error: 500"
      );
    });

    it("should handle failed status from API", async () => {
      const failedResponse: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "404",
          PostOffice: null,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => failedResponse,
      });

      const result = await fetchPincodeData("110001");

      expect(result.isValid).toBe(false);
      expect(result.areas).toEqual([]);
    });

    it("should handle empty PostOffice array", async () => {
      const emptyResponse: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: [],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => emptyResponse,
      });

      const result = await fetchPincodeData("110001");

      expect(result.isValid).toBe(false);
      expect(result.areas).toEqual([]);
    });

    it("should handle timeout with AbortController", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";

      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(fetchPincodeData("110001")).rejects.toThrow("timed out");
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(fetchPincodeData("110001")).rejects.toThrow(
        "Failed to lookup pincode. Please check your connection and try again."
      );
    });

    it("should preserve timeout error messages", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Pincode lookup timed out. Please try again.")
      );

      await expect(fetchPincodeData("110001")).rejects.toThrow("timed out");
    });

    it("should preserve not found error messages", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Pincode not found: 999999")
      );

      await expect(fetchPincodeData("999999")).rejects.toThrow("not found");
    });

    it("should preserve API error messages", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("India Post API error: 503")
      );

      await expect(fetchPincodeData("110001")).rejects.toThrow("API error");
    });

    it("should use district when division is missing", async () => {
      const noDivisionResponse: IndiaPostPincodeResponse[] = [
        {
          Message: "No records found",
          Status: "Success",
          PostOffice: [
            {
              Name: "Test Area",
              Description: "",
              BranchType: "Sub Post Office",
              DeliveryStatus: "Delivery",
              Circle: "Test",
              District: "Test District",
              Division: "",
              Region: "Test",
              Block: "Test",
              State: "Test State",
              Country: "India",
              Pincode: "123456",
            },
          ],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => noDivisionResponse,
      });

      const result = await fetchPincodeData("123456");

      expect(result.city).toBe("Test District");
    });

    it("should handle malformed JSON response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(fetchPincodeData("110001")).rejects.toThrow();
    });

    it("should include caching headers", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      await fetchPincodeData("110001");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: { revalidate: 86400 }, // 24 hours
        })
      );
    });

    it("should set proper accept header", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      await fetchPincodeData("110001");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Accept: "application/json" },
        })
      );
    });

    it("should clean timeout on successful fetch", async () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      });

      await fetchPincodeData("110001");

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("should clean timeout on fetch error", async () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(fetchPincodeData("110001")).rejects.toThrow();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("should handle abort error properly", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";

      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(fetchPincodeData("110001")).rejects.toThrow(
        "Pincode lookup timed out. Please try again."
      );
    });

    it("should log errors to console", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Test error")
      );

      await expect(fetchPincodeData("110001")).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Pincode lookup error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Edge Cases and Integration", () => {
    it("should handle very long pincode strings", async () => {
      const result = await fetchPincodeData("1234567890");

      expect(result.isValid).toBe(false);
    });

    it("should handle unicode characters in pincode", async () => {
      const result = await fetchPincodeData("१२३४५६"); // Devanagari digits

      expect(result.isValid).toBe(false);
    });

    it("should handle special characters", async () => {
      const result = await fetchPincodeData("@#$%^&");

      expect(result.isValid).toBe(false);
    });

    it("should handle empty string", async () => {
      const result = await fetchPincodeData("");

      expect(result.isValid).toBe(false);
    });

    it("should handle whitespace-only string", async () => {
      const result = await fetchPincodeData("      ");

      expect(result.isValid).toBe(false);
    });
  });
});
