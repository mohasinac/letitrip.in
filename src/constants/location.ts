/**
 * Location Constants - Indian States, Union Territories, and Country Codes
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

export const ALL_INDIAN_STATES = [
  ...INDIAN_STATES,
  ...UNION_TERRITORIES,
] as const;

export type IndianState = (typeof ALL_INDIAN_STATES)[number];

export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", iso: "IN" },
  { code: "+1", country: "United States", flag: "🇺🇸", iso: "US" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", iso: "GB" },
  { code: "+971", country: "UAE", flag: "🇦🇪", iso: "AE" },
  { code: "+65", country: "Singapore", flag: "🇸🇬", iso: "SG" },
  { code: "+61", country: "Australia", flag: "🇦🇺", iso: "AU" },
  { code: "+1", country: "Canada", flag: "🇨🇦", iso: "CA" },
] as const;

export const DEFAULT_COUNTRY_CODE = "+91";

export const ADDRESS_TYPES = ["home", "work", "other"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  home: "Home",
  work: "Work",
  other: "Other",
};

export const ADDRESS_TYPE_ICONS = {
  home: "🏠",
  work: "💼",
  other: "📍",
} as const;

// Pincode validation
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const PINCODE_LENGTH = 6;

// Phone validation for India
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const PHONE_LENGTH = 10;

/**
 * Validates an Indian pincode
 */
export function isValidPincode(pincode: string): boolean {
  return PINCODE_REGEX.test(pincode);
}

/**
 * Validates an Indian phone number
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return INDIAN_PHONE_REGEX.test(cleaned);
}

/**
 * Formats a phone number for display
 */
export function formatPhone(
  phone: string,
  countryCode: string = "+91",
): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${countryCode} ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}

// Re-export from formatters for backward compatibility
export { formatPincode } from "@/lib/formatters";
