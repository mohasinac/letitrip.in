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
export { apiService } from "./api.service";

// Auth service
export { authService } from "./auth.service";
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "./auth.service";

// Shops service
export { shopsService } from "./shops.service";
export type {
  ShopVerificationData,
  ShopFeatureData,
  ShopBanData,
  ShopPaymentData,
} from "./shops.service";

// Products service
export { productsService } from "./products.service";

// Orders service
export { ordersService } from "./orders.service";

// Coupons service
export { couponsService } from "./coupons.service";
export type {
  ValidateCouponData,
  ValidateCouponResponse,
} from "./coupons.service";

// Categories service
export { categoriesService } from "./categories.service";

// Auctions service
export { auctionsService } from "./auctions.service";

// Returns service
export { returnsService } from "./returns.service";
export type {
  UpdateReturnData,
  ApproveReturnData,
  ProcessRefundData,
  ResolveDisputeData,
} from "./returns.service";

// Reviews service
export { reviewsService } from "./reviews.service";
export type { ModerateReviewData } from "./reviews.service";

// Users service
export { usersService } from "./users.service";

// Analytics service
export { analyticsService } from "./analytics.service";

// Media service
export { mediaService } from "./media.service";
export type {
  UploadMediaData,
  MediaItem,
  UpdateMediaData,
  MediaUploadResponse,
} from "./media.service";

// Cart service
export { cartService } from "./cart.service";

// Favorites service
export { favoritesService } from "./favorites.service";
export type { FavoriteItem } from "./favorites.service";

// Support service
export { supportService } from "./support.service";
// Types are now in @/types/frontend/support-ticket.types.ts and @/types/backend/support-ticket.types.ts

// Blog service
export { blogService } from "./blog.service";
export type { BlogFilters } from "./blog.service";

// Address service
export { addressService } from "./address.service";

// Homepage Settings service
export { homepageSettingsService } from "./homepage-settings.service";
export type {
  HomepageSettings,
  HomepageSettingsResponse,
} from "./homepage-settings.service";
