/**
 * Cart Repository
 *
 * Data access layer for cart documents in Firestore.
 * Each user has one cart document, keyed by userId.
 */

import { randomUUID } from "crypto";
import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@mohasinac/appkit/providers/db-firebase";
import { DatabaseError, NotFoundError } from "@mohasinac/appkit/errors";
import { decryptPii } from "@/lib/pii";
import type {
  CartDocument,
  CartItemDocument,
  AddToCartInput,
  UpdateCartItemInput,
} from "@/db/schema";
import { CART_COLLECTION } from "@/db/schema";

class CartRepository extends BaseRepository<CartDocument> {
  constructor() {
    super(CART_COLLECTION);
  }

  /** Decrypt sellerName in every cart item on read (defensive — handles pre-encryption data). */
  protected override mapDoc<D = CartDocument>(
    snap: import("firebase-admin/firestore").DocumentSnapshot,
  ): D {
    const raw = super.mapDoc<CartDocument>(snap);
    return {
      ...raw,
      items: (raw.items ?? []).map((item) => ({
        ...item,
        sellerName:
          typeof item.sellerName === "string"
            ? (decryptPii(item.sellerName) ?? item.sellerName)
            : item.sellerName,
      })),
    } as unknown as D;
  }

  /**
   * Find cart by user ID (document ID = userId)
   */
  async findByUserId(userId: string): Promise<CartDocument | null> {
    return this.findById(userId);
  }

  /**
   * Get cart or create empty one if it doesn't exist
   */
  async getOrCreate(userId: string): Promise<CartDocument> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    return this.createEmpty(userId);
  }

  /**
   * Create an empty cart for user
   */
  async createEmpty(userId: string): Promise<CartDocument> {
    try {
      const now = new Date();
      const cartData: CartDocument = {
        id: userId,
        userId,
        items: [],
        createdAt: now,
        updatedAt: now,
      };

      await this.db
        .collection(this.collection)
        .doc(userId)
        .set(prepareForFirestore(cartData));

      return cartData;
    } catch (error) {
      throw new DatabaseError("Failed to create cart", error);
    }
  }

  /**
   * Add item to cart.
   * - Offer items (have offerId): idempotent — if same offerId already in cart,
   *   returns cart unchanged. Always added as a new line item (never merged
   *   with an existing product entry, since the locked price may differ).
   * - Regular items: if productId already in cart, increments quantity.
   */
  async addItem(userId: string, input: AddToCartInput): Promise<CartDocument> {
    try {
      const cart = await this.getOrCreate(userId);
      const items = [...cart.items];

      // Idempotency guard for offer-based items
      if (input.offerId) {
        const alreadyAdded = items.some(
          (item) => item.offerId === input.offerId,
        );
        if (alreadyAdded) return cart;
      }

      // For regular (non-offer) items only: merge by productId
      const existingIndex = input.offerId
        ? -1
        : items.findIndex(
            (item) => item.productId === input.productId && !item.offerId,
          );

      if (existingIndex >= 0) {
        // Increment existing item quantity
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + input.quantity,
          updatedAt: new Date(),
        };
      } else {
        // Add new item — include offerId/lockedPrice when present
        const newItem: CartItemDocument = {
          itemId: randomUUID(),
          productId: input.productId,
          productTitle: input.productTitle,
          productImage: input.productImage,
          price: input.price,
          currency: input.currency,
          quantity: input.quantity,
          sellerId: input.sellerId,
          sellerName: input.sellerName,
          isAuction: input.isAuction ?? false,
          isPreOrder: input.isPreOrder ?? false,
          ...(input.isOffer !== undefined && { isOffer: input.isOffer }),
          ...(input.offerId !== undefined && { offerId: input.offerId }),
          ...(input.lockedPrice !== undefined && {
            lockedPrice: input.lockedPrice,
          }),
          addedAt: new Date(),
          updatedAt: new Date(),
        };
        items.push(newItem);
      }

      const updatedCart: CartDocument = {
        ...cart,
        items,
        updatedAt: new Date(),
      };

      await this.db
        .collection(this.collection)
        .doc(userId)
        .set(prepareForFirestore(updatedCart));

      return updatedCart;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Failed to add item to cart", error);
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateItem(
    userId: string,
    itemId: string,
    input: UpdateCartItemInput,
  ): Promise<CartDocument> {
    try {
      const cart = await this.findByUserId(userId);
      if (!cart) throw new NotFoundError("Cart not found");

      const itemIndex = cart.items.findIndex((item) => item.itemId === itemId);
      if (itemIndex < 0) throw new NotFoundError("Cart item not found");

      const items = [...cart.items];
      items[itemIndex] = {
        ...items[itemIndex],
        quantity: input.quantity,
        updatedAt: new Date(),
      };

      const updatedCart: CartDocument = {
        ...cart,
        items,
        updatedAt: new Date(),
      };

      await this.db
        .collection(this.collection)
        .doc(userId)
        .set(prepareForFirestore(updatedCart));

      return updatedCart;
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError("Failed to update cart item", error);
    }
  }

  /**
   * Remove item from cart by itemId
   */
  async removeItem(userId: string, itemId: string): Promise<CartDocument> {
    try {
      const cart = await this.findByUserId(userId);
      if (!cart) throw new NotFoundError("Cart not found");

      const itemExists = cart.items.some((item) => item.itemId === itemId);
      if (!itemExists) throw new NotFoundError("Cart item not found");

      const items = cart.items.filter((item) => item.itemId !== itemId);

      const updatedCart: CartDocument = {
        ...cart,
        items,
        updatedAt: new Date(),
      };

      await this.db
        .collection(this.collection)
        .doc(userId)
        .set(prepareForFirestore(updatedCart));

      return updatedCart;
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError("Failed to remove cart item", error);
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<CartDocument> {
    try {
      const cart = await this.getOrCreate(userId);

      const clearedCart: CartDocument = {
        ...cart,
        items: [],
        updatedAt: new Date(),
      };

      await this.db
        .collection(this.collection)
        .doc(userId)
        .set(prepareForFirestore(clearedCart));

      return clearedCart;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("Failed to clear cart", error);
    }
  }

  /**
   * Get total item count for cart
   */
  getItemCount(cart: CartDocument): number {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get cart subtotal
   */
  getSubtotal(cart: CartDocument): number {
    return cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }
}

export const cartRepository = new CartRepository();
export { CartRepository };
