/**
 * RipLimit Frontend Types
 * Epic: E028 - RipLimit Bidding Currency
 *
 * UI-optimized types for RipLimit operations.
 * These types are used by frontend components and services.
 */

/**
 * RipLimit balance for UI display
 */
export interface RipLimitBalanceFE {
  // Formatted values for display
  availableBalance: number;
  blockedBalance: number;
  totalBalance: number;
  formattedAvailable: string;
  formattedBlocked: string;
  formattedTotal: string;
  
  // INR equivalents
  availableBalanceINR: number;
  blockedBalanceINR: number;
  totalBalanceINR: number;
  formattedAvailableINR: string;
  formattedBlockedINR: string;
  formattedTotalINR: string;
  
  // Status flags
  hasUnpaidAuctions: boolean;
  unpaidAuctionCount: number;
  isBlocked: boolean;
  canBid: boolean;
  
  // Blocked bids
  blockedBids: RipLimitBlockedBidFE[];
}

/**
 * Blocked bid for UI display
 */
export interface RipLimitBlockedBidFE {
  auctionId: string;
  bidId: string;
  amount: number;
  formattedAmount: string;
  bidAmountINR: number;
  formattedBidAmountINR: string;
}

/**
 * Transaction for UI display
 */
export interface RipLimitTransactionFE {
  id: string;
  type: string;
  typeLabel: string;
  amount: number;
  formattedAmount: string;
  isCredit: boolean;
  inrAmount: number;
  formattedINRAmount: string;
  balanceAfter: number;
  formattedBalanceAfter: string;
  description: string;
  auctionId?: string;
  orderId?: string;
  status: string;
  statusLabel: string;
  createdAt: Date;
  formattedDate: string;
  timeAgo: string;
}

/**
 * Transaction history response for UI
 */
export interface RipLimitTransactionHistoryFE {
  transactions: RipLimitTransactionFE[];
  total: number;
  hasMore: boolean;
}

/**
 * Purchase form data
 */
export interface RipLimitPurchaseFormFE {
  ripLimitAmount: number;
  inrAmount: number;
}

/**
 * Purchase response for UI
 */
export interface RipLimitPurchaseResponseFE {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  ripLimitAmount: number;
  formattedAmount: string;
}

/**
 * Purchase verification response for UI
 */
export interface RipLimitPurchaseVerifyResponseFE {
  success: boolean;
  newBalance: number;
  formattedNewBalance: string;
  purchasedAmount: number;
  formattedPurchasedAmount: string;
  message: string;
}

/**
 * Transaction type labels for UI
 */
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  PURCHASE: "Purchase",
  ADJUSTMENT: "Admin Adjustment",
  BID_BLOCK: "Bid Placed",
  BID_RELEASE: "Bid Released",
  AUCTION_PAYMENT: "Auction Payment",
  REFUND: "Refund",
  BONUS: "Bonus",
  PROMOTIONAL: "Promotional",
};

/**
 * Transaction status labels for UI
 */
export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REVERSED: "Reversed",
};
