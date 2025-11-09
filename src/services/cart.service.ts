import { apiService } from "./api.service";
import type { CartItem } from "@/types";

interface AddToCartData {
  productId: string;
  quantity: number;
  variant?: string;
}

interface UpdateCartItemData {
  quantity: number;
}

interface MergeGuestCartData {
  guestCartItems: {
    productId: string;
    quantity: number;
    variant?: string;
  }[];
}

interface ApplyCouponData {
  code: string;
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  itemCount: number;
}

class CartService {
  // Get user cart
  async get(): Promise<CartSummary> {
    return apiService.get<CartSummary>("/cart");
  }

  // Add item to cart
  async addItem(data: AddToCartData): Promise<CartItem> {
    return apiService.post<CartItem>("/cart", data);
  }

  // Update cart item quantity
  async updateItem(
    itemId: string,
    data: UpdateCartItemData,
  ): Promise<CartItem> {
    return apiService.patch<CartItem>(`/cart/${itemId}`, data);
  }

  // Remove item from cart
  async removeItem(itemId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/cart/${itemId}`);
  }

  // Clear cart
  async clear(): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>("/cart");
  }

  // Merge guest cart with user cart (on login)
  async mergeGuestCart(data: MergeGuestCartData): Promise<CartSummary> {
    return apiService.post<CartSummary>("/cart/merge", data);
  }

  // Apply coupon to cart
  async applyCoupon(data: ApplyCouponData): Promise<CartSummary> {
    return apiService.post<CartSummary>("/cart/coupon", data);
  }

  // Remove coupon from cart
  async removeCoupon(): Promise<CartSummary> {
    return apiService.delete<CartSummary>("/cart/coupon");
  }

  // Get cart item count
  async getItemCount(): Promise<{ count: number }> {
    return apiService.get<{ count: number }>("/cart/count");
  }

  // Validate cart (check stock, prices)
  async validate(): Promise<{
    valid: boolean;
    errors: Array<{
      itemId: string;
      productId: string;
      error: string;
    }>;
  }> {
    return apiService.get("/cart/validate");
  }

  // Local storage helpers for guest cart
  private readonly GUEST_CART_KEY = "guest_cart";

  getGuestCart(): CartItem[] {
    if (typeof window === "undefined") return [];

    try {
      const cart = localStorage.getItem(this.GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  }

  setGuestCart(items: CartItem[]): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(items));
  }

  addToGuestCart(item: Omit<CartItem, "id" | "addedAt">): void {
    const cart = this.getGuestCart();

    // Check if item already exists
    const existingIndex = cart.findIndex(
      (i) => i.productId === item.productId && i.variant === item.variant,
    );

    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.push({
        ...item,
        id: `guest_${Date.now()}_${Math.random()}`,
        addedAt: new Date(),
      });
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
    variant?: string;
  }): void {
    const cartItem: Omit<CartItem, "id" | "addedAt"> = {
      productId: product.productId,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: product.quantity,
      variant: product.variant,
      shopId: product.shopId,
      shopName: product.shopName,
    };

    this.addToGuestCart(cartItem);
  }

  updateGuestCartItem(itemId: string, quantity: number): void {
    const cart = this.getGuestCart();
    const index = cart.findIndex((i) => i.id === itemId);

    if (index >= 0) {
      if (quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
      }
      this.setGuestCart(cart);
    }
  }

  removeFromGuestCart(itemId: string): void {
    const cart = this.getGuestCart();
    const filtered = cart.filter((i) => i.id !== itemId);
    this.setGuestCart(filtered);
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
export type {
  AddToCartData,
  UpdateCartItemData,
  MergeGuestCartData,
  ApplyCouponData,
  CartSummary,
};
