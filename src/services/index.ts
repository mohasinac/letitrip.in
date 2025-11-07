/**
 * Service Layer - Client-side API Wrappers
 * 
 * All services follow the auth.service.ts pattern:
 * - Client-side only (no database imports)
 * - Use apiService for HTTP calls
 * - Type-safe interfaces
 * - Consistent error handling
 * 
 * Architecture:
 * UI Component → Service → apiService → API Route → Database
 * 
 * Example:
 * ```ts
 * import { shopsService } from '@/services';
 * 
 * const shops = await shopsService.list({ verified: true });
 * const shop = await shopsService.getById(shopId);
 * await shopsService.update(shopId, { name: 'New Name' });
 * ```
 */

// Base API service
export { apiService } from './api.service';

// Auth service
export { authService } from './auth.service';
export type { User, AuthResponse, LoginCredentials, RegisterData } from './auth.service';

// Shops service
export { shopsService } from './shops.service';
export type {
  ShopFilters,
  CreateShopData,
  UpdateShopData,
  ShopVerificationData,
  ShopFeatureData,
  ShopBanData,
  ShopPaymentData,
} from './shops.service';

// Products service
export { productsService } from './products.service';
export type {
  ProductFilters,
  CreateProductData,
  UpdateProductData,
} from './products.service';

// Orders service
export { ordersService } from './orders.service';
export type {
  OrderFilters,
  CreateOrderData,
  UpdateOrderStatusData,
  CreateShipmentData,
  CancelOrderData,
} from './orders.service';

// Coupons service
export { couponsService } from './coupons.service';
export type {
  CouponFilters,
  CreateCouponData,
  UpdateCouponData,
  ValidateCouponData,
  ValidateCouponResponse,
} from './coupons.service';

// Categories service
export { categoriesService } from './categories.service';
export type {
  CategoryFilters,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryTree,
} from './categories.service';

// Auctions service
export { auctionsService } from './auctions.service';
export type {
  AuctionFilters,
  CreateAuctionData,
  UpdateAuctionData,
  PlaceBidData,
} from './auctions.service';

// Returns service
export { returnsService } from './returns.service';
export type {
  ReturnFilters,
  InitiateReturnData,
  UpdateReturnData,
  ApproveReturnData,
  ProcessRefundData,
  ResolveDisputeData,
} from './returns.service';

// Reviews service
export { reviewsService } from './reviews.service';
export type {
  ReviewFilters,
  CreateReviewData,
  UpdateReviewData,
  ModerateReviewData,
} from './reviews.service';

// Users service
export { usersService } from './users.service';
export type {
  UserFilters,
  UpdateUserData,
  ChangePasswordData,
  VerifyEmailData,
  VerifyMobileData,
  BanUserData,
  ChangeRoleData,
} from './users.service';

// Analytics service
export { analyticsService } from './analytics.service';
export type {
  AnalyticsFilters,
  AnalyticsOverview,
  SalesData,
  TopProduct,
  CategoryPerformance,
} from './analytics.service';

// Media service
export { mediaService } from './media.service';
export type {
  UploadMediaData,
  MediaItem,
  UpdateMediaData,
  MediaUploadResponse,
} from './media.service';

// Cart service
export { cartService } from './cart.service';
export type {
  AddToCartData,
  UpdateCartItemData,
  MergeGuestCartData,
  ApplyCouponData,
  CartSummary,
} from './cart.service';

// Favorites service
export { favoritesService } from './favorites.service';
export type { FavoriteItem } from './favorites.service';

// Support service
export { supportService } from './support.service';
export type {
  TicketFilters,
  CreateTicketData,
  UpdateTicketData,
  ReplyToTicketData,
  AssignTicketData,
  EscalateTicketData,
} from './support.service';
