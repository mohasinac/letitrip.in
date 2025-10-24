/**
 * Cart API Service
 */

import apiClient from './client';
import type { Cart, CartItem } from '@/types';

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

class CartAPI {
  /**
   * Get user's cart
   */
  async getCart(): Promise<Cart | null> {
    try {
      const response = await apiClient.get<Cart>('/cart');
      return response;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      return null;
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(item: AddToCartRequest): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/add', item);
    return response;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(item: UpdateCartItemRequest): Promise<Cart> {
    const response = await apiClient.patch<Cart>('/cart/update', item);
    return response;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/cart/remove/${productId}`);
    return response;
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>('/cart/clear');
    return response;
  }

  /**
   * Get cart total
   */
  async getCartTotal(): Promise<{
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    itemCount: number;
  }> {
    const response = await apiClient.get<{
      subtotal: number;
      shipping: number;
      tax: number;
      total: number;
      itemCount: number;
    }>('/cart/total');
    return response;
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(couponCode: string): Promise<{
    success: boolean;
    discount: number;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      discount: number;
      message: string;
    }>('/cart/coupon/apply', { couponCode });
    return response;
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>('/cart/coupon/remove');
    return response;
  }

  /**
   * Validate cart items (check availability, prices)
   */
  async validateCart(): Promise<{
    valid: boolean;
    issues: Array<{
      productId: string;
      issue: 'out_of_stock' | 'price_changed' | 'not_available';
      message: string;
    }>;
  }> {
    const response = await apiClient.post<{
      valid: boolean;
      issues: Array<{
        productId: string;
        issue: 'out_of_stock' | 'price_changed' | 'not_available';
        message: string;
      }>;
    }>('/cart/validate');
    return response;
  }

  /**
   * Merge guest cart with user cart (after login)
   */
  async mergeCart(guestCartItems: CartItem[]): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/merge', {
      guestItems: guestCartItems,
    });
    return response;
  }
}

export const cartAPI = new CartAPI();
