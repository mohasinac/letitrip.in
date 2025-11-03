/**
 * Cart Model
 * 
 * Handles shopping cart operations:
 * - Cart CRUD operations
 * - Cart item management
 * - Cart validation
 * - Cart synchronization
 * 
 * Cart is user-scoped - each user has one cart document
 */

import { getAdminDb } from '../database/admin';
import { NotFoundError, ValidationError } from '../middleware/error-handler';
import { FieldValue } from 'firebase-admin/firestore';

export interface CartItem {
  id: string; // Unique item ID (productId + variant)
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  sku?: string;
  slug?: string;
  seller?: {
    id: string;
    name: string;
    storeName?: string;
  };
  variant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const CARTS_COLLECTION = 'carts';
const PRODUCTS_COLLECTION = 'products';

export class CartModel {
  /**
   * Get user's cart
   */
  static async getCart(userId: string): Promise<Cart> {
    const db = getAdminDb();
    const cartDoc = await db.collection(CARTS_COLLECTION).doc(userId).get();
    
    if (!cartDoc.exists) {
      // Return empty cart
      return {
        userId,
        items: [],
        updatedAt: new Date(),
        createdAt: new Date(),
      };
    }
    
    const data = cartDoc.data()!;
    return {
      userId,
      items: data.items || [],
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
      createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
    };
  }
  
  /**
   * Save/update entire cart
   */
  static async saveCart(userId: string, items: CartItem[]): Promise<Cart> {
    const db = getAdminDb();
    const cartRef = db.collection(CARTS_COLLECTION).doc(userId);
    
    // Validate items
    this.validateCartItems(items);
    
    const now = new Date();
    const cartDoc = await cartRef.get();
    const isNewCart = !cartDoc.exists;
    
    const cartData = {
      userId,
      items,
      updatedAt: now,
      ...(isNewCart && { createdAt: now }),
    };
    
    await cartRef.set(cartData, { merge: true });
    
    return {
      userId,
      items,
      updatedAt: now,
      createdAt: isNewCart ? now : (cartDoc.data()?.createdAt?.toDate?.() || now),
    };
  }
  
  /**
   * Add item to cart
   */
  static async addItem(userId: string, item: Omit<CartItem, 'addedAt'>): Promise<Cart> {
    const cart = await this.getCart(userId);
    
    // Validate product exists and has stock
    await this.validateProduct(item.productId, item.quantity);
    
    // Check if item already exists (same product + variant)
    const existingItemIndex = cart.items.findIndex(
      (i) => i.id === item.id || (i.productId === item.productId && 
        JSON.stringify(i.variant || {}) === JSON.stringify(item.variant || {}))
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].price = item.price; // Update with latest price
    } else {
      // Add new item
      cart.items.push({
        ...item,
        addedAt: new Date(),
      });
    }
    
    return await this.saveCart(userId, cart.items);
  }
  
  /**
   * Update item quantity
   */
  static async updateItem(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    
    const itemIndex = cart.items.findIndex((i) => i.id === itemId);
    
    if (itemIndex < 0) {
      throw new NotFoundError('Item not found in cart');
    }
    
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero');
    }
    
    // Validate stock
    await this.validateProduct(cart.items[itemIndex].productId, quantity);
    
    cart.items[itemIndex].quantity = quantity;
    
    return await this.saveCart(userId, cart.items);
  }
  
  /**
   * Remove item from cart
   */
  static async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    
    cart.items = cart.items.filter((i) => i.id !== itemId);
    
    return await this.saveCart(userId, cart.items);
  }
  
  /**
   * Clear entire cart
   */
  static async clearCart(userId: string): Promise<Cart> {
    return await this.saveCart(userId, []);
  }
  
  /**
   * Get cart item count
   */
  static async getItemCount(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
  
  /**
   * Get cart total price
   */
  static async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  /**
   * Validate cart items
   */
  private static validateCartItems(items: CartItem[]): void {
    if (!Array.isArray(items)) {
      throw new ValidationError('Cart items must be an array');
    }
    
    for (const item of items) {
      if (!item.productId || !item.id) {
        throw new ValidationError('Each cart item must have productId and id');
      }
      
      if (!item.quantity || item.quantity <= 0) {
        throw new ValidationError('Each cart item must have valid quantity');
      }
      
      if (!item.price || item.price < 0) {
        throw new ValidationError('Each cart item must have valid price');
      }
      
      if (!item.name) {
        throw new ValidationError('Each cart item must have name');
      }
    }
  }
  
  /**
   * Validate product exists and has sufficient stock
   */
  private static async validateProduct(productId: string, quantity: number): Promise<void> {
    const db = getAdminDb();
    const productDoc = await db.collection(PRODUCTS_COLLECTION).doc(productId).get();
    
    if (!productDoc.exists) {
      throw new NotFoundError(`Product ${productId} not found`);
    }
    
    const product = productDoc.data()!;
    
    // Check if product is active
    if (product.status !== 'active' && product.status !== 'approved') {
      throw new ValidationError(`Product ${product.name} is not available`);
    }
    
    // Check stock
    if (product.stock !== undefined && product.stock < quantity) {
      throw new ValidationError(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`
      );
    }
  }
  
  /**
   * Sync cart with current product prices and availability
   */
  static async syncCartPrices(userId: string): Promise<{
    cart: Cart;
    changes: Array<{
      itemId: string;
      type: 'price_changed' | 'out_of_stock' | 'unavailable';
      oldValue?: any;
      newValue?: any;
    }>;
  }> {
    const cart = await this.getCart(userId);
    const changes: Array<{
      itemId: string;
      type: 'price_changed' | 'out_of_stock' | 'unavailable';
      oldValue?: any;
      newValue?: any;
    }> = [];
    const updatedItems: CartItem[] = [];
    
    const db = getAdminDb();
    
    for (const item of cart.items) {
      try {
        const productDoc = await db.collection(PRODUCTS_COLLECTION).doc(item.productId).get();
        
        if (!productDoc.exists) {
          changes.push({
            itemId: item.id,
            type: 'unavailable',
          });
          continue; // Skip this item
        }
        
        const product = productDoc.data()!;
        
        // Check if product is available
        if (product.status !== 'active' && product.status !== 'approved') {
          changes.push({
            itemId: item.id,
            type: 'unavailable',
          });
          continue; // Skip this item
        }
        
        // Check stock
        if (product.stock !== undefined && product.stock < item.quantity) {
          changes.push({
            itemId: item.id,
            type: 'out_of_stock',
            oldValue: item.quantity,
            newValue: product.stock,
          });
          
          if (product.stock > 0) {
            // Update quantity to available stock
            item.quantity = product.stock;
          } else {
            continue; // Skip if out of stock
          }
        }
        
        // Check price changes
        if (product.price !== item.price) {
          changes.push({
            itemId: item.id,
            type: 'price_changed',
            oldValue: item.price,
            newValue: product.price,
          });
          item.price = product.price;
        }
        
        // Update item with latest product data
        updatedItems.push({
          ...item,
          name: product.name,
          image: product.images?.[0] || item.image,
          sku: product.sku || item.sku,
          slug: product.slug || item.slug,
        });
      } catch (error) {
        console.error(`Error syncing cart item ${item.id}:`, error);
        // Keep the item if there's an error
        updatedItems.push(item);
      }
    }
    
    const updatedCart = await this.saveCart(userId, updatedItems);
    
    return {
      cart: updatedCart,
      changes,
    };
  }
  
  /**
   * Merge guest cart with user cart (after login)
   */
  static async mergeCart(userId: string, guestCartItems: CartItem[]): Promise<Cart> {
    const userCart = await this.getCart(userId);
    
    // Merge items, updating quantities if product already exists
    for (const guestItem of guestCartItems) {
      const existingItemIndex = userCart.items.findIndex(
        (i) => i.productId === guestItem.productId && 
        JSON.stringify(i.variant || {}) === JSON.stringify(guestItem.variant || {})
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity (use max of both)
        userCart.items[existingItemIndex].quantity = Math.max(
          userCart.items[existingItemIndex].quantity,
          guestItem.quantity
        );
      } else {
        // Add guest item to user cart
        userCart.items.push(guestItem);
      }
    }
    
    return await this.saveCart(userId, userCart.items);
  }
}
