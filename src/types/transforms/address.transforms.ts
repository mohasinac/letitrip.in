/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/address.transforms
 * @description This file contains functionality related to address.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * ADDRESS TYPE TRANSFORMATIONS
 */

import { Timestamp } from "firebase/firestore";
import { AddressBE, CreateAddressRequestBE } from "../backend/address.types";
import {
  AddressFE,
  AddressFormFE,
  ADDRESS_TYPE_LABELS,
} from "../frontend/address.types";

/**
 * Function: Parse Date
 */
/**
 * Parses date
 *
 * @param {Timestamp | string} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string} date - The date
 *
 * @returns {any} The parsedate result
 */

function parseDate(date: Timestamp | string): Date {
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

/**
 * Function: To F E Address
 */
/**
 * Performs to f e address operation
 *
 * @param {AddressBE} addressBE - The address b e
 *
 * @returns {any} The tofeaddress result
 *
 * @example
 * toFEAddress(addressBE);
 */

/**
 * Performs to f e address operation
 *
 * @param {AddressBE} addressBE - The address b e
 *
 * @returns {any} The tofeaddress result
 *
 * @example
 * toFEAddress(addressBE);
 */

export function toFEAddress(addressBE: AddressBE): AddressFE {
  const parts = [
    addressBE.addressLine1,
    addressBE.addressLine2,
    addressBE.city,
    addressBE.state,
    addressBE.postalCode,
    addressBE.country,
  ].filter(Boolean);

  return {
    ...addressBE,
    /** Created At */
    createdAt: parseDate(addressBE.createdAt),
    /** Updated At */
    updatedAt: parseDate(addressBE.updatedAt),
    /** Formatted Address */
    formattedAddress: parts.join(", "),
    /** Short Address */
    shortAddress: `${addressBE.city}, ${addressBE.state}`,
    /** Type Label */
    typeLabel: ADDRESS_TYPE_LABELS[addressBE.addressType],
  };
}

/**
 * Function: To B E Create Address Request
 */
/**
 * Performs to b e create address request operation
 *
 * @param {AddressFormFE} formData - The form data
 *
 * @returns {any} The tobecreateaddressrequest result
 *
 * @example
 * toBECreateAddressRequest(formData);
 */

/**
 * Performs to b e create address request operation
 *
 * @param {AddressFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreateaddressrequest result
 *
 * @example
 * toBECreateAddressRequest(/** Form Data */
  formData);
 */

export function toBECreateAddressRequest(
  /** Form Data */
  formData: AddressFormFE,
): CreateAddressRequestBE {
  return {
    /** Full Name */
    fullName: formData.fullName,
    /** Phone Number */
    phoneNumber: formData.phoneNumber,
    /** Address Line1 */
    addressLine1: formData.addressLine1,
    /** Address Line2 */
    addressLine2: formData.addressLine2 || undefined,
    /** City */
    city: formData.city,
    /** State */
    state: formData.state,
    /** Postal Code */
    postalCode: formData.postalCode,
    /** Country */
    country: formData.country,
    /** Address Type */
    addressType: formData.addressType,
    /** Is Default */
    isDefault: formData.isDefault,
  };
}

/**
 * Function: To F E Addresses
 */
/**
 * Performs to f e addresses operation
 *
 * @param {AddressBE[]} addressesBE - The addresses b e
 *
 * @returns {any} The tofeaddresses result
 *
 * @example
 * toFEAddresses(addressesBE);
 */

/**
 * Performs to f e addresses operation
 *
 * @param {AddressBE[]} addressesBE - The addresses b e
 *
 * @returns {any} The tofeaddresses result
 *
 * @example
 * toFEAddresses(addressesBE);
 */

export function toFEAddresses(addressesBE: AddressBE[]): AddressFE[] {
  return addressesBE.map(toFEAddress);
}
