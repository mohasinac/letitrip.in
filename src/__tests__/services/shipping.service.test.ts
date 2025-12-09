/**
 * @jest-environment jsdom
 */

import { apiService } from "@/services/api.service";
import { shippingService } from "@/services/shipping.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock the API service
jest.mock("@/services/api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock global fetch for generateLabel test
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("ShippingService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.get = jest.fn();
    mockApiService.post = jest.fn();
  });

  // ============================================================================
  // GET COURIER OPTIONS
  // ============================================================================

  describe("getCourierOptions", () => {
    it("should fetch available courier options for an order", async () => {
      const mockCouriers = [
        {
          courier_company_id: 1,
          courier_name: "BlueDart",
          rate: 75.5,
          estimated_delivery_days: 2,
          is_surface: false,
          is_rto_available: true,
        },
        {
          courier_company_id: 2,
          courier_name: "Delhivery",
          rate: 65.0,
          estimated_delivery_days: 3,
          is_surface: true,
          is_rto_available: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { available_courier_companies: mockCouriers },
      });

      const result = await shippingService.getCourierOptions("order-123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/seller/shipping/couriers/order-123"
      );
      expect(result).toHaveLength(2);
      expect(result[0].courier_name).toBe("BlueDart");
      expect(result[1].rate).toBe(65.0);
    });

    it("should return multiple courier options sorted by rate", async () => {
      const mockCouriers = [
        {
          courier_company_id: 3,
          courier_name: "DTDC",
          rate: 85.0,
          estimated_delivery_days: 4,
          is_surface: true,
          is_rto_available: false,
        },
        {
          courier_company_id: 1,
          courier_name: "BlueDart",
          rate: 75.5,
          estimated_delivery_days: 2,
          is_surface: false,
          is_rto_available: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { available_courier_companies: mockCouriers },
      });

      const result = await shippingService.getCourierOptions("order-456");

      expect(result).toHaveLength(2);
      expect(result[0].courier_company_id).toBe(3);
    });

    it("should throw error when API response is not successful", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "Order not found",
      });

      await expect(
        shippingService.getCourierOptions("order-invalid")
      ).rejects.toThrow("Order not found");
    });

    it("should throw generic error when no error message provided", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
      });

      await expect(
        shippingService.getCourierOptions("order-123")
      ).rejects.toThrow("Failed to fetch courier options");
    });

    it("should handle empty courier list", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { available_courier_companies: [] },
      });

      const result = await shippingService.getCourierOptions("order-123");

      expect(result).toEqual([]);
    });

    it("should handle API network errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        shippingService.getCourierOptions("order-123")
      ).rejects.toThrow("Network error");
    });
  });

  // ============================================================================
  // GENERATE AWB
  // ============================================================================

  describe("generateAWB", () => {
    it("should generate AWB for order with selected courier", async () => {
      const mockAWBResponse = {
        awb_code: "AWB123456789",
        courier_company_id: 1,
        courier_name: "BlueDart",
        response: {
          data: {
            awb_assign_status: 1,
            awb_code: "AWB123456789",
            child_courier_name: "BlueDart Surface",
          },
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAWBResponse,
      });

      const result = await shippingService.generateAWB("order-123", 1);

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/seller/shipping/awb/order-123",
        { courier_id: 1 }
      );
      expect(result.awb_code).toBe("AWB123456789");
      expect(result.courier_name).toBe("BlueDart");
    });

    it("should throw error when AWB generation fails", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "AWB not available",
      });

      await expect(shippingService.generateAWB("order-123", 1)).rejects.toThrow(
        "AWB not available"
      );
    });

    it("should throw generic error when no error message provided", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
      });

      await expect(shippingService.generateAWB("order-123", 1)).rejects.toThrow(
        "Failed to generate AWB"
      );
    });

    it("should handle different courier IDs", async () => {
      const mockAWBResponse = {
        awb_code: "DLV987654321",
        courier_company_id: 2,
        courier_name: "Delhivery",
        response: {
          data: {
            awb_assign_status: 1,
            awb_code: "DLV987654321",
            child_courier_name: "Delhivery Express",
          },
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAWBResponse,
      });

      const result = await shippingService.generateAWB("order-456", 2);

      expect(result.courier_company_id).toBe(2);
      expect(result.courier_name).toBe("Delhivery");
    });
  });

  // ============================================================================
  // SCHEDULE PICKUP
  // ============================================================================

  describe("schedulePickup", () => {
    it("should schedule pickup for an order", async () => {
      const mockPickupResponse = {
        pickup_scheduled_date: "2024-12-10",
        pickup_token_number: "PKP123456",
        status: "scheduled",
        response_code: 200,
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPickupResponse,
      });

      const result = await shippingService.schedulePickup("order-123");

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/seller/shipping/pickup/order-123",
        {}
      );
      expect(result.pickup_token_number).toBe("PKP123456");
      expect(result.status).toBe("scheduled");
    });

    it("should throw error when pickup scheduling fails", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "Pickup already scheduled",
      });

      await expect(shippingService.schedulePickup("order-123")).rejects.toThrow(
        "Pickup already scheduled"
      );
    });

    it("should handle different pickup dates", async () => {
      const mockPickupResponse = {
        pickup_scheduled_date: "2024-12-15",
        pickup_token_number: "PKP789012",
        status: "scheduled",
        response_code: 200,
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPickupResponse,
      });

      const result = await shippingService.schedulePickup("order-789");

      expect(result.pickup_scheduled_date).toBe("2024-12-15");
    });
  });

  // ============================================================================
  // GET TRACKING
  // ============================================================================

  describe("getTracking", () => {
    it("should get tracking information for AWB code", async () => {
      const mockTrackingUpdate = {
        current_status: "In Transit",
        shipment_status: 6,
        shipment_track: [
          {
            current_status: "Picked Up",
            date: "2024-12-09T10:00:00Z",
            status: "Picked Up",
            activity: "Package picked up from seller",
            location: "Mumbai",
          },
          {
            current_status: "In Transit",
            date: "2024-12-09T18:00:00Z",
            status: "In Transit",
            activity: "Package in transit to destination",
            location: "Delhi Hub",
          },
        ],
        track_url: "https://tracking.example.com/AWB123456789",
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          tracking_data: mockTrackingUpdate,
        },
      });

      const result = await shippingService.getTracking("AWB123456789");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/seller/shipping/track/AWB123456789"
      );
      expect(result.current_status).toBe("In Transit");
      expect(result.shipment_track).toHaveLength(2);
      expect(result.track_url).toContain("AWB123456789");
    });

    it("should handle delivered status", async () => {
      const mockTrackingUpdate = {
        current_status: "Delivered",
        shipment_status: 7,
        shipment_track: [
          {
            current_status: "Delivered",
            date: "2024-12-10T14:30:00Z",
            status: "Delivered",
            activity: "Package delivered successfully",
            location: "Delhi",
          },
        ],
        track_url: "https://tracking.example.com/AWB123456789",
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          tracking_data: mockTrackingUpdate,
        },
      });

      const result = await shippingService.getTracking("AWB123456789");

      expect(result.current_status).toBe("Delivered");
      expect(result.shipment_status).toBe(7);
    });

    it("should throw error when tracking fails", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "AWB not found",
      });

      await expect(shippingService.getTracking("INVALID")).rejects.toThrow(
        "AWB not found"
      );
    });

    it("should handle multiple tracking events", async () => {
      const mockTrackingUpdate = {
        current_status: "Out for Delivery",
        shipment_status: 8,
        shipment_track: Array.from({ length: 5 }, (_, i) => ({
          current_status: `Status ${i}`,
          date: `2024-12-0${i + 1}T10:00:00Z`,
          status: `Status ${i}`,
          activity: `Activity ${i}`,
          location: `Location ${i}`,
        })),
        track_url: "https://tracking.example.com/AWB123",
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          tracking_data: mockTrackingUpdate,
        },
      });

      const result = await shippingService.getTracking("AWB123");

      expect(result.shipment_track).toHaveLength(5);
    });
  });

  // ============================================================================
  // GENERATE LABEL
  // ============================================================================

  describe("generateLabel", () => {
    it("should generate PDF label for order", async () => {
      const mockBlob = new Blob(["PDF content"], { type: "application/pdf" });

      mockApiService.getBlob = jest.fn().mockResolvedValue(mockBlob);

      const result = await shippingService.generateLabel("order-123");

      expect(mockApiService.getBlob).toHaveBeenCalledWith(
        "/api/seller/shipping/label/order-123"
      );
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("application/pdf");
    });

    it("should throw error when label generation fails", async () => {
      mockApiService.getBlob = jest
        .fn()
        .mockRejectedValue(
          new Error("HTTP undefined: Label generation failed")
        );

      await expect(shippingService.generateLabel("order-123")).rejects.toThrow(
        "HTTP undefined: Label generation failed"
      );
    });

    it("should handle error when response text fails", async () => {
      mockApiService.getBlob = jest
        .fn()
        .mockRejectedValue(new Error("HTTP undefined: Unknown error"));

      await expect(shippingService.generateLabel("order-123")).rejects.toThrow(
        "HTTP undefined: Unknown error"
      );
    });

    it("should handle network errors", async () => {
      mockApiService.getBlob = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      await expect(shippingService.generateLabel("order-123")).rejects.toThrow(
        "Network error"
      );
    });
  });

  // ============================================================================
  // GET PICKUP LOCATIONS
  // ============================================================================

  describe("getPickupLocations", () => {
    it("should fetch all pickup locations", async () => {
      const mockLocations = [
        {
          pickup_location: "Main Warehouse",
          name: "Mumbai Warehouse",
          email: "mumbai@example.com",
          phone: "+919876543210",
          address: "123 Main St",
          address_2: "Near Station",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          pin_code: "400001",
        },
        {
          pickup_location: "Branch Office",
          name: "Delhi Branch",
          email: "delhi@example.com",
          phone: "+911234567890",
          address: "456 Park Ave",
          address_2: "",
          city: "Delhi",
          state: "Delhi",
          country: "India",
          pin_code: "110001",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { shipping_address: mockLocations },
      });

      const result = await shippingService.getPickupLocations();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/seller/shipping/pickup-locations"
      );
      expect(result).toHaveLength(2);
      expect(result[0].pickup_location).toBe("Main Warehouse");
      expect(result[1].city).toBe("Delhi");
    });

    it("should throw error when fetching locations fails", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "No locations configured",
      });

      await expect(shippingService.getPickupLocations()).rejects.toThrow(
        "No locations configured"
      );
    });

    it("should handle empty pickup locations", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { shipping_address: [] },
      });

      const result = await shippingService.getPickupLocations();

      expect(result).toEqual([]);
    });

    it("should handle single pickup location", async () => {
      const mockLocations = [
        {
          pickup_location: "Only Warehouse",
          name: "Main Warehouse",
          email: "main@example.com",
          phone: "+919999999999",
          address: "789 Only St",
          address_2: "",
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
          pin_code: "560001",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { shipping_address: mockLocations },
      });

      const result = await shippingService.getPickupLocations();

      expect(result).toHaveLength(1);
      expect(result[0].city).toBe("Bangalore");
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle very long AWB codes", async () => {
      const longAWB = "AWB" + "1".repeat(50);
      const mockTrackingUpdate = {
        current_status: "Processing",
        shipment_status: 1,
        shipment_track: [],
        track_url: `https://tracking.example.com/${longAWB}`,
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          tracking_data: mockTrackingUpdate,
        },
      });

      const result = await shippingService.getTracking(longAWB);

      expect(result.track_url).toContain(longAWB);
    });

    it("should handle special characters in order IDs", async () => {
      const specialOrderId = "order-123-abc_DEF";
      const mockCouriers = [];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { available_courier_companies: mockCouriers },
      });

      await shippingService.getCourierOptions(specialOrderId);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining(specialOrderId)
      );
    });

    it("should handle concurrent requests", async () => {
      const mockCouriers = [
        {
          courier_company_id: 1,
          courier_name: "Test Courier",
          rate: 50.0,
          estimated_delivery_days: 2,
          is_surface: false,
          is_rto_available: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { available_courier_companies: mockCouriers },
      });

      const promises = [
        shippingService.getCourierOptions("order-1"),
        shippingService.getCourierOptions("order-2"),
        shippingService.getCourierOptions("order-3"),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.get).toHaveBeenCalledTimes(3);
    });

    it("should handle zero-cost courier options", async () => {
      const mockCouriers = [
        {
          courier_company_id: 99,
          courier_name: "Free Delivery",
          rate: 0,
          estimated_delivery_days: 7,
          is_surface: true,
          is_rto_available: false,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { available_courier_companies: mockCouriers },
      });

      const result = await shippingService.getCourierOptions("order-123");

      expect(result[0].rate).toBe(0);
    });

    it("should handle very large blob responses", async () => {
      const largeContent = "A".repeat(1024 * 1024); // 1MB
      const mockBlob = new Blob([largeContent], { type: "application/pdf" });

      mockApiService.getBlob = jest.fn().mockResolvedValue(mockBlob);

      const result = await shippingService.generateLabel("order-large");

      expect(result.size).toBeGreaterThan(1000000);
    });

    it("should handle pickup locations with missing address_2", async () => {
      const mockLocations = [
        {
          pickup_location: "Simple Location",
          name: "Simple Warehouse",
          email: "simple@example.com",
          phone: "+919999999999",
          address: "Simple Address",
          address_2: "",
          city: "City",
          state: "State",
          country: "India",
          pin_code: "123456",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { shipping_address: mockLocations },
      });

      const result = await shippingService.getPickupLocations();

      expect(result[0].address_2).toBe("");
    });
  });
});
