/**
 * Shipping Types
 * Shared between UI and Backend
 */

// ============================================
// Shiprocket Types
// ============================================

export interface ShiprocketOrder {
  id: string;
  orderId: string;
  shipmentId: string;
  awbCode: string;
  courierName: string;
  status: string;
  createdAt: string;
}

export interface ShiprocketOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
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
  shipping_email?: string;
  shipping_phone?: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: string;
  }>;
  payment_method: string;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketServiceabilityRequest {
  pickup_pincode: string;
  delivery_pincode: string;
  weight: number;
  cod?: 0 | 1;
}

export interface ShiprocketRateCalculation {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: string;
  cod: number;
}

export interface ShippingRate {
  courier: string;
  cost: number;
  deliveryTime: string;
  codAvailable: boolean;
}
