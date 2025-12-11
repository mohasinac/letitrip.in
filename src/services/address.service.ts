import { logError } from "@/lib/firebase-error-logger";
import { AddressBE } from "@/types/backend/address.types";
import { AddressFE, AddressFormFE } from "@/types/frontend/address.types";
import {
  toBECreateAddressRequest,
  toFEAddress,
  toFEAddresses,
} from "@/types/transforms/address.transforms";
import { apiService } from "./api.service";

// ============================================================================
// TYPES FOR ADDRESS LOOKUP
// ============================================================================

export interface PincodeDetails {
  pincode: string;
  city: string;
  state: string;
  stateCode: string;
  district: string;
  country: string;
  countryCode: string;
}

export interface PostalCodeDetails {
  postalCode: string;
  city: string;
  state: string;
  stateCode?: string;
  country: string;
  countryCode: string;
  places?: Array<{
    name: string;
    latitude: string;
    longitude: string;
  }>;
}

// ============================================================================
// ADDRESS SERVICE
// ============================================================================

class AddressService {
  async getAll(): Promise<AddressFE[]> {
    const response = await apiService.get<{ addresses: AddressBE[] }>(
      "/user/addresses"
    );
    return toFEAddresses(response.addresses);
  }

  async getById(id: string): Promise<AddressFE> {
    const addressBE = await apiService.get<AddressBE>(`/user/addresses/${id}`);
    return toFEAddress(addressBE);
  }

  async create(formData: AddressFormFE): Promise<AddressFE> {
    const request = toBECreateAddressRequest(formData);
    const addressBE = await apiService.post<AddressBE>(
      "/user/addresses",
      request
    );
    return toFEAddress(addressBE);
  }

  async update(
    id: string,
    formData: Partial<AddressFormFE>
  ): Promise<AddressFE> {
    const addressBE = await apiService.patch<AddressBE>(
      `/user/addresses/${id}`,
      formData
    );
    return toFEAddress(addressBE);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/user/addresses/${id}`);
  }

  async setDefault(id: string): Promise<AddressFE> {
    const addressBE = await apiService.patch<AddressBE>(
      `/user/addresses/${id}`,
      {
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
    // Validate Indian PIN code format (6 digits)
    if (!pincode || typeof pincode !== "string") {
      throw new Error("[Address] PIN code is required");
    }

    const cleanPincode = pincode.trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      throw new Error(
        "[Address] Invalid Indian PIN code format. Must be 6 digits."
      );
    }

    try {
      const response = await apiService.get<PincodeDetails>(
        `/address/pincode/${cleanPincode}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "AddressService.lookupPincode",
        pincode: cleanPincode,
      });
      return null;
    }
  }

  /**
   * Lookup international postal code details
   * Uses Zippopotam API
   */
  async lookupPostalCode(
    countryCode: string,
    postalCode: string
  ): Promise<PostalCodeDetails | null> {
    // Validate inputs
    if (!countryCode || typeof countryCode !== "string") {
      throw new Error("[Address] Country code is required");
    }
    if (!postalCode || typeof postalCode !== "string") {
      throw new Error("[Address] Postal code is required");
    }

    const cleanCountryCode = countryCode.trim().toUpperCase();
    const cleanPostalCode = postalCode.trim();

    // Validate country code format (2 or 3 letters)
    if (!/^[A-Z]{2,3}$/.test(cleanCountryCode)) {
      throw new Error("[Address] Invalid country code format");
    }

    try {
      const response = await apiService.get<PostalCodeDetails>(
        `/address/postal-code/${cleanCountryCode}/${cleanPostalCode}`
      );
      return response;
    } catch (error) {
      logError(error as Error, {
        component: "AddressService.lookupPostalCode",
        countryCode: cleanCountryCode,
        postalCode: cleanPostalCode,
      });
      return null;
    }
  }

  /**
   * Autocomplete city names based on partial input
   * For India: Uses state + city combination
   */
  async autocompleteCities(params: {
    query: string;
    state?: string;
    country: string;
    limit?: number;
  }): Promise<
    Array<{
      city: string;
      state: string;
      stateCode?: string;
    }>
  > {
    try {
      const response = await apiService.post<
        Array<{
          city: string;
          state: string;
          stateCode?: string;
        }>
      >("/address/autocomplete/cities", params);
      return response;
    } catch (error) {
      logError(error as Error, {
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
    isValid: boolean;
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
