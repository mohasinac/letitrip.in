/**
 * API Endpoints Constants
 * Use these constants in the API client for type-safe endpoint references
 */

export const API_ENDPOINTS = {
  // Authentication endpoints ✅ All routes exist
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    VERIFY_EMAIL: "/api/auth/verify-email",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    RESEND_VERIFICATION: "/api/auth/send-verification",
    /** POST to create, DELETE to destroy — same path, different method */
    CREATE_SESSION: "/api/auth/session",
    SESSION_ACTIVITY: "/api/auth/session/activity",
    SESSION_VALIDATE: "/api/auth/session/validate",
  },

  // User endpoints ✅ All routes exist
  USER: {
    /** GET profile or PATCH to update — same path, different method */
    PROFILE: "/api/user/profile",
    CHANGE_PASSWORD: "/api/user/change-password",
    SESSIONS: "/api/user/sessions",
    REVOKE_SESSION: (id: string) => `/api/user/sessions/${id}`,
    WISHLIST: {
      LIST: "/api/user/wishlist",
      ADD: "/api/user/wishlist",
      REMOVE: (productId: string) => `/api/user/wishlist/${productId}`,
      CHECK: (productId: string) => `/api/user/wishlist/${productId}`,
    },
    /** @deprecated Use top-level API_ENDPOINTS.ADDRESSES instead (identical paths) */
    ADDRESSES: {
      LIST: "/api/user/addresses",
      CREATE: "/api/user/addresses",
      GET_BY_ID: (id: string) => `/api/user/addresses/${id}`,
      UPDATE: (id: string) => `/api/user/addresses/${id}`,
      DELETE: (id: string) => `/api/user/addresses/${id}`,
      SET_DEFAULT: (id: string) => `/api/user/addresses/${id}/set-default`,
    },
  },

  // Profile endpoints ✅ All routes exist
  PROFILE: {
    GET_BY_ID: (userId: string) => `/api/profile/${userId}`,
    GET_SELLER_REVIEWS: (userId: string) => `/api/profile/${userId}/reviews`,
    GET_SELLER_PRODUCTS: (userId: string) =>
      `/api/products?filters=sellerId==${userId},status==published&sorts=-createdAt&pageSize=6`,
    GET_STOREFRONT_PRODUCTS: (userId: string) =>
      `/api/products?filters=sellerId==${userId},status==published&sorts=-createdAt&pageSize=12`,
    UPDATE: "/api/profile/update",
    ADD_PHONE: "/api/profile/add-phone",
    VERIFY_PHONE: "/api/profile/verify-phone",
    UPDATE_PASSWORD: "/api/profile/update-password",
    DELETE_ACCOUNT: "/api/profile/delete-account",
  },

  // Address endpoints ✅ Routes exist
  ADDRESSES: {
    LIST: "/api/user/addresses", // GET - List user addresses
    CREATE: "/api/user/addresses", // POST - Create new address
    GET_BY_ID: (id: string) => `/api/user/addresses/${id}`, // GET - Get single address
    UPDATE: (id: string) => `/api/user/addresses/${id}`, // PATCH - Update address
    DELETE: (id: string) => `/api/user/addresses/${id}`, // DELETE - Delete address
    SET_DEFAULT: (id: string) => `/api/user/addresses/${id}/set-default`, // POST - Set default address
  },

  // Order endpoints ✅ Routes exist
  ORDERS: {
    LIST: "/api/user/orders", // GET - List user orders
    GET_BY_ID: (id: string) => `/api/user/orders/${id}`, // GET - Get single order details
    TRACK: (id: string) => `/api/user/orders/${id}/track`, // GET - Track order
    CANCEL: (id: string) => `/api/user/orders/${id}/cancel`, // POST - Cancel order
  },

  // Admin endpoints ✅ All routes exist
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
    USERS: "/api/admin/users",
    USER_BY_ID: (uid: string) => `/api/admin/users/${uid}`,
    SESSIONS: "/api/admin/sessions",
    /** ❌ No route — needs /api/admin/sessions/[id]/route.ts */
    REVOKE_SESSION: (id: string) => `/api/admin/sessions/${id}`,
    /** ❌ No route — needs /api/admin/sessions/revoke-user/route.ts */
    REVOKE_USER_SESSIONS: "/api/admin/sessions/revoke-user",
    /** ✅ Admin products endpoints */
    PRODUCTS: "/api/admin/products",
    PRODUCT_BY_ID: (id: string) => `/api/admin/products/${id}`,
    /** ✅ Admin orders endpoints */
    ORDERS: "/api/admin/orders", // GET - List all orders
    ORDER_BY_ID: (id: string) => `/api/admin/orders/${id}`, // PATCH - Update order
    /** ✅ Admin coupons endpoints */
    COUPONS: "/api/admin/coupons", // GET/POST - List/create coupons
    COUPON_BY_ID: (id: string) => `/api/admin/coupons/${id}`, // GET/PATCH/DELETE
    /** ✅ Admin bids/auctions endpoints */
    BIDS: "/api/admin/bids", // GET - List all bids with filters
    BID_BY_ID: (id: string) => `/api/admin/bids/${id}`, // GET single bid
    /** Admin blog endpoints */
    BLOG: "/api/admin/blog", // GET/POST - List/create posts
    BLOG_BY_ID: (id: string) => `/api/admin/blog/${id}`, // GET/PATCH/DELETE
    /** ✅ Algolia sync endpoint */
    ALGOLIA_SYNC: "/api/admin/algolia/sync", // POST - Bulk sync products to Algolia
    /** ✅ Admin analytics */
    ANALYTICS: "/api/admin/analytics", // GET - Revenue + orders charts for admin
    /** ✅ Admin payouts */
    PAYOUTS: "/api/admin/payouts", // GET - List all payouts
    PAYOUT_BY_ID: (id: string) => `/api/admin/payouts/${id}`, // PATCH - Update payout status
  },

  // Product endpoints ✅ All routes exist
  PRODUCTS: {
    LIST: "/api/products", // GET - List products with filters
    CREATE: "/api/products", // POST - Create new product
    GET_BY_ID: (id: string) => `/api/products/${id}`, // GET - Get single product
    UPDATE: (id: string) => `/api/products/${id}`, // PATCH - Update product
    DELETE: (id: string) => `/api/products/${id}`, // DELETE - Delete product
  },

  // Category endpoints ✅ All routes exist
  CATEGORIES: {
    LIST: "/api/categories", // GET - Get category tree
    CREATE: "/api/categories", // POST - Create new category
    GET_BY_ID: (id: string) => `/api/categories/${id}`, // GET - Get single category
    UPDATE: (id: string) => `/api/categories/${id}`, // PATCH - Update category
    DELETE: (id: string) => `/api/categories/${id}`, // DELETE - Delete category
  },

  // Review endpoints ✅ All routes exist
  REVIEWS: {
    LIST: "/api/reviews", // GET - List reviews (requires productId param)
    CREATE: "/api/reviews", // POST - Create new review
    GET_BY_ID: (id: string) => `/api/reviews/${id}`, // GET - Get single review
    UPDATE: (id: string) => `/api/reviews/${id}`, // PATCH - Update review
    DELETE: (id: string) => `/api/reviews/${id}`, // DELETE - Delete review
    VOTE: (id: string) => `/api/reviews/${id}/vote`, // POST - Vote helpful/not helpful
  },

  // Site settings endpoints ✅ All routes exist
  SITE_SETTINGS: {
    GET: "/api/site-settings", // GET - Get global settings
    UPDATE: "/api/site-settings", // PATCH - Update settings (admin only)
  },

  // Carousel endpoints ✅ All routes exist
  CAROUSEL: {
    LIST: "/api/carousel", // GET - Get active carousel slides
    CREATE: "/api/carousel", // POST - Create new slide (admin only)
    GET_BY_ID: (id: string) => `/api/carousel/${id}`, // GET - Get single slide
    UPDATE: (id: string) => `/api/carousel/${id}`, // PATCH - Update slide (admin only)
    DELETE: (id: string) => `/api/carousel/${id}`, // DELETE - Delete slide (admin only)
    REORDER: "/api/carousel/reorder", // POST - Reorder slides (admin only)
  },

  // Homepage sections endpoints ✅ All routes exist
  HOMEPAGE_SECTIONS: {
    LIST: "/api/homepage-sections", // GET - Get active sections
    CREATE: "/api/homepage-sections", // POST - Create section (admin only)
    GET_BY_ID: (id: string) => `/api/homepage-sections/${id}`, // GET - Get single section
    UPDATE: (id: string) => `/api/homepage-sections/${id}`, // PATCH - Update section (admin only)
    DELETE: (id: string) => `/api/homepage-sections/${id}`, // DELETE - Delete section (admin only)
    REORDER: "/api/homepage-sections/reorder", // POST - Reorder sections (admin only)
  },

  // FAQ endpoints ✅ All routes exist
  FAQS: {
    LIST: "/api/faqs", // GET - List FAQs with filters
    CREATE: "/api/faqs", // POST - Create new FAQ (admin only)
    GET_BY_ID: (id: string) => `/api/faqs/${id}`, // GET - Get single FAQ
    UPDATE: (id: string) => `/api/faqs/${id}`, // PATCH - Update FAQ (admin only)
    DELETE: (id: string) => `/api/faqs/${id}`, // DELETE - Delete FAQ (admin only)
    VOTE: (id: string) => `/api/faqs/${id}/vote`, // POST - Vote helpful/not helpful
  },

  // Media endpoints ✅ All routes exist
  MEDIA: {
    UPLOAD: "/api/media/upload", // POST - Upload file to Cloud Storage
    CROP: "/api/media/crop", // POST - Crop image
    TRIM: "/api/media/trim", // POST - Trim video
  },

  // Logging endpoints ✅ Route exists
  LOGS: {
    WRITE: "/api/logs/write", // POST - Write log entry
  },

  // Newsletter endpoints ✅ Route exists
  NEWSLETTER: {
    SUBSCRIBE: "/api/newsletter/subscribe", // POST - Subscribe to newsletter
  },

  // Demo/Development endpoints (dev-only)
  DEMO: {
    SEED: "/api/demo/seed", // POST - Seed database with test data
  },

  // Cart endpoints
  CART: {
    GET: "/api/cart", // GET - Get user's cart (auth required)
    ADD_ITEM: "/api/cart", // POST - Add item to cart (auth required)
    UPDATE_ITEM: (itemId: string) => `/api/cart/${itemId}`, // PATCH - Update item quantity
    REMOVE_ITEM: (itemId: string) => `/api/cart/${itemId}`, // DELETE - Remove item
    CLEAR: "/api/cart/clear", // DELETE - Clear entire cart
  },

  // Checkout endpoints
  CHECKOUT: {
    PLACE_ORDER: "/api/checkout", // POST - Place order from cart (COD)
  },

  // Payment endpoints (Razorpay)
  PAYMENT: {
    CREATE_ORDER: "/api/payment/create-order", // POST - Create Razorpay order
    VERIFY: "/api/payment/verify", // POST - Verify payment & place orders
    WEBHOOK: "/api/payment/webhook", // POST - Razorpay webhook events
  },

  // Coupon endpoints
  COUPONS: {
    VALIDATE: "/api/coupons/validate", // POST - Validate a coupon code (public)
  },

  // Search endpoint
  SEARCH: {
    QUERY: "/api/search", // GET - Full-text product search with filters
  },

  // Bids endpoints
  BIDS: {
    LIST: "/api/bids", // GET ?productId=... - List bids for a product
    CREATE: "/api/bids", // POST - Place a bid (auth required)
    GET_BY_ID: (id: string) => `/api/bids/${id}`, // GET - Get single bid
  },

  // Seller endpoints ✅ Routes exist
  SELLER: {
    ORDERS: "/api/seller/orders", // GET - List seller's orders (auth: seller)
    ANALYTICS: "/api/seller/analytics", // GET - Seller analytics stats (auth: seller)
    PAYOUTS: "/api/seller/payouts", // GET/POST - List/request payouts (auth: seller)
  },

  // Blog endpoints — public
  BLOG: {
    LIST: "/api/blog", // GET - List published posts
    GET_BY_SLUG: (slug: string) => `/api/blog/${slug}`, // GET - Single post by slug
  },

  // Promotions/Deals endpoint
  PROMOTIONS: {
    LIST: "/api/promotions", // GET - Featured products + active coupons
  },

  // Contact endpoint
  CONTACT: {
    SEND: "/api/contact", // POST - Send a contact message
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: "/api/notifications", // GET - User's notifications (paginated)
    CREATE: "/api/notifications", // POST - Create notification (admin/system)
    MARK_READ: (id: string) => `/api/notifications/${id}`, // PATCH - Mark one as read
    DELETE: (id: string) => `/api/notifications/${id}`, // DELETE - Delete one
    READ_ALL: "/api/notifications/read-all", // PATCH - Mark all as read
    UNREAD_COUNT: "/api/notifications/unread-count", // GET - Unread count
  },
} as const;

// Type for API endpoints
export type ApiEndpoint = string | ((id: string) => string);
