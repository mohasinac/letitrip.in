/**
 * @fileoverview Configuration
 * @module src/config/address-api.config
 * @description This file contains functionality related to address-api.config
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Address API Configuration
 *
 * Configuration for address lookup and validation APIs:
 * - Postal Pincode API (India)
 * - Zippopotam.us (International)
 *
 * Usage:
 * ```ts
 * import { ADDRESS_API_CONFIG, FALLBACK_COUNTRIES } from '@/config/address-api.config';
 *
 * const indiaConfig = ADDRESS_API_CONFIG.POSTAL_PINCODE;
 * const intlConfig = ADDRESS_API_CONFIG.ZIPPOPOTAM;
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * AddressAPIConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressAPIConfig
 */
export interface AddressAPIConfig {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Base Url */
  baseUrl: string;
  /** Enabled */
  enabled: boolean;
  /** Rate Limit */
  rateLimit: {
    /** Requests Per Minute */
    requestsPerMinute: number;
    /** Requests Per Day */
    requestsPerDay: number;
  };
  timeout: number; // milliseconds
  /** Retry Attempts */
  retryAttempts: number;
  cacheTime: number; // milliseconds
  /** Docs */
  docs: string;
}

/**
 * IndianState interface
 * 
 * @interface
 * @description Defines the structure and contract for IndianState
 */
export interface IndianState {
  /** Code */
  code: string;
  /** Name */
  name: string;
  /** Hindi Name */
  hindiName?: string;
}

/**
 * Country interface
 * 
 * @interface
 * @description Defines the structure and contract for Country
 */
export interface Country {
  /** Code */
  code: string;
  /** Name */
  name: string;
  /** Postal Code Format */
  postalCodeFormat: string;
  /** Postal Code Example */
  postalCodeExample: string;
}

// ============================================================================
// ADDRESS API CONFIGURATIONS
// ============================================================================

/**
 * Postal Pincode API (India)
 * Free API for Indian PIN code lookup
 * https://www.postalpincode.in/Api-Details
 */
export const POSTAL_PINCODE_CONFIG: AddressAPIConfig = {
  /** Id */
  id: "postal_pincode",
  /** Name */
  name: "Postal Pincode API",
  /** Description */
  description: "Free API for Indian PIN code lookup and validation",
  baseUrl: "https://api.postalpincode.in",
  /** Enabled */
  enabled: true,
  /** Rate Limit */
  rateLimit: {
    /** Requests Per Minute */
    requestsPerMinute: 60,
    /** Requests Per Day */
    requestsPerDay: 10000,
  },
  /** Timeout */
  timeout: 5000,
  /** Retry Attempts */
  retryAttempts: 2,
  cacheTime: 86400000, // 24 hours (PIN codes don't change frequently)
  docs: "https://www.postalpincode.in/Api-Details",
};

/**
 * Zippopotam.us (International)
 * Free postal and zip code API
 * http://www.zippopotam.us/
 */
export const ZIPPOPOTAM_CONFIG: AddressAPIConfig = {
  /** Id */
  id: "zippopotam",
  /** Name */
  name: "Zippopotam",
  /** Description */
  description: "Free international postal code API",
  baseUrl: "https://api.zippopotam.us",
  /** Enabled */
  enabled: true,
  /** Rate Limit */
  rateLimit: {
    /** Requests Per Minute */
    requestsPerMinute: 60,
    /** Requests Per Day */
    requestsPerDay: 5000,
  },
  /** Timeout */
  timeout: 5000,
  /** Retry Attempts */
  retryAttempts: 2,
  cacheTime: 86400000, // 24 hours
  docs: "http://www.zippopotam.us/",
};

/**
 * Address Api Config
 * @constant
 */
export const ADDRESS_API_CONFIG = {
  POSTAL_PINCODE: POSTAL_PINCODE_CONFIG,
  /** Z I P P O P O T A M */
  ZIPPOPOTAM: ZIPPOPOTAM_CONFIG,
};

// ============================================================================
// INDIAN STATES
// ============================================================================

/**
 * Indian States
 * @constant
 */
export const INDIAN_STATES: IndianState[] = [
  {
    /** Code */
    code: "AN",
    /** Name */
    name: "Andaman and Nicobar Islands",
    /** Hindi Name */
    hindiName: "अंडमान और निकोबार द्वीप समूह",
  },
  { code: "AP", name: "Andhra Pradesh", hindiName: "आंध्र प्रदेश" },
  { code: "AR", name: "Arunachal Pradesh", hindiName: "अरुणाचल प्रदेश" },
  { code: "AS", name: "Assam", hindiName: "असम" },
  { code: "BR", name: "Bihar", hindiName: "बिहार" },
  { code: "CH", name: "Chandigarh", hindiName: "चंडीगढ़" },
  { code: "CT", name: "Chhattisgarh", hindiName: "छत्तीसगढ़" },
  {
    /** Code */
    code: "DN",
    /** Name */
    name: "Dadra and Nagar Haveli and Daman and Diu",
    /** Hindi Name */
    hindiName: "दादरा और नगर हवेली और दमन और दीव",
  },
  { code: "DL", name: "Delhi", hindiName: "दिल्ली" },
  { code: "GA", name: "Goa", hindiName: "गोवा" },
  { code: "GJ", name: "Gujarat", hindiName: "गुजरात" },
  { code: "HR", name: "Haryana", hindiName: "हरियाणा" },
  { code: "HP", name: "Himachal Pradesh", hindiName: "हिमाचल प्रदेश" },
  { code: "JK", name: "Jammu and Kashmir", hindiName: "जम्मू और कश्मीर" },
  { code: "JH", name: "Jharkhand", hindiName: "झारखंड" },
  { code: "KA", name: "Karnataka", hindiName: "कर्नाटक" },
  { code: "KL", name: "Kerala", hindiName: "केरल" },
  { code: "LA", name: "Ladakh", hindiName: "लद्दाख" },
  { code: "LD", name: "Lakshadweep", hindiName: "लक्षद्वीप" },
  { code: "MP", name: "Madhya Pradesh", hindiName: "मध्य प्रदेश" },
  { code: "MH", name: "Maharashtra", hindiName: "महाराष्ट्र" },
  { code: "MN", name: "Manipur", hindiName: "मणिपुर" },
  { code: "ML", name: "Meghalaya", hindiName: "मेघालय" },
  { code: "MZ", name: "Mizoram", hindiName: "मिजोरम" },
  { code: "NL", name: "Nagaland", hindiName: "नागालैंड" },
  { code: "OR", name: "Odisha", hindiName: "ओडिशा" },
  { code: "PY", name: "Puducherry", hindiName: "पुडुचेरी" },
  { code: "PB", name: "Punjab", hindiName: "पंजाब" },
  { code: "RJ", name: "Rajasthan", hindiName: "राजस्थान" },
  { code: "SK", name: "Sikkim", hindiName: "सिक्किम" },
  { code: "TN", name: "Tamil Nadu", hindiName: "तमिलनाडु" },
  { code: "TG", name: "Telangana", hindiName: "तेलंगाना" },
  { code: "TR", name: "Tripura", hindiName: "त्रिपुरा" },
  { code: "UP", name: "Uttar Pradesh", hindiName: "उत्तर प्रदेश" },
  { code: "UT", name: "Uttarakhand", hindiName: "उत्तराखंड" },
  { code: "WB", name: "West Bengal", hindiName: "पश्चिम बंगाल" },
];

// ============================================================================
// SUPPORTED COUNTRIES
// ============================================================================

/**
 * Countries supported by Zippopotam API
 * Full list: http://www.zippopotam.us/
 */
export const FALLBACK_COUNTRIES: Country[] = [
  // Major countries
  {
    /** Code */
    code: "US",
    /** Name */
    name: "United States",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN or NNNNN-NNNN",
    /** Postal Code Example */
    postalCodeExample: "90210",
  },
  {
    /** Code */
    code: "GB",
    /** Name */
    name: "United Kingdom",
    /** Postal Code Format */
    postalCodeFormat: "AA9A 9AA",
    /** Postal Code Example */
    postalCodeExample: "SW1A 1AA",
  },
  {
    /** Code */
    code: "CA",
    /** Name */
    name: "Canada",
    /** Postal Code Format */
    postalCodeFormat: "A9A 9A9",
    /** Postal Code Example */
    postalCodeExample: "K1A 0B1",
  },
  {
    /** Code */
    code: "AU",
    /** Name */
    name: "Australia",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "2000",
  },
  {
    /** Code */
    code: "DE",
    /** Name */
    name: "Germany",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "10115",
  },
  {
    /** Code */
    code: "FR",
    /** Name */
    name: "France",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "75001",
  },
  {
    /** Code */
    code: "IT",
    /** Name */
    name: "Italy",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "00118",
  },
  {
    /** Code */
    code: "ES",
    /** Name */
    name: "Spain",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "28001",
  },
  {
    /** Code */
    code: "NL",
    /** Name */
    name: "Netherlands",
    /** Postal Code Format */
    postalCodeFormat: "NNNN AA",
    /** Postal Code Example */
    postalCodeExample: "1012 JS",
  },
  {
    /** Code */
    code: "BE",
    /** Name */
    name: "Belgium",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "1000",
  },
  {
    /** Code */
    code: "AT",
    /** Name */
    name: "Austria",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "1010",
  },
  {
    /** Code */
    code: "CH",
    /** Name */
    name: "Switzerland",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "8001",
  },
  {
    /** Code */
    code: "SE",
    /** Name */
    name: "Sweden",
    /** Postal Code Format */
    postalCodeFormat: "NNN NN",
    /** Postal Code Example */
    postalCodeExample: "111 22",
  },
  {
    /** Code */
    code: "DK",
    /** Name */
    name: "Denmark",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "1050",
  },
  {
    /** Code */
    code: "NO",
    /** Name */
    name: "Norway",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "0001",
  },
  {
    /** Code */
    code: "FI",
    /** Name */
    name: "Finland",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "00100",
  },
  {
    /** Code */
    code: "IE",
    /** Name */
    name: "Ireland",
    /** Postal Code Format */
    postalCodeFormat: "ANN NNNN",
    /** Postal Code Example */
    postalCodeExample: "D02 AF30",
  },
  {
    /** Code */
    code: "PT",
    /** Name */
    name: "Portugal",
    /** Postal Code Format */
    postalCodeFormat: "NNNN-NNN",
    /** Postal Code Example */
    postalCodeExample: "1000-001",
  },
  {
    /** Code */
    code: "GR",
    /** Name */
    name: "Greece",
    /** Postal Code Format */
    postalCodeFormat: "NNN NN",
    /** Postal Code Example */
    postalCodeExample: "104 31",
  },
  {
    /** Code */
    code: "PL",
    /** Name */
    name: "Poland",
    /** Postal Code Format */
    postalCodeFormat: "NN-NNN",
    /** Postal Code Example */
    postalCodeExample: "00-001",
  },
  {
    /** Code */
    code: "CZ",
    /** Name */
    name: "Czech Republic",
    /** Postal Code Format */
    postalCodeFormat: "NNN NN",
    /** Postal Code Example */
    postalCodeExample: "100 00",
  },
  {
    /** Code */
    code: "HU",
    /** Name */
    name: "Hungary",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "1011",
  },
  {
    /** Code */
    code: "RO",
    /** Name */
    name: "Romania",
    /** Postal Code Format */
    postalCodeFormat: "NNNNNN",
    /** Postal Code Example */
    postalCodeExample: "010001",
  },

  // Asia Pacific
  {
    /** Code */
    code: "NZ",
    /** Name */
    name: "New Zealand",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "1010",
  },
  {
    /** Code */
    code: "SG",
    /** Name */
    name: "Singapore",
    /** Postal Code Format */
    postalCodeFormat: "NNNNNN",
    /** Postal Code Example */
    postalCodeExample: "018956",
  },
  {
    /** Code */
    code: "HK",
    /** Name */
    name: "Hong Kong",
    /** Postal Code Format */
    postalCodeFormat: "No postal code",
    /** Postal Code Example */
    postalCodeExample: "-",
  },
  {
    /** Code */
    code: "JP",
    /** Name */
    name: "Japan",
    /** Postal Code Format */
    postalCodeFormat: "NNN-NNNN",
    /** Postal Code Example */
    postalCodeExample: "100-0001",
  },
  {
    /** Code */
    code: "KR",
    /** Name */
    name: "South Korea",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "03141",
  },
  {
    /** Code */
    code: "TH",
    /** Name */
    name: "Thailand",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "10100",
  },
  {
    /** Code */
    code: "MY",
    /** Name */
    name: "Malaysia",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "50000",
  },
  {
    /** Code */
    code: "PH",
    /** Name */
    name: "Philippines",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "1000",
  },
  {
    /** Code */
    code: "ID",
    /** Name */
    name: "Indonesia",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "10110",
  },

  // Middle East
  {
    /** Code */
    code: "AE",
    /** Name */
    name: "United Arab Emirates",
    /** Postal Code Format */
    postalCodeFormat: "No postal code",
    /** Postal Code Example */
    postalCodeExample: "-",
  },
  {
    /** Code */
    code: "SA",
    /** Name */
    name: "Saudi Arabia",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "11564",
  },
  {
    /** Code */
    code: "IL",
    /** Name */
    name: "Israel",
    /** Postal Code Format */
    postalCodeFormat: "NNNNNNN",
    /** Postal Code Example */
    postalCodeExample: "6100001",
  },
  {
    /** Code */
    code: "TR",
    /** Name */
    name: "Turkey",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "34000",
  },

  // Latin America
  {
    /** Code */
    code: "MX",
    /** Name */
    name: "Mexico",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "01000",
  },
  {
    /** Code */
    code: "BR",
    /** Name */
    name: "Brazil",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN-NNN",
    /** Postal Code Example */
    postalCodeExample: "01000-000",
  },
  {
    /** Code */
    code: "AR",
    /** Name */
    name: "Argentina",
    /** Postal Code Format */
    postalCodeFormat: "ANNNA",
    /** Postal Code Example */
    postalCodeExample: "C1000",
  },
  {
    /** Code */
    code: "CL",
    /** Name */
    name: "Chile",
    /** Postal Code Format */
    postalCodeFormat: "NNNNNNN",
    /** Postal Code Example */
    postalCodeExample: "8320000",
  },
  {
    /** Code */
    code: "CO",
    /** Name */
    name: "Colombia",
    /** Postal Code Format */
    postalCodeFormat: "NNNNNN",
    /** Postal Code Example */
    postalCodeExample: "110111",
  },

  // Africa
  {
    /** Code */
    code: "ZA",
    /** Name */
    name: "South Africa",
    /** Postal Code Format */
    postalCodeFormat: "NNNN",
    /** Postal Code Example */
    postalCodeExample: "0001",
  },
  {
    /** Code */
    code: "EG",
    /** Name */
    name: "Egypt",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "11511",
  },
  {
    /** Code */
    code: "NG",
    /** Name */
    name: "Nigeria",
    /** Postal Code Format */
    postalCodeFormat: "NNNNNN",
    /** Postal Code Example */
    postalCodeExample: "100001",
  },
  {
    /** Code */
    code: "KE",
    /** Name */
    name: "Kenya",
    /** Postal Code Format */
    postalCodeFormat: "NNNNN",
    /** Postal Code Example */
    postalCodeExample: "00100",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get state by code
 */
/**
 * Retrieves state by code
 *
 * @param {string} code - The code
 *
 * @returns {string} The statebycode result
 *
 * @example
 * getStateByCode("example");
 */

/**
 * Retrieves state by code
 *
 * @param {string} code - The code
 *
 * @returns {string} The statebycode result
 *
 * @example
 * getStateByCode("example");
 */

export function getStateByCode(code: string): IndianState | undefined {
  return INDIAN_STATES.find((state) => state.code === code);
}

/**
 * Get state by name
 */
/**
 * Retrieves state by name
 *
 * @param {string} name - The name
 *
 * @returns {string} The statebyname result
 *
 * @example
 * getStateByName("example");
 */

/**
 * Retrieves state by name
 *
 * @param {string} name - The name
 *
 * @returns {string} The statebyname result
 *
 * @example
 * getStateByName("example");
 */

export function getStateByName(name: string): IndianState | undefined {
  return INDIAN_STATES.find(
    (state) =>
      state.name.toLowerCase() === name.toLowerCase() ||
      state.hindiName?.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get country by code
 */
/**
 * Retrieves country by code
 *
 * @param {string} code - The code
 *
 * @returns {string} The countrybycode result
 *
 * @example
 * getCountryByCode("example");
 */

/**
 * Retrieves country by code
 *
 * @param {string} code - The code
 *
 * @returns {string} The countrybycode result
 *
 * @example
 * getCountryByCode("example");
 */

export function getCountryByCode(code: string): Country | undefined {
  return FALLBACK_COUNTRIES.find((country) => country.code === code);
}

/**
 * Get country by name
 */
/**
 * Retrieves country by name
 *
 * @param {string} name - The name
 *
 * @returns {string} The countrybyname result
 *
 * @example
 * getCountryByName("example");
 */

/**
 * Retrieves country by name
 *
 * @param {string} name - The name
 *
 * @returns {string} The countrybyname result
 *
 * @example
 * getCountryByName("example");
 */

export function getCountryByName(name: string): Country | undefined {
  return FALLBACK_COUNTRIES.find(
    (country) => country.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Check if postal code API supports country
 */
/**
 * Checks if country supported
 *
 * @param {string} countryCode - The country code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isCountrySupported("example");
 */

/**
 * Checks if country supported
 *
 * @param {string} countryCode - The country code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isCountrySupported("example");
 */

export function isCountrySupported(countryCode: string): boolean {
  if (countryCode === "IN") return true;
  return FALLBACK_COUNTRIES.some((country) => country.code === countryCode);
}

/**
 * Get postal code format for country
 */
/**
 * Retrieves postal code format
 *
 * @param {string} countryCode - The country code
 *
 * @returns {string} The postalcodeformat result
 *
 * @example
 * getPostalCodeFormat("example");
 */

/**
 * Retrieves postal code format
 *
 * @param {string} countryCode - The country code
 *
 * @returns {string} The postalcodeformat result
 *
 * @example
 * getPostalCodeFormat("example");
 */

export function getPostalCodeFormat(countryCode: string): string {
  if (countryCode === "IN") return "NNNNNN (6 digits)";
  const country = getCountryByCode(countryCode);
  return country?.postalCodeFormat || "Unknown format";
}

/**
 * Get postal code example for country
 */
/**
 * Retrieves postal code example
 *
 * @param {string} countryCode - The country code
 *
 * @returns {string} The postalcodeexample result
 *
 * @example
 * getPostalCodeExample("example");
 */

/**
 * Retrieves postal code example
 *
 * @param {string} countryCode - The country code
 *
 * @returns {string} The postalcodeexample result
 *
 * @example
 * getPostalCodeExample("example");
 */

export function getPostalCodeExample(countryCode: string): string {
  if (countryCode === "IN") return "110001";
  const country = getCountryByCode(countryCode);
  return country?.postalCodeExample || "";
}
