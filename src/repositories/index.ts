/**
 * Repositories
 *
 * Centralized export for all repository instances.
 * Use these repositories for database operations throughout the application.
 *
 * @example
 * ```ts
 * import { userRepository } from '@/repositories';
 *
 * const user = await userRepository.findByEmail('user@example.com');
 * ```
 */

// Base repository
export * from "./base.repository";

// Unit of Work — atomic multi-collection operations
export { unitOfWork } from "./unit-of-work";
export type { UnitOfWork } from "./unit-of-work";

// Core repositories
export * from "./user.repository";
export * from "./address.repository";
export * from "./newsletter.repository";
export * from "./token.repository";
export * from "./product.repository";
export * from "./order.repository";
export * from "./review.repository";
export * from "./session.repository";
export * from "./bid.repository";
export * from "./cart.repository";

// Platform configuration repositories
export * from "./site-settings.repository";
export * from "./carousel.repository";
export * from "./homepage-sections.repository";
export * from "./categories.repository";
export * from "./coupons.repository";
export * from "./faqs.repository";
export * from "./wishlist.repository";
export * from "./blog.repository";
export * from "./payout.repository";

// Re-export singleton instances for convenience
export { userRepository } from "./user.repository";
export {
  emailVerificationTokenRepository,
  passwordResetTokenRepository,
  tokenRepository,
} from "./token.repository";
export { productRepository } from "./product.repository";
export { orderRepository } from "./order.repository";
export { reviewRepository } from "./review.repository";
export { sessionRepository } from "./session.repository";
export { bidRepository } from "./bid.repository";
export { cartRepository } from "./cart.repository";
export { siteSettingsRepository } from "./site-settings.repository";
export { carouselRepository } from "./carousel.repository";
export { homepageSectionsRepository } from "./homepage-sections.repository";
export { categoriesRepository } from "./categories.repository";
export { couponsRepository } from "./coupons.repository";
export { faqsRepository } from "./faqs.repository";
export { addressRepository } from "./address.repository";
export { newsletterRepository } from "./newsletter.repository";
export { wishlistRepository } from "./wishlist.repository";
export { blogRepository } from "./blog.repository";
export type { WishlistItem } from "./wishlist.repository";
export * from "./notification.repository";
export { notificationRepository } from "./notification.repository";
export { payoutRepository } from "./payout.repository";
