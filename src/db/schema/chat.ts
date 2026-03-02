/**
 * Chat Rooms Collection Schema
 *
 * Firestore schema definition for chat room metadata.
 * Actual messages are stored in Firebase Realtime Database for live streaming.
 * This collection tracks persistent room metadata and participants.
 *
 * Document ID format: chat_{buyerUid}_{sellerUid}_{orderId}
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface ChatRoomDocument {
  id: string; // Format: chat_{buyerUid}_{sellerUid}_{orderId}
  buyerId: string;
  sellerId: string;
  orderId: string;
  productId?: string;
  productTitle?: string;
  buyerName: string;
  sellerName: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CHAT_ROOM_COLLECTION = "chatRooms" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance.
 *
 * Composite indexes defined in firestore.indexes.json:
 *   - buyerId + updatedAt DESC  → inbox view for buyer
 *   - sellerId + updatedAt DESC → inbox view for seller
 */
export const CHAT_ROOM_INDEXED_FIELDS = [
  "buyerId",
  "sellerId",
  "orderId",
  "updatedAt",
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * chat_rooms.buyerId  → users.uid  (FK)
 * chat_rooms.sellerId → users.uid  (FK)
 * chat_rooms.orderId  → orders.id  (FK)
 * chat_rooms.productId → products.id (FK, optional)
 *
 * chat_rooms (1) ----< (N) Realtime DB messages  [/chat/{chatId}/messages]
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================

export const CHAT_ROOM_FIELDS = {
  ID: "id",
  BUYER_ID: "buyerId",
  SELLER_ID: "sellerId",
  ORDER_ID: "orderId",
  PRODUCT_ID: "productId",
  PRODUCT_TITLE: "productTitle",
  BUYER_NAME: "buyerName",
  SELLER_NAME: "sellerName",
  LAST_MESSAGE: "lastMessage",
  LAST_MESSAGE_AT: "lastMessageAt",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;

export const DEFAULT_CHAT_ROOM_DATA: Omit<
  ChatRoomDocument,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "lastMessage"
  | "lastMessageAt"
  | "productId"
  | "productTitle"
> = {
  buyerId: "",
  sellerId: "",
  orderId: "",
  buyerName: "",
  sellerName: "",
};

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type ChatRoomCreateInput = Omit<
  ChatRoomDocument,
  "id" | "createdAt" | "updatedAt" | "lastMessage" | "lastMessageAt"
>;

export type ChatRoomUpdateInput = Pick<
  ChatRoomDocument,
  "lastMessage" | "lastMessageAt" | "updatedAt"
>;

// ============================================
// 6. QUERY HELPERS
// ============================================

export const chatRoomQueryHelpers = {
  /** Filter rooms by buyer */
  byBuyer: (buyerId: string) => ({
    field: CHAT_ROOM_FIELDS.BUYER_ID,
    op: "==" as const,
    value: buyerId,
  }),

  /** Filter rooms by seller */
  bySeller: (sellerId: string) => ({
    field: CHAT_ROOM_FIELDS.SELLER_ID,
    op: "==" as const,
    value: sellerId,
  }),

  /** Filter rooms for a specific order */
  byOrder: (orderId: string) => ({
    field: CHAT_ROOM_FIELDS.ORDER_ID,
    op: "==" as const,
    value: orderId,
  }),
};
