import { INVENTORY_SETTINGS } from "@/constants/business-logic-constants";
import { CartBE } from "@/types/backend/cart.types";
import {
  AddToCartFormFE,
  CartFE,
  CartItemFE,
} from "@/types/frontend/cart.types";
import {
  toBEAddToCartRequest,
  toFECart,
} from "@/types/transforms/cart.transforms";
import { z } from "zod";
import { apiService } from "./api.service";

/**
 * Zod validation schemas for cart operations
 */

// Add to cart schema
export const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional().nullable(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(
      INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM,
      `Quantity cannot exceed ${INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM}`
    ),
  shopId: z.string().min(1, "Shop ID is required"),
});

// Update quantity schema
export const UpdateCartItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(
      INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM,
      `Quantity cannot exceed ${INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM}`
    ),
});

// Apply coupon schema
export const ApplyCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(50, "Coupon code must not exceed 50 characters")
    .regex(
      /^[A-Z0-9-]+$/,
      "Coupon code must contain only uppercase letters, numbers, and hyphens"
    ),
});

// Guest cart item schema
export const GuestCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be greater than 0"),
  image: z.string().url("Invalid image URL"),
  shopId: z.string().min(1, "Shop ID is required"),
  shopName: z.string().min(1, "Shop name is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(
      INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM,
      `Quantity cannot exceed ${INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM}`
    ),
  variantId: z.string().optional(),
});

/**
 * Cart Service - Updated with new type system and Zod validation ✅
 * All methods return FE types for UI, transform BE responses automatically
 */
class CartService {
  /**
   * Get user cart (returns UI-optimized cart)
   */
  async get(): Promise<CartFE> {
    const cartBE = await apiService.get<CartBE>("/cart");
    return toFECart(cartBE);
  }

  /**
   * Add item to cart
   */
  async addItem(formData: AddToCartFormFE): Promise<CartFE> {
    // Validate input data
    const validatedData = AddToCartSchema.parse({
      productId: formData.productId,
      variantId: formData.variantId,
      quantity: formData.quantity,
      shopId: formData.shopId,
    });

    const request = toBEAddToCartRequest(formData);
    const cartBE = await apiService.post<CartBE>("/cart", request);
    return toFECart(cartBE);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, quantity: number): Promise<CartFE> {
    // Validate input data
    const validatedData = UpdateCartItemSchema.parse({ itemId, quantity });

    const cartBE = await apiService.patch<CartBE>(
      `/cart/${validatedData.itemId}`,
      {
        quantity: validatedData.quantity,
      }
    );
    return toFECart(cartBE);
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<CartFE> {
    const cartBE = await apiService.delete<CartBE>(`/cart/${itemId}`);
    return toFECart(cartBE);
  }

  /**
   * Clear cart
   */
  async clear(): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>("/cart");
  }

  /**
   * Merge guest cart with user cart (on login)
   */
  async mergeGuestCart(guestItems: CartItemFE[]): Promise<CartFE> {
    const cartBE = await apiService.post<CartBE>("/cart/merge", {
      guestCartItems: guestItems,
    });
    return toFECart(cartBE);
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(code: string): Promise<CartFE> {
    // Validate coupon code
    const validatedData = ApplyCouponSchema.parse({ code: code.toUpperCase() });

    const cartBE = await apiService.post<CartBE>("/cart/coupon", {
      code: validatedData.code,
    });
    return toFECart(cartBE);
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(): Promise<CartFE> {
    const cartBE = await apiService.delete<CartBE>("/cart/coupon");
    return toFECart(cartBE);
  }

  /**
   * Get cart item count
   */
  async getItemCount(): Promise<number> {
    const result = await apiService.get<{ count: number }>("/cart/count");
    return result.count;
  }

  /**
   * Validate cart (check stock, prices)
   */
  async validate(): Promise<{
    valid: boolean;
    errors: Array<{ itemId: string; productId: string; error: string }>;
  }> {
    return apiService.get("/cart/validate");
  }

  // Local storage helpers for guest cart
  private readonly GUEST_CART_KEY = "guest_cart";

  getGuestCart(): CartItemFE[] {
    if (typeof window === "undefined") return [];

    try {
      const cart = localStorage.getItem(this.GUEST_CART_KEY);
      const parsed = cart ? JSON.parse(cart) : [];
      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        console.error("[Cart] Invalid cart data in localStorage, resetting");
        this.clearGuestCart();
        return [];
      }
      return parsed;
    } catch (error) {
      console.error("[Cart] Failed to parse cart from localStorage:", error);
      this.clearGuestCart();
      return [];
    }
  }

  setGuestCart(items: CartItemFE[]): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(items));
  }

  addToGuestCart(
    item: Omit<
      CartItemFE,
      | "id"
      | "addedAt"
      | "formattedPrice"
      | "formattedSubtotal"
      | "formattedTotal"
      | "isOutOfStock"
      | "isLowStock"
      | "canIncrement"
      | "canDecrement"
      | "hasDiscount"
      | "addedTimeAgo"
    >
  ): void {
    // Validate inputs
    if (!item.productId || typeof item.productId !== "string") {
      throw new Error("[Cart] Invalid product ID");
    }
    if (
      typeof item.quantity !== "number" ||
      isNaN(item.quantity) ||
      item.quantity < 1
    ) {
      throw new Error("[Cart] Invalid quantity");
    }
    if (
      typeof item.maxQuantity !== "number" ||
      isNaN(item.maxQuantity) ||
      item.maxQuantity < 1
    ) {
      throw new Error("[Cart] Invalid max quantity");
    }
    if (typeof item.price !== "number" || isNaN(item.price) || item.price < 0) {
      throw new Error("[Cart] Invalid price");
    }

    const cart = this.getGuestCart();

    // Check if item already exists
    const existingIndex = cart.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    );

    if (existingIndex >= 0) {
      // Update quantity and recalculate computed fields
      const existingItem = cart[existingIndex];
      const newQuantity = existingItem.quantity + item.quantity;

      // Don't exceed maxQuantity (validated above)
      existingItem.quantity = Math.min(newQuantity, item.maxQuantity);

      // Recalculate subtotal and total
      existingItem.subtotal = existingItem.price * existingItem.quantity;
      existingItem.total = existingItem.subtotal - existingItem.discount;

      // Update computed fields
      existingItem.formattedSubtotal = `₹${existingItem.subtotal}`;
      existingItem.formattedTotal = `₹${existingItem.total}`;
      existingItem.canIncrement = existingItem.quantity < item.maxQuantity;
      existingItem.canDecrement = existingItem.quantity > 1;
    } else {
      // Add new item with computed fields
      const now = new Date();
      cart.push({
        ...item,
        id: `guest_${Date.now()}_${Math.random()}`,
        addedAt: now,
        formattedPrice: `₹${item.price}`,
        formattedSubtotal: `₹${item.subtotal}`,
        formattedTotal: `₹${item.total}`,
        isOutOfStock: !item.isAvailable,
        isLowStock: item.maxQuantity <= 5,
        canIncrement: item.quantity < item.maxQuantity,
        canDecrement: item.quantity > 1,
        hasDiscount: item.discount > 0,
        addedTimeAgo: "Just added",
      } as CartItemFE);
    }

    this.setGuestCart(cart);
  }

  // Add to guest cart with full product details
  addToGuestCartWithDetails(product: {
    productId: string;
    name: string;
    price: number;
    image: string;
    shopId: string;
    shopName: string;
    quantity: number;
    variantId?: string;
  }): void {
    // Validate input data
    const validatedProduct = GuestCartItemSchema.parse(product);

    const subtotal = validatedProduct.price * validatedProduct.quantity;
    this.addToGuestCart({
      productId: validatedProduct.productId,
      productName: validatedProduct.name,
      productSlug: validatedProduct.name.toLowerCase().replace(/\s+/g, "-"),
      productImage: validatedProduct.image,
      variantId: validatedProduct.variantId || null,
      variantName: null,
      sku: "",
      price: validatedProduct.price,
      quantity: validatedProduct.quantity,
      maxQuantity: INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM,
      subtotal,
      discount: 0,
      total: subtotal,
      shopId: validatedProduct.shopId,
      shopName: validatedProduct.shopName,
      isAvailable: true,
    });
  }

  updateGuestCartItem(itemId: string, quantity: number): void {
    // Validate inputs with Zod
    const validatedData = UpdateCartItemSchema.parse({ itemId, quantity });

    const cart = this.getGuestCart();
    const index = cart.findIndex((i) => i.id === validatedData.itemId);

    if (index >= 0) {
      if (validatedData.quantity <= 0) {
        cart.splice(index, 1);
      } else {
        const item = cart[index];

        // Validate maxQuantity exists
        if (typeof item.maxQuantity !== "number" || item.maxQuantity < 1) {
          console.error(
            "[Cart] Invalid maxQuantity for item",
            validatedData.itemId
          );
          item.maxQuantity = INVENTORY_SETTINGS.MAX_QUANTITY_PER_CART_ITEM; // Default fallback
        }

        // Don't exceed maxQuantity
        item.quantity = Math.min(validatedData.quantity, item.maxQuantity);

        // Recalculate subtotal and total
        item.subtotal = item.price * item.quantity;
        item.total = item.subtotal - item.discount;

        // Update computed fields
        item.formattedSubtotal = `₹${item.subtotal}`;
        item.formattedTotal = `₹${item.total}`;
        item.canIncrement = item.quantity < item.maxQuantity;
        item.canDecrement = item.quantity > 1;
      }
      this.setGuestCart(cart);
    }
  }

  removeFromGuestCart(itemId: string): void {
    const cart = this.getGuestCart();
    const filtered = cart.filter((i) => i.id !== itemId);
    this.setGuestCart(filtered);
  }

  // Alias for consistency with useCart hook
  removeGuestCartItem(itemId: string): void {
    this.removeFromGuestCart(itemId);
  }

  clearGuestCart(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.GUEST_CART_KEY);
  }

  getGuestCartItemCount(): number {
    const cart = this.getGuestCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
}

export const cartService = new CartService();
