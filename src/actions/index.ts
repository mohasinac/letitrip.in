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
} from "./review.actions";

// Notification mutations
export {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "./notification.actions";
