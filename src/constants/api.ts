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

import { API_ENDPOINTS } from "@mohasinac/appkit";

// letitrip-only admin features missing from appkit's ADMIN_ENDPOINTS.
const ADMIN_LETITRIP = {
  ...API_ENDPOINTS.ADMIN,
  SITE_SETTINGS: "/api/admin/site-settings",
  MODERATION_QUEUE: "/api/admin/moderation",
  MODERATION_BY_ID: (id: string) => `/api/admin/moderation/${id}`,
  REPORTS: "/api/admin/reports",
  REPORT_BY_ID: (id: string) => `/api/admin/reports/${id}`,
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
  WHATSAPP_SETTINGS: API_ENDPOINTS.WHATSAPP_SELLER.SETTINGS,
  WHATSAPP_CATALOG_SYNC: API_ENDPOINTS.WHATSAPP_SELLER.CATALOG_SYNC,
  WHATSAPP_CATALOG_IMPORT: API_ENDPOINTS.WHATSAPP_SELLER.CATALOG_IMPORT,
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
  ORDERS_BULK_LOCATION: API_ENDPOINTS.SELLER.ORDERS_BULK_LOCATION,
  TEMPLATES: API_ENDPOINTS.SELLER.TEMPLATES,
  TEMPLATE_BY_ID: API_ENDPOINTS.SELLER.TEMPLATE_BY_ID,
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
} as const;

// Legacy USER namespace. Maps to appkit ACCOUNT_ENDPOINTS where keys overlap.
const USER_LETITRIP = {
  PROFILE: API_ENDPOINTS.ACCOUNT.PROFILE,
  ADDRESSES: API_ENDPOINTS.ACCOUNT.ADDRESSES,
  ADDRESS_BY_ID: API_ENDPOINTS.ACCOUNT.ADDRESS_BY_ID,
  ORDERS: API_ENDPOINTS.ACCOUNT.ORDERS,
  ORDER_BY_ID: API_ENDPOINTS.ACCOUNT.ORDER_BY_ID,
  WISHLIST: API_ENDPOINTS.ACCOUNT.WISHLIST,
  WISHLIST_ITEM: (productId: string) => `/api/user/wishlist/${productId}`,
  NOTIFICATIONS: "/api/user/notifications",
  NOTIFICATION_BY_ID: (id: string) => `/api/user/notifications/${id}`,
  NOTIFICATIONS_READ_ALL: "/api/user/notifications/read-all",
  NOTIFICATION_PREFERENCES: "/api/user/notification-preferences",
  CHANGE_PASSWORD: API_ENDPOINTS.ACCOUNT.CHANGE_PASSWORD,
  OFFERS: "/api/user/offers",
  EVENTS: "/api/user/events",
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGOUT: API_ENDPOINTS.AUTH.LOGOUT,
  },
  NEWSLETTER: {
    SUBSCRIBE: API_ENDPOINTS.HOMEPAGE.NEWSLETTER_SUBSCRIBE,
  },
  DEMO: API_ENDPOINTS.DEMO,
  ADS: {
    BY_SLOT: (slotId: string) => `/api/ads?slot=${encodeURIComponent(slotId)}`,
  },
  AUCTIONS: {
    BUY_NOW: (id: string) => `/api/auctions/${id}/buy-now`,
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
  },
  USER: USER_LETITRIP,
} as const;
