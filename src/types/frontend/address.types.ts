/**
 * FRONTEND ADDRESS TYPES
 */

export interface AddressFE {
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
  createdAt: Date;
  updatedAt: Date;

  // Computed
  formattedAddress: string;
  shortAddress: string;
  typeLabel: string;
}

export interface AddressFormFE {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
}

export const ADDRESS_TYPE_LABELS = {
  home: "Home",
  work: "Work",
  other: "Other",
};
