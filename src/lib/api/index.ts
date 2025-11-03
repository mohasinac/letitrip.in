/**
 * API Services Export Index
 * Centralized export for all API services
 */

import { CartService } from "./services/cart.service";
import { WishlistService } from "./services/wishlist.service";
import { ProductService } from "./services/product.service";
import { OrderService } from "./services/order.service";
import { ReviewService } from "./services/review.service";
import { UserService } from "./services/user.service";
import { CategoryService } from "./services/category.service";

// Export API Client
export { apiClient } from "./client";

// Export Services
export { CartService } from "./services/cart.service";
export { WishlistService } from "./services/wishlist.service";
export { ProductService } from "./services/product.service";
export { OrderService } from "./services/order.service";
export { ReviewService } from "./services/review.service";
export { UserService } from "./services/user.service";
export { CategoryService } from "./services/category.service";

// Export types from client
export type { ApiResponse, ApiClientConfig } from "./client";

// Export types from services
export type { CartData, CartSyncResult } from "./services/cart.service";
export type { WishlistData } from "./services/wishlist.service";
export type { 
  Product, 
  ProductFilters, 
  ProductListResponse 
} from "./services/product.service";
export type { 
  Order, 
  OrderItem, 
  CreateOrderData,
  OrderFilters,
  OrderListResponse,
  ShippingAddress
} from "./services/order.service";
export type { 
  Review, 
  CreateReviewData,
  ReviewFilters,
  ReviewStats,
  ReviewListResponse
} from "./services/review.service";
export type { 
  UserProfile, 
  Address,
  UpdateProfileData,
  CreateAddressData,
  ChangePasswordData
} from "./services/user.service";
export type { 
  Category, 
  CategoryFilters 
} from "./services/category.service";

// Convenience object for accessing all services
export const api = {
  cart: CartService,
  wishlist: WishlistService,
  products: ProductService,
  orders: OrderService,
  reviews: ReviewService,
  user: UserService,
  categories: CategoryService,
} as const;
