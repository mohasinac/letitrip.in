/**
 * Business Logic Constants
 *
 * Constants for business rules, fees, thresholds, and financial calculations.
 */

// ============================================================================
// PAYOUT & FINANCIAL SETTINGS
// ============================================================================

export const PAYOUT_SETTINGS = {
  // Minimum payout amount threshold
  MIN_PAYOUT_AMOUNT: 500, // ₹500 minimum

  // Payout frequency
  PAYOUT_CYCLE_DAYS: 7, // Weekly payouts

  // Settlement period (how long before funds are available)
  SETTLEMENT_DAYS: 2, // T+2 settlement

  // Maximum payout request per day
  MAX_DAILY_PAYOUT_REQUESTS: 5,

  // Payout method fees
  BANK_TRANSFER_FEE_PERCENTAGE: 0.5, // 0.5% for bank transfers
  UPI_TRANSFER_FEE_PERCENTAGE: 0, // Free for UPI
  WALLET_TRANSFER_FEE_PERCENTAGE: 0, // Free to wallet

  // Minimum and maximum commission rates (percentage)
  MIN_COMMISSION_RATE: 5, // 5%
  MAX_COMMISSION_RATE: 30, // 30%
  DEFAULT_COMMISSION_RATE: 15, // 15% default
} as const;

// ============================================================================
// SHIPPING & FULFILLMENT
// ============================================================================

export const SHIPPING_SETTINGS = {
  // Free shipping threshold
  FREE_SHIPPING_THRESHOLD: 5000, // ₹5000+

  // Default shipping cost below threshold
  DEFAULT_SHIPPING_COST: 100, // ₹100

  // Shipping fee for returns
  RETURN_SHIPPING_FEE_MIN: 2000, // ₹2000 minimum deduction
  RETURN_SHIPPING_FEE_MAX: 5000, // ₹5000 maximum deduction

  // Shipping time limits (days)
  STANDARD_SHIPPING_DAYS: 5,
  EXPRESS_SHIPPING_DAYS: 2,
  OVERNIGHT_SHIPPING_DAYS: 1,

  // Packing and processing time
  PROCESSING_TIME_HOURS: 24,

  // Domestic vs International
  INTERNATIONAL_SHIPPING_SURCHARGE_PERCENTAGE: 25, // 25% additional
} as const;

// ============================================================================
// AUCTION FEES & PRICING
// ============================================================================

export const AUCTION_FEES = {
  // Listing fees
  LISTING_FEE_BASE: 0, // Free listings
  FEATURED_LISTING_FEE: 100, // ₹100 for featured

  // Seller commission (percentage of sale price)
  BASE_COMMISSION_PERCENTAGE: 15, // 15% standard
  PREMIUM_SELLER_COMMISSION_PERCENTAGE: 10, // 10% for premium sellers

  // Payment processing fees
  PAYMENT_GATEWAY_FEE_PERCENTAGE: 2.5, // 2.5% for payment processing

  // Cancellation fees
  CANCELLATION_FEE_BUYER: 0, // Free for buyers
  CANCELLATION_FEE_SELLER: 0, // Free if within grace period
  CANCELLATION_GRACE_PERIOD_HOURS: 2,

  // Refund processing
  REFUND_PROCESSING_DAYS: 5, // 5 days to process refund
} as const;

// ============================================================================
// ORDER & TRANSACTION LIMITS
// ============================================================================

export const ORDER_LIMITS = {
  // Order value limits
  MIN_ORDER_VALUE: 1, // ₹1 minimum
  MAX_ORDER_VALUE: 999999999, // ₹99.99 Crores maximum

  // Bulk order limits
  MIN_BULK_QUANTITY: 10,
  MAX_BULK_QUANTITY: 10000,

  // Daily order limits per user
  MAX_ORDERS_PER_DAY: 100,

  // Fraud detection thresholds
  SUSPICIOUS_ORDER_VALUE_THRESHOLD: 100000, // ₹1,00,000+
  SUSPICIOUS_QUANTITY_THRESHOLD: 1000,
} as const;

// ============================================================================
// WALLET & CREDIT SYSTEM
// ============================================================================

export const WALLET_SETTINGS = {
  // Wallet credit limits
  MIN_TOPUP_AMOUNT: 100, // ₹100 minimum
  MAX_TOPUP_AMOUNT: 100000, // ₹1,00,000 maximum

  // Credit validity
  CREDIT_VALIDITY_DAYS: 365, // 1 year validity

  // Cashback and rewards
  CASHBACK_PERCENTAGE: 2, // 2% cashback on purchases
  REFERRAL_BONUS: 500, // ₹500 referral bonus

  // Wallet transaction limits
  MAX_DAILY_TOPUP: 500000, // ₹5,00,000 per day
} as const;

// ============================================================================
// PRODUCT INVENTORY
// ============================================================================

export const INVENTORY_SETTINGS = {
  // Low stock warning threshold
  LOW_STOCK_THRESHOLD: 5, // Alert when stock < 5

  // Out of stock behavior
  OUT_OF_STOCK_HOLD_DAYS: 7, // Hold order for 7 days

  // Inventory reservation
  RESERVATION_TIME_MINUTES: 15, // Reserve for 15 minutes

  // Restock alerts
  RESTOCK_ALERT_THRESHOLD: 2, // Alert when stock <= 2

  // Maximum quantity limits (cart and orders)
  MAX_QUANTITY_PER_CART_ITEM: 100, // Max 100 units per item in cart
  MAX_QUANTITY_PER_ORDER: 1000, // Max 1000 units per order
} as const;

// ============================================================================
// ACCOUNT RESTRICTIONS & LIMITS
// ============================================================================

export const ACCOUNT_LIMITS = {
  // Seller account limits
  MIN_SELLER_RATING_REQUIRED: 3.5, // 3.5+ stars required
  MIN_DELIVERY_PERCENTAGE: 95, // 95% on-time delivery required

  // Account suspension
  FAILURE_RATE_THRESHOLD: 10, // 10% failure rate triggers review
  NEGATIVE_FEEDBACK_LIMIT: 5, // 5+ critical issues

  // Buyer account limits
  MAX_RETURN_REQUESTS_PER_MONTH: 5,
  MAX_DISPUTES_PER_MONTH: 3,

  // Document expiry
  SELLER_VERIFICATION_VALIDITY_DAYS: 365, // Annual verification
  BUYER_VERIFICATION_VALIDITY_DAYS: 730, // 2 years
} as const;

// ============================================================================
// DISCOUNT & PROMOTION
// ============================================================================

export const PROMOTION_LIMITS = {
  // Discount limits
  MIN_DISCOUNT_PERCENTAGE: 5, // 5% minimum
  MAX_DISCOUNT_PERCENTAGE: 90, // 90% maximum

  // Coupon limits
  MAX_COUPON_USES_GLOBAL: 1000,
  MAX_COUPON_USES_PER_USER: 1,

  // Flash sale limits
  FLASH_SALE_MIN_DURATION_HOURS: 1,
  FLASH_SALE_MAX_DURATION_HOURS: 48,

  // Promotion validity
  MIN_PROMO_VALIDITY_DAYS: 1,
  MAX_PROMO_VALIDITY_DAYS: 90,
} as const;

// ============================================================================
// REVIEW & RATING
// ============================================================================

export const REVIEW_SETTINGS = {
  // Review requirements
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 2000,

  // Rating scale
  MIN_RATING: 1,
  MAX_RATING: 5,

  // Review visibility
  REVIEW_MODERATION_DAYS: 3, // Manual review within 3 days

  // Helpful rating
  MIN_HELPFUL_VOTES: 0,

  // Incentives
  HELPFUL_REVIEW_BONUS_POINTS: 10,
} as const;

// ============================================================================
// REPORTING & COMPLIANCE
// ============================================================================

export const COMPLIANCE_LIMITS = {
  // Report handling
  REPORT_RESPONSE_DAYS: 5, // Respond within 5 days
  REPORT_RESOLUTION_DAYS: 15, // Resolve within 15 days

  // Content violation penalties
  FIRST_VIOLATION_PENALTY_DAYS: 3, // 3 day suspension
  SECOND_VIOLATION_PENALTY_DAYS: 7, // 7 day suspension
  THIRD_VIOLATION_PENALTY_DAYS: 30, // 30 day suspension

  // Account ban thresholds
  BAN_THRESHOLD_VIOLATIONS: 5, // 5 violations = permanent ban
} as const;

// ============================================================================
// TAX & LEGAL
// ============================================================================

export const TAX_SETTINGS = {
  // GST/VAT rates
  GST_RATE_STANDARD: 18, // 18% for most products
  GST_RATE_REDUCED: 5, // 5% for certain items
  GST_RATE_EXEMPT: 0, // 0% for exempt items

  // TDS threshold (Tax Deducted at Source)
  TDS_THRESHOLD_AMOUNT: 50000, // Applicable for amounts > ₹50,000
  TDS_PERCENTAGE: 10, // 10% TDS

  // Invoice requirements
  MIN_AMOUNT_FOR_INVOICE: 1, // Issue invoice for all transactions
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate commission amount based on sale price
 * @param salePrice The sale price
 * @param rate Commission rate (default: BASE_COMMISSION_PERCENTAGE)
 * @returns Commission amount
 */
export function calculateCommission(
  salePrice: number,
  rate: number = AUCTION_FEES.BASE_COMMISSION_PERCENTAGE
): number {
  return Math.round((salePrice * rate) / 100);
}

/**
 * Calculate payout after deductions
 * @param salePrice The sale price
 * @param commissionRate Commission rate percentage
 * @param paymentFee Payment processing fee percentage
 * @returns Net payout amount
 */
export function calculateNetPayout(
  salePrice: number,
  commissionRate: number = AUCTION_FEES.BASE_COMMISSION_PERCENTAGE,
  paymentFee: number = AUCTION_FEES.PAYMENT_GATEWAY_FEE_PERCENTAGE
): number {
  const commission = calculateCommission(salePrice, commissionRate);
  const fee = Math.round((salePrice * paymentFee) / 100);
  return salePrice - commission - fee;
}

/**
 * Check if order is eligible for free shipping
 * @param orderTotal Order total amount
 * @returns True if eligible for free shipping
 */
export function isEligibleForFreeShipping(orderTotal: number): boolean {
  return orderTotal >= SHIPPING_SETTINGS.FREE_SHIPPING_THRESHOLD;
}

/**
 * Calculate shipping cost
 * @param orderTotal Order total amount
 * @returns Shipping cost
 */
export function calculateShippingCost(orderTotal: number): number {
  return isEligibleForFreeShipping(orderTotal)
    ? 0
    : SHIPPING_SETTINGS.DEFAULT_SHIPPING_COST;
}
