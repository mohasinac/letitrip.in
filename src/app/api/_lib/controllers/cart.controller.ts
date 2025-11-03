/**
 * Cart Controller
 * 
 * Business logic for shopping cart operations:
 * - Cart management (get, save, clear)
 * - Item operations (add, update, remove)
 * - Cart validation and synchronization
 * - Guest cart merging
 * 
 * All cart operations are user-scoped (owner only)
 */

import { CartModel, Cart, CartItem } from '../models/cart.model';
import { ValidationError, AuthorizationError } from '../middleware/error-handler';

export interface UserContext {
  userId: string;
  role: 'admin' | 'seller' | 'user';
  email?: string;
}

/**
 * Get user's cart
 */
export async function getCart(context: UserContext): Promise<Cart> {
  return await CartModel.getCart(context.userId);
}

/**
 * Save/update entire cart
 */
export async function saveCart(
  items: CartItem[],
  context: UserContext
): Promise<Cart> {
  // Validate items array
  if (!Array.isArray(items)) {
    throw new ValidationError('Items must be an array');
  }
  
  // Limit cart size to prevent abuse
  if (items.length > 100) {
    throw new ValidationError('Cart cannot contain more than 100 items');
  }
  
  return await CartModel.saveCart(context.userId, items);
}

/**
 * Add item to cart
 */
export async function addItemToCart(
  itemData: {
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
  },
  context: UserContext
): Promise<Cart> {
  // Validate required fields
  if (!itemData.productId) {
    throw new ValidationError('Product ID is required');
  }
  
  if (!itemData.quantity || itemData.quantity <= 0) {
    throw new ValidationError('Valid quantity is required');
  }
  
  if (!itemData.price || itemData.price < 0) {
    throw new ValidationError('Valid price is required');
  }
  
  if (!itemData.name) {
    throw new ValidationError('Product name is required');
  }
  
  // Limit quantity per item
  if (itemData.quantity > 999) {
    throw new ValidationError('Quantity cannot exceed 999 per item');
  }
  
  // Generate unique item ID (product + variant)
  const variantKey = itemData.variant 
    ? JSON.stringify(itemData.variant)
    : '';
  const itemId = `${itemData.productId}${variantKey}`;
  
  const item: Omit<CartItem, 'addedAt'> = {
    id: itemId,
    productId: itemData.productId,
    quantity: itemData.quantity,
    price: itemData.price,
    name: itemData.name.trim(),
    image: itemData.image,
    sku: itemData.sku,
    slug: itemData.slug,
    seller: itemData.seller,
    variant: itemData.variant,
  };
  
  return await CartModel.addItem(context.userId, item);
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: string,
  quantity: number,
  context: UserContext
): Promise<Cart> {
  // Validate item ID
  if (!itemId || itemId.trim() === '') {
    throw new ValidationError('Item ID is required');
  }
  
  // Validate quantity
  if (!quantity || quantity <= 0) {
    throw new ValidationError('Valid quantity is required');
  }
  
  if (quantity > 999) {
    throw new ValidationError('Quantity cannot exceed 999 per item');
  }
  
  return await CartModel.updateItem(context.userId, itemId.trim(), quantity);
}

/**
 * Remove item from cart
 */
export async function removeCartItem(
  itemId: string,
  context: UserContext
): Promise<Cart> {
  // Validate item ID
  if (!itemId || itemId.trim() === '') {
    throw new ValidationError('Item ID is required');
  }
  
  return await CartModel.removeItem(context.userId, itemId.trim());
}

/**
 * Clear entire cart
 */
export async function clearCart(context: UserContext): Promise<Cart> {
  return await CartModel.clearCart(context.userId);
}

/**
 * Get cart item count
 */
export async function getCartItemCount(context: UserContext): Promise<number> {
  return await CartModel.getItemCount(context.userId);
}

/**
 * Get cart total price
 */
export async function getCartTotal(context: UserContext): Promise<number> {
  return await CartModel.getCartTotal(context.userId);
}

/**
 * Sync cart with current product prices and availability
 */
export async function syncCart(context: UserContext): Promise<{
  cart: Cart;
  changes: Array<{
    itemId: string;
    type: 'price_changed' | 'out_of_stock' | 'unavailable';
    oldValue?: any;
    newValue?: any;
  }>;
}> {
  return await CartModel.syncCartPrices(context.userId);
}

/**
 * Merge guest cart with user cart (after login)
 */
export async function mergeGuestCart(
  guestCartItems: CartItem[],
  context: UserContext
): Promise<Cart> {
  // Validate guest cart items
  if (!Array.isArray(guestCartItems)) {
    throw new ValidationError('Guest cart items must be an array');
  }
  
  // Limit guest cart size
  if (guestCartItems.length > 100) {
    throw new ValidationError('Guest cart cannot contain more than 100 items');
  }
  
  return await CartModel.mergeCart(context.userId, guestCartItems);
}

/**
 * Get cart summary (items count and total)
 */
export async function getCartSummary(context: UserContext): Promise<{
  itemCount: number;
  total: number;
}> {
  const [itemCount, total] = await Promise.all([
    CartModel.getItemCount(context.userId),
    CartModel.getCartTotal(context.userId),
  ]);
  
  return { itemCount, total };
}
