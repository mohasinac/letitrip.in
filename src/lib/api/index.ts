/**
 * Type-safe API hooks and services for client-side
 * This layer provides a clean interface for the UI to interact with the API
 */

import apiClient from './client';
import { User, Product, Order, Cart, Auction, Review, PaginatedResponse, ProductFilters } from '@/types';
import type { RegisterInput, LoginInput, CreateProductInput, CreateOrderInput, PlaceBidInput } from '@/lib/validations/schemas';

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterInput): Promise<{ user: User; token: string }> => {
    return apiClient.post('/auth/register', data);
  },

  /**
   * Login user
   */
  login: async (data: LoginInput): Promise<{ user: User; token: string }> => {
    const result = await apiClient.post<{ user: User; token: string }>('/auth/login', data);
    // Store token in client
    apiClient.setToken(result.token);
    return result;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    apiClient.clearToken();
  },

  /**
   * Get current user
   */
  me: async (): Promise<User> => {
    return apiClient.get('/auth/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiClient.patch('/auth/profile', data);
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },
};

/**
 * Products API
 */
export const productsApi = {
  /**
   * Get all products with filters
   */
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    return apiClient.get('/products', filters);
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Get product by slug
   */
  getBySlug: async (slug: string): Promise<Product> => {
    return apiClient.get(`/products/slug/${slug}`);
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit = 8): Promise<Product[]> => {
    return apiClient.get('/products/featured', { limit });
  },

  /**
   * Get related products
   */
  getRelated: async (productId: string, limit = 4): Promise<Product[]> => {
    return apiClient.get(`/products/${productId}/related`, { limit });
  },

  /**
   * Create product (admin only)
   */
  create: async (data: CreateProductInput): Promise<Product> => {
    return apiClient.post('/products', data);
  },

  /**
   * Update product (admin only)
   */
  update: async (id: string, data: Partial<CreateProductInput>): Promise<Product> => {
    return apiClient.patch(`/products/${id}`, data);
  },

  /**
   * Delete product (admin only)
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/products/${id}`);
  },
};

/**
 * Cart API
 */
export const cartApi = {
  /**
   * Get user's cart
   */
  get: async (): Promise<Cart> => {
    return apiClient.get('/cart');
  },

  /**
   * Add item to cart
   */
  addItem: async (productId: string, quantity: number = 1): Promise<Cart> => {
    return apiClient.post('/cart/items', { productId, quantity });
  },

  /**
   * Update cart item quantity
   */
  updateItem: async (productId: string, quantity: number): Promise<Cart> => {
    return apiClient.patch(`/cart/items/${productId}`, { quantity });
  },

  /**
   * Remove item from cart
   */
  removeItem: async (productId: string): Promise<Cart> => {
    return apiClient.delete(`/cart/items/${productId}`);
  },

  /**
   * Clear entire cart
   */
  clear: async (): Promise<void> => {
    return apiClient.delete('/cart');
  },
};

/**
 * Orders API
 */
export const ordersApi = {
  /**
   * Get all orders for current user
   */
  getAll: async (filters?: any): Promise<PaginatedResponse<Order>> => {
    return apiClient.get('/orders', filters);
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    return apiClient.get(`/orders/${id}`);
  },

  /**
   * Create new order
   */
  create: async (data: CreateOrderInput): Promise<Order> => {
    return apiClient.post('/orders', data);
  },

  /**
   * Cancel order
   */
  cancel: async (id: string): Promise<Order> => {
    return apiClient.post(`/orders/${id}/cancel`);
  },
};

/**
 * Auctions API
 */
export const auctionsApi = {
  /**
   * Get all active auctions
   */
  getActive: async (): Promise<Auction[]> => {
    return apiClient.get('/auctions/active');
  },

  /**
   * Get auction by ID
   */
  getById: async (id: string): Promise<Auction> => {
    return apiClient.get(`/auctions/${id}`);
  },

  /**
   * Place bid on auction
   */
  placeBid: async (auctionId: string, data: PlaceBidInput): Promise<Auction> => {
    return apiClient.post(`/auctions/${auctionId}/bids`, data);
  },

  /**
   * Get user's bids
   */
  getMyBids: async (): Promise<Auction[]> => {
    return apiClient.get('/auctions/my-bids');
  },
};

/**
 * Reviews API
 */
export const reviewsApi = {
  /**
   * Get reviews for a product
   */
  getByProduct: async (productId: string): Promise<Review[]> => {
    return apiClient.get(`/products/${productId}/reviews`);
  },

  /**
   * Create review
   */
  create: async (data: any): Promise<Review> => {
    return apiClient.post('/reviews', data);
  },

  /**
   * Update review
   */
  update: async (id: string, data: any): Promise<Review> => {
    return apiClient.patch(`/reviews/${id}`, data);
  },

  /**
   * Delete review
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/reviews/${id}`);
  },
};

/**
 * Payment API
 */
export const paymentApi = {
  /**
   * Create Razorpay order
   */
  createRazorpayOrder: async (orderId: string): Promise<any> => {
    return apiClient.post('/payment/razorpay/create-order', { orderId });
  },

  /**
   * Verify Razorpay payment
   */
  verifyRazorpayPayment: async (data: any): Promise<void> => {
    return apiClient.post('/payment/razorpay/verify', data);
  },
};

/**
 * Shipping API
 */
export const shippingApi = {
  /**
   * Get shipping rates
   */
  getRates: async (pincode: string, weight: number): Promise<any[]> => {
    return apiClient.get('/shipping/rates', { pincode, weight });
  },

  /**
   * Create shipment
   */
  createShipment: async (orderId: string, courierId: number): Promise<any> => {
    return apiClient.post('/shipping/create', { orderId, courierId });
  },

  /**
   * Track shipment
   */
  trackShipment: async (trackingNumber: string): Promise<any> => {
    return apiClient.get(`/shipping/track/${trackingNumber}`);
  },
};
