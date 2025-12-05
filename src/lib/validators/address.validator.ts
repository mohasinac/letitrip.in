/**
 * @fileoverview TypeScript Module
 * @module src/lib/validators/address.validator
 * @description This file contains functionality related to address.validator
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * Address interface
 * 
 * @interface
 * @description Defines the structure and contract for Address
 */
export interface Address {
  /** Line1 */
  line1: string;
  /** Line2 */
  line2?: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Postal Code */
  postalCode: string;
  /** Country */
  country: string;
  /** Landmark */
  landmark?: string;
}

/**
 * AddressValidationResult interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressValidationResult
 */
export interface AddressValidationResult {
  /** Is Valid */
  isValid: boolean;
  /** Errors */
  errors: {
    /** Field */
    field: keyof Address;
    /** Message */
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
  /** I N */
  IN: {
    /** Postal Code Pattern */
    postalCodePattern: /^\d{6}$/,
    /** Postal Code Name */
    postalCodeName: "PIN Code",
    /** State Required */
    stateRequired: true,
  },
  /** U S */
  US: {
    /** Postal Code Pattern */
    postalCodePattern: /^\d{5}(-\d{4})?$/,
    /** Postal Code Name */
    postalCodeName: "ZIP Code",
    /** State Required */
    stateRequired: true,
  },
  /** C A */
  CA: {
    /** Postal Code Pattern */
    postalCodePattern: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    /** Postal Code Name */
    postalCodeName: "Postal Code",
    /** State Required */
    stateRequired: true,
  },
  /** G B */
  GB: {
    /** Postal Code Pattern */
    postalCodePattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/,
    /** Postal Code Name */
    postalCodeName: "Postcode",
    /** State Required */
    stateRequired: false,
  },
  /** A U */
  AU: {
    /** Postal Code Pattern */
    postalCodePattern: /^\d{4}$/,
    /** Postal Code Name */
    postalCodeName: "Postcode",
    /** State Required */
    stateRequired: true,
  },
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if address is international (non-India)
 */
/**
 * Checks if international address
 *
 * @param {Address | string} address - The address
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isInternationalAddress(address);
 */

/**
 * Checks if international address
 *
 * @param {Address | string} address - The address
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isInternationalAddress(address);
 */

export function isInternationalAddress(address: Address | string): boolean {
  const country = typeof address === "string" ? address : address.country;
  return country.toUpperCase() !== "IN" && country.toUpperCase() !== "INDIA";
}

/**
 * Check if country is eligible for PayPal
 */
/**
 * Checks if pay pal eligible country
 *
 * @param {string} countryCode - The country code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isPayPalEligibleCountry("example");
 */

/**
 * Checks if pay pal eligible country
 *
 * @param {string} countryCode - The country code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isPayPalEligibleCountry("example");
 */

export function isPayPalEligibleCountry(countryCode: string): boolean {
  return PAYPAL_SUPPORTED_COUNTRIES.includes(
    countryCode.toUpperCase() as (typeof PAYPAL_SUPPORTED_COUNTRIES)[number]
  );
}

/**
 * Validate complete address
 */
/**
 * Validates international address
 *
 * @param {Address} address - The address
 *
 * @returns {any} The validateinternationaladdress result
 *
 * @example
 * validateInternationalAddress(address);
 */

/**
 * Validates international address
 *
 * @param {Address} /** Address */
  address - The /**  address */
  address
 *
 * @returns {any} The validateinternationaladdress result
 *
 * @example
 * validateInternationalAddress(/** Address */
  address);
 */

export function validateInternationalAddress(
  /** Address */
  address: Address
): AddressValidationResult {
  const errors: AddressValidationResult["errors"] = [];

  // Validate line1
  if (!address.line1 || address.line1.trim().length === 0) {
    errors.push({
      /** Field */
      field: "line1",
      /** Message */
      message: "Address line 1 is required",
    });
  } else if (address.line1.length < VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH) {
    errors.push({
      /** Field */
      field: "line1",
      /** Message */
      message: `Address line 1 must be at least ${VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH} characters`,
    });
  } else if (address.line1.length > VALIDATION_RULES.ADDRESS.LINE1.MAX_LENGTH) {
    errors.push({
      /** Field */
      field: "line1",
      /** Message */
      message: `Address line 1 must be no more than ${VALIDATION_RULES.ADDRESS.LINE1.MAX_LENGTH} characters`,
    });
  }

  // Validate line2 (optional)
  if (
    address.line2 &&
    address.line2.length > VALIDATION_RULES.ADDRESS.LINE2.MAX_LENGTH
  ) {
    errors.push({
      /** Field */
      field: "line2",
      /** Message */
      message: `Address line 2 must be no more than ${VALIDATION_RULES.ADDRESS.LINE2.MAX_LENGTH} characters`,
    });
  }

  // Validate city
  if (!address.city || address.city.trim().length === 0) {
    errors.push({
      /** Field */
      field: "city",
      /** Message */
      message: "City is required",
    });
  } else if (address.city.length < VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH) {
    errors.push({
      /** Field */
      field: "city",
      /** Message */
      message: `City must be at least ${VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH} characters`,
    });
  } else if (address.city.length > VALIDATION_RULES.ADDRESS.CITY.MAX_LENGTH) {
    errors.push({
      /** Field */
      field: "city",
      /** Message */
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
        /** Field */
        field: "state",
        /** Message */
        message: "State/Province is required",
      });
    } else if (
      address.state.length < VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH
    ) {
      errors.push({
        /** Field */
        field: "state",
        /** Message */
        message: `State must be at least ${VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH} characters`,
      });
    } else if (
      address.state.length > VALIDATION_RULES.ADDRESS.STATE.MAX_LENGTH
    ) {
      errors.push({
        /** Field */
        field: "state",
        /** Message */
        message: `State must be no more than ${VALIDATION_RULES.ADDRESS.STATE.MAX_LENGTH} characters`,
      });
    }
  }

  // Validate postal code
  if (!address.postalCode || address.postalCode.trim().length === 0) {
    const postalCodeName = countryRules?.postalCodeName || "Postal Code";
    errors.push({
      /** Field */
      field: "postalCode",
      /** Message */
      message: `${postalCodeName} is required`,
    });
  } else {
    // Country-specific postal code validation
    if (countryRules) {
      const pattern = countryRules.postalCodePattern;
      if (!pattern.test(address.postalCode)) {
        errors.push({
          /** Field */
          field: "postalCode",
          /** Message */
          message: `Invalid ${countryRules.postalCodeName} format`,
        });
      }
    }
  }

  // Validate country
  if (!address.country || address.country.trim().length === 0) {
    errors.push({
      /** Field */
      field: "country",
      /** Message */
      message: "Country is required",
    });
  }

  // Validate landmark (optional)
  if (
    address.landmark &&
    address.landmark.length > VALIDATION_RULES.ADDRESS.LANDMARK.MAX_LENGTH
  ) {
    errors.push({
      /** Field */
      field: "landmark",
      /** Message */
      message: `Landmark must be no more than ${VALIDATION_RULES.ADDRESS.LANDMARK.MAX_LENGTH} characters`,
    });
  }

  return {
    /** Is Valid */
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Indian PIN code
 */
/**
 * Checks if valid indian pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidIndianPincode("example");
 */

/**
 * Checks if valid indian pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidIndianPincode("example");
 */

export function isValidIndianPincode(pincode: string): boolean {
  return VALIDATION_RULES.ADDRESS.PINCODE.PATTERN.test(pincode);
}

/**
 * Validate US ZIP code
 */
/**
 * Checks if valid u s zip code
 *
 * @param {string} zipCode - The zip code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidUSZipCode("example");
 */

/**
 * Checks if valid u s zip code
 *
 * @param {string} zipCode - The zip code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidUSZipCode("example");
 */

export function isValidUSZipCode(zipCode: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
}

/**
 * Validate Canadian postal code
 */
/**
 * Checks if valid canadian postal code
 *
 * @param {string} postalCode - The postal code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidCanadianPostalCode("example");
 */

/**
 * Checks if valid canadian postal code
 *
 * @param {string} postalCode - The postal code
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidCanadianPostalCode("example");
 */

export function isValidCanadianPostalCode(postalCode: string): boolean {
  return /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(postalCode.toUpperCase());
}

/**
 * Validate UK postcode
 */
/**
 * Checks if valid u k postcode
 *
 * @param {string} postcode - The postcode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidUKPostcode("example");
 */

/**
 * Checks if valid u k postcode
 *
 * @param {string} postcode - The postcode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidUKPostcode("example");
 */

export function isValidUKPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(postcode);
}

/**
 * Format postal code based on country
 */
/**
 * Formats postal code
 *
 * @param {string} postalCode - The postal code
 * @param {string} country - The country
 *
 * @returns {string} The formatpostalcode result
 *
 * @example
 * formatPostalCode("example", "example");
 */

/**
 * Formats postal code
 *
 * @param {string} postalCode - The postal code
 * @param {string} country - The country
 *
 * @returns {string} The formatpostalcode result
 *
 * @example
 * formatPostalCode("example", "example");
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

    /** Default */
    default:
      return cleaned;
  }
}

/**
 * Get postal code name for country
 */
/**
 * Retrieves postal code name
 *
 * @param {string} country - The country
 *
 * @returns {string} The postalcodename result
 *
 * @example
 * getPostalCodeName("example");
 */

/**
 * Retrieves postal code name
 *
 * @param {string} country - The country
 *
 * @returns {string} The postalcodename result
 *
 * @example
 * getPostalCodeName("example");
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
/**
 * Checks if state required
 *
 * @param {string} country - The country
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isStateRequired("example");
 */

/**
 * Checks if state required
 *
 * @param {string} country - The country
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isStateRequired("example");
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
/**
 * Validates postal code
 *
 * @param {string} postalCode - The postal code
 * @param {string} country - The country
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validatePostalCode("example", "example");
 */

/**
 * Validates postal code
 *
 * @returns {string} The validatepostalcode result
 *
 * @example
 * validatePostalCode();
 */

export function validatePostalCode(
  /** Postal Code */
  postalCode: string,
  /** Country */
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
      /** Is Valid */
      isValid: false,
      /** Error */
      error: `Invalid ${countryRules.postalCodeName} format`,
    };
  }

  return { isValid: true };
}

/**
 * Get example postal code for country
 */
/**
 * Retrieves postal code example
 *
 * @param {string} country - The country
 *
 * @returns {string} The postalcodeexample result
 *
 * @example
 * getPostalCodeExample("example");
 */

/**
 * Retrieves postal code example
 *
 * @param {string} country - The country
 *
 * @returns {string} The postalcodeexample result
 *
 * @example
 * getPostalCodeExample("example");
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
    /** Default */
    default:
      return "123456";
  }
}

/**
 * Check if address is valid for PayPal
 */
/**
 * Checks if valid pay pal address
 *
 * @param {Address} address - The address
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPayPalAddress(address);
 */

/**
 * Checks if valid pay pal address
 *
 * @param {Address} address - The address
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isValidPayPalAddress(address);
 */

export function isValidPayPalAddress(address: Address): {
  /** Is Valid */
  isValid: boolean;
  /** Error */
  error?: string;
} {
  // Check country eligibility
  if (!isPayPalEligibleCountry(address.country)) {
    return {
      /** Is Valid */
      isValid: false,
      /** Error */
      error: `PayPal is not available in ${address.country}`,
    };
  }

  // Validate address structure
  const validation = validateInternationalAddress(address);

  if (!validation.isValid) {
    return {
      /** Is Valid */
      isValid: false,
      /** Error */
      error: validation.errors.map((e) => e.message).join(", "),
    };
  }

  return { isValid: true };
}

/**
 * Normalize address for API submission
 */
/**
 * Performs normalize address operation
 *
 * @param {Address} address - The address
 *
 * @returns {any} The normalizeaddress result
 *
 * @example
 * normalizeAddress(address);
 */

/**
 * Performs normalize address operation
 *
 * @param {Address} address - The address
 *
 * @returns {any} The normalizeaddress result
 *
 * @example
 * normalizeAddress(address);
 */

export function normalizeAddress(address: Address): Address {
  return {
    /** Line1 */
    line1: address.line1.trim(),
    /** Line2 */
    line2: address.line2?.trim() || undefined,
    /** City */
    city: address.city.trim(),
    /** State */
    state: address.state.trim(),
    /** Postal Code */
    postalCode: formatPostalCode(address.postalCode, address.country),
    /** Country */
    country: address.country.toUpperCase(),
    /** Landmark */
    landmark: address.landmark?.trim() || undefined,
  };
}
