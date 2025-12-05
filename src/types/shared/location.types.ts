/**
 * @fileoverview Type Definitions
 * @module src/types/shared/location.types
 * @description This file contains TypeScript type definitions for location
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
  /** Message */
  Message: string;
  /** Status */
  Status: "Success" | "Error" | "404";
  /** Post Office */
  PostOffice: IndiaPostOffice[] | null;
}

/**
 * IndiaPostOffice interface
 * 
 * @interface
 * @description Defines the structure and contract for IndiaPostOffice
 */
export interface IndiaPostOffice {
  /** Name */
  Name: string;
  /** Description */
  Description: string | null;
  /** Branch Type */
  BranchType: "Head Post Office" | "Sub Post Office" | "Branch Post Office";
  /** Delivery Status */
  DeliveryStatus: "Delivery" | "Non-Delivery";
  /** Circle */
  Circle: string;
  /** District */
  District: string;
  /** Division */
  Division: string;
  /** Region */
  Region: string;
  /** Block */
  Block: string;
  /** State */
  State: string;
  /** Country */
  Country: string;
  /** Pincode */
  Pincode: string;
}

/**
 * Normalized pincode data for internal use
 */
export interface PincodeData {
  /** Pincode */
  pincode: string;
  /** Areas */
  areas: PincodeArea[];
  /** City */
  city: string;
  /** District */
  district: string;
  /** State */
  state: string;
  /** Country */
  country: string;
}

/**
 * PincodeArea interface
 * 
 * @interface
 * @description Defines the structure and contract for PincodeArea
 */
export interface PincodeArea {
  /** Name */
  name: string;
  /** Branch Type */
  branchType: string;
  /** Delivery Status */
  deliveryStatus: boolean;
}

/**
 * Simplified pincode lookup result for forms
 */
export interface PincodeLookupResult {
  /** Pincode */
  pincode: string;
  /** Areas */
  areas: string[];
  /** City */
  city: string;
  /** District */
  district: string;
  /** State */
  state: string;
  /** Country */
  country: string;
  /** Is Valid */
  isValid: boolean;
  /** Has Multiple Areas */
  hasMultipleAreas: boolean;
}

// ============================================================================
// GPS / GEOCODING TYPES
// ============================================================================

/**
 * GeoCoordinates interface
 * 
 * @interface
 * @description Defines the structure and contract for GeoCoordinates
 */
export interface GeoCoordinates {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** Accuracy */
  accuracy?: number;
}

/**
 * ReverseGeocodeResult interface
 * 
 * @interface
 * @description Defines the structure and contract for ReverseGeocodeResult
 */
export interface ReverseGeocodeResult {
  /** Formatted Address */
  formattedAddress: string;
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2: string;
  /** Area */
  area: string;
  /** City */
  city: string;
  /** District */
  district: string;
  /** State */
  state: string;
  /** Country */
  country: string;
  /** Pincode */
  pincode: string;
  /** Coordinates */
  coordinates: GeoCoordinates;
}

/**
 * GeolocationError interface
 * 
 * @interface
 * @description Defines the structure and contract for GeolocationError
 */
export interface GeolocationError {
  /** Code */
  code:
    | "PERMISSION_DENIED"
    | "POSITION_UNAVAILABLE"
    | "TIMEOUT"
    | "NOT_SUPPORTED";
  /** Message */
  message: string;
}

// ============================================================================
// SMART ADDRESS TYPES (Enhanced for E029)
// ============================================================================

/**
 * Extended Address type with all smart features
 */
export interface SmartAddressBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;

  // Contact
  /** Full Name */
  fullName: string;
  /** Mobile Number */
  mobileNumber: string;
  /** Alternate Mobile Number */
  alternateMobileNumber?: string;
  /** Country Code */
  countryCode: string;

  // Location
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2?: string;
  /** Landmark */
  landmark?: string;

  // Area (from pincode/autocomplete)
  /** Area */
  area: string;
  /** City */
  city: string;
  /** District */
  district?: string;
  /** State */
  state: string;
  /** Country */
  country: string;
  /** Pincode */
  pincode: string;

  // Coordinates (from GPS)
  /** Latitude */
  latitude?: number;
  /** Longitude */
  longitude?: number;
  /** Location Accuracy */
  locationAccuracy?: number;

  // Type & Preferences
  /** Type */
  type: "home" | "work" | "other";
  /** Custom Label */
  customLabel?: string;
  /** Is Default */
  isDefault: boolean;

  // Metadata
  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
}

/**
 * SmartAddressFE interface
 * 
 * @interface
 * @description Defines the structure and contract for SmartAddressFE
 */
export interface SmartAddressFE extends Omit<
  SmartAddressBE,
  "createdAt" | "updatedAt"
> {
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // Computed fields
  /** Formatted Address */
  formattedAddress: string;
  /** Short Address */
  shortAddress: string;
  /** Type Label */
  typeLabel: string;
  /** Formatted Phone */
  formattedPhone: string;
  /** Has Coordinates */
  hasCoordinates: boolean;
}

/**
 * SmartAddressFormData interface
 * 
 * @interface
 * @description Defines the structure and contract for SmartAddressFormData
 */
export interface SmartAddressFormData {
  /** Full Name */
  fullName: string;
  /** Mobile Number */
  mobileNumber: string;
  /** Alternate Mobile Number */
  alternateMobileNumber?: string;
  /** Country Code */
  countryCode: string;

  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2?: string;
  /** Landmark */
  landmark?: string;

  /** Area */
  area: string;
  /** City */
  city: string;
  /** District */
  district?: string;
  /** State */
  state: string;
  /** Country */
  country: string;
  /** Pincode */
  pincode: string;

  /** Latitude */
  latitude?: number;
  /** Longitude */
  longitude?: number;

  /** Type */
  type: "home" | "work" | "other";
  /** Custom Label */
  customLabel?: string;
  /** Is Default */
  isDefault: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * PincodeLookupRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for PincodeLookupRequest
 */
export interface PincodeLookupRequest {
  /** Pincode */
  pincode: string;
}

/**
 * PincodeLookupResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for PincodeLookupResponse
 */
export interface PincodeLookupResponse {
  /** Success */
  success: boolean;
  /** Data */
  data?: PincodeLookupResult;
  /** Error */
  error?: string;
}

/**
 * ReverseGeocodeRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for ReverseGeocodeRequest
 */
export interface ReverseGeocodeRequest {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
}

/**
 * ReverseGeocodeResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for ReverseGeocodeResponse
 */
export interface ReverseGeocodeResponse {
  /** Success */
  success: boolean;
  /** Data */
  data?: ReverseGeocodeResult;
  /** Error */
  error?: string;
}

/**
 * CreateSmartAddressRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateSmartAddressRequest
 */
export interface CreateSmartAddressRequest {
  /** Full Name */
  fullName: string;
  /** Mobile Number */
  mobileNumber: string;
  /** Alternate Mobile Number */
  alternateMobileNumber?: string;
  /** Country Code */
  countryCode?: string;
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2?: string;
  /** Landmark */
  landmark?: string;
  /** Area */
  area: string;
  /** City */
  city: string;
  /** District */
  district?: string;
  /** State */
  state: string;
  /** Country */
  country?: string;
  /** Pincode */
  pincode: string;
  /** Latitude */
  latitude?: number;
  /** Longitude */
  longitude?: number;
  /** Type */
  type?: "home" | "work" | "other";
  /** Custom Label */
  customLabel?: string;
  /** Is Default */
  isDefault?: boolean;
}

/**
 * UpdateSmartAddressRequest type
 * 
 * @typedef {Object} UpdateSmartAddressRequest
 * @description Type definition for UpdateSmartAddressRequest
 */
export type UpdateSmartAddressRequest = Partial<CreateSmartAddressRequest>;
