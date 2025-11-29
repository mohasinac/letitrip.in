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

function parseDate(date: Timestamp | string): Date {
  return date instanceof Timestamp ? date.toDate() : new Date(date);
}

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
    createdAt: parseDate(addressBE.createdAt),
    updatedAt: parseDate(addressBE.updatedAt),
    formattedAddress: parts.join(", "),
    shortAddress: `${addressBE.city}, ${addressBE.state}`,
    typeLabel: ADDRESS_TYPE_LABELS[addressBE.addressType],
  };
}

export function toBECreateAddressRequest(
  formData: AddressFormFE,
): CreateAddressRequestBE {
  return {
    fullName: formData.fullName,
    phoneNumber: formData.phoneNumber,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2 || undefined,
    city: formData.city,
    state: formData.state,
    postalCode: formData.postalCode,
    country: formData.country,
    addressType: formData.addressType,
    isDefault: formData.isDefault,
  };
}

export function toFEAddresses(addressesBE: AddressBE[]): AddressFE[] {
  return addressesBE.map(toFEAddress);
}
