/**
 * Server Actions
 *
 * Barrel export for all Server Actions (`"use server"` functions).
 * These bypass the service → apiClient → HTTP → API route chain and call
 * repositories directly, reducing mutation latency from 7 hops to 2.
 *
 * Usage in hooks/components:
 * ```ts
 * import { addToCartAction, addToWishlistAction } from "@/actions";
 * ```
 *
 * Rules:
 * - Actions must authenticate via `requireAuth()` before any data access
 * - Actions must validate all inputs with Zod before calling repositories
 * - Rate limiting uses `rateLimitByIdentifier` keyed by `${uid}:action`
 * - Never import client-only code (React, hooks, components) in action files
 */

// Cart mutations
export {
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
  mergeGuestCartAction,
} from "./cart.actions";

// Wishlist mutations
export {
  addToWishlistAction,
  removeFromWishlistAction,
  getWishlistAction,
} from "./wishlist.actions";
export type { EnrichedWishlistItem } from "./wishlist.actions";

// Review mutations
export {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  voteReviewHelpfulAction,
  adminUpdateReviewAction,
  adminDeleteReviewAction,
} from "./review.actions";

// Notification mutations
export {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "./notification.actions";

// Contact (public — no auth)
export { sendContactAction } from "./contact.actions";
export type { SendContactInput } from "./contact.actions";

// Newsletter (public — no auth)
export { subscribeNewsletterAction } from "./newsletter.actions";
export type { SubscribeNewsletterInput } from "./newsletter.actions";

// FAQ voting (auth required)
export { voteFaqAction } from "./faq.actions";
export type { VoteFaqActionInput, VoteFaqActionResult } from "./faq.actions";

// Profile update (auth required)
export { updateProfileAction } from "./profile.actions";
export type { UpdateProfileInput } from "./profile.actions";

// Address mutations (auth required)
export {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "./address.actions";
export type { AddressInput } from "./address.actions";

// Store address mutations (seller role required)
export {
  listStoreAddressesAction,
  createStoreAddressAction,
  updateStoreAddressAction,
  deleteStoreAddressAction,
} from "./store-address.actions";
export type { StoreAddressInput } from "./store-address.actions";

// Bid mutations (auth required)
export { placeBidAction } from "./bid.actions";

// Coupon validation (auth required)
export {
  validateCouponAction,
  validateCouponForCartAction,
} from "./coupon.actions";
export type {
  ValidateCouponInput,
  ValidateCouponForCartInput,
  CouponValidationResult,
  CouponCartValidationResult,
} from "./coupon.actions";

// Seller coupon CRUD (seller role required)
export {
  sellerCreateCouponAction,
  sellerUpdateCouponAction,
  sellerDeleteCouponAction,
} from "./seller-coupon.actions";
export type {
  SellerCreateCouponInput,
  SellerUpdateCouponInput,
} from "./seller-coupon.actions";

// Seller application (auth required)
export { becomeSellerAction } from "./seller.actions";

// Seller store/payout/product mutations (seller role required)
export {
  createStoreAction,
  updateStoreAction,
  updatePayoutSettingsAction,
  requestPayoutAction,
  bulkSellerOrderAction,
  createSellerProductAction,
  sellerUpdateProductAction,
  sellerDeleteProductAction,
  shipOrderAction,
  updateSellerShippingAction,
  verifyShiprocketPickupOtpAction,
} from "./seller.actions";
export type { BulkSellerOrderResult } from "./seller.actions";

// Category mutations (admin only)
export { createCategoryAction } from "./category.actions";
export type { CreateCategoryInput } from "./category.actions";

// Admin session management (admin only)
export { revokeSessionAction, revokeUserSessionsAction } from "./admin.actions";

// Admin CRUD mutations (admin only)
export {
  adminUpdateOrderAction,
  adminUpdatePayoutAction,
  adminUpdateUserAction,
  adminDeleteUserAction,
  adminUpdateStoreStatusAction,
  adminUpdateProductAction,
  adminCreateProductAction,
  adminDeleteProductAction,
} from "./admin.actions";

// Blog post mutations (admin only)
export {
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "./blog.actions";
export type { CreateBlogPostInput, UpdateBlogPostInput } from "./blog.actions";

// Event mutations (admin only + user participation)
export {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  changeEventStatusAction,
  adminUpdateEventEntryAction,
} from "./event.actions";
export type { CreateEventInput, UpdateEventInput } from "./event.actions";

// Carousel mutations (admin only)
export {
  createCarouselSlideAction,
  updateCarouselSlideAction,
  deleteCarouselSlideAction,
  reorderCarouselSlidesAction,
} from "./carousel.actions";
export type {
  CarouselSlideInput,
  CarouselSlideUpdateInput,
} from "./carousel.actions";

// Homepage section mutations (admin only)
export {
  createHomepageSectionAction,
  updateHomepageSectionAction,
  deleteHomepageSectionAction,
  reorderHomepageSectionsAction,
} from "./sections.actions";
export type {
  CreateHomepageSectionInput,
  UpdateHomepageSectionInput,
} from "./sections.actions";

// Coupon admin CRUD (admin only)
export {
  adminCreateCouponAction,
  adminUpdateCouponAction,
  adminDeleteCouponAction,
} from "./admin-coupon.actions";
export type {
  AdminCreateCouponInput,
  AdminUpdateCouponInput,
} from "./admin-coupon.actions";

// FAQ admin CRUD (admin only)
export {
  adminCreateFaqAction,
  adminUpdateFaqAction,
  adminDeleteFaqAction,
} from "./faq.actions";
export type { AdminCreateFaqInput, AdminUpdateFaqInput } from "./faq.actions";

// Category update + delete (admin only)
export { updateCategoryAction, deleteCategoryAction } from "./category.actions";

// Order mutations (auth required)
export { cancelOrderAction } from "./order.actions";

// Checkout consent OTP + SMS grant (auth required)
export {
  sendConsentOtpAction,
  verifyConsentOtpAction,
  grantCheckoutConsentViaSmsAction,
} from "./checkout.actions";

// ─── Read Actions (2-hop: Hook → Action → Repository) ────────────────────────

// Product reads (public)
export type { ProductListActionParams, ProductListResult } from "./product.actions";
export {
  listProductsAction,
  getProductByIdAction,
  getFeaturedProductsAction,
  getFeaturedAuctionsAction,
  getLatestProductsAction,
  getLatestAuctionsAction,
  listAuctionsAction,
  getFeaturedPreOrdersAction,
  getLatestPreOrdersAction,
  listPreOrdersAction,
  getRelatedProductsAction,
  getSellerStorefrontProductsAction,
} from "./product.actions";

// Store reads (public)
export {
  listStoresAction,
  getStoreBySlugAction,
  getStoreProductsAction,
  getStoreAuctionsAction,
  getStoreReviewsAction,
} from "./store.actions";

// Promotions reads (public)
export { getPromotionsAction } from "./promotions.actions";

// Search (public)
export { searchProductsAction } from "./search.actions";

// Site settings (public read, admin write)
export { getSiteSettingsAction } from "./site-settings.actions";

// Realtime token (auth required)
export { getRealtimeTokenAction } from "./realtime-token.actions";

// Category reads (public)
export {
  listCategoriesAction,
  listTopLevelCategoriesAction,
  listBrandCategoriesAction,
  getCategoryByIdAction,
  getCategoryBySlugAction,
  getCategoryChildrenAction,
  buildCategoryTreeAction,
} from "./category.actions";

// Blog reads (public)
export {
  listBlogPostsAction,
  getFeaturedBlogPostsAction,
  getLatestBlogPostsAction,
  getBlogPostBySlugAction,
} from "./blog.actions";

// Carousel reads (public)
export {
  listActiveCarouselSlidesAction,
  listAllCarouselSlidesAction,
  getCarouselSlideByIdAction,
} from "./carousel.actions";

// Homepage sections reads (public)
export {
  listHomepageSectionsAction,
  listEnabledHomepageSectionsAction,
  getHomepageSectionByIdAction,
} from "./sections.actions";

// FAQ reads (public)
export {
  listFaqsAction,
  listPublicFaqsAction,
  getFaqByIdAction,
} from "./faq.actions";

// Review reads (public + admin)
export {
  listReviewsByProductAction,
  listAdminReviewsAction,
  listReviewsBySellerAction,
  getHomepageReviewsAction,
  getReviewByIdAction,
} from "./review.actions";

// Bid reads (public)
export { listBidsByProductAction, getBidByIdAction } from "./bid.actions";

// Event reads (public + admin)
export {
  listPublicEventsAction,
  getPublicEventByIdAction,
  getEventLeaderboardAction,
  adminListEventsAction,
  adminGetEventByIdAction,
  adminGetEventEntriesAction,
  adminGetEventStatsAction,
} from "./event.actions";

// Notification reads (auth required)
export {
  listNotificationsAction,
  getUnreadNotificationCountAction,
} from "./notification.actions";

// Address reads (auth required)
export { listAddressesAction, getAddressByIdAction } from "./address.actions";

// Order reads (auth required)
export { listOrdersAction, getOrderByIdAction } from "./order.actions";

// Cart read (auth required)
export { getCartAction } from "./cart.actions";

// Chat actions (auth required)
export {
  getChatRoomsAction,
  createOrGetChatRoomAction,
  sendChatMessageAction,
  deleteChatRoomAction,
} from "./chat.actions";

// Profile reads (auth required + public)
export {
  getMyProfileAction,
  listMySessionsAction,
  getPublicProfileAction,
  getSellerReviewsAction,
  getSellerProductsAction,
} from "./profile.actions";

// Seller reads (seller role required)
export {
  getSellerStoreAction,
  getSellerShippingAction,
  getSellerPayoutSettingsAction,
  listSellerOrdersAction,
  getSellerAnalyticsAction,
  listSellerPayoutsAction,
  listSellerCouponsAction,
  listSellerMyProductsAction,
} from "./seller.actions";

// Admin reads (admin/moderator role required)
export {
  getAdminDashboardStatsAction,
  getAdminAnalyticsAction,
  listAdminOrdersAction,
  listAdminUsersAction,
  listAdminBidsAction,
  listAdminBlogAction,
  listAdminPayoutsAction,
  listAdminProductsAction,
  listAdminStoresAction,
  listAdminSessionsAction,
} from "./admin-read.actions";

// Event entry (public � auth optional per event type)
export { enterEventAction } from "./event.actions";
export type { EnterEventInput } from "./event.actions";

// Admin coupon list (admin role required)
export { listAdminCouponsAction } from "./admin-coupon.actions";

// Site settings update (admin role required)
export { updateSiteSettingsAction } from "./site-settings.actions";

// Offer mutations (auth required — buyer / seller)
export {
  makeOfferAction,
  respondToOfferAction,
  acceptCounterOfferAction,
  counterOfferByBuyerAction,
  withdrawOfferAction,
  listBuyerOffersAction,
  listSellerOffersAction,
  checkoutOfferAction,
} from "./offer.actions";
export type {
  MakeOfferInput,
  RespondToOfferInput,
  BuyerCounterInput,
} from "./offer.actions";

// Refund (admin only)
export {
  adminPartialRefundAction,
  previewCancellationRefundAction,
} from "./refund.actions";
export type { PartialRefundInput, PartialRefundResult } from "./refund.actions";

// Demo seed (admin only, dev environment)
export { demoSeedAction } from "./demo-seed.actions";
export type {
  SeedCollectionName,
  SeedOperationResult,
} from "./demo-seed.actions";

