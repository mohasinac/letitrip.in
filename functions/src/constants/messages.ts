/**
 * Message Constants — Firebase Functions
 *
 * All notification titles, message templates, and system strings used by
 * scheduled jobs and Firestore triggers. Follows RULE 3 (zero hardcoded
 * strings) for the functions package context.
 *
 * Templates are plain functions so TypeScript catches missing variables.
 */

// ---------------------------------------------------------------------------
// Auction notifications
// ---------------------------------------------------------------------------
export const AUCTION_MESSAGES = {
  WON_TITLE: "You won the auction! 🎉",
  WON_MESSAGE: (
    productTitle: string,
    currency: string,
    amount: number,
  ): string =>
    `Congratulations! You won "${productTitle}" with a bid of ${currency} ${amount}.`,

  LOST_TITLE: "Auction ended",
  LOST_MESSAGE: (productTitle: string): string =>
    `The auction for "${productTitle}" has ended. You were outbid.`,

  NO_BIDS_LOG: (productId: string): string =>
    `Auction ${productId} ended with no bids`,
};

// ---------------------------------------------------------------------------
// Bid notifications
// ---------------------------------------------------------------------------
export const BID_MESSAGES = {
  OUTBID_TITLE: "You've been outbid",
  OUTBID_MESSAGE: (
    productTitle: string,
    currency: string,
    currentBid: number,
  ): string =>
    `Someone placed a higher bid on "${productTitle}". Current bid: ${currency} ${currentBid}.`,
};

// ---------------------------------------------------------------------------
// Order notifications
// ---------------------------------------------------------------------------
export const ORDER_MESSAGES = {
  CANCELLED_TITLE: "Order cancelled",
  CANCELLED_TIMEOUT_MESSAGE: (productTitle: string, hours: number): string =>
    `Your order for "${productTitle}" was cancelled because payment was not received within ${hours} hours.`,

  CONFIRMED_TITLE: "Order confirmed ✅",
  CONFIRMED_MESSAGE: (productTitle: string): string =>
    `Your order for "${productTitle}" has been confirmed and is being prepared.`,

  SHIPPED_TITLE: "Your order has shipped 📦",
  SHIPPED_MESSAGE: (productTitle: string, trackingNumber?: string): string =>
    `Your order for "${productTitle}" is on its way!${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}`,

  DELIVERED_TITLE: "Order delivered 🎉",
  DELIVERED_MESSAGE: (productTitle: string): string =>
    `Your order for "${productTitle}" has been delivered. Enjoy!`,
};

// ---------------------------------------------------------------------------
// Email subjects (Resend)
// ---------------------------------------------------------------------------
export const EMAIL_SUBJECTS = {
  ORDER_CONFIRMED: (productTitle: string): string =>
    `Order confirmed — ${productTitle}`,
  ORDER_SHIPPED: (productTitle: string): string =>
    `Your order has shipped — ${productTitle}`,
  ORDER_DELIVERED: (productTitle: string): string =>
    `Order delivered — ${productTitle}`,
  ORDER_UPDATE_FALLBACK: (productTitle: string): string =>
    `Order update — ${productTitle}`,
};

// ---------------------------------------------------------------------------
// Error messages (thrown / logged)
// ---------------------------------------------------------------------------
export const FN_ERROR_MESSAGES = {
  RAZORPAY_CREDENTIALS_MISSING:
    "Razorpay credentials not configured — set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_ACCOUNT_NUMBER via Firebase Secrets",
  RAZORPAY_NO_FUND_ACCOUNT:
    "No valid fund account details for payout — upiId or bankAccount must be provided",
  RESEND_KEY_MISSING: "RESEND_API_KEY not configured — skipping email",
  RAZORPAY_API_ERROR: (status: number, body: string): string =>
    `Razorpay API error ${status}: ${body}`,
  RESEND_API_ERROR: (status: number, body: string): string =>
    `Resend API error ${status}: ${body}`,
};
