/**
 * Shipping Service Tests
 *
 * Tests Shiprocket integration service
 */

import { apiService } from "../api.service";
import { shippingService } from "../shipping.service";

jest.mock("../api.service");

describe("ShippingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCourierOptions", () => {
    it("should fetch available courier options for an order", async () => {
      const mockResponse = {
        success: true,
        data: {
          available_courier_companies: [
            {
              courier_company_id: 1,
              courier_name: "Fedex",
              rate: 150,
              estimated_delivery_days: 3,
              is_surface: false,
              is_rto_available: true,
            },
            {
              courier_company_id: 2,
              courier_name: "DTDC",
              rate: 100,
              estimated_delivery_days: 5,
              is_surface: true,
              is_rto_available: true,
            },
          ],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shippingService.getCourierOptions("order1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/seller/shipping/couriers/order1"
      );
      expect(result).toHaveLength(2);
      expect(result[0].courier_name).toBe("Fedex");
      expect(result[1].courier_name).toBe("DTDC");
    });

    it("should throw error if fetch fails", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid order ID",
      });

      await expect(
        shippingService.getCourierOptions("invalid")
      ).rejects.toThrow("Invalid order ID");
    });

    it("should throw generic error if no error message", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ success: false });

      await expect(shippingService.getCourierOptions("order1")).rejects.toThrow(
        "Failed to fetch courier options"
      );
    });
  });

  describe("generateAWB", () => {
    it("should generate AWB for an order with selected courier", async () => {
      const mockResponse = {
        success: true,
        data: {
          awb_code: "AWB123456789",
          courier_company_id: 1,
          courier_name: "Fedex",
          response: {
            data: {
              awb_assign_status: 1,
              awb_code: "AWB123456789",
              child_courier_name: "Fedex Surface",
            },
          },
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shippingService.generateAWB("order1", 1);

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/seller/shipping/awb/order1",
        { courier_id: 1 }
      );
      expect(result.awb_code).toBe("AWB123456789");
      expect(result.courier_name).toBe("Fedex");
    });

    it("should throw error if AWB generation fails", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "Courier service unavailable",
      });

      await expect(shippingService.generateAWB("order1", 99)).rejects.toThrow(
        "Courier service unavailable"
      );
    });

    it("should throw generic error if no error message", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({ success: false });

      await expect(shippingService.generateAWB("order1", 1)).rejects.toThrow(
        "Failed to generate AWB"
      );
    });
  });

  describe("schedulePickup", () => {
    it("should schedule pickup for an order", async () => {
      const mockResponse = {
        success: true,
        data: {
          pickup_scheduled_date: "2024-12-15",
          pickup_token_number: "PKP123456",
          status: "Pickup scheduled",
          response_code: 200,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shippingService.schedulePickup("order1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/seller/shipping/pickup/order1",
        {}
      );
      expect(result.pickup_token_number).toBe("PKP123456");
      expect(result.status).toBe("Pickup scheduled");
    });

    it("should throw error if pickup scheduling fails", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "No AWB generated yet",
      });

      await expect(shippingService.schedulePickup("order1")).rejects.toThrow(
        "No AWB generated yet"
      );
    });

    it("should throw generic error if no error message", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({ success: false });

      await expect(shippingService.schedulePickup("order1")).rejects.toThrow(
        "Failed to schedule pickup"
      );
    });
  });

  describe("getTracking", () => {
    it("should fetch tracking information for a shipment", async () => {
      const mockResponse = {
        success: true,
        data: {
          tracking_data: {
            current_status: "In Transit",
            shipment_status: 6,
            shipment_track: [
              {
                current_status: "Pickup Done",
                date: "2024-12-10T10:00:00Z",
                status: "Pickup Done",
                activity: "Package picked up",
                location: "Mumbai",
              },
              {
                current_status: "In Transit",
                date: "2024-12-11T14:30:00Z",
                status: "In Transit",
                activity: "Reached sorting facility",
                location: "Delhi",
              },
            ],
            track_url: "https://shiprocket.co/tracking/AWB123",
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shippingService.getTracking("AWB123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/seller/shipping/track/AWB123"
      );
      expect(result.current_status).toBe("In Transit");
      expect(result.shipment_track).toHaveLength(2);
      expect(result.track_url).toBe("https://shiprocket.co/tracking/AWB123");
    });

    it("should throw error if tracking fetch fails", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid AWB code",
      });

      await expect(shippingService.getTracking("INVALID")).rejects.toThrow(
        "Invalid AWB code"
      );
    });

    it("should throw generic error if no error message", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ success: false });

      await expect(shippingService.getTracking("AWB123")).rejects.toThrow(
        "Failed to fetch tracking info"
      );
    });
  });

  describe("generateLabel", () => {
    let originalFetch: typeof global.fetch;

    beforeAll(() => {
      originalFetch = global.fetch;
    });

    afterAll(() => {
      global.fetch = originalFetch;
    });

    it("should generate and download shipping label", async () => {
      const mockBlob = new Blob(["PDF content"], { type: "application/pdf" });

      (apiService.getBlob as jest.Mock).mockResolvedValue(mockBlob);

      const result = await shippingService.generateLabel("order1");

      expect(apiService.getBlob).toHaveBeenCalledWith(
        "/api/seller/shipping/label/order1"
      );
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("application/pdf");
    });

    it("should throw error if label generation fails", async () => {
      (apiService.getBlob as jest.Mock).mockRejectedValue(
        new Error("Failed to generate label")
      );

      await expect(shippingService.generateLabel("invalid")).rejects.toThrow(
        "Failed to generate label"
      );
    });
  });

  describe("getPickupLocations", () => {
    it("should fetch available pickup locations", async () => {
      const mockResponse = {
        success: true,
        data: {
          shipping_address: [
            {
              pickup_location: "Warehouse 1",
              name: "Main Warehouse",
              email: "warehouse@example.com",
              phone: "+919876543210",
              address: "123 Main St",
              address_2: "Building A",
              city: "Mumbai",
              state: "Maharashtra",
              country: "India",
              pin_code: "400001",
            },
            {
              pickup_location: "Warehouse 2",
              name: "Secondary Warehouse",
              email: "warehouse2@example.com",
              phone: "+919876543211",
              address: "456 Side St",
              address_2: "",
              city: "Delhi",
              state: "Delhi",
              country: "India",
              pin_code: "110001",
            },
          ],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shippingService.getPickupLocations();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/seller/shipping/pickup-locations"
      );
      expect(result).toHaveLength(2);
      expect(result[0].pickup_location).toBe("Warehouse 1");
      expect(result[1].city).toBe("Delhi");
    });

    it("should throw error if fetch fails", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "No locations configured",
      });

      await expect(shippingService.getPickupLocations()).rejects.toThrow(
        "No locations configured"
      );
    });

    it("should throw generic error if no error message", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ success: false });

      await expect(shippingService.getPickupLocations()).rejects.toThrow(
        "Failed to fetch pickup locations"
      );
    });
  });
});
