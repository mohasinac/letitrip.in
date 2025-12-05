/**
 * Shiprocket Service
 *
 * @status IMPLEMENTED
 * @task 1.3.1
 *
 * Client-side service for Shiprocket shipping operations:
 * - Authentication
 * - Rate calculation
 * - Order creation
 * - AWB generation
 * - Pickup scheduling
 * - Tracking
 * - Label generation
 */

import type {
  CourierPartnerId,
  CourierRate,
  PickupLocation,
  RateCalculationParams,
  ShipmentOrderParams,
  ShippingLabel,
  TrackingDetails,
} from "@/config/shiprocket.config";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";

// ============================================================================
// TYPES
// ============================================================================

interface ShiprocketAuthResponse {
  token: string;
  expiresAt: Date;
}

interface CreateOrderResponse {
  orderId: string;
  shipmentId: string;
  status: string;
  awbAssignStatus: string;
  awbCode?: string;
}

interface GenerateAWBResponse {
  awbCode: string;
  courierName: string;
  courierCompanyId: number;
}

interface SchedulePickupResponse {
  pickupId: string;
  pickupScheduledDate: string;
  status: string;
}

interface CancelOrderResponse {
  orderId: string;
  status: string;
  message: string;
}

interface ManifestResponse {
  manifestUrl: string;
  manifestId: string;
}

interface PrintLabelResponse {
  labelUrl: string;
}

// ============================================================================
// SHIPROCKET SERVICE CLASS
// ============================================================================

class ShiprocketService {
  /**
   * Calculate shipping rates
   */
  async calculateRates(params: RateCalculationParams): Promise<CourierRate[]> {
    try {
      const response = await apiService.post<CourierRate[]>(
        "/shipping/shiprocket/calculate-rates",
        params
      );
      return response || [];
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.calculateRates",
        params,
      });
      throw error;
    }
  }

  /**
   * Get recommended courier for shipment
   */
  async getRecommendedCourier(
    params: RateCalculationParams
  ): Promise<CourierRate | null> {
    try {
      const rates = await this.calculateRates(params);
      return rates.find((rate) => rate.recommended) || rates[0] || null;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.getRecommendedCourier",
        params,
      });
      return null;
    }
  }

  /**
   * Create shipment order
   */
  async createOrder(params: ShipmentOrderParams): Promise<CreateOrderResponse> {
    try {
      const response = await apiService.post<CreateOrderResponse>(
        "/shipping/shiprocket/create-order",
        params
      );

      if (!response) {
        throw new Error("Failed to create shipment order");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.createOrder",
        orderId: params.orderId,
      });
      throw error;
    }
  }

  /**
   * Generate AWB (Air Waybill) for shipment
   */
  async generateAWB(
    shipmentId: string,
    courierId?: CourierPartnerId
  ): Promise<GenerateAWBResponse> {
    try {
      const response = await apiService.post<GenerateAWBResponse>(
        "/shipping/shiprocket/generate-awb",
        {
          shipmentId,
          courierId,
        }
      );

      if (!response) {
        throw new Error("Failed to generate AWB");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.generateAWB",
        shipmentId,
        courierId,
      });
      throw error;
    }
  }

  /**
   * Schedule pickup for shipment
   */
  async schedulePickup(
    shipmentIds: string[],
    pickupDate?: Date
  ): Promise<SchedulePickupResponse> {
    try {
      const response = await apiService.post<SchedulePickupResponse>(
        "/shipping/shiprocket/schedule-pickup",
        {
          shipmentIds,
          pickupDate: pickupDate?.toISOString(),
        }
      );

      if (!response) {
        throw new Error("Failed to schedule pickup");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.schedulePickup",
        shipmentIds,
        pickupDate,
      });
      throw error;
    }
  }

  /**
   * Track shipment by AWB code
   */
  async trackShipment(awbCode: string): Promise<TrackingDetails | null> {
    try {
      const response = await apiService.get<TrackingDetails>(
        `/shipping/shiprocket/track/${awbCode}`
      );
      return response || null;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.trackShipment",
        awbCode,
      });
      return null;
    }
  }

  /**
   * Track multiple shipments by order ID
   */
  async trackByOrderId(orderId: string): Promise<TrackingDetails[]> {
    try {
      const response = await apiService.get<TrackingDetails[]>(
        `/shipping/shiprocket/track/order/${orderId}`
      );
      return response || [];
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.trackByOrderId",
        orderId,
      });
      return [];
    }
  }

  /**
   * Cancel shipment
   */
  async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
    try {
      const response = await apiService.post<CancelOrderResponse>(
        "/shipping/shiprocket/cancel-order",
        { orderId }
      );

      if (!response) {
        throw new Error("Failed to cancel shipment");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.cancelOrder",
        orderId,
      });
      throw error;
    }
  }

  /**
   * Generate shipping label
   */
  async generateLabel(shipmentIds: string[]): Promise<PrintLabelResponse> {
    try {
      const response = await apiService.post<PrintLabelResponse>(
        "/shipping/shiprocket/generate-label",
        { shipmentIds }
      );

      if (!response) {
        throw new Error("Failed to generate label");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.generateLabel",
        shipmentIds,
      });
      throw error;
    }
  }

  /**
   * Generate manifest
   */
  async generateManifest(shipmentIds: string[]): Promise<ManifestResponse> {
    try {
      const response = await apiService.post<ManifestResponse>(
        "/shipping/shiprocket/generate-manifest",
        { shipmentIds }
      );

      if (!response) {
        throw new Error("Failed to generate manifest");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.generateManifest",
        shipmentIds,
      });
      throw error;
    }
  }

  /**
   * Get pickup locations
   */
  async getPickupLocations(): Promise<PickupLocation[]> {
    try {
      const response = await apiService.get<PickupLocation[]>(
        "/shipping/shiprocket/pickup-locations"
      );
      return response || [];
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.getPickupLocations",
      });
      return [];
    }
  }

  /**
   * Create pickup location
   */
  async createPickupLocation(
    location: Omit<PickupLocation, "id">
  ): Promise<PickupLocation> {
    try {
      const response = await apiService.post<PickupLocation>(
        "/shipping/shiprocket/pickup-locations",
        location
      );

      if (!response) {
        throw new Error("Failed to create pickup location");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.createPickupLocation",
        location,
      });
      throw error;
    }
  }

  /**
   * Update pickup location
   */
  async updatePickupLocation(
    locationId: string,
    updates: Partial<PickupLocation>
  ): Promise<PickupLocation> {
    try {
      const response = await apiService.put<PickupLocation>(
        `/shipping/shiprocket/pickup-locations/${locationId}`,
        updates
      );

      if (!response) {
        throw new Error("Failed to update pickup location");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.updatePickupLocation",
        locationId,
        updates,
      });
      throw error;
    }
  }

  /**
   * Delete pickup location
   */
  async deletePickupLocation(locationId: string): Promise<boolean> {
    try {
      await apiService.delete(
        `/shipping/shiprocket/pickup-locations/${locationId}`
      );
      return true;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.deletePickupLocation",
        locationId,
      });
      return false;
    }
  }

  /**
   * Get shipment by order ID
   */
  async getShipmentByOrderId(orderId: string): Promise<ShippingLabel | null> {
    try {
      const response = await apiService.get<ShippingLabel>(
        `/shipping/shiprocket/shipments/order/${orderId}`
      );
      return response || null;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.getShipmentByOrderId",
        orderId,
      });
      return null;
    }
  }

  /**
   * Get all shipments
   */
  async getAllShipments(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{
    shipments: ShippingLabel[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.startDate) {
        queryParams.append("startDate", filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        queryParams.append("endDate", filters.endDate.toISOString());
      }
      if (filters?.page) {
        queryParams.append("page", filters.page.toString());
      }
      if (filters?.limit) {
        queryParams.append("limit", filters.limit.toString());
      }

      const response = await apiService.get<{
        shipments: ShippingLabel[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/shipping/shiprocket/shipments?${queryParams.toString()}`);

      return (
        response || {
          shipments: [],
          total: 0,
          page: 1,
          totalPages: 0,
        }
      );
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.getAllShipments",
        filters,
      });
      return {
        shipments: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }

  /**
   * Request return pickup (RTO)
   */
  async requestReturn(
    orderId: string,
    reason: string
  ): Promise<SchedulePickupResponse> {
    try {
      const response = await apiService.post<SchedulePickupResponse>(
        "/shipping/shiprocket/request-return",
        {
          orderId,
          reason,
        }
      );

      if (!response) {
        throw new Error("Failed to request return pickup");
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.requestReturn",
        orderId,
        reason,
      });
      throw error;
    }
  }

  /**
   * Check serviceability for pincode
   */
  async checkServiceability(params: {
    pickupPincode: string;
    deliveryPincode: string;
    weight: number;
    codAmount?: number;
  }): Promise<{
    isServiceable: boolean;
    availableCouriers: string[];
    estimatedDeliveryDays: number;
  }> {
    try {
      const response = await apiService.post<{
        isServiceable: boolean;
        availableCouriers: string[];
        estimatedDeliveryDays: number;
      }>("/shipping/shiprocket/check-serviceability", params);

      return (
        response || {
          isServiceable: false,
          availableCouriers: [],
          estimatedDeliveryDays: 0,
        }
      );
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.checkServiceability",
        params,
      });
      return {
        isServiceable: false,
        availableCouriers: [],
        estimatedDeliveryDays: 0,
      };
    }
  }

  /**
   * Get NDR (Non-Delivery Report) details
   */
  async getNDRDetails(awbCode: string): Promise<{
    ndrStatus: string;
    ndrReason: string;
    actionTaken?: string;
  } | null> {
    try {
      const response = await apiService.get<{
        ndrStatus: string;
        ndrReason: string;
        actionTaken?: string;
      }>(`/shipping/shiprocket/ndr/${awbCode}`);
      return response || null;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.getNDRDetails",
        awbCode,
      });
      return null;
    }
  }

  /**
   * Take action on NDR
   */
  async actionNDR(
    awbCode: string,
    action: "reattempt" | "rto" | "reroute",
    params?: {
      newAddress?: string;
      newPhone?: string;
      reattemptDate?: Date;
    }
  ): Promise<boolean> {
    try {
      await apiService.post(`/shipping/shiprocket/ndr/${awbCode}/action`, {
        action,
        ...params,
      });
      return true;
    } catch (error) {
      logError(error as Error, {
        service: "ShiprocketService.actionNDR",
        awbCode,
        action,
        params,
      });
      return false;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const shiprocketService = new ShiprocketService();

