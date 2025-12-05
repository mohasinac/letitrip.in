/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/address.types
 * @description This file contains TypeScript type definitions for address
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * FRONTEND ADDRESS TYPES
 */

/**
 * Address F E interface
 * @interface AddressFE
 */
export interface AddressFE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Full Name */
  fullName: string;
  /** Phone Number */
  phoneNumber: string;
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2: string | null;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Postal Code */
  postalCode: string;
  /** Country */
  country: string;
  /** Address Type */
  addressType: "home" | "work" | "other";
  /** Is Default */
  isDefault: boolean;
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // Computed
  /** Formatted Address */
  formattedAddress: string;
  /** Short Address */
  shortAddress: string;
  /** Type Label */
  typeLabel: string;
}

/**
 * AddressFormFE interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressFormFE
 */
export interface AddressFormFE {
  /** Full Name */
  fullName: string;
  /** Phone Number */
  phoneNumber: string;
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Postal Code */
  postalCode: string;
  /** Country */
  country: string;
  /** Address Type */
  addressType: "home" | "work" | "other";
  /** Is Default */
  isDefault: boolean;
}

/**
 * Address Type Labels
 * @constant
 */
export const ADDRESS_TYPE_LABELS = {
  /** Home */
  home: "Home",
  /** Work */
  work: "Work",
  /** Other */
  other: "Other",
};
