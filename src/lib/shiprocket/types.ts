/**
 * Shiprocket API Types
 *
 * Type definitions for the Shiprocket REST API (v1/external).
 * API base: https://apiv2.shiprocket.in/v1/external
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface ShiprocketAuthRequest {
  email: string;
  password: string;
}

export interface ShiprocketAuthResponse {
  token: string;
  message: string;
  data?: {
    id: number;
    email: string;
    name: string;
    company_id: number;
  };
}

// ─── Pickup Addresses ─────────────────────────────────────────────────────────

export interface ShiprocketPickupLocation {
  id: number;
  pickup_location: string; // short nickname
  add: string; // address line 1
  add2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  phone: string;
  email: string;
  name: string;
  is_first_time_user?: boolean;
  is_revamp?: boolean;
  phone_verified?: number; // 1 = verified
}

export interface ShiprocketPickupLocationsResponse {
  shipping_address: ShiprocketPickupLocation[];
}

export interface ShiprocketAddPickupRequest {
  pickup_location: string; // short nickname (unique)
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}

export interface ShiprocketAddPickupResponse {
  success: boolean;
  address?: {
    pickup_location_id: number;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
  };
  message?: string;
}

export interface ShiprocketVerifyPickupOTPRequest {
  otp: number;
  pickup_location_id: number;
}

export interface ShiprocketVerifyPickupOTPResponse {
  success: boolean;
  message: string;
}

// ─── Order Creation ───────────────────────────────────────────────────────────

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: string;
  hsn?: number;
}

export interface ShiprocketCreateOrderRequest {
  order_id: string;         // Our Firestore order ID
  order_date: string;       // YYYY-MM-DD format
  pickup_location: string;  // Pickup location nickname
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;     // cm
  breadth: number;    // cm
  height: number;     // cm
  weight: number;     // kg
}

export interface ShiprocketCreateOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: boolean;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
}

// ─── AWB Assignment ──────────────────────────────────────────────────────────

export interface ShiprocketGenerateAWBRequest {
  shipment_id: number;
  courier_id?: number; // omit for auto-assignment
}

export interface ShiprocketAWBResponse {
  awb_code: string;
  courier_company_id: number;
  courier_name: string;
  shipment_id: number;
  assigned_date_time: string;
  expected_delivery: string;
  tracking_url?: string;
}

// ─── Pickup Scheduling ───────────────────────────────────────────────────────

export interface ShiprocketGeneratePickupRequest {
  shipment_id: number[];
  pickup_date?: string[]; // YYYY-MM-DD
}

export interface ShiprocketPickupResponse {
  pickup_scheduled_date?: string;
  pickup_token_number?: string;
  status: number;
  others?: string;
}

// ─── Tracking ────────────────────────────────────────────────────────────────

export interface ShiprocketTrackActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  sr_status?: string;
  sr_status_label?: string;
}

export interface ShiprocketShipmentTrack {
  id: number;
  awb_code: string;
  courier_company_id: number;
  shipment_id: number;
  order_id: number;
  pickup_date?: string;
  delivered_date?: string;
  weight: string;
  packages: number;
  edd?: string; // estimated delivery date
  current_status: string;
  new_cust_city: string;
  origin_city: string;
  destination_city: string;
  consignee_name: string;
  courier_agent_assigned: boolean;
  shipment_track_activities: ShiprocketTrackActivity[];
}

export interface ShiprocketTrackingResponse {
  tracking_data: {
    awb_track_url: string;
    track_url: string;
    current_status: string;
    current_status_id: number;
    shipment_status: number;
    shipment_track: ShiprocketShipmentTrack[];
    shipment_track_activities: ShiprocketTrackActivity[];
    error?: string;
    cod?: boolean;
    pod?: string;
    pod_status?: string;
  };
}

// ─── Webhook ─────────────────────────────────────────────────────────────────

/**
 * Shape of the Shiprocket webhook POST body.
 * Shiprocket sends status updates to our registered webhook URL.
 */
export interface ShiprocketWebhookPayload {
  awb: string;
  /** The order_id we passed when creating the Shiprocket order (our Firestore ID) */
  order_id: string;
  /** Shiprocket's numeric shipment ID stringified */
  shipment_id: string;
  current_status: string;
  current_status_id: number;
  courier_agent_assigned?: boolean;
  etd?: string;
  pickup_generated?: boolean;
  pickup_scheduled_date?: string;
  delivered_date?: string;
  courier_name?: string;
  /** Shiprocket public tracking URL */
  tracking_url?: string;
}

// ─── Courier Selection ────────────────────────────────────────────────────────

export interface ShiprocketCourierCheckRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod?: 0 | 1;
}

export interface ShiprocketCourierOption {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  estimated_delivery_days: string;
  rate?: number;
}

export interface ShiprocketCourierServiceabilityResponse {
  data: {
    available_courier_companies: ShiprocketCourierOption[];
    courier_data?: ShiprocketCourierOption[];
  };
}
