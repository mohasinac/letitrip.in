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
import { AuthService } from "./services/auth.service";
import { AddressService } from "./services/address.service";
import { PaymentService } from "./services/payment.service";
import { SearchService } from "./services/search.service";
import { GameService } from "./services/game.service";
import { SellerService } from "./services/seller.service";
import { AdminService } from "./services/admin.service";
import { UploadService } from "./services/upload.service";

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
export { AuthService } from "./services/auth.service";
export { AddressService } from "./services/address.service";
export { PaymentService } from "./services/payment.service";
export { SearchService } from "./services/search.service";
export { GameService } from "./services/game.service";
export { SellerService } from "./services/seller.service";
export { AdminService } from "./services/admin.service";
export { UploadService } from "./services/upload.service";

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
export type {
  AuthUser,
  RegisterData,
  SendOtpData,
  VerifyOtpData,
  ChangePasswordData as AuthChangePasswordData
} from "./services/auth.service";
export type {
  Address as ServiceAddress,
  CreateAddressData as ServiceCreateAddressData,
  UpdateAddressData
} from "./services/address.service";
export type {
  RazorpayOrderData,
  RazorpayOrderResponse,
  RazorpayVerifyData,
  PayPalOrderData,
  PayPalOrderResponse,
  PayPalCaptureData
} from "./services/payment.service";
export type {
  SearchResults,
  Store
} from "./services/search.service";
export type {
  Beyblade,
  CreateBeybladeData,
  UpdateBeybladeData,
  Arena,
  CreateArenaData,
  UpdateArenaData
} from "./services/game.service";
export type {
  SellerProductStats,
  SellerOrderStats,
  SellerAnalytics,
  Coupon,
  CreateCouponData,
  Shipment,
  SellerShop,
  SellerAlert
} from "./services/seller.service";
export type {
  AdminUser,
  AdminProductStats,
  AdminOrderStats,
  SiteSettings,
  HeroSettings,
  HeroSlide,
  ThemeSettings,
  BulkOperation
} from "./services/admin.service";
export type {
  UploadResponse,
  UploadOptions
} from "./services/upload.service";

// Convenience object for accessing all services
export const api = {
  cart: CartService,
  wishlist: WishlistService,
  products: ProductService,
  orders: OrderService,
  reviews: ReviewService,
  user: UserService,
  categories: CategoryService,
  auth: AuthService,
  addresses: AddressService,
  payment: PaymentService,
  search: SearchService,
  game: GameService,
  seller: SellerService,
  admin: AdminService,
  upload: UploadService,
} as const;
