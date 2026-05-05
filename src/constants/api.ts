/**
 * API Route Constants
 *
 * Centralized API endpoint strings for all client-side fetch calls.
 * Prevents scattering of raw "/api/..." strings across components.
 */

export const API_ROUTES = {
  AUTH: {
    LOGOUT: "/api/auth/logout",
  },
  NEWSLETTER: {
    SUBSCRIBE: "/api/newsletter/subscribe",
  },
  DEMO: {
    SEED: "/api/demo/seed",
  },
  ADS: {
    BY_SLOT: (slotId: string) => `/api/ads?slot=${encodeURIComponent(slotId)}`,
  },
  BRANDS: {
    LIST: "/api/brands",
    BY_ID: (id: string) => `/api/brands/${id}`,
  },
  EVENTS: {
    LIST: "/api/events",
    BY_ID: (id: string) => `/api/events/${id}`,
    ENTRIES: (id: string) => `/api/events/${id}/entries`,
    LEADERBOARD: (id: string, limit?: number) =>
      `/api/events/${id}/leaderboard${limit !== undefined ? `?limit=${limit}` : ""}`,
  },
  ADMIN: {
    USERS: "/api/admin/users",
    USER_BY_ID: (uid: string) => `/api/admin/users/${uid}`,
    STORES: "/api/admin/stores",
    STORE_BY_ID: (uid: string) => `/api/admin/stores/${uid}`,
    BRANDS: "/api/admin/brands",
    BRAND_BY_ID: (id: string) => `/api/admin/brands/${id}`,
    ORDERS: "/api/admin/orders",
    ORDER_BY_ID: (id: string) => `/api/admin/orders/${id}`,
    ORDER_REFUND: (id: string) => `/api/admin/orders/${id}/refund`,
    PRODUCTS: "/api/admin/products",
    PRODUCT_BY_ID: (id: string) => `/api/admin/products/${id}`,
    CATEGORIES: "/api/admin/categories",
    CATEGORY_BY_ID: (id: string) => `/api/admin/categories/${id}`,
    BLOG: "/api/admin/blog",
    BLOG_BY_ID: (id: string) => `/api/admin/blog/${id}`,
    FAQS: "/api/admin/faqs",
    FAQ_BY_ID: (id: string) => `/api/admin/faqs/${id}`,
    REVIEWS: "/api/admin/reviews",
    REVIEW_BY_ID: (id: string) => `/api/admin/reviews/${id}`,
    BIDS: "/api/admin/bids",
    BID_BY_ID: (id: string) => `/api/admin/bids/${id}`,
    COUPONS: "/api/admin/coupons",
    COUPON_BY_ID: (id: string) => `/api/admin/coupons/${id}`,
    CAROUSEL: "/api/admin/carousel",
    CAROUSEL_BY_ID: (id: string) => `/api/admin/carousel/${id}`,
    SECTIONS: "/api/admin/sections",
    SECTION_BY_ID: (id: string) => `/api/admin/sections/${id}`,
    ADS: "/api/admin/ads",
    AD_BY_ID: (id: string) => `/api/admin/ads/${id}`,
    EVENTS: "/api/admin/events",
    EVENT_BY_ID: (id: string) => `/api/admin/events/${id}`,
    NEWSLETTER: "/api/admin/newsletter",
    NEWSLETTER_BY_ID: (id: string) => `/api/admin/newsletter/${id}`,
    CONTACT_SUBMISSIONS: "/api/admin/contact-submissions",
    CONTACT_SUBMISSION_BY_ID: (id: string) => `/api/admin/contact-submissions/${id}`,
    PAYOUTS: "/api/admin/payouts",
    PAYOUT_BY_ID: (id: string) => `/api/admin/payouts/${id}`,
    ANALYTICS: "/api/admin/analytics",
    DASHBOARD: "/api/admin/dashboard",
    SITE_SETTINGS: "/api/admin/site-settings",
  },
  STORE: {
    PRODUCTS: "/api/store/products",
    ORDERS: "/api/store/orders",
    ORDER_BY_ID: (id: string) => `/api/store/orders/${id}`,
    COUPONS: "/api/store/coupons",
    COUPON_BY_ID: (id: string) => `/api/store/coupons/${id}`,
    STOREFRONT: "/api/store/storefront",
    SHIPPING: "/api/store/shipping",
    PAYOUT_SETTINGS: "/api/store/payout-settings",
    ANALYTICS: "/api/store/analytics",
  },
  USER: {
    PROFILE: "/api/user/profile",
    ADDRESSES: "/api/user/addresses",
    ADDRESS_BY_ID: (id: string) => `/api/user/addresses/${id}`,
    ORDERS: "/api/user/orders",
    ORDER_BY_ID: (id: string) => `/api/user/orders/${id}`,
    WISHLIST: "/api/user/wishlist",
    WISHLIST_ITEM: (productId: string) => `/api/user/wishlist/${productId}`,
    NOTIFICATIONS: "/api/user/notifications",
    NOTIFICATION_BY_ID: (id: string) => `/api/user/notifications/${id}`,
    NOTIFICATIONS_READ_ALL: "/api/user/notifications/read-all",
    CHANGE_PASSWORD: "/api/user/change-password",
    OFFERS: "/api/user/offers",
  },
} as const;
