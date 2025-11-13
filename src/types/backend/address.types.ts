/**
 * BACKEND ADDRESS TYPES
 */

import { Timestamp } from "firebase/firestore";

export interface AddressBE {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateAddressRequestBE {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: "home" | "work" | "other";
  isDefault?: boolean;
}

export interface UpdateAddressRequestBE {
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  addressType?: "home" | "work" | "other";
  isDefault?: boolean;
}
