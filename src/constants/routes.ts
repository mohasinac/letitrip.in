/**
 * Application Routes Constants
 *
 * Centralized route paths for consistency across the application
 */

export const ROUTES = {
  // Public Routes
  HOME: "/",

  PUBLIC: {
    FAQS: "/faqs",
    FAQ_CATEGORY: (category: string) => `/faqs/${category}`,
    PROFILE: (userId: string) => `/profile/${userId}`,
    PRODUCTS: "/products",
    /** Canonical product detail URL — pass `product.slug ?? product.id` */
    PRODUCT_DETAIL: (slugOrId: string) => `/products/${slugOrId}`,
    AUCTIONS: "/auctions",
    AUCTION_DETAIL: (id: string) => `/auctions/${id}`,
    PRE_ORDERS: "/pre-orders",
    PRE_ORDER_DETAIL: (id: string) => `/pre-orders/${id}`,
    SELLERS: "/sellers",
    SELLER_DETAIL: (id: string) => `/sellers/${id}`,
    STORES: "/stores",
    STORE_DETAIL: (storeSlug: string) => `/stores/${storeSlug}`,
    STORE_PRODUCTS: (storeSlug: string) => `/stores/${storeSlug}/products`,
    STORE_AUCTIONS: (storeSlug: string) => `/stores/${storeSlug}/auctions`,
    STORE_REVIEWS: (storeSlug: string) => `/stores/${storeSlug}/reviews`,
    STORE_ABOUT: (storeSlug: string) => `/stores/${storeSlug}/about`,
    CATEGORIES: "/categories",
    SEARCH: "/search",
    PROMOTIONS: "/promotions",
    ABOUT: "/about",
    CONTACT: "/contact",
    BLOG: "/blog",
    HELP: "/help",
    TERMS: "/terms",
    PRIVACY: "/privacy",
    TRACK_ORDER: "/track",
    SELLER_GUIDE: "/seller-guide",
    COOKIE_POLICY: "/cookies",
    REFUND_POLICY: "/refund-policy",
    EVENTS: "/events",
    EVENT_DETAIL: (id: string) => `/events/${id}`,
    EVENT_PARTICIPATE: (id: string) => `/events/${id}/participate`,
    REVIEWS: "/reviews",
  },

  // Error Pages
  ERRORS: {
    UNAUTHORIZED: "/unauthorized",
  },

  // Auth Routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    OAUTH_LOADING: "/auth/oauth-loading",
  },

  // User Routes
  USER: {
    PROFILE: "/user/profile",
    SETTINGS: "/user/settings",
    ORDERS: "/user/orders",
    WISHLIST: "/user/wishlist",
    ADDRESSES: "/user/addresses",
    ADDRESSES_ADD: "/user/addresses/add",
    ADDRESSES_EDIT: (id: string) => `/user/addresses/edit/${id}`,
    ORDER_DETAIL: (id: string) => `/user/orders/view/${id}`,
    ORDER_TRACK: (id: string) => `/user/orders/${id}/track`,
    NOTIFICATIONS: "/user/notifications",
    RIPCOINS: "/user/ripcoins",
    RIPCOINS_PURCHASE: "/user/ripcoins/purchase",
    MESSAGES: "/user/messages",
    BECOME_SELLER: "/user/become-seller",
    CART: "/cart",
    CHECKOUT: "/checkout",
    CHECKOUT_SUCCESS: "/checkout/success",
  },

  // Seller Routes
  SELLER: {
    DASHBOARD: "/seller",
    PRODUCTS: "/seller/products",
    PRODUCTS_NEW: "/seller/products/new",
    PRODUCTS_EDIT: (id: string) => `/seller/products/${id}`,
    ORDERS: "/seller/orders",
    AUCTIONS: "/seller/auctions",
    PRE_ORDERS: "/seller/pre-orders",
    ANALYTICS: "/seller/analytics",
    PAYOUTS: "/seller/payouts",
    STORE: "/seller/store",
    SHIPPING: "/seller/shipping",
    PAYOUT_SETTINGS: "/seller/payout-settings",
    ADDRESSES: "/seller/addresses",
    ADDRESSES_ADD: "/seller/addresses/add",
    ADDRESSES_EDIT: (id: string) => `/seller/addresses/edit/${id}`,
  },

  // Admin Routes
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    SITE: "/admin/site",
    CAROUSEL: "/admin/carousel",
    SECTIONS: "/admin/sections",
    CATEGORIES: "/admin/categories",
    FAQS: "/admin/faqs",
    REVIEWS: "/admin/reviews",
    COUPONS: "/admin/coupons",
    MEDIA: "/admin/media",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    BIDS: "/admin/bids",
    PRE_ORDERS: "/admin/pre-orders",
    BLOG: "/admin/blog",
    ANALYTICS: "/admin/analytics",
    PAYOUTS: "/admin/payouts",
    NEWSLETTER: "/admin/newsletter",
    EVENTS: "/admin/events",
    EVENT_ENTRIES: (id: string) => `/admin/events/${id}/entries`,
    STORES: "/admin/stores",
    FEATURE_FLAGS: "/admin/feature-flags",
  },

  // Demo Routes (dev-only)
  DEMO: {
    SEED: "/demo/seed",
    ALGOLIA: "/demo/algolia",
  },

  // Blog Routes
  BLOG: {
    LIST: "/blog",
    ARTICLE: (slug: string) => `/blog/${slug}`,
  },
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.PUBLIC.FAQS,
  ROUTES.PUBLIC.PRODUCTS,
  ROUTES.PUBLIC.AUCTIONS,
  ROUTES.PUBLIC.PRE_ORDERS,
  ROUTES.PUBLIC.SELLERS,
  ROUTES.PUBLIC.STORES,
  ROUTES.PUBLIC.CATEGORIES,
  ROUTES.PUBLIC.SEARCH,
  ROUTES.PUBLIC.PROMOTIONS,
  ROUTES.PUBLIC.ABOUT,
  ROUTES.PUBLIC.CONTACT,
  ROUTES.PUBLIC.BLOG,
  ROUTES.PUBLIC.HELP,
  ROUTES.PUBLIC.TERMS,
  ROUTES.PUBLIC.PRIVACY,
  ROUTES.ERRORS.UNAUTHORIZED,
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_EMAIL,
] as const;

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTES.USER.PROFILE,
  ROUTES.USER.SETTINGS,
  ROUTES.USER.ORDERS,
  ROUTES.USER.WISHLIST,
  ROUTES.USER.ADDRESSES,
  ROUTES.USER.ADDRESSES_ADD,
  ROUTES.USER.NOTIFICATIONS,
  ROUTES.USER.CART,
] as const;

/**
 * Auth routes that should redirect to home if already authenticated
 */
export const AUTH_ROUTES = [ROUTES.AUTH.LOGIN, ROUTES.AUTH.REGISTER] as const;
