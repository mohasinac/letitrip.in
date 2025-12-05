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

export interface AddressAPIConfig {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  enabled: boolean;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  timeout: number; // milliseconds
  retryAttempts: number;
  cacheTime: number; // milliseconds
  docs: string;
}

export interface IndianState {
  code: string;
  name: string;
  hindiName?: string;
}

export interface Country {
  code: string;
  name: string;
  postalCodeFormat: string;
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
  id: "postal_pincode",
  name: "Postal Pincode API",
  description: "Free API for Indian PIN code lookup and validation",
  baseUrl: "https://api.postalpincode.in",
  enabled: true,
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 10000,
  },
  timeout: 5000,
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
  id: "zippopotam",
  name: "Zippopotam",
  description: "Free international postal code API",
  baseUrl: "https://api.zippopotam.us",
  enabled: true,
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 5000,
  },
  timeout: 5000,
  retryAttempts: 2,
  cacheTime: 86400000, // 24 hours
  docs: "http://www.zippopotam.us/",
};

export const ADDRESS_API_CONFIG = {
  POSTAL_PINCODE: POSTAL_PINCODE_CONFIG,
  ZIPPOPOTAM: ZIPPOPOTAM_CONFIG,
};

// ============================================================================
// INDIAN STATES
// ============================================================================

export const INDIAN_STATES: IndianState[] = [
  {
    code: "AN",
    name: "Andaman and Nicobar Islands",
    hindiName: "अंडमान और निकोबार द्वीप समूह",
  },
  { code: "AP", name: "Andhra Pradesh", hindiName: "आंध्र प्रदेश" },
  { code: "AR", name: "Arunachal Pradesh", hindiName: "अरुणाचल प्रदेश" },
  { code: "AS", name: "Assam", hindiName: "असम" },
  { code: "BR", name: "Bihar", hindiName: "बिहार" },
  { code: "CH", name: "Chandigarh", hindiName: "चंडीगढ़" },
  { code: "CT", name: "Chhattisgarh", hindiName: "छत्तीसगढ़" },
  {
    code: "DN",
    name: "Dadra and Nagar Haveli and Daman and Diu",
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
    code: "US",
    name: "United States",
    postalCodeFormat: "NNNNN or NNNNN-NNNN",
    postalCodeExample: "90210",
  },
  {
    code: "GB",
    name: "United Kingdom",
    postalCodeFormat: "AA9A 9AA",
    postalCodeExample: "SW1A 1AA",
  },
  {
    code: "CA",
    name: "Canada",
    postalCodeFormat: "A9A 9A9",
    postalCodeExample: "K1A 0B1",
  },
  {
    code: "AU",
    name: "Australia",
    postalCodeFormat: "NNNN",
    postalCodeExample: "2000",
  },
  {
    code: "DE",
    name: "Germany",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "10115",
  },
  {
    code: "FR",
    name: "France",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "75001",
  },
  {
    code: "IT",
    name: "Italy",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "00118",
  },
  {
    code: "ES",
    name: "Spain",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "28001",
  },
  {
    code: "NL",
    name: "Netherlands",
    postalCodeFormat: "NNNN AA",
    postalCodeExample: "1012 JS",
  },
  {
    code: "BE",
    name: "Belgium",
    postalCodeFormat: "NNNN",
    postalCodeExample: "1000",
  },
  {
    code: "AT",
    name: "Austria",
    postalCodeFormat: "NNNN",
    postalCodeExample: "1010",
  },
  {
    code: "CH",
    name: "Switzerland",
    postalCodeFormat: "NNNN",
    postalCodeExample: "8001",
  },
  {
    code: "SE",
    name: "Sweden",
    postalCodeFormat: "NNN NN",
    postalCodeExample: "111 22",
  },
  {
    code: "DK",
    name: "Denmark",
    postalCodeFormat: "NNNN",
    postalCodeExample: "1050",
  },
  {
    code: "NO",
    name: "Norway",
    postalCodeFormat: "NNNN",
    postalCodeExample: "0001",
  },
  {
    code: "FI",
    name: "Finland",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "00100",
  },
  {
    code: "IE",
    name: "Ireland",
    postalCodeFormat: "ANN NNNN",
    postalCodeExample: "D02 AF30",
  },
  {
    code: "PT",
    name: "Portugal",
    postalCodeFormat: "NNNN-NNN",
    postalCodeExample: "1000-001",
  },
  {
    code: "GR",
    name: "Greece",
    postalCodeFormat: "NNN NN",
    postalCodeExample: "104 31",
  },
  {
    code: "PL",
    name: "Poland",
    postalCodeFormat: "NN-NNN",
    postalCodeExample: "00-001",
  },
  {
    code: "CZ",
    name: "Czech Republic",
    postalCodeFormat: "NNN NN",
    postalCodeExample: "100 00",
  },
  {
    code: "HU",
    name: "Hungary",
    postalCodeFormat: "NNNN",
    postalCodeExample: "1011",
  },
  {
    code: "RO",
    name: "Romania",
    postalCodeFormat: "NNNNNN",
    postalCodeExample: "010001",
  },

  // Asia Pacific
  {
    code: "NZ",
    name: "New Zealand",
    postalCodeFormat: "NNNN",
    postalCodeExample: "1010",
  },
  {
    code: "SG",
    name: "Singapore",
    postalCodeFormat: "NNNNNN",
    postalCodeExample: "018956",
  },
  {
    code: "HK",
    name: "Hong Kong",
    postalCodeFormat: "No postal code",
    postalCodeExample: "-",
  },
  {
    code: "JP",
    name: "Japan",
    postalCodeFormat: "NNN-NNNN",
    postalCodeExample: "100-0001",
  },
  {
    code: "KR",
    name: "South Korea",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "03141",
  },
  {
    code: "TH",
    name: "Thailand",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "10100",
  },
  {
    code: "MY",
    name: "Malaysia",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "50000",
  },
  {
    code: "PH",
    name: "Philippines",
    postalCodeFormat: "NNNN",
    postalCodeExample: "1000",
  },
  {
    code: "ID",
    name: "Indonesia",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "10110",
  },

  // Middle East
  {
    code: "AE",
    name: "United Arab Emirates",
    postalCodeFormat: "No postal code",
    postalCodeExample: "-",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "11564",
  },
  {
    code: "IL",
    name: "Israel",
    postalCodeFormat: "NNNNNNN",
    postalCodeExample: "6100001",
  },
  {
    code: "TR",
    name: "Turkey",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "34000",
  },

  // Latin America
  {
    code: "MX",
    name: "Mexico",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "01000",
  },
  {
    code: "BR",
    name: "Brazil",
    postalCodeFormat: "NNNNN-NNN",
    postalCodeExample: "01000-000",
  },
  {
    code: "AR",
    name: "Argentina",
    postalCodeFormat: "ANNNA",
    postalCodeExample: "C1000",
  },
  {
    code: "CL",
    name: "Chile",
    postalCodeFormat: "NNNNNNN",
    postalCodeExample: "8320000",
  },
  {
    code: "CO",
    name: "Colombia",
    postalCodeFormat: "NNNNNN",
    postalCodeExample: "110111",
  },

  // Africa
  {
    code: "ZA",
    name: "South Africa",
    postalCodeFormat: "NNNN",
    postalCodeExample: "0001",
  },
  {
    code: "EG",
    name: "Egypt",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "11511",
  },
  {
    code: "NG",
    name: "Nigeria",
    postalCodeFormat: "NNNNNN",
    postalCodeExample: "100001",
  },
  {
    code: "KE",
    name: "Kenya",
    postalCodeFormat: "NNNNN",
    postalCodeExample: "00100",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get state by code
 */
export function getStateByCode(code: string): IndianState | undefined {
  return INDIAN_STATES.find((state) => state.code === code);
}

/**
 * Get state by name
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
export function getCountryByCode(code: string): Country | undefined {
  return FALLBACK_COUNTRIES.find((country) => country.code === code);
}

/**
 * Get country by name
 */
export function getCountryByName(name: string): Country | undefined {
  return FALLBACK_COUNTRIES.find(
    (country) => country.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Check if postal code API supports country
 */
export function isCountrySupported(countryCode: string): boolean {
  if (countryCode === "IN") return true;
  return FALLBACK_COUNTRIES.some((country) => country.code === countryCode);
}

/**
 * Get postal code format for country
 */
export function getPostalCodeFormat(countryCode: string): string {
  if (countryCode === "IN") return "NNNNNN (6 digits)";
  const country = getCountryByCode(countryCode);
  return country?.postalCodeFormat || "Unknown format";
}

/**
 * Get postal code example for country
 */
export function getPostalCodeExample(countryCode: string): string {
  if (countryCode === "IN") return "110001";
  const country = getCountryByCode(countryCode);
  return country?.postalCodeExample || "";
}
