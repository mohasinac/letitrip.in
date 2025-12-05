/**
 * Shiprocket Service Configuration
 *
 * @status IMPLEMENTED
 * @task 1.3.1
 *
 * Configuration for Shiprocket shipping integration:
 * - API endpoints
 * - Courier partners
 * - Service types
 * - Weight slabs
 * - Delivery zones
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const SHIPROCKET_CONFIG = {
  baseUrl: "https://apiv2.shiprocket.in/v1/external",
  authUrl: "https://apiv2.shiprocket.in/v1/external/auth/login",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// ============================================================================
// COURIER PARTNERS
// ============================================================================

export const COURIER_PARTNERS = [
  {
    id: "bluedart",
    name: "Blue Dart",
    displayName: "Blue Dart",
    type: "express",
    minWeight: 0.5,
    maxWeight: 50,
    domesticOnly: false,
    codAvailable: true,
    hyperlocalAvailable: false,
    priority: 1,
  },
  {
    id: "delhivery",
    name: "Delhivery",
    displayName: "Delhivery",
    type: "standard",
    minWeight: 0.5,
    maxWeight: 50,
    domesticOnly: false,
    codAvailable: true,
    hyperlocalAvailable: true,
    priority: 2,
  },
  {
    id: "dtdc",
    name: "DTDC",
    displayName: "DTDC",
    type: "standard",
    minWeight: 0.5,
    maxWeight: 50,
    domesticOnly: true,
    codAvailable: true,
    hyperlocalAvailable: false,
    priority: 3,
  },
  {
    id: "fedex",
    name: "FedEx",
    displayName: "FedEx",
    type: "express",
    minWeight: 0.5,
    maxWeight: 70,
    domesticOnly: false,
    codAvailable: false,
    hyperlocalAvailable: false,
    priority: 4,
  },
  {
    id: "ecom-express",
    name: "Ecom Express",
    displayName: "Ecom Express",
    type: "standard",
    minWeight: 0.5,
    maxWeight: 30,
    domesticOnly: true,
    codAvailable: true,
    hyperlocalAvailable: false,
    priority: 5,
  },
  {
    id: "xpressbees",
    name: "Xpressbees",
    displayName: "XpressBees",
    type: "standard",
    minWeight: 0.5,
    maxWeight: 30,
    domesticOnly: true,
    codAvailable: true,
    hyperlocalAvailable: true,
    priority: 6,
  },
  {
    id: "shadowfax",
    name: "Shadowfax",
    displayName: "Shadowfax",
    type: "hyperlocal",
    minWeight: 0.1,
    maxWeight: 10,
    domesticOnly: true,
    codAvailable: true,
    hyperlocalAvailable: true,
    priority: 7,
  },
  {
    id: "dunzo",
    name: "Dunzo",
    displayName: "Dunzo",
    type: "hyperlocal",
    minWeight: 0.1,
    maxWeight: 20,
    domesticOnly: true,
    codAvailable: true,
    hyperlocalAvailable: true,
    priority: 8,
  },
] as const;

export type CourierPartnerType = "express" | "standard" | "hyperlocal";
export type CourierPartnerId = (typeof COURIER_PARTNERS)[number]["id"];

// ============================================================================
// SERVICE TYPES
// ============================================================================

export const SERVICE_TYPES = {
  FORWARD: {
    id: "forward",
    name: "Forward Shipment",
    description: "Regular delivery from seller to buyer",
    icon: "truck",
  },
  REVERSE: {
    id: "reverse",
    name: "Reverse Shipment",
    description: "Return pickup from buyer to seller",
    icon: "package-return",
  },
  HYPERLOCAL: {
    id: "hyperlocal",
    name: "Hyperlocal",
    description: "Same-day delivery within city",
    icon: "zap",
  },
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;

// ============================================================================
// DELIVERY ZONES
// ============================================================================

export const DELIVERY_ZONES = {
  WITHIN_CITY: {
    id: "within-city",
    name: "Within City",
    deliveryDays: "1-2",
    multiplier: 1.0,
  },
  WITHIN_STATE: {
    id: "within-state",
    name: "Within State",
    deliveryDays: "2-4",
    multiplier: 1.2,
  },
  WITHIN_ZONE: {
    id: "within-zone",
    name: "Within Zone",
    deliveryDays: "3-5",
    multiplier: 1.4,
  },
  METRO_TO_METRO: {
    id: "metro-to-metro",
    name: "Metro to Metro",
    deliveryDays: "2-4",
    multiplier: 1.3,
  },
  REST_OF_INDIA: {
    id: "rest-of-india",
    name: "Rest of India",
    deliveryDays: "4-7",
    multiplier: 1.6,
  },
  SPECIAL_AREAS: {
    id: "special-areas",
    name: "Special Areas (NE, J&K)",
    deliveryDays: "7-10",
    multiplier: 2.0,
  },
} as const;

export type DeliveryZone = keyof typeof DELIVERY_ZONES;

// ============================================================================
// WEIGHT SLABS
// ============================================================================

export interface WeightSlab {
  min: number; // kg
  max: number; // kg
  baseRate: number; // INR
  additionalPerKg: number; // INR
}

export const WEIGHT_SLABS: WeightSlab[] = [
  { min: 0, max: 0.5, baseRate: 40, additionalPerKg: 0 },
  { min: 0.5, max: 1, baseRate: 50, additionalPerKg: 20 },
  { min: 1, max: 2, baseRate: 60, additionalPerKg: 15 },
  { min: 2, max: 5, baseRate: 80, additionalPerKg: 12 },
  { min: 5, max: 10, baseRate: 120, additionalPerKg: 10 },
  { min: 10, max: 20, baseRate: 200, additionalPerKg: 8 },
  { min: 20, max: 50, baseRate: 350, additionalPerKg: 6 },
];

// ============================================================================
// PACKAGE DIMENSIONS
// ============================================================================

export interface PackageDimensions {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // kg
}

export const PACKAGE_TYPES = {
  ENVELOPE: {
    id: "envelope",
    name: "Envelope / Document",
    maxWeight: 0.5,
    dimensions: { length: 30, width: 25, height: 2 },
  },
  SMALL_BOX: {
    id: "small-box",
    name: "Small Box",
    maxWeight: 2,
    dimensions: { length: 20, width: 15, height: 10 },
  },
  MEDIUM_BOX: {
    id: "medium-box",
    name: "Medium Box",
    maxWeight: 5,
    dimensions: { length: 30, width: 25, height: 20 },
  },
  LARGE_BOX: {
    id: "large-box",
    name: "Large Box",
    maxWeight: 15,
    dimensions: { length: 50, width: 40, height: 30 },
  },
  CUSTOM: {
    id: "custom",
    name: "Custom Dimensions",
    maxWeight: 50,
    dimensions: null,
  },
} as const;

export type PackageType = keyof typeof PACKAGE_TYPES;

// ============================================================================
// SHIPMENT STATUS
// ============================================================================

export const SHIPMENT_STATUS = {
  PENDING: {
    id: "pending",
    label: "Pending",
    description: "Shipment created, awaiting pickup",
    color: "gray",
    icon: "clock",
  },
  PICKUP_SCHEDULED: {
    id: "pickup-scheduled",
    label: "Pickup Scheduled",
    description: "Pickup scheduled with courier",
    color: "blue",
    icon: "calendar",
  },
  PICKED_UP: {
    id: "picked-up",
    label: "Picked Up",
    description: "Package picked up by courier",
    color: "indigo",
    icon: "package",
  },
  IN_TRANSIT: {
    id: "in-transit",
    label: "In Transit",
    description: "Package in transit to destination",
    color: "purple",
    icon: "truck",
  },
  OUT_FOR_DELIVERY: {
    id: "out-for-delivery",
    label: "Out for Delivery",
    description: "Package out for delivery",
    color: "yellow",
    icon: "map-pin",
  },
  DELIVERED: {
    id: "delivered",
    label: "Delivered",
    description: "Package delivered successfully",
    color: "green",
    icon: "check-circle",
  },
  FAILED: {
    id: "failed",
    label: "Delivery Failed",
    description: "Delivery attempt failed",
    color: "orange",
    icon: "alert-circle",
  },
  RTO: {
    id: "rto",
    label: "RTO (Return to Origin)",
    description: "Package being returned to seller",
    color: "red",
    icon: "rotate-ccw",
  },
  CANCELLED: {
    id: "cancelled",
    label: "Cancelled",
    description: "Shipment cancelled",
    color: "gray",
    icon: "x-circle",
  },
} as const;

export type ShipmentStatusId = keyof typeof SHIPMENT_STATUS;

// ============================================================================
// PICKUP LOCATION
// ============================================================================

export interface PickupLocation {
  id?: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

// ============================================================================
// SHIPPING LABEL
// ============================================================================

export interface ShippingLabel {
  orderId: string;
  awbCode: string;
  courierName: string;
  labelUrl: string;
  manifestUrl?: string;
  invoiceUrl?: string;
  createdAt: Date;
}

// ============================================================================
// RATE CALCULATION
// ============================================================================

export interface RateCalculationParams {
  pickupPincode: string;
  deliveryPincode: string;
  weight: number; // kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  codAmount?: number;
  declaredValue: number;
  serviceType?: ServiceType;
}

export interface CourierRate {
  courierId: CourierPartnerId;
  courierName: string;
  rate: number;
  codCharges: number;
  estimatedDeliveryDays: string;
  zone: string;
  availableCod: boolean;
  recommended?: boolean;
}

// ============================================================================
// SHIPMENT ORDER
// ============================================================================

export interface ShipmentOrderParams {
  orderId: string;
  orderDate: Date;
  pickupLocationId: string;
  channelId?: string;
  billingCustomerName: string;
  billingLastName?: string;
  billingAddress: string;
  billingAddress2?: string;
  billingCity: string;
  billingPincode: string;
  billingState: string;
  billingCountry: string;
  billingEmail: string;
  billingPhone: string;
  shippingIsBilling: boolean;
  shippingCustomerName?: string;
  shippingLastName?: string;
  shippingAddress?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingPincode?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  orderItems: ShipmentOrderItem[];
  paymentMethod: "prepaid" | "cod";
  subTotal: number;
  shippingCharges: number;
  discount?: number;
  codCharges?: number;
  transactionCharges?: number;
  totalDiscount?: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  ewaybillNo?: string;
  customerGstin?: string;
  invoiceNumber?: string;
  orderType?: string;
}

export interface ShipmentOrderItem {
  name: string;
  sku: string;
  units: number;
  sellingPrice: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

// ============================================================================
// TRACKING
// ============================================================================

export interface TrackingEvent {
  status: string;
  statusCode: string;
  location: string;
  timestamp: Date;
  activity: string;
  srStatusLabel?: string;
}

export interface TrackingDetails {
  awbCode: string;
  courierId: CourierPartnerId;
  courierName: string;
  currentStatus: ShipmentStatusId;
  currentLocation: string;
  estimatedDeliveryDate?: Date;
  deliveredDate?: Date;
  trackingEvents: TrackingEvent[];
  podUrl?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate volumetric weight
 */
export function calculateVolumetricWeight(
  length: number,
  width: number,
  height: number
): number {
  // Volumetric weight = (L x W x H) / 5000
  return (length * width * height) / 5000;
}

/**
 * Get effective weight (max of actual weight and volumetric weight)
 */
export function getEffectiveWeight(dimensions: PackageDimensions): number {
  const volumetricWeight = calculateVolumetricWeight(
    dimensions.length,
    dimensions.width,
    dimensions.height
  );
  return Math.max(dimensions.weight, volumetricWeight);
}

/**
 * Get weight slab for given weight
 */
export function getWeightSlab(weight: number): WeightSlab | null {
  return (
    WEIGHT_SLABS.find((slab) => weight >= slab.min && weight <= slab.max) ||
    null
  );
}

/**
 * Calculate shipping rate based on weight and zone
 */
export function calculateShippingRate(
  weight: number,
  zone: DeliveryZone,
  codAmount?: number
): number {
  const slab = getWeightSlab(weight);
  if (!slab) return 0;

  const zoneMultiplier = DELIVERY_ZONES[zone].multiplier;
  let rate = slab.baseRate * zoneMultiplier;

  if (weight > slab.min) {
    const additionalWeight = weight - slab.min;
    rate += additionalWeight * slab.additionalPerKg * zoneMultiplier;
  }

  // Add COD charges if applicable (2% of order value, min ₹30)
  if (codAmount && codAmount > 0) {
    const codCharges = Math.max(codAmount * 0.02, 30);
    rate += codCharges;
  }

  return Math.round(rate);
}

/**
 * Get courier partner by ID
 */
export function getCourierPartnerById(id: CourierPartnerId) {
  return COURIER_PARTNERS.find((cp) => cp.id === id);
}

/**
 * Get available couriers for weight and type
 */
export function getAvailableCouriers(
  weight: number,
  type: CourierPartnerType | "all" = "all",
  codRequired = false,
  hyperlocalRequired = false
) {
  return COURIER_PARTNERS.filter((cp) => {
    if (type !== "all" && cp.type !== type) return false;
    if (weight < cp.minWeight || weight > cp.maxWeight) return false;
    if (codRequired && !cp.codAvailable) return false;
    if (hyperlocalRequired && !cp.hyperlocalAvailable) return false;
    return true;
  }).sort((a, b) => a.priority - b.priority);
}

/**
 * Format AWB code for display
 */
export function formatAwbCode(awbCode: string): string {
  // Format AWB code with spaces for readability
  return awbCode.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Get shipment status color
 */
export function getShipmentStatusColor(status: ShipmentStatusId): string {
  return SHIPMENT_STATUS[status]?.color || "gray";
}

/**
 * Get shipment status label
 */
export function getShipmentStatusLabel(status: ShipmentStatusId): string {
  return SHIPMENT_STATUS[status]?.label || status;
}

/**
 * Check if shipment is in final state
 */
export function isShipmentFinal(status: ShipmentStatusId): boolean {
  return ["delivered", "cancelled", "rto"].includes(status);
}

/**
 * Check if shipment can be cancelled
 */
export function canCancelShipment(status: ShipmentStatusId): boolean {
  return ["pending", "pickup-scheduled"].includes(status);
}

/**
 * Validate pincode format
 */
export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

/**
 * Validate package dimensions
 */
export function validateDimensions(dimensions: PackageDimensions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (dimensions.length <= 0) errors.push("Length must be greater than 0");
  if (dimensions.width <= 0) errors.push("Width must be greater than 0");
  if (dimensions.height <= 0) errors.push("Height must be greater than 0");
  if (dimensions.weight <= 0) errors.push("Weight must be greater than 0");
  if (dimensions.weight > 50) errors.push("Weight cannot exceed 50 kg");

  return {
    isValid: errors.length === 0,
    errors,
  };
}
