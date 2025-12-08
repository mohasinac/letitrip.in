import type {
  CourierRate,
  PickupLocation,
  RateCalculationParams,
  ShipmentOrderParams,
  ShippingLabel,
  TrackingDetails,
} from "@/config/shiprocket.config";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "../api.service";
import { shiprocketService } from "../shiprocket.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("ShiprocketService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRateParams: RateCalculationParams = {
    pickupPincode: "400001",
    deliveryPincode: "110001",
    weight: 1.5,
    length: 20,
    breadth: 15,
    height: 10,
    codAmount: 500,
  };

  const mockCourierRate: CourierRate = {
    courier_company_id: 1,
    courier_name: "BlueDart",
    rate: 85.5,
    estimated_delivery_days: "3-4",
    recommended: true,
    cod_charges: 20,
    cod_multiplier: 0.02,
    base_courier_id: 1,
    min_weight: 0.5,
    freight_charge: 65.5,
  };

  const mockPickupLocation: PickupLocation = {
    id: "loc_123",
    nickname: "Mumbai Warehouse",
    name: "John Doe",
    email: "john@example.com",
    phone: "+919876543210",
    address: "123 MG Road",
    address_2: "Near Station",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pin_code: "400001",
  };

  const mockTrackingDetails: TrackingDetails = {
    awb_code: "AWB123456",
    courier_name: "BlueDart",
    current_status: "In Transit",
    shipment_status: 5,
    delivered_date: null,
    expected_delivery_date: "2024-12-10",
    scans: [
      {
        date: "2024-12-08",
        activity: "Shipment Picked Up",
        location: "Mumbai Hub",
      },
    ],
  };

  describe("calculateRates", () => {
    it("should calculate shipping rates successfully", async () => {
      const mockRates = [mockCourierRate];
      (apiService.post as jest.Mock).mockResolvedValue(mockRates);

      const result = await shiprocketService.calculateRates(mockRateParams);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/calculate-rates",
        mockRateParams
      );
      expect(result).toEqual(mockRates);
    });

    it("should return empty array if no rates available", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.calculateRates(mockRateParams);

      expect(result).toEqual([]);
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Rate calculation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.calculateRates(mockRateParams)
      ).rejects.toThrow("Rate calculation failed");

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.calculateRates",
        params: mockRateParams,
      });
    });

    it("should handle multiple courier rates", async () => {
      const mockRates = [
        mockCourierRate,
        { ...mockCourierRate, courier_company_id: 2, recommended: false },
      ];
      (apiService.post as jest.Mock).mockResolvedValue(mockRates);

      const result = await shiprocketService.calculateRates(mockRateParams);

      expect(result).toHaveLength(2);
    });
  });

  describe("getRecommendedCourier", () => {
    it("should return recommended courier", async () => {
      const mockRates = [
        mockCourierRate,
        { ...mockCourierRate, courier_company_id: 2, recommended: false },
      ];
      (apiService.post as jest.Mock).mockResolvedValue(mockRates);

      const result = await shiprocketService.getRecommendedCourier(
        mockRateParams
      );

      expect(result).toEqual(mockCourierRate);
      expect(result?.recommended).toBe(true);
    });

    it("should return first courier if none recommended", async () => {
      const unRecommendedRate = { ...mockCourierRate, recommended: false };
      const mockRates = [unRecommendedRate];
      (apiService.post as jest.Mock).mockResolvedValue(mockRates);

      const result = await shiprocketService.getRecommendedCourier(
        mockRateParams
      );

      expect(result).toEqual(unRecommendedRate);
    });

    it("should return null if no rates available", async () => {
      (apiService.post as jest.Mock).mockResolvedValue([]);

      const result = await shiprocketService.getRecommendedCourier(
        mockRateParams
      );

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Network error");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.getRecommendedCourier(
        mockRateParams
      );

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("createOrder", () => {
    const mockOrderParams: ShipmentOrderParams = {
      orderId: "ORD123",
      orderDate: "2024-12-08",
      pickupLocation: "loc_123",
      billingCustomerName: "Jane Doe",
      billingAddress: "456 Park Street",
      billingCity: "Delhi",
      billingState: "Delhi",
      billingPincode: "110001",
      billingCountry: "India",
      billingEmail: "jane@example.com",
      billingPhone: "+919123456789",
      shippingIsBilling: true,
      orderItems: [
        {
          name: "Product 1",
          sku: "SKU123",
          units: 2,
          selling_price: 500,
        },
      ],
      paymentMethod: "prepaid",
      subTotal: 1000,
      length: 20,
      breadth: 15,
      height: 10,
      weight: 1.5,
    };

    it("should create shipment order successfully", async () => {
      const mockResponse = {
        orderId: "ORD123",
        shipmentId: "SHIP123",
        status: "Created",
        awbAssignStatus: "Pending",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.createOrder(mockOrderParams);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/create-order",
        mockOrderParams
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        shiprocketService.createOrder(mockOrderParams)
      ).rejects.toThrow("Failed to create shipment order");
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Order creation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.createOrder(mockOrderParams)
      ).rejects.toThrow("Order creation failed");

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.createOrder",
        orderId: mockOrderParams.orderId,
      });
    });
  });

  describe("generateAWB", () => {
    it("should generate AWB successfully", async () => {
      const mockResponse = {
        awbCode: "AWB123456",
        courierName: "BlueDart",
        courierCompanyId: 1,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.generateAWB("SHIP123");

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/generate-awb",
        {
          shipmentId: "SHIP123",
          courierId: undefined,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should generate AWB with specific courier", async () => {
      const mockResponse = {
        awbCode: "AWB123456",
        courierName: "BlueDart",
        courierCompanyId: 1,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.generateAWB("SHIP123", 1);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/generate-awb",
        {
          shipmentId: "SHIP123",
          courierId: 1,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(shiprocketService.generateAWB("SHIP123")).rejects.toThrow(
        "Failed to generate AWB"
      );
    });

    it("should handle errors and log them", async () => {
      const error = new Error("AWB generation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(shiprocketService.generateAWB("SHIP123", 1)).rejects.toThrow(
        "AWB generation failed"
      );

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.generateAWB",
        shipmentId: "SHIP123",
        courierId: 1,
      });
    });
  });

  describe("schedulePickup", () => {
    it("should schedule pickup successfully", async () => {
      const mockResponse = {
        pickupId: "PICK123",
        pickupScheduledDate: "2024-12-09",
        status: "Scheduled",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.schedulePickup(["SHIP123"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/schedule-pickup",
        {
          shipmentIds: ["SHIP123"],
          pickupDate: undefined,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should schedule pickup with specific date", async () => {
      const pickupDate = new Date("2024-12-10");
      const mockResponse = {
        pickupId: "PICK123",
        pickupScheduledDate: "2024-12-10",
        status: "Scheduled",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.schedulePickup(
        ["SHIP123"],
        pickupDate
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/schedule-pickup",
        {
          shipmentIds: ["SHIP123"],
          pickupDate: pickupDate.toISOString(),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should schedule pickup for multiple shipments", async () => {
      const mockResponse = {
        pickupId: "PICK123",
        pickupScheduledDate: "2024-12-09",
        status: "Scheduled",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await shiprocketService.schedulePickup(["SHIP123", "SHIP124"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/schedule-pickup",
        {
          shipmentIds: ["SHIP123", "SHIP124"],
          pickupDate: undefined,
        }
      );
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        shiprocketService.schedulePickup(["SHIP123"])
      ).rejects.toThrow("Failed to schedule pickup");
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Pickup scheduling failed");
      const pickupDate = new Date("2024-12-10");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.schedulePickup(["SHIP123"], pickupDate)
      ).rejects.toThrow("Pickup scheduling failed");

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.schedulePickup",
        shipmentIds: ["SHIP123"],
        pickupDate,
      });
    });
  });

  describe("trackShipment", () => {
    it("should track shipment successfully", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(mockTrackingDetails);

      const result = await shiprocketService.trackShipment("AWB123456");

      expect(apiService.get).toHaveBeenCalledWith(
        "/shipping/shiprocket/track/AWB123456"
      );
      expect(result).toEqual(mockTrackingDetails);
    });

    it("should return null if response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.trackShipment("AWB123456");

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Tracking failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.trackShipment("AWB123456");

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.trackShipment",
        awbCode: "AWB123456",
      });
    });
  });

  describe("trackByOrderId", () => {
    it("should track shipments by order ID", async () => {
      const mockTrackings = [mockTrackingDetails];
      (apiService.get as jest.Mock).mockResolvedValue(mockTrackings);

      const result = await shiprocketService.trackByOrderId("ORD123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/shipping/shiprocket/track/order/ORD123"
      );
      expect(result).toEqual(mockTrackings);
    });

    it("should return empty array if response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.trackByOrderId("ORD123");

      expect(result).toEqual([]);
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Tracking failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.trackByOrderId("ORD123");

      expect(result).toEqual([]);
      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.trackByOrderId",
        orderId: "ORD123",
      });
    });
  });

  describe("cancelOrder", () => {
    it("should cancel order successfully", async () => {
      const mockResponse = {
        orderId: "ORD123",
        status: "Cancelled",
        message: "Order cancelled successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.cancelOrder("ORD123");

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/cancel-order",
        { orderId: "ORD123" }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(shiprocketService.cancelOrder("ORD123")).rejects.toThrow(
        "Failed to cancel shipment"
      );
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Cancellation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(shiprocketService.cancelOrder("ORD123")).rejects.toThrow(
        "Cancellation failed"
      );

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.cancelOrder",
        orderId: "ORD123",
      });
    });
  });

  describe("generateLabel", () => {
    it("should generate shipping label successfully", async () => {
      const mockResponse = {
        labelUrl: "https://example.com/label.pdf",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.generateLabel(["SHIP123"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/generate-label",
        { shipmentIds: ["SHIP123"] }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should generate label for multiple shipments", async () => {
      const mockResponse = {
        labelUrl: "https://example.com/label.pdf",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await shiprocketService.generateLabel(["SHIP123", "SHIP124"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/generate-label",
        { shipmentIds: ["SHIP123", "SHIP124"] }
      );
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        shiprocketService.generateLabel(["SHIP123"])
      ).rejects.toThrow("Failed to generate label");
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Label generation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.generateLabel(["SHIP123"])
      ).rejects.toThrow("Label generation failed");

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.generateLabel",
        shipmentIds: ["SHIP123"],
      });
    });
  });

  describe("generateManifest", () => {
    it("should generate manifest successfully", async () => {
      const mockResponse = {
        manifestUrl: "https://example.com/manifest.pdf",
        manifestId: "MAN123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.generateManifest(["SHIP123"]);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/generate-manifest",
        { shipmentIds: ["SHIP123"] }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        shiprocketService.generateManifest(["SHIP123"])
      ).rejects.toThrow("Failed to generate manifest");
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Manifest generation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.generateManifest(["SHIP123"])
      ).rejects.toThrow("Manifest generation failed");

      expect(logError).toHaveBeenCalled();
    });
  });

  describe("getPickupLocations", () => {
    it("should fetch pickup locations successfully", async () => {
      const mockLocations = [mockPickupLocation];
      (apiService.get as jest.Mock).mockResolvedValue(mockLocations);

      const result = await shiprocketService.getPickupLocations();

      expect(apiService.get).toHaveBeenCalledWith(
        "/shipping/shiprocket/pickup-locations"
      );
      expect(result).toEqual(mockLocations);
    });

    it("should return empty array if response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.getPickupLocations();

      expect(result).toEqual([]);
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Fetch failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.getPickupLocations();

      expect(result).toEqual([]);
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("createPickupLocation", () => {
    const newLocation = {
      nickname: "Delhi Warehouse",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+919123456789",
      address: "456 Park Street",
      address_2: "",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      pin_code: "110001",
    };

    it("should create pickup location successfully", async () => {
      const mockResponse = { ...newLocation, id: "loc_456" };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.createPickupLocation(newLocation);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/pickup-locations",
        newLocation
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        shiprocketService.createPickupLocation(newLocation)
      ).rejects.toThrow("Failed to create pickup location");
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Creation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.createPickupLocation(newLocation)
      ).rejects.toThrow("Creation failed");

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.createPickupLocation",
        location: newLocation,
      });
    });
  });

  describe("updatePickupLocation", () => {
    it("should update pickup location successfully", async () => {
      const updates = { nickname: "Updated Warehouse" };
      const mockResponse = { ...mockPickupLocation, ...updates };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.updatePickupLocation(
        "loc_123",
        updates
      );

      expect(apiService.put).toHaveBeenCalledWith(
        "/shipping/shiprocket/pickup-locations/loc_123",
        updates
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if response is null", async () => {
      (apiService.put as jest.Mock).mockResolvedValue(null);

      await expect(
        shiprocketService.updatePickupLocation("loc_123", {})
      ).rejects.toThrow("Failed to update pickup location");
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Update failed");
      const updates = { nickname: "Updated" };
      (apiService.put as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.updatePickupLocation("loc_123", updates)
      ).rejects.toThrow("Update failed");

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.updatePickupLocation",
        locationId: "loc_123",
        updates,
      });
    });
  });

  describe("deletePickupLocation", () => {
    it("should delete pickup location successfully", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({});

      const result = await shiprocketService.deletePickupLocation("loc_123");

      expect(apiService.delete).toHaveBeenCalledWith(
        "/shipping/shiprocket/pickup-locations/loc_123"
      );
      expect(result).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Delete failed");
      (apiService.delete as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.deletePickupLocation("loc_123");

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.deletePickupLocation",
        locationId: "loc_123",
      });
    });
  });

  describe("getShipmentByOrderId", () => {
    it("should fetch shipment by order ID", async () => {
      const mockShipment: ShippingLabel = {
        shipment_id: "SHIP123",
        awb_code: "AWB123456",
        courier_name: "BlueDart",
        order_id: "ORD123",
        status: "In Transit",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockShipment);

      const result = await shiprocketService.getShipmentByOrderId("ORD123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/shipping/shiprocket/shipments/order/ORD123"
      );
      expect(result).toEqual(mockShipment);
    });

    it("should return null if response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.getShipmentByOrderId("ORD123");

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Fetch failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.getShipmentByOrderId("ORD123");

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("getAllShipments", () => {
    it("should fetch all shipments with default pagination", async () => {
      const mockResponse = {
        shipments: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.getAllShipments();

      expect(apiService.get).toHaveBeenCalledWith(
        "/shipping/shiprocket/shipments?"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should fetch shipments with filters", async () => {
      const filters = {
        status: "In Transit",
        startDate: new Date("2024-12-01"),
        endDate: new Date("2024-12-31"),
        page: 2,
        limit: 20,
      };

      const mockResponse = {
        shipments: [],
        total: 0,
        page: 2,
        totalPages: 0,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.getAllShipments(filters);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=In")
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return default response if null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.getAllShipments();

      expect(result).toEqual({
        shipments: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Fetch failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.getAllShipments();

      expect(result).toEqual({
        shipments: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("requestReturn", () => {
    it("should request return pickup successfully", async () => {
      const mockResponse = {
        pickupId: "PICK123",
        pickupScheduledDate: "2024-12-10",
        status: "Scheduled",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.requestReturn(
        "ORD123",
        "Defective product"
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/request-return",
        {
          orderId: "ORD123",
          reason: "Defective product",
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if response is null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      await expect(
        shiprocketService.requestReturn("ORD123", "Defective")
      ).rejects.toThrow("Failed to request return pickup");
    });

    it("should handle errors and log them", async () => {
      const error = new Error("Return request failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        shiprocketService.requestReturn("ORD123", "Defective")
      ).rejects.toThrow("Return request failed");

      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.requestReturn",
        orderId: "ORD123",
        reason: "Defective",
      });
    });
  });

  describe("checkServiceability", () => {
    it("should check serviceability successfully", async () => {
      const params = {
        pickupPincode: "400001",
        deliveryPincode: "110001",
        weight: 1.5,
        codAmount: 500,
      };

      const mockResponse = {
        isServiceable: true,
        availableCouriers: ["BlueDart", "Delhivery"],
        estimatedDeliveryDays: 3,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.checkServiceability(params);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/check-serviceability",
        params
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return default response if null", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.checkServiceability({
        pickupPincode: "400001",
        deliveryPincode: "110001",
        weight: 1.5,
      });

      expect(result).toEqual({
        isServiceable: false,
        availableCouriers: [],
        estimatedDeliveryDays: 0,
      });
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Check failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.checkServiceability({
        pickupPincode: "400001",
        deliveryPincode: "110001",
        weight: 1.5,
      });

      expect(result).toEqual({
        isServiceable: false,
        availableCouriers: [],
        estimatedDeliveryDays: 0,
      });
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("getNDRDetails", () => {
    it("should fetch NDR details successfully", async () => {
      const mockResponse = {
        ndrStatus: "Pending",
        ndrReason: "Customer not available",
        actionTaken: "Reattempt scheduled",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shiprocketService.getNDRDetails("AWB123456");

      expect(apiService.get).toHaveBeenCalledWith(
        "/shipping/shiprocket/ndr/AWB123456"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return null if response is null", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await shiprocketService.getNDRDetails("AWB123456");

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Fetch failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.getNDRDetails("AWB123456");

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("actionNDR", () => {
    it("should take reattempt action on NDR", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      const result = await shiprocketService.actionNDR(
        "AWB123456",
        "reattempt",
        {
          reattemptDate: new Date("2024-12-10"),
        }
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/ndr/AWB123456/action",
        {
          action: "reattempt",
          reattemptDate: new Date("2024-12-10"),
        }
      );
      expect(result).toBe(true);
    });

    it("should take RTO action on NDR", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      const result = await shiprocketService.actionNDR("AWB123456", "rto");

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/ndr/AWB123456/action",
        {
          action: "rto",
        }
      );
      expect(result).toBe(true);
    });

    it("should take reroute action with new address", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});

      const result = await shiprocketService.actionNDR("AWB123456", "reroute", {
        newAddress: "789 New Street",
        newPhone: "+919999888877",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/shipping/shiprocket/ndr/AWB123456/action",
        {
          action: "reroute",
          newAddress: "789 New Street",
          newPhone: "+919999888877",
        }
      );
      expect(result).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Action failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      const result = await shiprocketService.actionNDR(
        "AWB123456",
        "reattempt"
      );

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(error, {
        service: "ShiprocketService.actionNDR",
        awbCode: "AWB123456",
        action: "reattempt",
        params: undefined,
      });
    });
  });
});
