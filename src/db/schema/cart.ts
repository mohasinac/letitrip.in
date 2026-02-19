/**
 * Cart Collection Schema
 *
 * Firestore collection for user shopping carts.
 *
 * Design Decision:
 * - One cart document per user, stored in the `carts` collection
 * - Document ID = userId for O(1) retrieval
 * - Items stored as an array within the cart document (denormalized)
 * - Price is captured at time of adding to cart (not live price)
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface CartItemDocument {
  itemId: string; // UUID for this cart entry
  productId: string;
  productTitle: string;
  productImage: string;
  price: number; // Price at time of adding to cart
  currency: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
  isAuction: boolean;
  addedAt: Date;
  updatedAt: Date;
}

export interface CartDocument {
  id: string; // = userId
  userId: string;
  items: CartItemDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export const CART_COLLECTION = "carts" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================

/**
 * Firestore indexes for carts collection:
 * - userId (==) — Primary key, document ID is userId, no composite index needed
 */
export const CART_INDEXED_FIELDS: string[] = ["userId"];

// ============================================
// 3. RELATIONSHIPS
// ============================================

/**
 * Cart Relationships:
 *
 * carts
 *  └── userId → users.uid (FK)
 *  └── items[].productId → products.id (FK, denormalized price/title/image)
 *  └── items[].sellerId → users.uid (FK)
 */

// ============================================
// 4. FIELD CONSTANTS
// ============================================

export const CART_FIELDS = {
  ID: "id",
  USER_ID: "userId",
  ITEMS: "items",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  // CartItem sub-fields
  ITEM: {
    ITEM_ID: "itemId",
    PRODUCT_ID: "productId",
    PRODUCT_TITLE: "productTitle",
    PRODUCT_IMAGE: "productImage",
    PRICE: "price",
    CURRENCY: "currency",
    QUANTITY: "quantity",
    SELLER_ID: "sellerId",
    SELLER_NAME: "sellerName",
    IS_AUCTION: "isAuction",
    ADDED_AT: "addedAt",
    UPDATED_AT: "updatedAt",
  },
} as const;

export const DEFAULT_CART_DATA: Partial<CartDocument> = {
  items: [],
};

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type CartCreateInput = Omit<
  CartDocument,
  "id" | "createdAt" | "updatedAt"
>;

export type AddToCartInput = {
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  currency: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
  isAuction?: boolean;
};

export type UpdateCartItemInput = {
  quantity: number;
};

// ============================================
// 6. QUERY HELPERS
// ============================================

export const cartQueryHelpers = {
  byUserId: (userId: string) => ({ field: CART_FIELDS.USER_ID, value: userId }),
} as const;
