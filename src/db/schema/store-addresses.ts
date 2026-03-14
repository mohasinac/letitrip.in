/**
 * Store Addresses Subcollection Schema
 *
 * Addresses stored as a subcollection under stores:
 *   stores/{storeSlug}/addresses/{addressId}
 *
 * These are pickup/warehouse addresses owned by a store,
 * separate from the seller's personal user addresses.
 * Used as the pickup location on products (pickupAddressId).
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface StoreAddressDocument {
  id: string;
  label: string; // e.g. "Main Warehouse", "Showroom"
  fullName: string; // Contact person name
  phone: string; // Contact phone (Indian mobile)
  addressLine1: string; // Building/street
  addressLine2?: string; // Area (optional)
  landmark?: string; // Nearby landmark (optional)
  city: string;
  state: string;
  postalCode: string; // 6-digit Indian pincode
  country: string; // Default: "India"
  isDefault: boolean; // At most one per store
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subcollection path segments — used to build references:
 *   db.collection(STORE_COLLECTION).doc(storeSlug).collection(STORE_ADDRESS_SUBCOLLECTION)
 */
export const STORE_ADDRESS_SUBCOLLECTION = "addresses" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================

export const STORE_ADDRESS_INDEXED_FIELDS = ["isDefault", "createdAt"] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================

/**
 * RELATIONSHIPS:
 *
 * stores (1) ----< (N) addresses  [subcollection]
 *
 * Path: stores/{storeSlug}/addresses/{addressId}
 *
 * Products reference a store address via pickupAddressId.
 *
 * CASCADE BEHAVIOR:
 * - When store is deleted: delete all store addresses
 * - isDefault is unique per store (enforced at repository level)
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================

export const DEFAULT_STORE_ADDRESS_DATA: Partial<StoreAddressDocument> = {
  isDefault: false,
  country: "India",
};

export const STORE_ADDRESS_PUBLIC_FIELDS = [
  "id",
  "label",
  "fullName",
  "phone",
  "addressLine1",
  "addressLine2",
  "landmark",
  "city",
  "state",
  "postalCode",
  "country",
  "isDefault",
  "createdAt",
  "updatedAt",
] as const;

export const STORE_ADDRESS_UPDATABLE_FIELDS = [
  "label",
  "fullName",
  "phone",
  "addressLine1",
  "addressLine2",
  "landmark",
  "city",
  "state",
  "postalCode",
  "country",
  "isDefault",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type StoreAddressCreateInput = Omit<
  StoreAddressDocument,
  "id" | "createdAt" | "updatedAt"
>;

export type StoreAddressUpdateInput = Partial<
  Pick<StoreAddressDocument, (typeof STORE_ADDRESS_UPDATABLE_FIELDS)[number]>
>;

// ============================================
// 6. FIELD NAME CONSTANTS
// ============================================

export const STORE_ADDRESS_FIELDS = {
  ID: "id",
  LABEL: "label",
  FULL_NAME: "fullName",
  PHONE: "phone",
  ADDRESS_LINE_1: "addressLine1",
  ADDRESS_LINE_2: "addressLine2",
  LANDMARK: "landmark",
  CITY: "city",
  STATE: "state",
  POSTAL_CODE: "postalCode",
  COUNTRY: "country",
  IS_DEFAULT: "isDefault",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;
