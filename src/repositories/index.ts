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

// Shared repository foundations
export { BaseRepository } from "@mohasinac/appkit/providers/db-firebase";

// Unit of Work — atomic multi-collection operations
export { unitOfWork } from "@mohasinac/appkit/core";
export type { UnitOfWork } from "@mohasinac/appkit/core";

// Core repositories
export {
  UserRepository,
  userRepository,
  EmailVerificationTokenRepository,
  PasswordResetTokenRepository,
  emailVerificationTokenRepository,
  passwordResetTokenRepository,
  tokenRepository,
  SessionRepository,
  sessionRepository,
} from "@mohasinac/appkit/features/auth";
export { AddressRepository, addressRepository } from "@mohasinac/appkit/features/account";
export {
  ProductRepository,
  ProductsRepository,
  productRepository,
} from "@mohasinac/appkit/features/products";
export {
  OrderRepository,
  OrdersRepository,
  orderRepository,
} from "@mohasinac/appkit/features/orders";
export {
  ReviewRepository,
  ReviewsRepository,
  reviewRepository,
} from "@mohasinac/appkit/features/reviews";

// Canonical appkit-owned repositories
export { bidRepository } from "@mohasinac/appkit/features/auctions";
export { CartRepository, cartRepository } from "@mohasinac/appkit/features/cart";
export {
  StoreRepository,
  storeRepository,
  storeAddressRepository,
} from "@mohasinac/appkit/features/stores";
export {
  siteSettingsRepository,
  notificationRepository,
  chatRepository,
} from "@mohasinac/appkit/features/admin";
export {
  carouselRepository,
  homepageSectionsRepository,
} from "@mohasinac/appkit/features/homepage";
export { CategoriesRepository, categoriesRepository } from "@mohasinac/appkit/features/categories";
export { couponsRepository } from "@mohasinac/appkit/features/promotions";
export {
  FAQsRepository,
  FirebaseFAQsRepository,
  faqsRepository,
} from "@mohasinac/appkit/features/faq";
export { BlogRepository, blogRepository } from "@mohasinac/appkit/features/blog";
export { payoutRepository } from "@mohasinac/appkit/features/payments";
export { OfferRepository, offerRepository } from "@mohasinac/appkit/features/seller";

export {
  wishlistRepository,
  type UserWishlistItem as WishlistItem,
} from "@mohasinac/appkit/features/wishlist";

// Feature repositories already appkit-owned
export {
  EventRepository,
  EventsRepository,
  eventRepository,
  EventEntryRepository,
  EventEntriesRepository,
  eventEntryRepository,
} from "@mohasinac/appkit/features/events";
export {
  NewsletterRepository,
  newsletterRepository,
} from "@mohasinac/appkit/core/newsletter.repository";
export type {
  NewsletterSubscriberDocument,
  NewsletterSubscriberCreateInput,
  NewsletterSubscriberUpdateInput,
  NewsletterListModel,
} from "@mohasinac/appkit/core/newsletter.repository";

export { SmsCounterRepository, smsCounterRepository } from "@mohasinac/appkit/features/auth";

export {
  CopilotLogRepository,
  copilotLogRepository,
} from "@mohasinac/appkit/core";
export type {
  CopilotFeedback,
  CopilotLogDocument,
  CopilotLogCreateInput,
} from "@mohasinac/appkit/core";
