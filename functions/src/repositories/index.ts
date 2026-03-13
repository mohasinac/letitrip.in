/**
 * Repositories barrel — Firebase Functions
 *
 * Every job and trigger imports from here, never from individual repository
 * files directly. Follows RULE 2 (barrel imports only).
 */
export { productRepository } from "./product.repository";
export type { AuctionProductRow } from "./product.repository";

export { bidRepository } from "./bid.repository";
export type { BidRow } from "./bid.repository";

export { orderRepository } from "./order.repository";
export type { OrderRow, CreateOrderFromAuctionInput } from "./order.repository";

export { sessionRepository } from "./session.repository";

export { tokenRepository } from "./token.repository";

export { couponRepository } from "./coupon.repository";

export { cartRepository } from "./cart.repository";

export { payoutRepository } from "./payout.repository";
export type { PayoutRow } from "./payout.repository";

export { notificationRepository } from "./notification.repository";
export type { CreateNotificationInput } from "./notification.repository";

export { reviewRepository } from "./review.repository";
export type { ReviewRatingAggregate } from "./review.repository";

export { userRepository } from "./user.repository";
export type { SellerPayoutDetails, UserRC } from "./user.repository";

export { categoryRepository } from "./category.repository";
export type { CategoryRow } from "./category.repository";

export { storeRepository } from "./store.repository";

export { offerRepository } from "./offer.repository";
export type { OfferRow } from "./offer.repository";

export { rcRepository } from "./rc.repository";
export type { CreateRCTransactionInput } from "./rc.repository";
