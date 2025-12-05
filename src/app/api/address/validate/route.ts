/**
 * @fileoverview TypeScript Module
 * @module src/app/api/address/validate/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Address Validation API Route
 * POST /api/address/validate
 *
 * Validates an address for completeness and correctness.
 * Public endpoint - no authentication required.
 */

import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * AddressValidationRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressValidationRequest
 */
interface AddressValidationRequest {
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2?: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Postal Code */
  postalCode: string;
  /** Country */
  country: string;
}

/**
 * ValidationError interface
 * 
 * @interface
 * @description Defines the structure and contract for ValidationError
 */
interface ValidationError {
  /** Field */
  field: string;
  /** Message */
  message: string;
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AddressValidationRequest = await request.json();
    const { addressLine1, addressLine2, city, state, postalCode, country } =
      body;

    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!addressLine1 || addressLine1.trim().length === 0) {
      errors.push({
        /** Field */
        field: "addressLine1",
        /** Message */
        message: "Address line 1 is required",
      });
    } else if (addressLine1.length < 5) {
      errors.push({
        /** Field */
        field: "addressLine1",
        /** Message */
        message: "Address line 1 must be at least 5 characters",
      });
    } else if (addressLine1.length > 200) {
      errors.push({
        /** Field */
        field: "addressLine1",
        /** Message */
        message: "Address line 1 must not exceed 200 characters",
      });
    }

    if (addressLine2 && addressLine2.length > 200) {
      errors.push({
        /** Field */
        field: "addressLine2",
        /** Message */
        message: "Address line 2 must not exceed 200 characters",
      });
    }

    if (!city || city.trim().length === 0) {
      errors.push({
        /** Field */
        field: "city",
        /** Message */
        message: "City is required",
      });
    } else if (city.length < 2) {
      errors.push({
        /** Field */
        field: "city",
        /** Message */
        message: "City name must be at least 2 characters",
      });
    } else if (city.length > 100) {
      errors.push({
        /** Field */
        field: "city",
        /** Message */
        message: "City name must not exceed 100 characters",
      });
    }

    if (!state || state.trim().length === 0) {
      errors.push({
        /** Field */
        field: "state",
        /** Message */
        message: "State/Province is required",
      });
    } else if (state.length > 100) {
      errors.push({
        /** Field */
        field: "state",
        /** Message */
        message: "State/Province name must not exceed 100 characters",
      });
    }

    if (!postalCode || postalCode.trim().length === 0) {
      errors.push({
        /** Field */
        field: "postalCode",
        /** Message */
        message: "Postal/ZIP code is required",
      });
    } else {
      // Validate postal code format based on country
      const countryCode = country?.toUpperCase() || "IN";

      if (countryCode === "IN") {
        // Indian PIN code: 6 digits
        if (!/^\d{6}$/.test(postalCode)) {
          errors.push({
            /** Field */
            field: "postalCode",
            /** Message */
            message: "Invalid Indian PIN code format (must be 6 digits)",
          });
        }
      } else if (countryCode === "US") {
        // US ZIP code: 5 digits or 5+4 format
        if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
          errors.push({
            /** Field */
            field: "postalCode",
            /** Message */
            message: "Invalid US ZIP code format (must be 12345 or 12345-6789)",
          });
        }
      } else if (countryCode === "CA") {
        // Canadian postal code: A1A 1A1 format
        if (!/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(postalCode)) {
          errors.push({
            /** Field */
            field: "postalCode",
            /** Message */
            message: "Invalid Canadian postal code format (must be A1A 1A1)",
          });
        }
      } else if (countryCode === "GB") {
        // UK postcode: Various formats
        if (!/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(postalCode)) {
          errors.push({
            /** Field */
            field: "postalCode",
            /** Message */
            message: "Invalid UK postcode format",
          });
        }
      } else if (countryCode === "AU") {
        // Australian postcode: 4 digits
        if (!/^\d{4}$/.test(postalCode)) {
          errors.push({
            /** Field */
            field: "postalCode",
            /** Message */
            message: "Invalid Australian postcode format (must be 4 digits)",
          });
        }
      } else {
        // Generic validation for other countries
        if (postalCode.length < 3 || postalCode.length > 10) {
          warnings.push("Postal code length seems unusual for this country");
        }
      }
    }

    if (!country || country.trim().length === 0) {
      errors.push({
        /** Field */
        field: "country",
        /** Message */
        message: "Country is required",
      });
    } else if (country.length !== 2 && country.length > 50) {
      errors.push({
        /** Field */
        field: "country",
        /** Message */
        message: "Country must be a 2-letter code or full name (max 50 chars)",
      });
    }

    // Check for potentially incomplete addresses
    if (addressLine1 && addressLine1.length < 10) {
      warnings.push("Address seems very short - please verify it's complete");
    }

    // Check for PO Box addresses
    if (addressLine1 && /p\.?o\.?\s*box/i.test(addressLine1)) {
      warnings.push(
        "PO Box address detected - some carriers may not deliver to PO Boxes"
      );
    }

    // Return validation result
    if (errors.length > 0) {
      return NextResponse.json(
        {
          /** Valid */
          valid: false,
          errors,
          /** Warnings */
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        /** Valid */
        valid: true,
        /** Warnings */
        warnings: warnings.length > 0 ? warnings : undefined,
        /** Message */
        message: "Address is valid",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "AddressValidationAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Failed to validate address",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to validate address",
        /** Valid */
        valid: false,
      },
      { status: 500 }
    );
  }
}
