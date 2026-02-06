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

export * from "./base.repository";
export * from "./user.repository";
export * from "./token.repository";
export * from "./product.repository";
export * from "./booking.repository";
export * from "./review.repository";

// Re-export singleton instances for convenience
export { userRepository } from "./user.repository";
export {
  emailVerificationTokenRepository,
  passwordResetTokenRepository,
  tokenRepository,
} from "./token.repository";
export { productRepository } from "./product.repository";
export { orderRepository } from "./booking.repository";
export { reviewRepository } from "./review.repository";
