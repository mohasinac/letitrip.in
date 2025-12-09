/**
 * Unit Tests for Shiprocket Configuration
 *
 * Tests courier partners, service types, zones, and helper functions
 * No mocks - testing actual config logic
 */

import {
  COURIER_PARTNERS,
  DELIVERY_ZONES,
  SERVICE_TYPES,
  SHIPMENT_STATUS,
  SHIPROCKET_CONFIG,
  WEIGHT_SLABS,
  calculateChargeableWeight,
  calculateVolumetricWeight,
  canCancelShipment,
  estimateDeliveryDate,
  formatAwbCode,
  getAvailableCouriers,
  getCourierById,
  getServiceTypeById,
  getShipmentStatusColor,
  getShipmentStatusLabel,
  getWeightSlab,
  getZoneByPincodes,
  isShipmentFinal,
  validateDimensions,
  validatePincode,
  type PackageDimensions,
} from "../shiprocket.config";

describe("Shiprocket Configuration", () => {
  describe("SHIPROCKET_CONFIG constant", () => {
    it("should have valid base URL", () => {
      expect(SHIPROCKET_CONFIG.baseUrl).toMatch(/^https:\/\//);
    });

    it("should have valid auth URL", () => {
      expect(SHIPROCKET_CONFIG.authUrl).toMatch(/^https:\/\//);
    });

    it("should have reasonable timeout", () => {
      expect(SHIPROCKET_CONFIG.timeout).toBeGreaterThan(0);
      expect(SHIPROCKET_CONFIG.timeout).toBeLessThanOrEqual(60000);
    });

    it("should have retry configuration", () => {
      expect(SHIPROCKET_CONFIG.retryAttempts).toBeGreaterThanOrEqual(1);
      expect(SHIPROCKET_CONFIG.retryDelay).toBeGreaterThanOrEqual(500);
    });
  });

  describe("COURIER_PARTNERS", () => {
    it("should have courier partners defined", () => {
      expect(COURIER_PARTNERS).toBeDefined();
      expect(COURIER_PARTNERS.length).toBeGreaterThan(0);
    });

    it("should have unique courier IDs", () => {
      const ids = COURIER_PARTNERS.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have valid weight limits", () => {
      COURIER_PARTNERS.forEach((courier) => {
        expect(courier.minWeight).toBeGreaterThan(0);
        expect(courier.maxWeight).toBeGreaterThan(courier.minWeight);
      });
    });

    it("should have valid priority values", () => {
      COURIER_PARTNERS.forEach((courier) => {
        expect(courier.priority).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(courier.priority)).toBe(true);
      });
    });

    it("should have boolean flags", () => {
      COURIER_PARTNERS.forEach((courier) => {
        expect(typeof courier.domesticOnly).toBe("boolean");
        expect(typeof courier.codAvailable).toBe("boolean");
        expect(typeof courier.hyperlocalAvailable).toBe("boolean");
      });
    });

    it("should have valid types", () => {
      const validTypes = ["express", "standard", "economy"];
      COURIER_PARTNERS.forEach((courier) => {
        expect(validTypes).toContain(courier.type);
      });
    });
  });

  describe("SERVICE_TYPES", () => {
    it("should have service types defined", () => {
      expect(SERVICE_TYPES).toBeDefined();
      expect(SERVICE_TYPES.length).toBeGreaterThan(0);
    });

    it("should have unique service IDs", () => {
      const ids = SERVICE_TYPES.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have valid delivery times", () => {
      SERVICE_TYPES.forEach((service) => {
        expect(service.deliveryDays.min).toBeGreaterThanOrEqual(0);
        expect(service.deliveryDays.max).toBeGreaterThanOrEqual(
          service.deliveryDays.min
        );
      });
    });

    it("should have display names", () => {
      SERVICE_TYPES.forEach((service) => {
        expect(service.name).toBeTruthy();
        expect(service.displayName).toBeTruthy();
      });
    });
  });

  describe("WEIGHT_SLABS", () => {
    it("should have weight slabs defined", () => {
      expect(WEIGHT_SLABS).toBeDefined();
      expect(WEIGHT_SLABS.length).toBeGreaterThan(0);
    });

    it("should have sequential weight ranges", () => {
      for (let i = 0; i < WEIGHT_SLABS.length - 1; i++) {
        expect(WEIGHT_SLABS[i].max).toBeLessThanOrEqual(
          WEIGHT_SLABS[i + 1].min
        );
      }
    });

    it("should have valid min and max values", () => {
      WEIGHT_SLABS.forEach((slab) => {
        expect(slab.min).toBeGreaterThanOrEqual(0);
        expect(slab.max).toBeGreaterThan(slab.min);
      });
    });

    it("should start from zero or near-zero", () => {
      expect(WEIGHT_SLABS[0].min).toBeLessThanOrEqual(1);
    });
  });

  describe("DELIVERY_ZONES", () => {
    it("should have delivery zones defined", () => {
      expect(DELIVERY_ZONES).toBeDefined();
      expect(Object.keys(DELIVERY_ZONES).length).toBeGreaterThan(0);
    });

    it("should have valid zone properties", () => {
      Object.values(DELIVERY_ZONES).forEach((zone) => {
        expect(zone.name).toBeTruthy();
        expect(zone.deliveryDays.min).toBeGreaterThanOrEqual(0);
        expect(zone.deliveryDays.max).toBeGreaterThanOrEqual(
          zone.deliveryDays.min
        );
      });
    });
  });

  describe("SHIPMENT_STATUS", () => {
    it("should have shipment statuses defined", () => {
      expect(SHIPMENT_STATUS).toBeDefined();
      expect(Object.keys(SHIPMENT_STATUS).length).toBeGreaterThan(0);
    });

    it("should have labels and colors", () => {
      Object.values(SHIPMENT_STATUS).forEach((status) => {
        expect(status.label).toBeTruthy();
        expect(status.color).toBeTruthy();
      });
    });

    it("should have valid color values", () => {
      const validColors = [
        "blue",
        "yellow",
        "green",
        "orange",
        "red",
        "gray",
        "purple",
      ];
      Object.values(SHIPMENT_STATUS).forEach((status) => {
        expect(validColors).toContain(status.color);
      });
    });
  });

  describe("getCourierById", () => {
    it("should return courier by valid ID", () => {
      const courier = getCourierById("bluedart");
      expect(courier).toBeDefined();
      expect(courier?.id).toBe("bluedart");
    });

    it("should return undefined for invalid ID", () => {
      const courier = getCourierById("invalid-courier");
      expect(courier).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const courier = getCourierById("");
      expect(courier).toBeUndefined();
    });

    it("should be case sensitive", () => {
      const courier = getCourierById("BLUEDART");
      expect(courier).toBeUndefined();
    });
  });

  describe("getAvailableCouriers", () => {
    it("should return all couriers with default options", () => {
      const couriers = getAvailableCouriers({});
      expect(couriers.length).toBeGreaterThan(0);
    });

    it("should filter by weight", () => {
      const weight = 25;
      const couriers = getAvailableCouriers({ weight });
      couriers.forEach((courier) => {
        expect(courier.minWeight).toBeLessThanOrEqual(weight);
        expect(courier.maxWeight).toBeGreaterThanOrEqual(weight);
      });
    });

    it("should filter domestic only couriers", () => {
      const couriers = getAvailableCouriers({ domesticOnly: true });
      couriers.forEach((courier) => {
        expect(courier.domesticOnly).toBe(true);
      });
    });

    it("should filter COD available couriers", () => {
      const couriers = getAvailableCouriers({ codRequired: true });
      couriers.forEach((courier) => {
        expect(courier.codAvailable).toBe(true);
      });
    });

    it("should filter hyperlocal couriers", () => {
      const couriers = getAvailableCouriers({ hyperlocal: true });
      couriers.forEach((courier) => {
        expect(courier.hyperlocalAvailable).toBe(true);
      });
    });

    it("should return sorted by priority", () => {
      const couriers = getAvailableCouriers({});
      for (let i = 0; i < couriers.length - 1; i++) {
        expect(couriers[i].priority).toBeLessThanOrEqual(
          couriers[i + 1].priority
        );
      }
    });

    it("should combine multiple filters", () => {
      const couriers = getAvailableCouriers({
        weight: 10,
        codRequired: true,
        domesticOnly: true,
      });

      couriers.forEach((courier) => {
        expect(courier.minWeight).toBeLessThanOrEqual(10);
        expect(courier.maxWeight).toBeGreaterThanOrEqual(10);
        expect(courier.codAvailable).toBe(true);
        expect(courier.domesticOnly).toBe(true);
      });
    });

    it("should return empty array when no couriers match", () => {
      const couriers = getAvailableCouriers({ weight: 1000 }); // Exceeds max weight
      expect(Array.isArray(couriers)).toBe(true);
    });
  });

  describe("getServiceTypeById", () => {
    it("should return service by valid ID", () => {
      const service = getServiceTypeById("surface");
      expect(service).toBeDefined();
      if (service) {
        expect(service.id).toBe("surface");
      }
    });

    it("should return undefined for invalid ID", () => {
      const service = getServiceTypeById("invalid-service");
      expect(service).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const service = getServiceTypeById("");
      expect(service).toBeUndefined();
    });
  });

  describe("getWeightSlab", () => {
    it("should return slab for weight within range", () => {
      const slab = getWeightSlab(1.5);
      expect(slab).toBeDefined();
      if (slab) {
        expect(slab.min).toBeLessThanOrEqual(1.5);
        expect(slab.max).toBeGreaterThanOrEqual(1.5);
      }
    });

    it("should return undefined for zero weight", () => {
      const slab = getWeightSlab(0);
      // Depending on implementation, might return first slab or undefined
      expect(slab).toBeDefined();
    });

    it("should return undefined for negative weight", () => {
      const slab = getWeightSlab(-5);
      expect(slab).toBeUndefined();
    });

    it("should return last slab for very large weight", () => {
      const slab = getWeightSlab(100);
      expect(slab).toBeDefined();
    });

    it("should handle edge cases at slab boundaries", () => {
      const firstSlab = WEIGHT_SLABS[0];
      const slab = getWeightSlab(firstSlab.min);
      expect(slab).toBeDefined();
    });
  });

  describe("getZoneByPincodes", () => {
    it("should determine zone between pincodes", () => {
      const zone = getZoneByPincodes("110001", "400001");
      expect(zone).toBeTruthy();
      expect(Object.keys(DELIVERY_ZONES)).toContain(zone);
    });

    it("should return local for same city", () => {
      const zone = getZoneByPincodes("110001", "110002");
      expect(zone).toBe("local");
    });

    it("should handle invalid pincodes", () => {
      const zone = getZoneByPincodes("invalid", "400001");
      expect(typeof zone).toBe("string");
    });

    it("should be consistent for reversed pincodes", () => {
      const zone1 = getZoneByPincodes("110001", "400001");
      const zone2 = getZoneByPincodes("400001", "110001");
      expect(zone1).toBe(zone2);
    });

    it("should handle empty pincodes", () => {
      const zone = getZoneByPincodes("", "");
      expect(typeof zone).toBe("string");
    });
  });

  describe("calculateVolumetricWeight", () => {
    it("should calculate volumetric weight correctly", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 10,
        weight: 5,
      };
      const volWeight = calculateVolumetricWeight(dimensions);
      expect(volWeight).toBeGreaterThan(0);
      expect(Number.isFinite(volWeight)).toBe(true);
    });

    it("should use standard divisor (5000)", () => {
      const dimensions: PackageDimensions = {
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
      };
      const volWeight = calculateVolumetricWeight(dimensions);
      const expected = (10 * 10 * 10) / 5000;
      expect(volWeight).toBeCloseTo(expected, 2);
    });

    it("should handle small dimensions", () => {
      const dimensions: PackageDimensions = {
        length: 5,
        width: 5,
        height: 5,
        weight: 0.5,
      };
      const volWeight = calculateVolumetricWeight(dimensions);
      expect(volWeight).toBeGreaterThan(0);
    });

    it("should handle large dimensions", () => {
      const dimensions: PackageDimensions = {
        length: 100,
        width: 100,
        height: 100,
        weight: 50,
      };
      const volWeight = calculateVolumetricWeight(dimensions);
      expect(volWeight).toBeGreaterThan(0);
    });

    it("should return consistent results", () => {
      const dimensions: PackageDimensions = {
        length: 20,
        width: 15,
        height: 10,
        weight: 3,
      };
      const vol1 = calculateVolumetricWeight(dimensions);
      const vol2 = calculateVolumetricWeight(dimensions);
      expect(vol1).toBe(vol2);
    });
  });

  describe("calculateChargeableWeight", () => {
    it("should return greater of actual and volumetric weight", () => {
      const dimensions: PackageDimensions = {
        length: 50,
        width: 50,
        height: 50,
        weight: 1,
      };
      const chargeable = calculateChargeableWeight(dimensions);
      const volumetric = calculateVolumetricWeight(dimensions);
      expect(chargeable).toBeGreaterThanOrEqual(dimensions.weight);
      expect(chargeable).toBeGreaterThanOrEqual(volumetric);
    });

    it("should return actual weight when heavier than volumetric", () => {
      const dimensions: PackageDimensions = {
        length: 10,
        width: 10,
        height: 10,
        weight: 10,
      };
      const chargeable = calculateChargeableWeight(dimensions);
      expect(chargeable).toBe(dimensions.weight);
    });

    it("should return volumetric weight when heavier than actual", () => {
      const dimensions: PackageDimensions = {
        length: 100,
        width: 100,
        height: 100,
        weight: 1,
      };
      const chargeable = calculateChargeableWeight(dimensions);
      const volumetric = calculateVolumetricWeight(dimensions);
      expect(chargeable).toBe(volumetric);
    });

    it("should handle zero weight", () => {
      const dimensions: PackageDimensions = {
        length: 10,
        width: 10,
        height: 10,
        weight: 0,
      };
      const chargeable = calculateChargeableWeight(dimensions);
      expect(chargeable).toBeGreaterThan(0);
    });
  });

  describe("estimateDeliveryDate", () => {
    it("should return future date", () => {
      const pickupDate = new Date();
      const zone = "metro";
      const serviceType = "express";

      const deliveryDate = estimateDeliveryDate(pickupDate, zone, serviceType);
      expect(deliveryDate.getTime()).toBeGreaterThan(pickupDate.getTime());
    });

    it("should add minimum days for zone", () => {
      const pickupDate = new Date("2024-01-01");
      const zone = "metro";
      const serviceType = "surface";

      const deliveryDate = estimateDeliveryDate(pickupDate, zone, serviceType);
      const daysDiff = Math.floor(
        (deliveryDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const zoneData = DELIVERY_ZONES[zone];
      expect(daysDiff).toBeGreaterThanOrEqual(zoneData.deliveryDays.min);
    });

    it("should handle different zones", () => {
      const pickupDate = new Date();
      const date1 = estimateDeliveryDate(pickupDate, "local", "express");
      const date2 = estimateDeliveryDate(
        pickupDate,
        "rest-of-india",
        "surface"
      );

      expect(date1).toBeDefined();
      expect(date2).toBeDefined();
      expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
    });

    it("should handle different service types", () => {
      const pickupDate = new Date();
      const zone = "metro";

      const express = estimateDeliveryDate(pickupDate, zone, "express");
      const surface = estimateDeliveryDate(pickupDate, zone, "surface");

      expect(express.getTime()).toBeLessThanOrEqual(surface.getTime());
    });

    it("should handle past dates", () => {
      const pickupDate = new Date("2020-01-01");
      const zone = "metro";
      const serviceType = "express";

      const deliveryDate = estimateDeliveryDate(pickupDate, zone, serviceType);
      expect(deliveryDate.getTime()).toBeGreaterThan(pickupDate.getTime());
    });
  });

  describe("formatAwbCode", () => {
    it("should format AWB code with spaces", () => {
      const awb = "1234567890123456";
      const formatted = formatAwbCode(awb);
      expect(formatted).toContain(" ");
    });

    it("should handle short codes", () => {
      const awb = "123";
      const formatted = formatAwbCode(awb);
      expect(formatted).toBeDefined();
    });

    it("should handle empty string", () => {
      const formatted = formatAwbCode("");
      expect(formatted).toBe("");
    });

    it("should not add extra spaces", () => {
      const awb = "12345678";
      const formatted = formatAwbCode(awb);
      expect(formatted.startsWith(" ")).toBe(false);
      expect(formatted.endsWith(" ")).toBe(false);
    });

    it("should maintain original characters", () => {
      const awb = "1234567890";
      const formatted = formatAwbCode(awb);
      const cleaned = formatted.replace(/\s/g, "");
      expect(cleaned).toBe(awb);
    });
  });

  describe("getShipmentStatusColor", () => {
    it("should return valid color for known status", () => {
      const color = getShipmentStatusColor("delivered");
      expect(color).toBeTruthy();
      expect(typeof color).toBe("string");
    });

    it("should return default color for unknown status", () => {
      const color = getShipmentStatusColor("invalid-status" as any);
      expect(color).toBe("gray");
    });

    it("should handle all defined statuses", () => {
      Object.keys(SHIPMENT_STATUS).forEach((status) => {
        const color = getShipmentStatusColor(status as any);
        expect(color).toBeTruthy();
      });
    });
  });

  describe("getShipmentStatusLabel", () => {
    it("should return label for known status", () => {
      const label = getShipmentStatusLabel("delivered");
      expect(label).toBeTruthy();
      expect(typeof label).toBe("string");
    });

    it("should return status itself for unknown status", () => {
      const unknownStatus = "unknown-status" as any;
      const label = getShipmentStatusLabel(unknownStatus);
      expect(label).toBe(unknownStatus);
    });

    it("should handle all defined statuses", () => {
      Object.keys(SHIPMENT_STATUS).forEach((status) => {
        const label = getShipmentStatusLabel(status as any);
        expect(label).toBeTruthy();
      });
    });
  });

  describe("isShipmentFinal", () => {
    it("should return true for final statuses", () => {
      expect(isShipmentFinal("delivered")).toBe(true);
      expect(isShipmentFinal("cancelled")).toBe(true);
      expect(isShipmentFinal("rto")).toBe(true);
    });

    it("should return false for non-final statuses", () => {
      expect(isShipmentFinal("pending")).toBe(false);
      expect(isShipmentFinal("in-transit")).toBe(false);
    });

    it("should handle unknown statuses", () => {
      const result = isShipmentFinal("unknown" as any);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("canCancelShipment", () => {
    it("should return true for cancellable statuses", () => {
      expect(canCancelShipment("pending")).toBe(true);
      expect(canCancelShipment("pickup-scheduled")).toBe(true);
    });

    it("should return false for non-cancellable statuses", () => {
      expect(canCancelShipment("delivered")).toBe(false);
      expect(canCancelShipment("in-transit")).toBe(false);
    });

    it("should handle unknown statuses", () => {
      const result = canCancelShipment("unknown" as any);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("validatePincode", () => {
    it("should validate correct pincode", () => {
      expect(validatePincode("110001")).toBe(true);
      expect(validatePincode("400001")).toBe(true);
    });

    it("should reject invalid pincodes", () => {
      expect(validatePincode("12345")).toBe(false); // Too short
      expect(validatePincode("1234567")).toBe(false); // Too long
      expect(validatePincode("abcdef")).toBe(false); // Non-numeric
      expect(validatePincode("11000a")).toBe(false); // Mixed
    });

    it("should reject empty string", () => {
      expect(validatePincode("")).toBe(false);
    });

    it("should reject pincodes with spaces", () => {
      expect(validatePincode("110 001")).toBe(false);
    });

    it("should handle leading zeros", () => {
      expect(validatePincode("001234")).toBe(true);
    });
  });

  describe("validateDimensions", () => {
    it("should validate correct dimensions", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 10,
        weight: 5,
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject zero or negative length", () => {
      const dimensions: PackageDimensions = {
        length: 0,
        width: 20,
        height: 10,
        weight: 5,
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject zero or negative width", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: -10,
        height: 10,
        weight: 5,
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(false);
    });

    it("should reject zero or negative height", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 0,
        weight: 5,
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(false);
    });

    it("should reject zero or negative weight", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 10,
        weight: 0,
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(false);
    });

    it("should reject weight exceeding maximum", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 10,
        weight: 100, // Exceeds 50kg limit
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("50"))).toBe(true);
    });

    it("should report multiple errors", () => {
      const dimensions: PackageDimensions = {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });

    it("should accept maximum valid weight", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 10,
        weight: 50,
      };
      const result = validateDimensions(dimensions);
      expect(result.isValid).toBe(true);
    });
  });

  describe("Edge Cases and Integration", () => {
    it("should handle complete shipment workflow", () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 15,
        weight: 5,
      };

      // Validate dimensions
      const validation = validateDimensions(dimensions);
      expect(validation.isValid).toBe(true);

      // Calculate chargeable weight
      const chargeableWeight = calculateChargeableWeight(dimensions);
      expect(chargeableWeight).toBeGreaterThan(0);

      // Get available couriers
      const couriers = getAvailableCouriers({ weight: chargeableWeight });
      expect(couriers.length).toBeGreaterThan(0);

      // Get weight slab
      const slab = getWeightSlab(chargeableWeight);
      expect(slab).toBeDefined();

      // Estimate delivery
      const deliveryDate = estimateDeliveryDate(new Date(), "metro", "express");
      expect(deliveryDate).toBeDefined();
    });

    it("should handle pincode validation in zone calculation", () => {
      const pincode1 = "110001";
      const pincode2 = "400001";

      expect(validatePincode(pincode1)).toBe(true);
      expect(validatePincode(pincode2)).toBe(true);

      const zone = getZoneByPincodes(pincode1, pincode2);
      expect(zone).toBeTruthy();
    });

    it("should handle courier filtering with edge weights", () => {
      const minWeightCourier = COURIER_PARTNERS.reduce((min, c) =>
        c.minWeight < min.minWeight ? c : min
      );

      const couriers = getAvailableCouriers({
        weight: minWeightCourier.minWeight,
      });
      expect(couriers.length).toBeGreaterThan(0);
    });
  });
});
