// API Services
import { CategoryService } from "./category.service";
import { StorageService } from "./storage.service";

export { CategoryService } from "./category.service";
export { StorageService } from "./storage.service";
export { BaseService } from "./base.service";
export { productsService, ProductsService } from './products.service';
export { ordersService, OrdersService } from './orders.service';
export { usersService, UsersService } from './users.service';
export { reviewsService, ReviewsService } from './reviews.service';

// Types
export type {
  StorageUploadRequest,
  StorageUploadResponse,
} from "./storage.service";
export type { ServiceConfig } from "./base.service";
export type { ProductStats } from './products.service';
export type { OrderStats, CreateOrderData, TrackOrderParams, TrackOrderResult } from './orders.service';
export type { UpdateProfileData } from './users.service';
export type { ReviewFilters, CreateReviewData, UpdateReviewData } from './reviews.service';

/**
 * Unified API service object
 * Provides access to all service singletons in one place
 * 
 * Usage:
 *   import { api } from '@/lib/api/services';
 *   const products = await api.products.list();
 *   const orders = await api.orders.list();
 */
import { productsService } from './products.service';
import { ordersService } from './orders.service';
import { usersService } from './users.service';
import { reviewsService } from './reviews.service';

// Create singleton for category service
const categoriesService = new CategoryService();
export { categoriesService };

export const api = {
  products: productsService,
  orders: ordersService,
  users: usersService,
  categories: categoriesService,
  reviews: reviewsService,
  storage: new StorageService(),
} as const;

// Default export
export default api;
