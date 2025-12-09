/**
 * Address Validator
 *
 * Validation utilities for address fields, international addresses,
 * and PayPal eligibility checks.
 *
 * Usage:
 * ```ts
 * import { isInternationalAddress, isPayPalEligibleCountry } from '@/lib/validators/address.validator';
 *
 * const isIntl = isInternationalAddress(address);
 * const canUsePayPal = isPayPalEligibleCountry('US');
 * ```
 */

import { VALIDATION_RULES } from "@/constants/validation-messages";

// ============================================================================
// TYPES
// ============================================================================

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: {
    field: keyof Address;
    message: string;
  }[];
}

// ============================================================================
// COUNTRY DEFINITIONS
// ============================================================================

/**
 * PayPal supported countries
 * Full list: https://developer.paypal.com/docs/reports/reference/paypal-supported-countries/
 */
export const PAYPAL_SUPPORTED_COUNTRIES = [
  "US", // United States
  "GB", // United Kingdom
  "CA", // Canada
  "AU", // Australia
  "DE", // Germany
  "FR", // France
  "IT", // Italy
  "ES", // Spain
  "NL", // Netherlands
  "BE", // Belgium
  "AT", // Austria
  "CH", // Switzerland
  "SE", // Sweden
  "DK", // Denmark
  "NO", // Norway
  "FI", // Finland
  "IE", // Ireland
  "PT", // Portugal
  "GR", // Greece
  "PL", // Poland
  "CZ", // Czech Republic
  "HU", // Hungary
  "RO", // Romania
  "NZ", // New Zealand
  "SG", // Singapore
  "HK", // Hong Kong
  "JP", // Japan
  "IN", // India (limited)
] as const;

/**
 * Countries requiring special handling
 */
export const SPECIAL_HANDLING_COUNTRIES = {
  IN: {
    postalCodePattern: /^\d{6}$/,
    postalCodeName: "PIN Code",
    stateRequired: true,
  },
  US: {
    postalCodePattern: /^\d{5}(-\d{4})?$/,
    postalCodeName: "ZIP Code",
    stateRequired: true,
  },
  CA: {
    postalCodePattern: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    postalCodeName: "Postal Code",
    stateRequired: true,
  },
  GB: {
    postalCodePattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/,
    postalCodeName: "Postcode",
    stateRequired: false,
  },
  AU: {
    postalCodePattern: /^\d{4}$/,
    postalCodeName: "Postcode",
    stateRequired: true,
  },
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if address is international (non-India)
 */
export function isInternationalAddress(address: Address | string): boolean {
  const country = typeof address === "string" ? address : address.country;
  if (!country) return false;
  return country.toUpperCase() !== "IN" && country.toUpperCase() !== "INDIA";
}

/**
 * Check if country is eligible for PayPal
 */
export function isPayPalEligibleCountry(countryCode: string): boolean {
  return PAYPAL_SUPPORTED_COUNTRIES.includes(
    countryCode.toUpperCase() as (typeof PAYPAL_SUPPORTED_COUNTRIES)[number]
  );
}

/**
 * Validate complete address
 */
export function validateInternationalAddress(
  address: Address
): AddressValidationResult {
  const errors: AddressValidationResult["errors"] = [];

  // Validate line1
  if (!address.line1 || address.line1.trim().length === 0) {
    errors.push({
      field: "line1",
      message: "Address line 1 is required",
    });
  } else if (address.line1.length < VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH) {
    errors.push({
      field: "line1",
      message: `Address line 1 must be at least ${VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH} characters`,
    });
  } else if (address.line1.length > VALIDATION_RULES.ADDRESS.LINE1.MAX_LENGTH) {
    errors.push({
      field: "line1",
      message: `Address line 1 must be no more than ${VALIDATION_RULES.ADDRESS.LINE1.MAX_LENGTH} characters`,
    });
  }

  // Validate line2 (optional)
  if (
    address.line2 &&
    address.line2.length > VALIDATION_RULES.ADDRESS.LINE2.MAX_LENGTH
  ) {
    errors.push({
      field: "line2",
      message: `Address line 2 must be no more than ${VALIDATION_RULES.ADDRESS.LINE2.MAX_LENGTH} characters`,
    });
  }

  // Validate city
  if (!address.city || address.city.trim().length === 0) {
    errors.push({
      field: "city",
      message: "City is required",
    });
  } else if (address.city.length < VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH) {
    errors.push({
      field: "city",
      message: `City must be at least ${VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH} characters`,
    });
  } else if (address.city.length > VALIDATION_RULES.ADDRESS.CITY.MAX_LENGTH) {
    errors.push({
      field: "city",
      message: `City must be no more than ${VALIDATION_RULES.ADDRESS.CITY.MAX_LENGTH} characters`,
    });
  }

  // Validate state
  const countryRules =
    SPECIAL_HANDLING_COUNTRIES[
      address.country.toUpperCase() as keyof typeof SPECIAL_HANDLING_COUNTRIES
    ];

  if (countryRules?.stateRequired || address.country.toUpperCase() === "IN") {
    if (!address.state || address.state.trim().length === 0) {
      errors.push({
        field: "state",
        message: "State/Province is required",
      });
    } else if (
      address.state.length < VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH
    ) {
      errors.push({
        field: "state",
        message: `State must be at least ${VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH} characters`,
      });
    } else if (
      address.state.length > VALIDATION_RULES.ADDRESS.STATE.MAX_LENGTH
    ) {
      errors.push({
        field: "state",
        message: `State must be no more than ${VALIDATION_RULES.ADDRESS.STATE.MAX_LENGTH} characters`,
      });
    }
  }

  // Validate postal code
  if (!address.postalCode || address.postalCode.trim().length === 0) {
    const postalCodeName = countryRules?.postalCodeName || "Postal Code";
    errors.push({
      field: "postalCode",
      message: `${postalCodeName} is required`,
    });
  } else {
    // Country-specific postal code validation
    if (countryRules) {
      const pattern = countryRules.postalCodePattern;
      if (!pattern.test(address.postalCode)) {
        errors.push({
          field: "postalCode",
          message: `Invalid ${countryRules.postalCodeName} format`,
        });
      }
    }
  }

  // Validate country
  if (!address.country || address.country.trim().length === 0) {
    errors.push({
      field: "country",
      message: "Country is required",
    });
  }

  // Validate landmark (optional)
  if (
    address.landmark &&
    address.landmark.length > VALIDATION_RULES.ADDRESS.LANDMARK.MAX_LENGTH
  ) {
    errors.push({
      field: "landmark",
      message: `Landmark must be no more than ${VALIDATION_RULES.ADDRESS.LANDMARK.MAX_LENGTH} characters`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Indian PIN code
 */
export function isValidIndianPincode(pincode: string): boolean {
  return VALIDATION_RULES.ADDRESS.PINCODE.PATTERN.test(pincode);
}

/**
 * Validate US ZIP code
 */
export function isValidUSZipCode(zipCode: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
}

/**
 * Validate Canadian postal code
 */
export function isValidCanadianPostalCode(postalCode: string): boolean {
  return /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(postalCode.toUpperCase());
}

/**
 * Validate UK postcode
 */
export function isValidUKPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(postcode);
}

/**
 * Format postal code based on country
 */
export function formatPostalCode(postalCode: string, country: string): string {
  const cleaned = postalCode.trim().toUpperCase();

  switch (country.toUpperCase()) {
    case "IN":
      // Indian PIN: 6 digits
      return cleaned.replace(/\D/g, "").slice(0, 6);

    case "US":
      // US ZIP: 5 digits or 5+4
      const digits = cleaned.replace(/\D/g, "");
      if (digits.length <= 5) {
        return digits;
      }
      return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;

    case "CA":
      // Canadian: A1A 1A1
      const alphanumeric = cleaned.replace(/[^A-Z0-9]/g, "");
      if (alphanumeric.length >= 6) {
        return `${alphanumeric.slice(0, 3)} ${alphanumeric.slice(3, 6)}`;
      }
      return alphanumeric;

    case "GB":
      // UK postcode: AA9A 9AA
      return cleaned;

    default:
      return cleaned;
  }
}

/**
 * Get postal code name for country
 */
export function getPostalCodeName(country: string): string {
  const countryRules =
    SPECIAL_HANDLING_COUNTRIES[
      country.toUpperCase() as keyof typeof SPECIAL_HANDLING_COUNTRIES
    ];
  return countryRules?.postalCodeName || "Postal Code";
}

/**
 * Check if country requires state field
 */
export function isStateRequired(country: string): boolean {
  const countryRules =
    SPECIAL_HANDLING_COUNTRIES[
      country.toUpperCase() as keyof typeof SPECIAL_HANDLING_COUNTRIES
    ];
  return countryRules?.stateRequired ?? true;
}

/**
 * Validate postal code for specific country
 */
export function validatePostalCode(
  postalCode: string,
  country: string
): { isValid: boolean; error?: string } {
  const countryRules =
    SPECIAL_HANDLING_COUNTRIES[
      country.toUpperCase() as keyof typeof SPECIAL_HANDLING_COUNTRIES
    ];

  if (!countryRules) {
    // No specific rules, just check it's not empty
    if (!postalCode || postalCode.trim().length === 0) {
      return { isValid: false, error: "Postal code is required" };
    }
    return { isValid: true };
  }

  if (!countryRules.postalCodePattern.test(postalCode)) {
    return {
      isValid: false,
      error: `Invalid ${countryRules.postalCodeName} format`,
    };
  }

  return { isValid: true };
}

/**
 * Get example postal code for country
 */
export function getPostalCodeExample(country: string): string {
  switch (country.toUpperCase()) {
    case "IN":
      return "110001";
    case "US":
      return "90210";
    case "CA":
      return "K1A 0B1";
    case "GB":
      return "SW1A 1AA";
    case "AU":
      return "2000";
    default:
      return "123456";
  }
}

/**
 * Check if address is valid for PayPal
 */
export function isValidPayPalAddress(address: Address): {
  isValid: boolean;
  error?: string;
} {
  // Check country eligibility
  if (!isPayPalEligibleCountry(address.country)) {
    return {
      isValid: false,
      error: `PayPal is not available in ${address.country}`,
    };
  }

  // Validate address structure
  const validation = validateInternationalAddress(address);

  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.errors.map((e) => e.message).join(", "),
    };
  }

  return { isValid: true };
}

/**
 * Normalize address for API submission
 */
export function normalizeAddress(address: Address): Address {
  return {
    line1: address.line1.trim(),
    line2: address.line2?.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: formatPostalCode(address.postalCode, address.country),
    country: address.country.toUpperCase(),
    landmark: address.landmark?.trim() || undefined,
  };
}

/**
 * Alias for validateInternationalAddress (for backward compatibility)
 */
export const validateAddress = validateInternationalAddress;
