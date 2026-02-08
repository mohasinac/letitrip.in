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

// Core repositories
export * from "./user.repository";
export * from "./token.repository";
export * from "./product.repository";
export * from "./order.repository";
export * from "./review.repository";
export * from "./session.repository";

// Platform configuration repositories
export * from "./site-settings.repository";
export * from "./carousel.repository";
export * from "./homepage-sections.repository";
export * from "./categories.repository";
export * from "./coupons.repository";
export * from "./faqs.repository";

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
export { siteSettingsRepository } from "./site-settings.repository";
export { carouselRepository } from "./carousel.repository";
export { homepageSectionsRepository } from "./homepage-sections.repository";
export { categoriesRepository } from "./categories.repository";
export { couponsRepository } from "./coupons.repository";
export { faqsRepository } from "./faqs.repository";
