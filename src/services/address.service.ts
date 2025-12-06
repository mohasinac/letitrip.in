/**
 * @fileoverview Address Service - Extends BaseService
 * @module src/services/address.service
 * @description Address management service with CRUD and lookup operations
 *
 * @pattern BaseService - Inherits common CRUD operations
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to BaseService pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { logError } from "@/lib/firebase-error-logger";
import { AddressBE } from "@/types/backend/address.types";
import { AddressFE, AddressFormFE } from "@/types/frontend/address.types";
import {
  toBECreateAddressRequest,
  toFEAddress,
  toFEAddresses,
} from "@/types/transforms/address.transforms";
import { apiService } from "./api.service";
import { BaseService } from "./base.service";

// ============================================================================
// TYPES FOR ADDRESS LOOKUP
// ============================================================================

/**
 * PincodeDetails interface
 *
 * @interface
 * @description Defines the structure and contract for PincodeDetails
 */
export interface PincodeDetails {
  /** Pincode */
  pincode: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** State Code */
  stateCode: string;
  /** District */
  district: string;
  /** Country */
  country: string;
  /** Country Code */
  countryCode: string;
}

/**
 * PostalCodeDetails interface
 *
 * @interface
 * @description Defines the structure and contract for PostalCodeDetails
 */
export interface PostalCodeDetails {
  /** Postal Code */
  postalCode: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** State Code */
  stateCode?: string;
  /** Country */
  country: string;
  /** Country Code */
  countryCode: string;
  /** Places */
  places?: Array<{
    /** Name */
    name: string;
    /** Latitude */
    latitude: string;
    /** Longitude */
    longitude: string;
  }>;
}

// ============================================================================
// ADDRESS SERVICE
// ============================================================================

class AddressService extends BaseService<
  AddressBE,
  AddressFE,
  AddressFormFE,
  Record<string, any>
> {
  protected endpoint = "/user/addresses";
  protected entityName = "Address";

  protected toBE(form: AddressFormFE): Partial<AddressBE> {
    return toBECreateAddressRequest(form) as Partial<AddressBE>;
  }

  protected toFE(be: AddressBE): AddressFE {
    return toFEAddress(be);
  }

  // Note: list(), getById(), create(), update(), delete() inherited from BaseService

  async getAll(): Promise<AddressFE[]> {
    const response = await apiService.get<{ addresses: AddressBE[] }>(
      "/user/addresses"
    );
    return toFEAddresses(response.addresses);
  }

  async setDefault(id: string): Promise<AddressFE> {
    const addressBE = await apiService.patch<AddressBE>(
      `/user/addresses/${id}`,
      {
        /** Is Default */
        isDefault: true,
      }
    );
    return toFEAddress(addressBE);
  }

  // ============================================================================
  // ADDRESS LOOKUP METHODS
  // ============================================================================

  /**
   * Lookup Indian PIN code details
   * Uses Postal Pincode API
   */
  async lookupPincode(pincode: string): Promise<PincodeDetails | null> {
    try {
      const response = await apiService.get<PincodeDetails>(
        `/address/pincode/${pincode}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "AddressService.lookupPincode",
        pincode,
      });
      return null;
    }
  }

  /**
   * Lookup international postal code details
   * Uses Zippopotam API
   */
  async lookupPostalCode(
    /** Country Code */
    countryCode: string,
    /** Postal Code */
    postalCode: string
  ): Promise<PostalCodeDetails | null> {
    try {
      const response = await apiService.get<PostalCodeDetails>(
        `/address/postal-code/${countryCode}/${postalCode}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "AddressService.lookupPostalCode",
        countryCode,
        postalCode,
      });
      return null;
    }
  }

  /**
   * Autocomplete city names based on partial input
   * For India: Uses state + city combination
   */
  async autocompleteCities(params: {
    /** Query */
    query: string;
    /** State */
    state?: string;
    /** Country */
    country: string;
    /** Limit */
    limit?: number;
  }): Promise<
    Array<{
      /** City */
      city: string;
      /** State */
      state: string;
      /** State Code */
      stateCode?: string;
    }>
  > {
    try {
      const response = await apiService.post<
        Array<{
          /** City */
          city: string;
          /** State */
          state: string;
          /** State Code */
          stateCode?: string;
        }>
      >("/address/autocomplete/cities", params);
      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "AddressService.autocompleteCities",
        params,
      });
      return [];
    }
  }

  /**
   * Validate address completeness
   * Checks if all required fields are present
   */
  validateAddress(address: Partial<AddressFormFE>): {
    /** Is Valid */
    isValid: boolean;
    /** Errors */
    errors: string[];
  } {
    const errors: string[] = [];

    if (!address.addressLine1 || address.addressLine1.trim().length < 5) {
      errors.push("Address line 1 must be at least 5 characters");
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.push("City is required");
    }

    if (!address.state || address.state.trim().length < 2) {
      errors.push("State is required");
    }

    if (!address.postalCode || address.postalCode.trim().length === 0) {
      errors.push("Postal code is required");
    }

    if (!address.country || address.country.trim().length === 0) {
      errors.push("Country is required");
    }

    return {
      /** Is Valid */
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format address for display
   */
  formatAddress(address: AddressFE | AddressFormFE): string {
    const parts: string[] = [];

    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    return parts.join(", ");
  }

  /**
   * Get state codes for India
   * Helper method for forms
   */
  getIndianStateCodes(): Array<{ code: string; name: string }> {
    return [
      { code: "AN", name: "Andaman and Nicobar Islands" },
      { code: "AP", name: "Andhra Pradesh" },
      { code: "AR", name: "Arunachal Pradesh" },
      { code: "AS", name: "Assam" },
      { code: "BR", name: "Bihar" },
      { code: "CH", name: "Chandigarh" },
      { code: "CT", name: "Chhattisgarh" },
      { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
      { code: "DL", name: "Delhi" },
      { code: "GA", name: "Goa" },
      { code: "GJ", name: "Gujarat" },
      { code: "HR", name: "Haryana" },
      { code: "HP", name: "Himachal Pradesh" },
      { code: "JK", name: "Jammu and Kashmir" },
      { code: "JH", name: "Jharkhand" },
      { code: "KA", name: "Karnataka" },
      { code: "KL", name: "Kerala" },
      { code: "LA", name: "Ladakh" },
      { code: "LD", name: "Lakshadweep" },
      { code: "MP", name: "Madhya Pradesh" },
      { code: "MH", name: "Maharashtra" },
      { code: "MN", name: "Manipur" },
      { code: "ML", name: "Meghalaya" },
      { code: "MZ", name: "Mizoram" },
      { code: "NL", name: "Nagaland" },
      { code: "OR", name: "Odisha" },
      { code: "PY", name: "Puducherry" },
      { code: "PB", name: "Punjab" },
      { code: "RJ", name: "Rajasthan" },
      { code: "SK", name: "Sikkim" },
      { code: "TN", name: "Tamil Nadu" },
      { code: "TG", name: "Telangana" },
      { code: "TR", name: "Tripura" },
      { code: "UP", name: "Uttar Pradesh" },
      { code: "UT", name: "Uttarakhand" },
      { code: "WB", name: "West Bengal" },
    ];
  }
}

export const addressService = new AddressService();
