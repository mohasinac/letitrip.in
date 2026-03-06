/**
 * Services Barrel
 * Central export for ALL shared (Tier 1) service functions.
 *
 * Usage:
 *   import { productService } from '@/services';
 *   import { cartService, wishlistService } from '@/services';
 *
 * Rules:
 * - Services are PURE async functions — no React, no hooks, no state.
 * - Each function maps to exactly ONE apiClient call.
 * - Components must NEVER import from here directly — use hooks instead.
 * - Hooks pass service functions as queryFn / mutationFn to useApiQuery / useApiMutation.
 *
 * See Rule 19 and Rule 20 in .github/copilot-instructions.md for the full pattern.
 */

export * from "./auth.service";
export * from "./session.service";
export * from "./profile.service";
export * from "./address.service";
export * from "./order.service";
export * from "./product.service";
export * from "./carousel.service";
export * from "./review.service";
export * from "./category.service";
export * from "./faq.service";
export * from "./cart.service";
export * from "./wishlist.service";
export * from "./notification.service";
export * from "./site-settings.service";
export * from "./homepage-sections.service";
export * from "./search.service";
export * from "./checkout.service";
export * from "./event.service";
export * from "./admin.service";
export * from "./bid.service";
export * from "./contact.service";
export * from "./store.service";
export * from "./media.service";
export * from "./blog.service";
export * from "./seller.service";
export * from "./promotions.service";
export * from "./coupon.service";
export * from "./demo.service";
export * from "./newsletter.service";
export * from "./realtime-token.service";
export * from "./ripcoin.service";
export * from "./chat.service";
export * from "./auth-event.service";
export * from "./payment-event.service";
