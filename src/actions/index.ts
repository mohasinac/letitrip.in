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
export type { VoteFaqInput, VoteFaqResult } from "./faq.actions";

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

// Bid mutations (auth required)
export { placeBidAction } from "./bid.actions";
export type { PlaceBidInput, PlaceBidResult } from "./bid.actions";

// Coupon validation (auth required)
export { validateCouponAction } from "./coupon.actions";
export type {
  ValidateCouponInput,
  ValidateCouponResult,
} from "./coupon.actions";

// Seller application (auth required)
export { becomeSellerAction } from "./seller.actions";
export type { BecomeSellerActionResult } from "./seller.actions";

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
} from "./carousel.actions";
export type {
  CreateCarouselSlideInput,
  UpdateCarouselSlideInput,
} from "./carousel.actions";

// Homepage section mutations (admin only)
export {
  createHomepageSectionAction,
  updateHomepageSectionAction,
  deleteHomepageSectionAction,
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
