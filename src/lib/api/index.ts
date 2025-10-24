/**
 * API Services Export Index
 * Centralized export for all API services
 */

// Import API services
import apiClient from './client';
import { productsAPI } from './products';
import { authAPI } from './auth';
import { cartAPI } from './cart';
import { ordersAPI } from './orders';

// Export API client
export { default as apiClient } from './client';

// Export structured API services
export { productsAPI } from './products';
export { authAPI } from './auth';
export { cartAPI } from './cart';
export { ordersAPI } from './orders';

// Export types
export type {
  ProductsApiParams,
  FeaturedProductsParams,
} from './products';

export type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from './auth';

export type {
  AddToCartRequest,
  UpdateCartItemRequest,
} from './cart';

export type {
  CreateOrderRequest,
  OrderTrackingInfo,
} from './orders';

// Convenience object for accessing all APIs
export const API = {
  products: productsAPI,
  auth: authAPI,
  cart: cartAPI,
  orders: ordersAPI,
} as const;

// Legacy API exports (for backward compatibility)
import { User, Product, Order, Cart, Auction, Review, PaginatedResponse, ProductFilters } from '@/types';
import type { RegisterInput, LoginInput, CreateProductInput, CreateOrderInput, PlaceBidInput } from '@/lib/validations/schemas';

/**
 * Legacy Authentication API (deprecated - use authAPI instead)
 */
export const authApi = {
  register: async (data: RegisterInput): Promise<{ user: User; token: string }> => {
    return authAPI.register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as 'user' | 'seller',
      isOver18: data.isOver18,
    });
  },

  login: async (data: LoginInput): Promise<{ user: User; token: string }> => {
    return authAPI.login(data);
  },

  logout: async (): Promise<void> => {
    return authAPI.logout();
  },

  me: async (): Promise<User> => {
    const user = await authAPI.getCurrentUser();
    if (!user) throw new Error('User not found');
    return user;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return authAPI.updateProfile(data);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await authAPI.changePassword({ currentPassword, newPassword });
  },
};

/**
 * Legacy Products API (deprecated - use productsAPI instead)
 */
export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    return productsAPI.getProducts({
      page: filters?.page,
      limit: filters?.pageSize,
      category: filters?.category,
      search: filters?.search,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      sortBy: filters?.sort?.includes('price') ? 'price' : 
             filters?.sort === 'newest' ? 'created' : 
             filters?.sort === 'popular' ? 'views' : undefined,
      sortOrder: filters?.sort?.includes('desc') ? 'desc' : 'asc',
    });
  },

  getById: async (id: string): Promise<Product> => {
    const product = await productsAPI.getProduct(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const product = await productsAPI.getProduct(slug);
    if (!product) throw new Error('Product not found');
    return product;
  },

  getFeatured: async (limit = 8): Promise<Product[]> => {
    return productsAPI.getFeaturedProducts({ limit });
  },

  getRelated: async (productId: string, limit = 4): Promise<Product[]> => {
    // This would need to be implemented in the new API
    return apiClient.get(`/products/${productId}/related`, { limit });
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    return productsAPI.createProduct(data as any);
  },

  update: async (id: string, data: Partial<CreateProductInput>): Promise<Product> => {
    return productsAPI.updateProduct(id, data as any);
  },

  delete: async (id: string): Promise<void> => {
    return productsAPI.deleteProduct(id);
  },
};

/**
 * Legacy Cart API (deprecated - use cartAPI instead)
 */
export const cartApi = {
  get: async (): Promise<Cart> => {
    const cart = await cartAPI.getCart();
    if (!cart) throw new Error('Cart not found');
    return cart;
  },

  addItem: async (productId: string, quantity: number = 1): Promise<Cart> => {
    return cartAPI.addToCart({ productId, quantity });
  },

  updateItem: async (productId: string, quantity: number): Promise<Cart> => {
    return cartAPI.updateCartItem({ productId, quantity });
  },

  removeItem: async (productId: string): Promise<Cart> => {
    return cartAPI.removeFromCart(productId);
  },

  clear: async (): Promise<void> => {
    await cartAPI.clearCart();
  },
};

/**
 * Legacy Orders API (deprecated - use ordersAPI instead)
 */
export const ordersApi = {
  getAll: async (filters?: any): Promise<PaginatedResponse<Order>> => {
    return ordersAPI.getOrders(filters);
  },

  getById: async (id: string): Promise<Order> => {
    const order = await ordersAPI.getOrder(id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  create: async (data: CreateOrderInput): Promise<Order> => {
    return ordersAPI.createOrder(data as any);
  },

  cancel: async (id: string): Promise<Order> => {
    return ordersAPI.cancelOrder(id);
  },
};

/**
 * Auctions API (unchanged)
 */
export const auctionsApi = {
  getActive: async (): Promise<Auction[]> => {
    return apiClient.get('/auctions/active');
  },

  getById: async (id: string): Promise<Auction> => {
    return apiClient.get(`/auctions/${id}`);
  },

  placeBid: async (auctionId: string, data: PlaceBidInput): Promise<Auction> => {
    return apiClient.post(`/auctions/${auctionId}/bids`, data);
  },

  getMyBids: async (): Promise<Auction[]> => {
    return apiClient.get('/auctions/my-bids');
  },
};

/**
 * Reviews API (unchanged)
 */
export const reviewsApi = {
  getByProduct: async (productId: string): Promise<Review[]> => {
    return apiClient.get(`/products/${productId}/reviews`);
  },

  create: async (data: any): Promise<Review> => {
    return apiClient.post('/reviews', data);
  },

  update: async (id: string, data: any): Promise<Review> => {
    return apiClient.patch(`/reviews/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/reviews/${id}`);
  },
};

/**
 * Payment API (unchanged)
 */
export const paymentApi = {
  createRazorpayOrder: async (orderId: string): Promise<any> => {
    return apiClient.post('/payment/razorpay/create-order', { orderId });
  },

  verifyRazorpayPayment: async (data: any): Promise<void> => {
    return apiClient.post('/payment/razorpay/verify', data);
  },
};

/**
 * Shipping API (unchanged)
 */
export const shippingApi = {
  getRates: async (pincode: string, weight: number): Promise<any[]> => {
    return apiClient.get('/shipping/rates', { pincode, weight });
  },

  createShipment: async (orderId: string, courierId: number): Promise<any> => {
    return apiClient.post('/shipping/create', { orderId, courierId });
  },

  trackShipment: async (trackingNumber: string): Promise<any> => {
    return apiClient.get(`/shipping/track/${trackingNumber}`);
  },
};
