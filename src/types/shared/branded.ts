/**
 * Branded Types for Type-Safe IDs
 *
 * This module provides branded types to prevent mixing different ID types.
 * Branded types add compile-time safety without runtime overhead.
 *
 * @example
 * ```typescript
 * const userId: UserId = 'user123' as UserId;
 * const productId: ProductId = 'product456' as ProductId;
 *
 * // This will cause a TypeScript error:
 * // const wrongId: UserId = productId; // Error!
 * ```
 *
 * @module branded-types
 */

/**
 * Utility type to create branded primitives
 */
declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

/**
 * User-related branded types
 */
export type UserId = Branded<string, "UserId">;
export type UserEmail = Branded<string, "UserEmail">;
export type UserRole = Branded<string, "UserRole">;

/**
 * Product-related branded types
 */
export type ProductId = Branded<string, "ProductId">;
export type ProductSku = Branded<string, "ProductSku">;

/**
 * Order-related branded types
 */
export type OrderId = Branded<string, "OrderId">;
export type OrderNumber = Branded<string, "OrderNumber">;

/**
 * Cart-related branded types
 */
export type CartId = Branded<string, "CartId">;
export type CartItemId = Branded<string, "CartItemId">;

/**
 * Shop-related branded types
 */
export type ShopId = Branded<string, "ShopId">;
export type ShopSlug = Branded<string, "ShopSlug">;

/**
 * Category-related branded types
 */
export type CategoryId = Branded<string, "CategoryId">;
export type CategorySlug = Branded<string, "CategorySlug">;

/**
 * Review-related branded types
 */
export type ReviewId = Branded<string, "ReviewId">;

/**
 * Payment-related branded types
 */
export type PaymentId = Branded<string, "PaymentId">;
export type TransactionId = Branded<string, "TransactionId">;

/**
 * Address-related branded types
 */
export type AddressId = Branded<string, "AddressId">;

/**
 * Notification-related branded types
 */
export type NotificationId = Branded<string, "NotificationId">;

/**
 * Conversation-related branded types
 */
export type ConversationId = Branded<string, "ConversationId">;
export type MessageId = Branded<string, "MessageId">;

/**
 * Support ticket-related branded types
 */
export type TicketId = Branded<string, "TicketId">;

/**
 * Coupon-related branded types
 */
export type CouponId = Branded<string, "CouponId">;
export type CouponCode = Branded<string, "CouponCode">;

/**
 * Shipment-related branded types
 */
export type ShipmentId = Branded<string, "ShipmentId">;
export type TrackingNumber = Branded<string, "TrackingNumber">;

/**
 * Type guards to check if a value is a valid branded type
 */

/**
 * Check if a string is a valid format for an ID
 * @param value - The value to check
 * @returns True if the value is a non-empty string
 */
const isValidId = (value: unknown): value is string => {
  return typeof value === "string" && value.length > 0;
};

/**
 * Type guard for UserId
 */
export const isUserId = (value: unknown): value is UserId => {
  return isValidId(value);
};

/**
 * Type guard for ProductId
 */
export const isProductId = (value: unknown): value is ProductId => {
  return isValidId(value);
};

/**
 * Type guard for OrderId
 */
export const isOrderId = (value: unknown): value is OrderId => {
  return isValidId(value);
};

/**
 * Type guard for CartId
 */
export const isCartId = (value: unknown): value is CartId => {
  return isValidId(value);
};

/**
 * Type guard for ShopId
 */
export const isShopId = (value: unknown): value is ShopId => {
  return isValidId(value);
};

/**
 * Type guard for CategoryId
 */
export const isCategoryId = (value: unknown): value is CategoryId => {
  return isValidId(value);
};

/**
 * Type guard for ReviewId
 */
export const isReviewId = (value: unknown): value is ReviewId => {
  return isValidId(value);
};

/**
 * Type guard for PaymentId
 */
export const isPaymentId = (value: unknown): value is PaymentId => {
  return isValidId(value);
};

/**
 * Type guard for AddressId
 */
export const isAddressId = (value: unknown): value is AddressId => {
  return isValidId(value);
};

/**
 * Type guard for NotificationId
 */
export const isNotificationId = (value: unknown): value is NotificationId => {
  return isValidId(value);
};

/**
 * Type guard for ConversationId
 */
export const isConversationId = (value: unknown): value is ConversationId => {
  return isValidId(value);
};

/**
 * Type guard for TicketId
 */
export const isTicketId = (value: unknown): value is TicketId => {
  return isValidId(value);
};

/**
 * Type guard for CouponId
 */
export const isCouponId = (value: unknown): value is CouponId => {
  return isValidId(value);
};

/**
 * Type guard for ShipmentId
 */
export const isShipmentId = (value: unknown): value is ShipmentId => {
  return isValidId(value);
};

/**
 * Helper functions to create branded types from strings
 */

/**
 * Create a UserId from a string
 * @param id - The user ID string
 * @returns The branded UserId
 * @throws Error if the ID is invalid
 */
export const createUserId = (id: string): UserId => {
  if (!isUserId(id)) {
    throw new Error(`Invalid UserId: ${id}`);
  }
  return id;
};

/**
 * Create a ProductId from a string
 * @param id - The product ID string
 * @returns The branded ProductId
 * @throws Error if the ID is invalid
 */
export const createProductId = (id: string): ProductId => {
  if (!isProductId(id)) {
    throw new Error(`Invalid ProductId: ${id}`);
  }
  return id;
};

/**
 * Create an OrderId from a string
 * @param id - The order ID string
 * @returns The branded OrderId
 * @throws Error if the ID is invalid
 */
export const createOrderId = (id: string): OrderId => {
  if (!isOrderId(id)) {
    throw new Error(`Invalid OrderId: ${id}`);
  }
  return id;
};

/**
 * Create a CartId from a string
 * @param id - The cart ID string
 * @returns The branded CartId
 * @throws Error if the ID is invalid
 */
export const createCartId = (id: string): CartId => {
  if (!isCartId(id)) {
    throw new Error(`Invalid CartId: ${id}`);
  }
  return id;
};

/**
 * Create a ShopId from a string
 * @param id - The shop ID string
 * @returns The branded ShopId
 * @throws Error if the ID is invalid
 */
export const createShopId = (id: string): ShopId => {
  if (!isShopId(id)) {
    throw new Error(`Invalid ShopId: ${id}`);
  }
  return id;
};

/**
 * Create a CategoryId from a string
 * @param id - The category ID string
 * @returns The branded CategoryId
 * @throws Error if the ID is invalid
 */
export const createCategoryId = (id: string): CategoryId => {
  if (!isCategoryId(id)) {
    throw new Error(`Invalid CategoryId: ${id}`);
  }
  return id;
};

/**
 * Create a ReviewId from a string
 * @param id - The review ID string
 * @returns The branded ReviewId
 * @throws Error if the ID is invalid
 */
export const createReviewId = (id: string): ReviewId => {
  if (!isReviewId(id)) {
    throw new Error(`Invalid ReviewId: ${id}`);
  }
  return id;
};

/**
 * Utility type to extract the underlying type from a branded type
 */
export type Unbrand<T> = T extends Branded<infer U, any> ? U : T;

/**
 * Convert a branded type back to its underlying type
 * @param value - The branded value
 * @returns The underlying value
 */
export const unbrand = <T extends Branded<any, any>>(value: T): Unbrand<T> => {
  return value as any;
};
