/**
 * Shipping Service
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Frontend service for shipping operations (Shiprocket integration).
 */

import { apiService } from "./api.service";

export interface CourierOption {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: number;
  is_surface: boolean;
  is_rto_available: boolean;
}

export interface AWBResponse {
  awb_code: string;
  courier_company_id: number;
  courier_name: string;
  response: {
    data: {
      awb_assign_status: number;
      awb_code: string;
      child_courier_name: string;
    };
  };
}

export interface PickupLocation {
  pickup_location: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}

export interface PickupResponse {
  pickup_scheduled_date: string;
  pickup_token_number: string;
  status: string;
  response_code: number;
}

export interface TrackingUpdate {
  current_status: string;
  shipment_status: number;
  shipment_track: Array<{
    current_status: string;
    date: string;
    status: string;
    activity: string;
    location: string;
  }>;
  track_url: string;
}

class ShippingService {
  private baseUrl = "/api/seller/shipping";

  /**
   * Get available courier options for an order
   */
  async getCourierOptions(orderId: string): Promise<CourierOption[]> {
    const response = await apiService.get<{
      success: boolean;
      data: { available_courier_companies: CourierOption[] };
      error?: string;
    }>(`${this.baseUrl}/couriers/${orderId}`);

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch courier options");
    }

    return response.data.available_courier_companies;
  }

  /**
   * Generate AWB (Airway Bill) for an order
   */
  async generateAWB(orderId: string, courierId: number): Promise<AWBResponse> {
    const response = await apiService.post<{
      success: boolean;
      data: AWBResponse;
      error?: string;
    }>(`${this.baseUrl}/awb/${orderId}`, { courier_id: courierId });

    if (!response.success) {
      throw new Error(response.error || "Failed to generate AWB");
    }

    return response.data;
  }

  /**
   * Schedule pickup for an order
   */
  async schedulePickup(orderId: string): Promise<PickupResponse> {
    const response = await apiService.post<{
      success: boolean;
      data: PickupResponse;
      error?: string;
    }>(`${this.baseUrl}/pickup/${orderId}`, {});

    if (!response.success) {
      throw new Error(response.error || "Failed to schedule pickup");
    }

    return response.data;
  }

  /**
   * Get tracking information for a shipment
   */
  async getTracking(awbCode: string): Promise<TrackingUpdate> {
    const response = await apiService.get<{
      success: boolean;
      data: {
        tracking_data: TrackingUpdate;
      };
      error?: string;
    }>(`${this.baseUrl}/track/${awbCode}`);

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch tracking info");
    }

    return response.data.tracking_data;
  }

  /**
   * Generate shipping label for an order
   */
  async generateLabel(orderId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/label/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to generate label");
    }

    return response.blob();
  }

  /**
   * Get pickup locations
   */
  async getPickupLocations(): Promise<PickupLocation[]> {
    const response = await apiService.get<{
      success: boolean;
      data: { shipping_address: PickupLocation[] };
      error?: string;
    }>(`${this.baseUrl}/pickup-locations`);

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch pickup locations");
    }

    return response.data.shipping_address;
  }
}

export const shippingService = new ShippingService();
