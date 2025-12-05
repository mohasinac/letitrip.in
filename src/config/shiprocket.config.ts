/**
 * @fileoverview Configuration
 * @module src/config/shiprocket.config
 * @description This file contains functionality related to shiprocket.config
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * Shiprocket Config
 * @constant
 */
export const SHIPROCKET_CONFIG = {
  baseUrl: "https://apiv2.shiprocket.in/v1/external",
  authUrl: "https://apiv2.shiprocket.in/v1/external/auth/login",
  timeout: 30000, // 30 seconds
  /** Retry Attempts */
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// ============================================================================
// COURIER PARTNERS
// ============================================================================

/**
 * Courier Partners
 * @constant
 */
export const COURIER_PARTNERS = [
  {
    /** Id */
    id: "bluedart",
    /** Name */
    name: "Blue Dart",
    /** Display Name */
    displayName: "Blue Dart",
    /** Type */
    type: "express",
    /** Min Weight */
    minWeight: 0.5,
    /** Max Weight */
    maxWeight: 50,
    /** Domestic Only */
    domesticOnly: false,
    /** Cod Available */
    codAvailable: true,
    /** Hyperlocal Available */
    hyperlocalAvailable: false,
    /** Priority */
    priority: 1,
  },
  {
    /** Id */
    id: "delhivery",
    /** Name */
    name: "Delhivery",
    /** Display Name */
    displayName: "Delhivery",
    /** Type */
    type: "standard",
    /** Min Weight */
    minWeight: 0.5,
    /** Max Weight */
    maxWeight: 50,
    /** Domestic Only */
    domesticOnly: false,
    /** Cod Available */
    codAvailable: true,
    /** Hyperlocal Available */
    hyperlocalAvailable: true,
    /** Priority */
    priority: 2,
  },
  {
    /** Id */
    id: "dtdc",
    /** Name */
    name: "DTDC",
    /** Display Name */
    displayName: "DTDC",
    /** Type */
    type: "standard",
    /** Min Weight */
    minWeight: 0.5,
    /** Max Weight */
    maxWeight: 50,
    /** Domestic Only */
    domesticOnly: true,
    /** Cod Available */
    codAvailable: true,
    /** Hyperlocal Available */
    hyperlocalAvailable: false,
    /** Priority */
    priority: 3,
  },
  {
    /** Id */
    id: "fedex",
    /** Name */
    name: "FedEx",
    /** Display Name */
    displayName: "FedEx",
    /** Type */
    type: "express",
    /** Min Weight */
    minWeight: 0.5,
    /** Max Weight */
    maxWeight: 70,
    /** Domestic Only */
    domesticOnly: false,
    /** Cod Available */
    codAvailable: false,
    /** Hyperlocal Available */
    hyperlocalAvailable: false,
    /** Priority */
    priority: 4,
  },
  {
    /** Id */
    id: "ecom-express",
    /** Name */
    name: "Ecom Express",
    /** Display Name */
    displayName: "Ecom Express",
    /** Type */
    type: "standard",
    /** Min Weight */
    minWeight: 0.5,
    /** Max Weight */
    maxWeight: 30,
    /** Domestic Only */
    domesticOnly: true,
    /** Cod Available */
    codAvailable: true,
    /** Hyperlocal Available */
    hyperlocalAvailable: false,
    /** Priority */
    priority: 5,
  },
  {
    /** Id */
    id: "xpressbees",
    /** Name */
    name: "Xpressbees",
    /** Display Name */
    displayName: "XpressBees",
    /** Type */
    type: "standard",
    /** Min Weight */
    minWeight: 0.5,
    /** Max Weight */
    maxWeight: 30,
    /** Domestic Only */
    domesticOnly: true,
    /** Cod Available */
    codAvailable: true,
    /** Hyperlocal Available */
    hyperlocalAvailable: true,
    /** Priority */
    priority: 6,
  },
  {
    /** Id */
    id: "shadowfax",
    /** Name */
    name: "Shadowfax",
    /** Display Name */
    displayName: "Shadowfax",
    /** Type */
    type: "hyperlocal",
    /** Min Weight */
    minWeight: 0.1,
    /** Max Weight */
    maxWeight: 10,
    /** Domestic Only */
    domesticOnly: true,
    /** Cod Available */
    codAvailable: true,
    /** Hyperlocal Available */
    hyperlocalAvailable: true,
    /** Priority */
    priority: 7,
  },
  {
    /** Id */
    id: "dunzo",
    /** Name */
    name: "Dunzo",
    /** Display Name */
    displayName: "Dunzo",
    /** Type */
    type: "hyperlocal",
    /** Min Weight */
    minWeight: 0.1,
    /** Max Weight */
    maxWeight: 20,
    /** Domestic Only */
    domesticOnly: true,
    /** Cod Available */
    codAvailable: true,
    /** Hyperlocal Available */
    hyperlocalAvailable: true,
    /** Priority */
    priority: 8,
  },
] as const;

/**
 * CourierPartnerType type
 * 
 * @typedef {Object} CourierPartnerType
 * @description Type definition for CourierPartnerType
 */
export type CourierPartnerType = "express" | "standard" | "hyperlocal";
/**
 * CourierPartnerId type
 * 
 * @typedef {Object} CourierPartnerId
 * @description Type definition for CourierPartnerId
 */
export type CourierPartnerId = (typeof COURIER_PARTNERS)[number]["id"];

// ============================================================================
// SERVICE TYPES
// ============================================================================

/**
 * Service Types
 * @constant
 */
export const SERVICE_TYPES = {
  /** F O R W A R D */
  FORWARD: {
    /** Id */
    id: "forward",
    /** Name */
    name: "Forward Shipment",
    /** Description */
    description: "Regular delivery from seller to buyer",
    /** Icon */
    icon: "truck",
  },
  /** R E V E R S E */
  REVERSE: {
    /** Id */
    id: "reverse",
    /** Name */
    name: "Reverse Shipment",
    /** Description */
    description: "Return pickup from buyer to seller",
    /** Icon */
    icon: "package-return",
  },
  /** H Y P E R L O C A L */
  HYPERLOCAL: {
    /** Id */
    id: "hyperlocal",
    /** Name */
    name: "Hyperlocal",
    /** Description */
    description: "Same-day delivery within city",
    /** Icon */
    icon: "zap",
  },
} as const;

/**
 * ServiceType type
 * 
 * @typedef {Object} ServiceType
 * @description Type definition for ServiceType
 */
export type ServiceType = keyof typeof SERVICE_TYPES;

// ============================================================================
// DELIVERY ZONES
// ============================================================================

/**
 * Delivery Zones
 * @constant
 */
export const DELIVERY_ZONES = {
  /** WITHIN_CITY */
  WITHIN_CITY: {
    /** Id */
    id: "within-city",
    /** Name */
    name: "Within City",
    /** Delivery Days */
    deliveryDays: "1-2",
    /** Multiplier */
    multiplier: 1.0,
  },
  /** WITHIN_STATE */
  WITHIN_STATE: {
    /** Id */
    id: "within-state",
    /** Name */
    name: "Within State",
    /** Delivery Days */
    deliveryDays: "2-4",
    /** Multiplier */
    multiplier: 1.2,
  },
  /** WITHIN_ZONE */
  WITHIN_ZONE: {
    /** Id */
    id: "within-zone",
    /** Name */
    name: "Within Zone",
    /** Delivery Days */
    deliveryDays: "3-5",
    /** Multiplier */
    multiplier: 1.4,
  },
  /** METRO_TO_METRO */
  METRO_TO_METRO: {
    /** Id */
    id: "metro-to-metro",
    /** Name */
    name: "Metro to Metro",
    /** Delivery Days */
    deliveryDays: "2-4",
    /** Multiplier */
    multiplier: 1.3,
  },
  /** REST_OF_INDIA */
  REST_OF_INDIA: {
    /** Id */
    id: "rest-of-india",
    /** Name */
    name: "Rest of India",
    /** Delivery Days */
    deliveryDays: "4-7",
    /** Multiplier */
    multiplier: 1.6,
  },
  /** SPECIAL_AREAS */
  SPECIAL_AREAS: {
    /** Id */
    id: "special-areas",
    /** Name */
    name: "Special Areas (NE, J&K)",
    /** Delivery Days */
    deliveryDays: "7-10",
    /** Multiplier */
    multiplier: 2.0,
  },
} as const;

/**
 * DeliveryZone type
 * 
 * @typedef {Object} DeliveryZone
 * @description Type definition for DeliveryZone
 */
export type DeliveryZone = keyof typeof DELIVERY_ZONES;

// ============================================================================
// WEIGHT SLABS
// ============================================================================

/**
 * WeightSlab interface
 * 
 * @interface
 * @description Defines the structure and contract for WeightSlab
 */
export interface WeightSlab {
  /** Min */
  min: number; // kg
  /** Max */
  max: number; // kg
  /** BaseRate */
  baseRate: number; // INR
  /** AdditionalPerKg */
  additionalPerKg: number; // INR
}

/**
 * Weight Slabs
 * @constant
 */
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

/**
 * PackageDimensions interface
 * 
 * @interface
 * @description Defines the structure and contract for PackageDimensions
 */
export interface PackageDimensions {
  /** Length */
  length: number; // cm
  /** Width */
  width: number; // cm
  /** Height */
  height: number; // cm
  /** Weight */
  weight: number; // kg
}

/**
 * Package Types
 * @constant
 */
export const PACKAGE_TYPES = {
  /** E N V E L O P E */
  ENVELOPE: {
    /** Id */
    id: "envelope",
    /** Name */
    name: "Envelope / Document",
    /** Max Weight */
    maxWeight: 0.5,
    /** Dimensions */
    dimensions: { length: 30, width: 25, height: 2 },
  },
  SMALL_BOX: {
    /** Id */
    id: "small-box",
    /** Name */
    name: "Small Box",
    /** Max Weight */
    maxWeight: 2,
    /** Dimensions */
    dimensions: { length: 20, width: 15, height: 10 },
  },
  MEDIUM_BOX: {
    /** Id */
    id: "medium-box",
    /** Name */
    name: "Medium Box",
    /** Max Weight */
    maxWeight: 5,
    /** Dimensions */
    dimensions: { length: 30, width: 25, height: 20 },
  },
  LARGE_BOX: {
    /** Id */
    id: "large-box",
    /** Name */
    name: "Large Box",
    /** Max Weight */
    maxWeight: 15,
    /** Dimensions */
    dimensions: { length: 50, width: 40, height: 30 },
  },
  /** C U S T O M */
  CUSTOM: {
    /** Id */
    id: "custom",
    /** Name */
    name: "Custom Dimensions",
    /** Max Weight */
    maxWeight: 50,
    /** Dimensions */
    dimensions: null,
  },
} as const;

/**
 * PackageType type
 * 
 * @typedef {Object} PackageType
 * @description Type definition for PackageType
 */
export type PackageType = keyof typeof PACKAGE_TYPES;

// ============================================================================
// SHIPMENT STATUS
// ============================================================================

/**
 * Shipment Status
 * @constant
 */
export const SHIPMENT_STATUS = {
  /** P E N D I N G */
  PENDING: {
    /** Id */
    id: "pending",
    /** Label */
    label: "Pending",
    /** Description */
    description: "Shipment created, awaiting pickup",
    /** Color */
    color: "gray",
    /** Icon */
    icon: "clock",
  },
  /** PICKUP_SCHEDULED */
  PICKUP_SCHEDULED: {
    /** Id */
    id: "pickup-scheduled",
    /** Label */
    label: "Pickup Scheduled",
    /** Description */
    description: "Pickup scheduled with courier",
    /** Color */
    color: "blue",
    /** Icon */
    icon: "calendar",
  },
  /** PICKED_UP */
  PICKED_UP: {
    /** Id */
    id: "picked-up",
    /** Label */
    label: "Picked Up",
    /** Description */
    description: "Package picked up by courier",
    /** Color */
    color: "indigo",
    /** Icon */
    icon: "package",
  },
  /** IN_TRANSIT */
  IN_TRANSIT: {
    /** Id */
    id: "in-transit",
    /** Label */
    label: "In Transit",
    /** Description */
    description: "Package in transit to destination",
    /** Color */
    color: "purple",
    /** Icon */
    icon: "truck",
  },
  /** OUT_FOR_DELIVERY */
  OUT_FOR_DELIVERY: {
    /** Id */
    id: "out-for-delivery",
    /** Label */
    label: "Out for Delivery",
    /** Description */
    description: "Package out for delivery",
    /** Color */
    color: "yellow",
    /** Icon */
    icon: "map-pin",
  },
  /** D E L I V E R E D */
  DELIVERED: {
    /** Id */
    id: "delivered",
    /** Label */
    label: "Delivered",
    /** Description */
    description: "Package delivered successfully",
    /** Color */
    color: "green",
    /** Icon */
    icon: "check-circle",
  },
  /** F A I L E D */
  FAILED: {
    /** Id */
    id: "failed",
    /** Label */
    label: "Delivery Failed",
    /** Description */
    description: "Delivery attempt failed",
    /** Color */
    color: "orange",
    /** Icon */
    icon: "alert-circle",
  },
  /** R T O */
  RTO: {
    /** Id */
    id: "rto",
    /** Label */
    label: "RTO (Return to Origin)",
    /** Description */
    description: "Package being returned to seller",
    /** Color */
    color: "red",
    /** Icon */
    icon: "rotate-ccw",
  },
  /** C A N C E L L E D */
  CANCELLED: {
    /** Id */
    id: "cancelled",
    /** Label */
    label: "Cancelled",
    /** Description */
    description: "Shipment cancelled",
    /** Color */
    color: "gray",
    /** Icon */
    icon: "x-circle",
  },
} as const;

/**
 * ShipmentStatusId type
 * 
 * @typedef {Object} ShipmentStatusId
 * @description Type definition for ShipmentStatusId
 */
export type ShipmentStatusId = keyof typeof SHIPMENT_STATUS;

// ============================================================================
// PICKUP LOCATION
// ============================================================================

/**
 * PickupLocation interface
 * 
 * @interface
 * @description Defines the structure and contract for PickupLocation
 */
export interface PickupLocation {
  /** Id */
  id?: string;
  /** Name */
  name: string;
  /** Contact Name */
  contactName: string;
  /** Phone */
  phone: string;
  /** Email */
  email: string;
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2?: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Pincode */
  pincode: string;
  /** Country */
  country: string;
  /** Is Default */
  isDefault?: boolean;
}

// ============================================================================
// SHIPPING LABEL
// ============================================================================

/**
 * ShippingLabel interface
 * 
 * @interface
 * @description Defines the structure and contract for ShippingLabel
 */
export interface ShippingLabel {
  /** Order Id */
  orderId: string;
  /** Awb Code */
  awbCode: string;
  /** Courier Name */
  courierName: string;
  /** Label Url */
  labelUrl: string;
  /** Manifest Url */
  manifestUrl?: string;
  /** Invoice Url */
  invoiceUrl?: string;
  /** Created At */
  createdAt: Date;
}

// ============================================================================
// RATE CALCULATION
// ============================================================================

/**
 * RateCalculationParams interface
 * 
 * @interface
 * @description Defines the structure and contract for RateCalculationParams
 */
export interface RateCalculationParams {
  /** Pickup Pincode */
  pickupPincode: string;
  /** Delivery Pincode */
  deliveryPincode: string;
  /** Weight */
  weight: number; // kg
  /** Length */
  length?: number; // cm
  /** Width */
  width?: number; // cm
  /** Height */
  height?: number; // cm
  /** Cod Amount */
  codAmount?: number;
  /** Declared Value */
  declaredValue: number;
  /** Service Type */
  serviceType?: ServiceType;
}

/**
 * CourierRate interface
 * 
 * @interface
 * @description Defines the structure and contract for CourierRate
 */
export interface CourierRate {
  /** Courier Id */
  courierId: CourierPartnerId;
  /** Courier Name */
  courierName: string;
  /** Rate */
  rate: number;
  /** Cod Charges */
  codCharges: number;
  /** Estimated Delivery Days */
  estimatedDeliveryDays: string;
  /** Zone */
  zone: string;
  /** Available Cod */
  availableCod: boolean;
  /** Recommended */
  recommended?: boolean;
}

// ============================================================================
// SHIPMENT ORDER
// ============================================================================

/**
 * ShipmentOrderParams interface
 * 
 * @interface
 * @description Defines the structure and contract for ShipmentOrderParams
 */
export interface ShipmentOrderParams {
  /** Order Id */
  orderId: string;
  /** Order Date */
  orderDate: Date;
  /** Pickup Location Id */
  pickupLocationId: string;
  /** Channel Id */
  channelId?: string;
  /** Billing Customer Name */
  billingCustomerName: string;
  /** Billing Last Name */
  billingLastName?: string;
  /** Billing Address */
  billingAddress: string;
  /** Billing Address2 */
  billingAddress2?: string;
  /** Billing City */
  billingCity: string;
  /** Billing Pincode */
  billingPincode: string;
  /** Billing State */
  billingState: string;
  /** Billing Country */
  billingCountry: string;
  /** Billing Email */
  billingEmail: string;
  /** Billing Phone */
  billingPhone: string;
  /** Shipping Is Billing */
  shippingIsBilling: boolean;
  /** Shipping Customer Name */
  shippingCustomerName?: string;
  /** Shipping Last Name */
  shippingLastName?: string;
  /** Shipping Address */
  shippingAddress?: string;
  /** Shipping Address2 */
  shippingAddress2?: string;
  /** Shipping City */
  shippingCity?: string;
  /** Shipping Pincode */
  shippingPincode?: string;
  /** Shipping State */
  shippingState?: string;
  /** Shipping Country */
  shippingCountry?: string;
  /** Shipping Email */
  shippingEmail?: string;
  /** Shipping Phone */
  shippingPhone?: string;
  /** Order Items */
  orderItems: ShipmentOrderItem[];
  /** Payment Method */
  paymentMethod: "prepaid" | "cod";
  /** Sub Total */
  subTotal: number;
  /** Shipping Charges */
  shippingCharges: number;
  /** Discount */
  discount?: number;
  /** Cod Charges */
  codCharges?: number;
  /** Transaction Charges */
  transactionCharges?: number;
  /** Total Discount */
  totalDiscount?: number;
  /** Length */
  length: number;
  /** Breadth */
  breadth: number;
  /** Height */
  height: number;
  /** Weight */
  weight: number;
  /** Ewaybill No */
  ewaybillNo?: string;
  /** Customer Gstin */
  customerGstin?: string;
  /** Invoice Number */
  invoiceNumber?: string;
  /** Order Type */
  orderType?: string;
}

/**
 * ShipmentOrderItem interface
 * 
 * @interface
 * @description Defines the structure and contract for ShipmentOrderItem
 */
export interface ShipmentOrderItem {
  /** Name */
  name: string;
  /** Sku */
  sku: string;
  /** Units */
  units: number;
  /** Selling Price */
  sellingPrice: number;
  /** Discount */
  discount?: number;
  /** Tax */
  tax?: number;
  /** Hsn */
  hsn?: number;
}

// ============================================================================
// TRACKING
// ============================================================================

/**
 * TrackingEvent interface
 * 
 * @interface
 * @description Defines the structure and contract for TrackingEvent
 */
export interface TrackingEvent {
  /** Status */
  status: string;
  /** Status Code */
  statusCode: string;
  /** Location */
  location: string;
  /** Timestamp */
  timestamp: Date;
  /** Activity */
  activity: string;
  /** Sr Status Label */
  srStatusLabel?: string;
}

/**
 * TrackingDetails interface
 * 
 * @interface
 * @description Defines the structure and contract for TrackingDetails
 */
export interface TrackingDetails {
  /** Awb Code */
  awbCode: string;
  /** Courier Id */
  courierId: CourierPartnerId;
  /** Courier Name */
  courierName: string;
  /** Current Status */
  currentStatus: ShipmentStatusId;
  /** Current Location */
  currentLocation: string;
  /** Estimated Delivery Date */
  estimatedDeliveryDate?: Date;
  /** Delivered Date */
  deliveredDate?: Date;
  /** Tracking Events */
  trackingEvents: TrackingEvent[];
  /** Pod Url */
  podUrl?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate volumetric weight
 */
/**
 * Calculates volumetric weight
 *
 * @param {number} length - The length
 * @param {number} width - The width
 * @param {number} height - The height
 *
 * @returns {number} The calculatevolumetricweight result
 *
 * @example
 * calculateVolumetricWeight(123, 123, 123);
 */

/**
 * Calculates volumetric weight
 *
 * @returns {number} The calculatevolumetricweight result
 *
 * @example
 * calculateVolumetricWeight();
 */

export function calculateVolumetricWeight(
  /** Length */
  length: number,
  /** Width */
  width: number,
  /** Height */
  height: number
): number {
  // Volumetric weight = (L x W x H) / 5000
  return (length * width * height) / 5000;
}

/**
 * Get effective weight (max of actual weight and volumetric weight)
 */
/**
 * Retrieves effective weight
 *
 * @param {PackageDimensions} dimensions - The dimensions
 *
 * @returns {number} The effectiveweight result
 *
 * @example
 * getEffectiveWeight(dimensions);
 */

/**
 * Retrieves effective weight
 *
 * @param {PackageDimensions} dimensions - The dimensions
 *
 * @returns {number} The effectiveweight result
 *
 * @example
 * getEffectiveWeight(dimensions);
 */

export function getEffectiveWeight(dimensions: PackageDimensions): number {
  /**
 * Performs volumetric weight operation
 *
 * @param {any} dimensions.length - The dimensions.length
 * @param {any} dimensions.width - The dimensions.width
 * @param {any} dimensions.height - The dimensions.height
 *
 * @returns {WeightSlab | null} The volumetricweight result
 *
 * @example
 * volumetricWeight(dimensions.length, dimensions.width, dimensions.height);
 */
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
/**
 * Retrieves weight slab
 *
 * @param {number} weight - The weight
 *
 * @returns {number} The weightslab result
 *
 * @example
 * getWeightSlab(123);
 */

/**
 * Retrieves weight slab
 *
 * @param {number} weight - The weight
 *
 * @returns {number} The weightslab result
 *
 * @example
 * getWeightSlab(123);
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
/**
 * Calculates shipping rate
 *
 * @param {number} weight - The weight
 * @param {DeliveryZone} zone - The zone
 * @param {number} [codAmount] - The cod amount
 *
 * @returns {number} The calculateshippingrate result
 *
 * @example
 * calculateShippingRate(123, zone, 123);
 */

/**
 * Calculates shipping rate
 *
 * @returns {number} The calculateshippingrate result
 *
 * @example
 * calculateShippingRate();
 */

export function calculateShippingRate(
  /** Weight */
  weight: number,
  /** Zone */
  zone: DeliveryZone,
  /** Cod Amount */
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
/**
 * Retrieves courier partner by id
 *
 * @param {CourierPartnerId} id - Unique identifier
 *
 * @returns {any} The courierpartnerbyid result
 *
 * @example
 * getCourierPartnerById(id);
 */

/**
 * Retrieves courier partner by id
 *
 * @param {CourierPartnerId} id - Unique identifier
 *
 * @returns {any} The courierpartnerbyid result
 *
 * @example
 * getCourierPartnerById(id);
 */

export function getCourierPartnerById(id: CourierPartnerId) {
  return COURIER_PARTNERS.find((cp) => cp.id === id);
}

/**
 * Get available couriers for weight and type
 */
/**
 * Retrieves available couriers
 *
 * @returns {number} The availablecouriers result
 *
 * @example
 * getAvailableCouriers();
 */

/**
 * Retrieves available couriers
 *
 * @returns {number} The availablecouriers result
 *
 * @example
 * getAvailableCouriers();
 */

export function getAvailableCouriers(
  /** Weight */
  weight: number,
  /** Type */
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
/**
 * Formats awb code
 *
 * @param {string} awbCode - The awb code
 *
 * @returns {string} The formatawbcode result
 *
 * @example
 * formatAwbCode("example");
 */

/**
 * Formats awb code
 *
 * @param {string} awbCode - The awb code
 *
 * @returns {string} The formatawbcode result
 *
 * @example
 * formatAwbCode("example");
 */

export function formatAwbCode(awbCode: string): string {
  // Format AWB code with spaces for readability
  return awbCode.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Get shipment status color
 */
/**
 * Retrieves shipment status color
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {string} The shipmentstatuscolor result
 *
 * @example
 * getShipmentStatusColor(status);
 */

/**
 * Retrieves shipment status color
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {string} The shipmentstatuscolor result
 *
 * @example
 * getShipmentStatusColor(status);
 */

export function getShipmentStatusColor(status: ShipmentStatusId): string {
  return SHIPMENT_STATUS[status]?.color || "gray";
}

/**
 * Get shipment status label
 */
/**
 * Retrieves shipment status label
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {string} The shipmentstatuslabel result
 *
 * @example
 * getShipmentStatusLabel(status);
 */

/**
 * Retrieves shipment status label
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {string} The shipmentstatuslabel result
 *
 * @example
 * getShipmentStatusLabel(status);
 */

export function getShipmentStatusLabel(status: ShipmentStatusId): string {
  return SHIPMENT_STATUS[status]?.label || status;
}

/**
 * Check if shipment is in final state
 */
/**
 * Checks if shipment final
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isShipmentFinal(status);
 */

/**
 * Checks if shipment final
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isShipmentFinal(status);
 */

export function isShipmentFinal(status: ShipmentStatusId): boolean {
  return ["delivered", "cancelled", "rto"].includes(status);
}

/**
 * Check if shipment can be cancelled
 */
/**
 * Checks if cancel shipment
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * canCancelShipment(status);
 */

/**
 * Checks if cancel shipment
 *
 * @param {ShipmentStatusId} status - The status
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * canCancelShipment(status);
 */

export function canCancelShipment(status: ShipmentStatusId): boolean {
  return ["pending", "pickup-scheduled"].includes(status);
}

/**
 * Validate pincode format
 */
/**
 * Validates pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validatePincode("example");
 */

/**
 * Validates pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validatePincode("example");
 */

export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

/**
 * Validate package dimensions
 */
/**
 * Validates dimensions
 *
 * @param {PackageDimensions} dimensions - The dimensions
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validateDimensions(dimensions);
 */

/**
 * Validates dimensions
 *
 * @param {PackageDimensions} dimensions - The dimensions
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateDimensions(dimensions);
 */

export function validateDimensions(dimensions: PackageDimensions): {
  /** Is Valid */
  isValid: boolean;
  /** Errors */
  errors: string[];
} {
  const errors: string[] = [];

  if (dimensions.length <= 0) errors.push("Length must be greater than 0");
  if (dimensions.width <= 0) errors.push("Width must be greater than 0");
  if (dimensions.height <= 0) errors.push("Height must be greater than 0");
  if (dimensions.weight <= 0) errors.push("Weight must be greater than 0");
  if (dimensions.weight > 50) errors.push("Weight cannot exceed 50 kg");

  return {
    /** Is Valid */
    isValid: errors.length === 0,
    errors,
  };
}
