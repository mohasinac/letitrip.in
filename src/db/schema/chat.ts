/**
 * Chat Rooms Collection Schema
 *
 * Firestore schema definition for chat room metadata.
 * Actual messages are stored in Firebase Realtime Database for live streaming.
 * This collection tracks persistent room metadata and participants.
 *
 * Document ID format:
 *   1-1 rooms:  chat_{buyerUid}_{sellerUid}_{orderId}
 *   Group rooms (admin-only): chat_group_{timestamp}
 *
 * Deletion semantics:
 *   - Regular 1-1: either user can soft-delete (adds uid to `deletedBy`).
 *     The room is kept until BOTH users delete it.
 *   - Admin group: only an admin can delete; `adminDeleted` is set to true,
 *     which revokes all participants' access immediately.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface ChatRoomDocument {
  id: string;
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
  /**
   * UIDs of participants who have deleted this room on their end.
   * For 1-1 chats the room is physically deleted when both users appear here.
   * For group chats this field is ignored — use `adminDeleted` instead.
   */
  deletedBy: string[];
  /**
   * True for admin-created group chats (more than 2 participants).
   * Regular users can only create 1-1 (isGroup: false) rooms.
   */
  isGroup: boolean;
  /**
   * All participant UIDs. For 1-1 rooms this is [buyerId, sellerId].
   * For group rooms this can be larger (admin-only).
   */
  participantIds: string[];
  /**
   * Set to true by an admin to permanently revoke all participants' access.
   * Once set, the room is effectively gone for everyone.
   */
  adminDeleted: boolean;
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
 *   - participantIds (array-contains) + updatedAt DESC → group chat inbox
 */
export const CHAT_ROOM_INDEXED_FIELDS = [
  "buyerId",
  "sellerId",
  "orderId",
  "participantIds",
  "adminDeleted",
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
  DELETED_BY: "deletedBy",
  IS_GROUP: "isGroup",
  PARTICIPANT_IDS: "participantIds",
  ADMIN_DELETED: "adminDeleted",
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
  deletedBy: [],
  isGroup: false,
  participantIds: [],
  adminDeleted: false,
};

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type ChatRoomCreateInput = Omit<
  ChatRoomDocument,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "lastMessage"
  | "lastMessageAt"
  | "deletedBy"
  | "adminDeleted"
> & {
  // isGroup defaults to false; participantIds should always be set
};

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
