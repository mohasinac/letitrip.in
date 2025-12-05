/**
 * @fileoverview Type Definitions
 * @module src/types/backend/address.types
 * @description This file contains TypeScript type definitions for address
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * BACKEND ADDRESS TYPES
 */

import { Timestamp } from "firebase/firestore";

/**
 * AddressBE interface
 * 
 * @interface
 * @description Defines the structure and contract for AddressBE
 */
export interface AddressBE {
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
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
}

/**
 * CreateAddressRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateAddressRequestBE
 */
export interface CreateAddressRequestBE {
  /** Full Name */
  fullName: string;
  /** Phone Number */
  phoneNumber: string;
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
  /** Address Type */
  addressType?: "home" | "work" | "other";
  /** Is Default */
  isDefault?: boolean;
}

/**
 * UpdateAddressRequestBE interface
 * 
 * @interface
 * @description Defines the structure and contract for UpdateAddressRequestBE
 */
export interface UpdateAddressRequestBE {
  /** Full Name */
  fullName?: string;
  /** Phone Number */
  phoneNumber?: string;
  /** Address Line1 */
  addressLine1?: string;
  /** Address Line2 */
  addressLine2?: string;
  /** City */
  city?: string;
  /** State */
  state?: string;
  /** Postal Code */
  postalCode?: string;
  /** Country */
  country?: string;
  /** Address Type */
  addressType?: "home" | "work" | "other";
  /** Is Default */
  isDefault?: boolean;
}
