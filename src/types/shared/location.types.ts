/**
 * Location Types - Pincode, GPS, and Address Location Data
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// PINCODE TYPES
// ============================================================================

/**
 * Response from India Post Pincode API
 */
export interface IndiaPostPincodeResponse {
  Message: string;
  Status: "Success" | "Error" | "404";
  PostOffice: IndiaPostOffice[] | null;
}

export interface IndiaPostOffice {
  Name: string;
  Description: string | null;
  BranchType: "Head Post Office" | "Sub Post Office" | "Branch Post Office";
  DeliveryStatus: "Delivery" | "Non-Delivery";
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
}

/**
 * Normalized pincode data for internal use
 */
export interface PincodeData {
  pincode: string;
  areas: PincodeArea[];
  city: string;
  district: string;
  state: string;
  country: string;
}

export interface PincodeArea {
  name: string;
  branchType: string;
  deliveryStatus: boolean;
}

/**
 * Simplified pincode lookup result for forms
 */
export interface PincodeLookupResult {
  pincode: string;
  areas: string[];
  city: string;
  district: string;
  state: string;
  country: string;
  isValid: boolean;
  hasMultipleAreas: boolean;
}

// ============================================================================
// GPS / GEOCODING TYPES
// ============================================================================

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  addressLine1: string;
  addressLine2: string;
  area: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  coordinates: GeoCoordinates;
}

export interface GeolocationError {
  code: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "NOT_SUPPORTED";
  message: string;
}

// ============================================================================
// SMART ADDRESS TYPES (Enhanced for E029)
// ============================================================================

/**
 * Extended Address type with all smart features
 */
export interface SmartAddressBE {
  id: string;
  userId: string;

  // Contact
  fullName: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  countryCode: string;

  // Location
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;

  // Area (from pincode/autocomplete)
  area: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  pincode: string;

  // Coordinates (from GPS)
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;

  // Type & Preferences
  type: "home" | "work" | "other";
  customLabel?: string;
  isDefault: boolean;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SmartAddressFE extends Omit<SmartAddressBE, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;

  // Computed fields
  formattedAddress: string;
  shortAddress: string;
  typeLabel: string;
  formattedPhone: string;
  hasCoordinates: boolean;
}

export interface SmartAddressFormData {
  fullName: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  countryCode: string;

  addressLine1: string;
  addressLine2?: string;
  landmark?: string;

  area: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  pincode: string;

  latitude?: number;
  longitude?: number;

  type: "home" | "work" | "other";
  customLabel?: string;
  isDefault: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface PincodeLookupRequest {
  pincode: string;
}

export interface PincodeLookupResponse {
  success: boolean;
  data?: PincodeLookupResult;
  error?: string;
}

export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResponse {
  success: boolean;
  data?: ReverseGeocodeResult;
  error?: string;
}

export interface CreateSmartAddressRequest {
  fullName: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  countryCode?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area: string;
  city: string;
  district?: string;
  state: string;
  country?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  type?: "home" | "work" | "other";
  customLabel?: string;
  isDefault?: boolean;
}

export type UpdateSmartAddressRequest = Partial<CreateSmartAddressRequest>;
