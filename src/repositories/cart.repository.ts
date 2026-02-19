/**
 * Cart Repository
 *
 * Data access layer for cart documents in Firestore.
 * Each user has one cart document, keyed by userId.
 */

import { randomUUID } from "crypto";
import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import type {
  CartDocument,
  CartItemDocument,
  AddToCartInput,
  UpdateCartItemInput,
} from "@/db/schema";
import { CART_COLLECTION, CART_FIELDS } from "@/db/schema";

class CartRepository extends BaseRepository<CartDocument> {
  constructor() {
    super(CART_COLLECTION);
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
   * If productId already exists in cart, increments quantity instead.
   */
  async addItem(userId: string, input: AddToCartInput): Promise<CartDocument> {
    try {
      const cart = await this.getOrCreate(userId);
      const items = [...cart.items];

      // Check if product already in cart
      const existingIndex = items.findIndex(
        (item) => item.productId === input.productId,
      );

      if (existingIndex >= 0) {
        // Increment existing item quantity
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + input.quantity,
          updatedAt: new Date(),
        };
      } else {
        // Add new item
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
