/**
 * @fileoverview TypeScript Module
 * @module src/constants/location
 * @description This file contains functionality related to location
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Location Constants - Indian States, Union Territories, and Country Codes
 */

/**
 * Indian States
 * @constant
 */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/**
 * Union Territories
 * @constant
 */
export const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

/**
 * All Indian States
 * @constant
 */
export const ALL_INDIAN_STATES = [
  ...INDIAN_STATES,
  ...UNION_TERRITORIES,
] as const;

/**
 * IndianState type
 * 
 * @typedef {Object} IndianState
 * @description Type definition for IndianState
 */
export type IndianState = (typeof ALL_INDIAN_STATES)[number];

/**
 * Country Codes
 * @constant
 */
export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", iso: "IN" },
  { code: "+1", country: "United States", flag: "🇺🇸", iso: "US" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", iso: "GB" },
  { code: "+971", country: "UAE", flag: "🇦🇪", iso: "AE" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", iso: "SG" },
  { code: "+61", country: "Australia", flag: "🇦🇺", iso: "AU" },
  { code: "+1", country: "Canada", flag: "🇨🇦", iso: "CA" },
] as const;

/**
 * Default Country Code
 * @constant
 */
export const DEFAULT_COUNTRY_CODE = "+91";

/**
 * Address Types
 * @constant
 */
export const ADDRESS_TYPES = ["home", "work", "other"] as const;
/**
 * AddressType type
 * 
 * @typedef {Object} AddressType
 * @description Type definition for AddressType
 */
export type AddressType = (typeof ADDRESS_TYPES)[number];

/**
 * Address Type Labels
 * @constant
 */
export const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  /** Home */
  home: "Home",
  /** Work */
  work: "Work",
  /** Other */
  other: "Other",
};

/**
 * Address Type Icons
 * @constant
 */
export const ADDRESS_TYPE_ICONS = {
  /** Home */
  home: "🏠",
  /** Work */
  work: "💼",
  /** Other */
  other: "📍",
} as const;

// Pincode validation
/**
 * Pincode Regex
 * @constant
 */
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
/**
 * Pincode Length
 * @constant
 */
export const PINCODE_LENGTH = 6;

// Phone validation for India
/**
 * Indian Phone Regex
 * @constant
 */
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
/**
 * Phone Length
 * @constant
 */
export const PHONE_LENGTH = 10;

/**
 * Validates an Indian pincode
 */
/**
 * Checks if valid pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPincode("example");
 */

/**
 * Checks if valid pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPincode("example");
 */

export function isValidPincode(pincode: string): boolean {
  return PINCODE_REGEX.test(pincode);
}

/**
 * Validates an Indian phone number
 */
/**
 * Checks if valid indian phone
 *
 * @param {string} phone - The phone
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidIndianPhone("example");
 */

/**
 * Checks if valid indian phone
 *
 * @param {string} phone - The phone
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidIndianPhone("example");
 */

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return INDIAN_PHONE_REGEX.test(cleaned);
}

/**
 * Formats a phone number for display
 */
/**
 * Formats phone
 *
 * @param {string} phone - The phone
 * @param {string} [countryCode] - The country code
 *
 * @returns {string} The formatphone result
 *
 * @example
 * formatPhone("example", "example");
 */

/**
 * Formats phone
 *
 * @returns {string} The formatphone result
 *
 * @example
 * formatPhone();
 */

export function formatPhone(
  /** Phone */
  phone: string,
  /** Country Code */
  countryCode: string = "+91"
): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${countryCode} ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}
