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

  // User endpoints ✅ Routes exist (except addresses — no route yet)
  USER: {
    /** GET profile or PATCH to update — same path, different method */
    PROFILE: "/api/user/profile",
    CHANGE_PASSWORD: "/api/user/change-password",
    SESSIONS: "/api/user/sessions",
    REVOKE_SESSION: (id: string) => `/api/user/sessions/${id}`,
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
    UPDATE: "/api/profile/update",
    ADD_PHONE: "/api/profile/add-phone",
    VERIFY_PHONE: "/api/profile/verify-phone",
    UPDATE_PASSWORD: "/api/profile/update-password",
    DELETE_ACCOUNT: "/api/profile/delete-account",
  },

  // Address endpoints ❌ No route files yet — TODO: create /api/user/addresses routes
  ADDRESSES: {
    LIST: "/api/user/addresses", // GET - List user addresses
    CREATE: "/api/user/addresses", // POST - Create new address
    GET_BY_ID: (id: string) => `/api/user/addresses/${id}`, // GET - Get single address
    UPDATE: (id: string) => `/api/user/addresses/${id}`, // PATCH - Update address
    DELETE: (id: string) => `/api/user/addresses/${id}`, // DELETE - Delete address
    SET_DEFAULT: (id: string) => `/api/user/addresses/${id}/set-default`, // POST - Set default address
  },

  // Order endpoints ❌ No route files yet — TODO: create /api/user/orders routes
  ORDERS: {
    LIST: "/api/user/orders", // GET - List user orders
    GET_BY_ID: (id: string) => `/api/user/orders/${id}`, // GET - Get single order details
    TRACK: (id: string) => `/api/user/orders/${id}/track`, // GET - Track order
    CANCEL: (id: string) => `/api/user/orders/${id}/cancel`, // POST - Cancel order
  },

  // Admin endpoints ⚠️ REVOKE_SESSION and REVOKE_USER_SESSIONS have no route files yet
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
    USERS: "/api/admin/users",
    USER_BY_ID: (uid: string) => `/api/admin/users/${uid}`,
    SESSIONS: "/api/admin/sessions",
    /** ❌ No route — needs /api/admin/sessions/[id]/route.ts */
    REVOKE_SESSION: (id: string) => `/api/admin/sessions/${id}`,
    /** ❌ No route — needs /api/admin/sessions/revoke-user/route.ts */
    REVOKE_USER_SESSIONS: "/api/admin/sessions/revoke-user",
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

  // Logging endpoints ❌ No route — TODO: create /api/logs/write route
  LOGS: {
    WRITE: "/api/logs/write", // POST - Write log entry
  },

  // Newsletter endpoints ❌ No route — TODO: create /api/newsletter/subscribe route
  NEWSLETTER: {
    SUBSCRIBE: "/api/newsletter/subscribe", // POST - Subscribe to newsletter
  },

  // Demo/Development endpoints (dev-only)
  DEMO: {
    SEED: "/api/demo/seed", // POST - Seed database with test data
  },
} as const;

// Type for API endpoints
export type ApiEndpoint = string | ((id: string) => string);
