/**
 * Address Validation API Route
 * POST /api/address/validate
 *
 * Validates an address for completeness and correctness.
 * Public endpoint - no authentication required.
 */

import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface AddressValidationRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ValidationError {
  field: string;
  message: string;
}

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
        field: "addressLine1",
        message: "Address line 1 is required",
      });
    } else if (addressLine1.length < 5) {
      errors.push({
        field: "addressLine1",
        message: "Address line 1 must be at least 5 characters",
      });
    } else if (addressLine1.length > 200) {
      errors.push({
        field: "addressLine1",
        message: "Address line 1 must not exceed 200 characters",
      });
    }

    if (addressLine2 && addressLine2.length > 200) {
      errors.push({
        field: "addressLine2",
        message: "Address line 2 must not exceed 200 characters",
      });
    }

    if (!city || city.trim().length === 0) {
      errors.push({
        field: "city",
        message: "City is required",
      });
    } else if (city.length < 2) {
      errors.push({
        field: "city",
        message: "City name must be at least 2 characters",
      });
    } else if (city.length > 100) {
      errors.push({
        field: "city",
        message: "City name must not exceed 100 characters",
      });
    }

    if (!state || state.trim().length === 0) {
      errors.push({
        field: "state",
        message: "State/Province is required",
      });
    } else if (state.length > 100) {
      errors.push({
        field: "state",
        message: "State/Province name must not exceed 100 characters",
      });
    }

    if (!postalCode || postalCode.trim().length === 0) {
      errors.push({
        field: "postalCode",
        message: "Postal/ZIP code is required",
      });
    } else {
      // Validate postal code format based on country
      const countryCode = country?.toUpperCase() || "IN";

      if (countryCode === "IN") {
        // Indian PIN code: 6 digits
        if (!/^\d{6}$/.test(postalCode)) {
          errors.push({
            field: "postalCode",
            message: "Invalid Indian PIN code format (must be 6 digits)",
          });
        }
      } else if (countryCode === "US") {
        // US ZIP code: 5 digits or 5+4 format
        if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
          errors.push({
            field: "postalCode",
            message: "Invalid US ZIP code format (must be 12345 or 12345-6789)",
          });
        }
      } else if (countryCode === "CA") {
        // Canadian postal code: A1A 1A1 format
        if (!/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(postalCode)) {
          errors.push({
            field: "postalCode",
            message: "Invalid Canadian postal code format (must be A1A 1A1)",
          });
        }
      } else if (countryCode === "GB") {
        // UK postcode: Various formats
        if (!/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(postalCode)) {
          errors.push({
            field: "postalCode",
            message: "Invalid UK postcode format",
          });
        }
      } else if (countryCode === "AU") {
        // Australian postcode: 4 digits
        if (!/^\d{4}$/.test(postalCode)) {
          errors.push({
            field: "postalCode",
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
        field: "country",
        message: "Country is required",
      });
    } else if (country.length !== 2 && country.length > 50) {
      errors.push({
        field: "country",
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
          valid: false,
          errors,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        warnings: warnings.length > 0 ? warnings : undefined,
        message: "Address is valid",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "AddressValidationAPI",
      method: "POST",
      context: "Failed to validate address",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to validate address",
        valid: false,
      },
      { status: 500 }
    );
  }
}
