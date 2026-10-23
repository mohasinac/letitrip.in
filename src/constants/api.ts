/**
 * API Route Constants — backward-compat layer over `@mohasinac/appkit` `API_ENDPOINTS`.
 *
 * Consolidated 2026-05-23 (W1-10): every duplicated endpoint definition from the
 * previous standalone copy now derives from `API_ENDPOINTS.*`. Only letitrip-specific
 * routes that are not yet (or never will be) exposed through appkit remain inlined
 * below. The exported `API_ROUTES` shape is preserved verbatim so existing consumers
 * — `API_ROUTES.STORE.*`, `API_ROUTES.USER.*`, `API_ROUTES.ADMIN.*` — keep working
 * without churn while the canonical source-of-truth moves to appkit.
 *
 * New code should import `API_ENDPOINTS` directly from `@mohasinac/appkit` instead
 * of going through this shim.
 */

import { API_ENDPOINTS } from "@mohasinac/appkit/constants";

// letitrip-only admin features missing from appkit's ADMIN_ENDPOINTS.
const ADMIN_LETITRIP = {
  ...API_ENDPOINTS.ADMIN,
  SITE_SETTINGS: "/api/admin/site-settings",
  MODERATION_QUEUE: "/api/admin/moderation",
  MODERATION_BY_ID: (id: string) => `/api/admin/moderation/${id}`,
  REPORTS: "/api/admin/reports",
  REPORT_BY_ID: (id: string) => `/api/admin/reports/${id}`,
  /*
   * Payment protection. `payment-cases` and `protection-claims` are NOT under
   * `maintenance/` — a case can carry the gateway's own `respond_by`, which is
   * the wrong urgency for a page named Maintenance.
   */
  /*
   * Staff curation of the buyer's dispute-reason picker.
   *
   * 🛑 A SECOND route beside the public `/api/dispute-reasons`, not a widening
   * of it. That one requires `kind` and returns only active rows, and its own
   * comment explains why: a buyer reporting a damaged item must never be
   * offered "it never arrived", because that reason belongs to the other gate.
   * A management list needs every kind and the retired rows too.
   */
  PRICING: "/api/admin/pricing",
  DISPUTE_REASONS: "/api/admin/dispute-reasons",
  DISPUTE_REASON_BY_ID: (id: string) => `/api/admin/dispute-reasons/${id}`,
  PAYMENT_CASES: "/api/admin/payment-cases",
  PAYMENT_CASE_BY_ID: (id: string) => `/api/admin/payment-cases/${id}`,
  PROTECTION_CLAIMS: "/api/admin/protection-claims",
  PROTECTION_CLAIM_BY_ID: (id: string) => `/api/admin/protection-claims/${id}`,
  /*
   * Diagnostics, under `maintenance/` — no external clock, so
   * `maintenance_employee` holds these permissions where it deliberately does
   * not hold the payment-case ones.
   */
  MAINTENANCE_GATEWAY_EVENTS: "/api/admin/maintenance/gateway-events",
  MAINTENANCE_OBLIGATIONS: "/api/admin/maintenance/obligations",
  ITEM_REQUESTS: "/api/admin/item-requests",
  ITEM_REQUEST_BY_ID: (id: string) => `/api/admin/item-requests/${id}`,
  ADMIN_ANALYTICS_CARDS: "/api/admin/analytics/cards",
  ADMIN_ANALYTICS_CARD_BY_ID: (id: string) => `/api/admin/analytics/cards/${id}`,
  ADMIN_ANALYTICS_ALERTS: "/api/admin/analytics/alerts",
  ADMIN_ANALYTICS_ALERT_BY_ID: (id: string) => `/api/admin/analytics/alerts/${id}`,
  ROLES: "/api/admin/roles",
  ROLE_BY_ID: (id: string) => `/api/admin/roles/${id}`,
  // Note: distinct from appkit's ADMIN.ADMIN_NOTIFICATIONS ("/api/admin/notifications")
  // — these are two different admin notification surfaces.
  ADMIN_NOTIFICATIONS: "/api/admin/admin-notifications",
} as const;

// Legacy STORE namespace. Maps to appkit SELLER_ENDPOINTS where keys overlap, plus
// the letitrip-only seller-scoped routes that aren't in appkit yet.
const STORE_LETITRIP = {
  PRODUCTS: API_ENDPOINTS.SELLER.PRODUCTS,
  ORDERS: API_ENDPOINTS.SELLER.ORDERS,
  ORDER_BY_ID: API_ENDPOINTS.SELLER.ORDERS_BY_ID,
  COUPONS: API_ENDPOINTS.SELLER.COUPONS,
  COUPON_BY_ID: API_ENDPOINTS.SELLER.COUPON_BY_ID,
  STOREFRONT: API_ENDPOINTS.SELLER.STORE,
  SHIPPING: "/api/store/shipping",
  PAYOUT_SETTINGS: API_ENDPOINTS.SELLER.PAYOUT_SETTINGS,
  ANALYTICS: "/api/store/analytics",
  REVIEWS: "/api/store/reviews",
  REVIEW_REPLY: (id: string) => `/api/store/reviews/${id}/reply`,
  PAYOUTS: API_ENDPOINTS.SELLER.PAYOUTS,
  PAYOUTS_REQUEST: "/api/store/payouts/request",
  ADDRESSES: API_ENDPOINTS.SELLER.STORE_ADDRESSES,
  ADDRESS_BY_ID: API_ENDPOINTS.SELLER.STORE_ADDRESS_BY_ID,
  BIDS: API_ENDPOINTS.SELLER.BIDS,
  SUBLISTING_CATEGORIES: "/api/store/sublisting-categories",
  SUBLISTING_CATEGORY_BY_ID: (id: string) => `/api/store/sublisting-categories/${id}`,
  PRODUCT_GROUP: (id: string) => `/api/store/products/${id}/group`,
  PRODUCT_GROUP_CHILDREN: (id: string) => `/api/store/products/${id}/group/children`,
  PRODUCT_GROUP_CHILD: (id: string, childId: string) =>
    `/api/store/products/${id}/group/children/${childId}`,
  // SB-UNI-N digital-code pool management
  PRODUCT_CODES: (id: string) => `/api/store/products/${id}/codes`,
  PRODUCTS_BULK_LOCATION: API_ENDPOINTS.SELLER.PRODUCTS_BULK_LOCATION,
  PRODUCTS_BULK_STOCK: API_ENDPOINTS.SELLER.PRODUCTS_BULK_STOCK,
  ORDERS_BULK_LOCATION: API_ENDPOINTS.SELLER.ORDERS_BULK_LOCATION,
  PROFILE: "/api/store/profile",
  SLUG_CHECK: (slug: string) => `/api/store/slug/check?slug=${encodeURIComponent(slug)}`,
  // S-STORE Tier extensions
  PAYOUT_METHODS: API_ENDPOINTS.SELLER.PAYOUT_METHODS,
  PAYOUT_METHOD_BY_ID: API_ENDPOINTS.SELLER.PAYOUT_METHOD_BY_ID,
  SHIPPING_CONFIGS: API_ENDPOINTS.SELLER.SHIPPING_CONFIGS,
  SHIPPING_CONFIG_BY_ID: API_ENDPOINTS.SELLER.SHIPPING_CONFIG_BY_ID,
  ANALYTICS_CARDS: "/api/store/analytics/cards",
  ANALYTICS_CARD_BY_ID: (id: string) => `/api/store/analytics/cards/${id}`,
  ANALYTICS_ALERTS: API_ENDPOINTS.SELLER.ANALYTICS_ALERTS,
  ANALYTICS_ALERT_BY_ID: API_ENDPOINTS.SELLER.ANALYTICS_ALERT_BY_ID,
  STORE_CATEGORIES: API_ENDPOINTS.SELLER.STORE_CATEGORIES,
  STORE_CATEGORY_BY_ID: API_ENDPOINTS.SELLER.STORE_CATEGORY_BY_ID,
  LISTING_TEMPLATES: "/api/store/listing-templates",
  LISTING_TEMPLATE_BY_ID: (id: string) => `/api/store/listing-templates/${id}`,
  GROUPED_LISTINGS: API_ENDPOINTS.SELLER.GROUPED_LISTINGS,
  GROUPED_LISTING_BY_ID: API_ENDPOINTS.SELLER.GROUPED_LISTING_BY_ID,
  GOOGLE_REVIEWS: API_ENDPOINTS.SELLER.GOOGLE_REVIEWS,
  GOOGLE_REVIEWS_SYNC: API_ENDPOINTS.SELLER.GOOGLE_REVIEWS_SYNC,
  PRODUCTS_SCAN: API_ENDPOINTS.SELLER.PRODUCTS_SCAN,
  FULFILLMENT: API_ENDPOINTS.SELLER.ORDERS_FULFILLMENT,
  ORDER_ASSIGN: API_ENDPOINTS.SELLER.ORDERS_ASSIGN,
} as const;

// Legacy USER namespace. Maps to appkit ACCOUNT_ENDPOINTS where keys overlap.
const USER_LETITRIP = {
  PROFILE: API_ENDPOINTS.ACCOUNT.PROFILE,
  ADDRESSES: API_ENDPOINTS.ACCOUNT.ADDRESSES,
  ADDRESS_BY_ID: API_ENDPOINTS.ACCOUNT.ADDRESS_BY_ID,
  ORDERS: API_ENDPOINTS.ACCOUNT.ORDERS,
  ORDER_BY_ID: API_ENDPOINTS.ACCOUNT.ORDER_BY_ID,
  /** Buyer submits payment for one EMI instalment. Distinct from the
   *  seller's PATCH /api/store/orders/[id]/emi-installment, which confirms it. */
  ORDER_EMI_INSTALLMENT: (id: string) => `/api/user/orders/${id}/emi-installment`,
  /*
   * Rate the lines, then close the order — one endpoint for the whole flow,
   * discriminated in the body. `complete` carries no fields at all, so its own
   * folder would be a handler whose entire job is to pass through the order id
   * the path already has.
   */
  ORDER_COMPLETION: (id: string) => `/api/user/orders/${id}/completion`,
  /** Protection claim — GET returns per-reason availability, POST files it. */
  ORDER_CLAIM: (id: string) => `/api/user/orders/${id}/claim`,
  WISHLIST: API_ENDPOINTS.ACCOUNT.WISHLIST,
  WISHLIST_ITEM: (productId: string) => `/api/user/wishlist/${productId}`,
  WISHLIST_ITEM_SYNC: API_ENDPOINTS.ACCOUNT.WISHLIST_ITEM_SYNC,
  WISHLIST_VALIDATE: API_ENDPOINTS.ACCOUNT.WISHLIST_VALIDATE,
  NOTIFICATIONS: "/api/user/notifications",
  NOTIFICATION_BY_ID: (id: string) => `/api/user/notifications/${id}`,
  /*
   * Both of these routes have been live with zero consumers — not even an
   * API_ROUTES entry — until the pages that read them were built.
   */
  SESSIONS: "/api/user/sessions",
  SESSION_BY_ID: (id: string) => `/api/user/sessions/${id}`,
  PAYMENT_METHODS: "/api/user/payment-methods",
  PAYMENT_METHOD_BY_ID: (id: string) => `/api/user/payment-methods/${id}`,
  NOTIFICATIONS_READ_ALL: "/api/user/notifications/read-all",
  NOTIFICATION_PREFERENCES: "/api/user/notification-preferences",
  OFFERS: "/api/user/offers",
  EVENTS: "/api/user/events",
  REVIEWS: API_ENDPOINTS.ACCOUNT.REVIEWS,
  BIDS: API_ENDPOINTS.ACCOUNT.BIDS,
  EXPORT: API_ENDPOINTS.ACCOUNT.EXPORT,
  COUPONS: API_ENDPOINTS.ACCOUNT.COUPONS,
  COUPON_BY_ID: API_ENDPOINTS.ACCOUNT.COUPON_BY_ID,
} as const;

export const API_ROUTES = {
  CONFIG: API_ENDPOINTS.CONFIG,
  CART: API_ENDPOINTS.CART,
  /** Courier options + rounded rates for a delivery pincode. */
  SHIPPING_QUOTE: "/api/shipping/quote",
  /** The signed-in buyer's points balance + ledger. */
  USER_POINTS: "/api/user/points",
  /**
   * Statutory grievance intake. Top-level rather than under USER because the
   * page that hosts it is PUBLIC (`/grievance`) — the endpoint requires a
   * session, the page does not.
   */
  GRIEVANCE: "/api/grievance",
  AUTH: {
    LOGOUT: API_ENDPOINTS.AUTH.LOGOUT,
  },
  NEWSLETTER: {
    SUBSCRIBE: API_ENDPOINTS.HOMEPAGE.NEWSLETTER_SUBSCRIBE,
  },
  ADS: {
    BY_SLOT: (slotId: string) => `/api/ads?slot=${encodeURIComponent(slotId)}`,
    /* D56 — the public rate card: price per placement, plus which months are free. */
    SLOTS: "/api/ads/slots",
    /* D56 — the advertiser's own bookings. POST books, GET lists mine. */
    BOOKINGS: "/api/ads/bookings",
    /* PATCH resubmits a creative (and returns it to review); DELETE cancels. */
    BOOKING: (id: string) => `/api/ads/bookings/${encodeURIComponent(id)}`,
  },
  TOOLS: {
    /*
     * The authenticity checker. Lives here rather than in appkit's
     * API_ENDPOINTS because this app is pinned to a published appkit and a new
     * endpoint there would not exist until the next publish — the same reason
     * `BRANDS` below is inlined.
     */
    AUTHENTICITY: "/api/tools/authenticity",
  },
  BRANDS: {
    LIST: "/api/brands",
    BY_ID: (id: string) => `/api/brands/${id}`,
  },
  EVENTS: API_ENDPOINTS.EVENTS,
  ADMIN: ADMIN_LETITRIP,
  SUBLISTING_CATEGORIES: {
    BY_SLUG: (slug: string) => `/api/sublisting-categories/${slug}`,
    LISTINGS: (slug: string) => `/api/sublisting-categories/${slug}/listings`,
  },
  STORE: STORE_LETITRIP,
  PRODUCTS: {
    GROUP: (groupId: string) => `/api/products/group/${groupId}`,
  },
  SCAMS: {
    REPORTS: "/api/scams/reports",
  },
  // letitrip-only public item-request feature — no appkit equivalent (precedent:
  // ADMIN_LETITRIP.ITEM_REQUESTS above is the admin-side counterpart, also consumer-only).
  ITEM_REQUESTS: {
    LIST: "/api/item-requests",
    BY_ID: (id: string) => `/api/item-requests/${id}`,
    REPLIES: (id: string) => `/api/item-requests/${id}/replies`,
  },
  // SB1-K — bundles + prize draws
  BUNDLES: {
    LIST: "/api/bundles",
    BY_ID: (id: string) => `/api/bundles/${id}`,
  },
  PRIZE_DRAWS: {
    LIST: "/api/prize-draws",
    BY_ID: (id: string) => `/api/prize-draws/${id}`,
    REVEAL: (id: string) => `/api/prize-draws/${id}/reveal`,
  },
  ORDERS: {
    // SB-UNI-N — reveal a digital code for a confirmed order
    CODE: (id: string) => `/api/orders/${id}/code`,
    // Tier PP — raise a dispute on an auto-approved order
    DISPUTE: (id: string) => `/api/orders/${id}/dispute`,
  },
  /*
   * The buyer's dispute-reason picker, and the staff create.
   *
   * 🛑 NOT order-scoped, which is why it is not under `ORDERS` — the list is
   * global and the form queries it by `kind`. `RaiseDisputeForm` takes this as
   * a `reasonsEndpoint` PROP rather than importing it, because appkit holds no
   * consumer routes; this constant is the one place the path is written.
   */
  DISPUTE_REASONS: "/api/dispute-reasons",
  LOTTERY: {
    PULL: (id: string) => `/api/events/${id}/lottery-pull`,
    ENTRIES: (id: string) => `/api/events/${id}/lottery-entries`,
    PRODUCT_PULL: (id: string) => `/api/products/${id}/lottery-pull`,
    PRODUCT_ENTRIES: (id: string) => `/api/products/${id}/lottery-entries`,
    FLAG_ENTRY: (entryId: string) => `/api/lottery-entries/${entryId}/flag`,
    REOPEN_SLOT: (entryId: string) => `/api/lottery-entries/${entryId}/reopen-slot`,
  },
  USER: USER_LETITRIP,
} as const;
