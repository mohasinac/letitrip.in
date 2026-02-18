/**
 * Addresses Subcollection Schema
 *
 * Addresses stored as a subcollection under users:
 *   users/{userId}/addresses/{addressId}
 *
 * This keeps addresses isolated per user and allows efficient listing
 * without a top-level collection query.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface AddressDocument {
  id: string;
  label: string; // e.g. "Home", "Office", "Parents' Home"
  fullName: string; // Recipient name
  phone: string; // Recipient phone (Indian mobile)
  addressLine1: string; // House/flat/building
  addressLine2?: string; // Street/area (optional)
  landmark?: string; // Nearby landmark (optional)
  city: string;
  state: string;
  postalCode: string; // 6-digit Indian pincode
  country: string; // Default: "India"
  isDefault: boolean; // At most one address per user is default
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subcollection path segments — used to build references:
 *   db.collection(USER_COLLECTION).doc(userId).collection(ADDRESS_SUBCOLLECTION)
 */
export const ADDRESS_SUBCOLLECTION = "addresses" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================

/**
 * No composite indices needed — all queries are already scoped to
 * a single parent user document (subcollection query).
 */
export const ADDRESS_INDEXED_FIELDS = ["isDefault", "createdAt"] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================

/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) addresses  [subcollection]
 *
 * Path: users/{userId}/addresses/{addressId}
 *
 * CASCADE BEHAVIOR:
 * - When user is deleted: delete all their addresses (handled in delete-account route)
 * - isDefault is unique per user (enforced at API level)
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================

export const DEFAULT_ADDRESS_DATA: Partial<AddressDocument> = {
  isDefault: false,
  country: "India",
};

export const ADDRESS_PUBLIC_FIELDS = [
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

export const ADDRESS_UPDATABLE_FIELDS = [
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

export type AddressCreateInput = Omit<
  AddressDocument,
  "id" | "createdAt" | "updatedAt"
>;

export type AddressUpdateInput = Partial<
  Pick<AddressDocument, (typeof ADDRESS_UPDATABLE_FIELDS)[number]>
>;

// ============================================
// 6. FIELD NAME CONSTANTS
// ============================================

export const ADDRESS_FIELDS = {
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
