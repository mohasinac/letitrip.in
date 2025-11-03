/**
 * API Routes Constants
 * 
 * Centralized API endpoint definitions for the entire application.
 * Used by both frontend and backend to ensure consistency.
 * 
 * Usage (Frontend):
 * ```typescript
 * import { API_ROUTES } from '@/constants/api-routes';
 * const response = await fetch(API_ROUTES.PRODUCTS.LIST);
 * ```
 * 
 * Usage (Backend):
 * ```typescript
 * import { API_ROUTES } from '@/constants/api-routes';
 * // For route documentation and testing
 * ```
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * API Routes organized by feature
 */
export const API_ROUTES = {
  // ========================================
  // PUBLIC ROUTES
  // ========================================

  /** Product Routes */
  PRODUCTS: {
    /** GET - List all products with filters */
    LIST: `${BASE_URL}/api/products`,
    /** GET - Get product by slug */
    DETAIL: (slug: string) => `${BASE_URL}/api/products/${slug}`,
    /** GET - Search products */
    SEARCH: `${BASE_URL}/api/search`,
  },

  /** Category Routes */
  CATEGORIES: {
    /** GET - List all categories */
    LIST: `${BASE_URL}/api/categories`,
    /** GET - Get category tree */
    TREE: `${BASE_URL}/api/categories?format=tree`,
    /** GET - Get category by slug */
    DETAIL: (slug: string) => `${BASE_URL}/api/categories/${slug}`,
  },

  /** Order Routes */
  ORDERS: {
    /** GET/POST - List orders / Create order */
    LIST: `${BASE_URL}/api/orders`,
    /** POST - Create new order */
    CREATE: `${BASE_URL}/api/orders/create`,
    /** GET - Get order by ID */
    DETAIL: (orderId: string) => `${BASE_URL}/api/orders/${orderId}`,
    /** POST - Cancel order */
    CANCEL: (orderId: string) => `${BASE_URL}/api/orders/${orderId}/cancel`,
    /** GET - Track order */
    TRACK: `${BASE_URL}/api/orders/track`,
  },

  /** Review Routes */
  REVIEWS: {
    /** GET/POST - List reviews / Create review */
    LIST: `${BASE_URL}/api/reviews`,
    /** GET/PUT/DELETE - Review CRUD */
    DETAIL: (reviewId: string) => `${BASE_URL}/api/reviews/${reviewId}`,
  },

  /** Cart Routes */
  CART: {
    /** GET/POST/DELETE - Cart operations */
    MAIN: `${BASE_URL}/api/cart`,
  },

  /** Address Routes */
  ADDRESSES: {
    /** GET/POST - List addresses / Create address */
    LIST: `${BASE_URL}/api/addresses`,
    /** GET/PUT/DELETE - Address CRUD */
    DETAIL: (addressId: string) => `${BASE_URL}/api/addresses/${addressId}`,
  },

  // ========================================
  // AUTHENTICATION ROUTES
  // ========================================

  AUTH: {
    /** POST - Register with email */
    REGISTER: `${BASE_URL}/api/auth/register`,
    /** GET - Get current user */
    ME: `${BASE_URL}/api/auth/me`,
    /** POST - Change password */
    CHANGE_PASSWORD: `${BASE_URL}/api/auth/change-password`,
    /** POST - Send OTP */
    SEND_OTP: `${BASE_URL}/api/auth/send-otp`,
    /** POST - Verify OTP */
    VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,
    /** DELETE/POST - Delete account */
    DELETE_ACCOUNT: `${BASE_URL}/api/auth/delete-account`,
  },

  /** User Profile Routes */
  USER: {
    /** GET/PUT - User profile */
    PROFILE: `${BASE_URL}/api/user/profile`,
    /** GET/PUT - Account settings */
    ACCOUNT: `${BASE_URL}/api/user/account`,
    /** GET/PUT - User preferences */
    PREFERENCES: `${BASE_URL}/api/user/preferences`,
  },

  // ========================================
  // PAYMENT ROUTES
  // ========================================

  PAYMENT: {
    /** Razorpay */
    RAZORPAY: {
      /** POST - Create Razorpay order */
      CREATE_ORDER: `${BASE_URL}/api/payment/razorpay/create-order`,
      /** POST - Verify Razorpay payment */
      VERIFY: `${BASE_URL}/api/payment/razorpay/verify`,
    },
    /** PayPal */
    PAYPAL: {
      /** POST - Create PayPal order */
      CREATE_ORDER: `${BASE_URL}/api/payment/paypal/create-order`,
      /** POST - Capture PayPal payment */
      CAPTURE: `${BASE_URL}/api/payment/paypal/capture`,
    },
  },

  // ========================================
  // ADMIN ROUTES
  // ========================================

  ADMIN: {
    /** Admin Product Management */
    PRODUCTS: {
      /** GET - List all products (admin) */
      LIST: `${BASE_URL}/api/admin/products`,
      /** GET - Product statistics */
      STATS: `${BASE_URL}/api/admin/products/stats`,
    },

    /** Admin Order Management */
    ORDERS: {
      /** GET - List all orders (admin) */
      LIST: `${BASE_URL}/api/admin/orders`,
      /** GET - Order statistics */
      STATS: `${BASE_URL}/api/admin/orders/stats`,
      /** POST - Cancel order (admin) */
      CANCEL: (orderId: string) => `${BASE_URL}/api/admin/orders/${orderId}/cancel`,
    },

    /** Admin User Management */
    USERS: {
      /** GET - List all users */
      LIST: `${BASE_URL}/api/admin/users`,
      /** GET - Search users */
      SEARCH: `${BASE_URL}/api/admin/users/search`,
      /** GET/PUT - User details */
      DETAIL: (userId: string) => `${BASE_URL}/api/admin/users/${userId}`,
      /** PUT - Update user role */
      ROLE: (userId: string) => `${BASE_URL}/api/admin/users/${userId}/role`,
      /** PUT - Ban/unban user */
      BAN: (userId: string) => `${BASE_URL}/api/admin/users/${userId}/ban`,
      /** POST - Create user document */
      CREATE_DOCUMENT: (userId: string) => `${BASE_URL}/api/admin/users/${userId}/create-document`,
    },

    /** Admin Category Management */
    CATEGORIES: {
      /** GET/POST/PATCH/DELETE - Category CRUD */
      MAIN: `${BASE_URL}/api/admin/categories`,
      /** POST - Batch update categories */
      BATCH_UPDATE: `${BASE_URL}/api/admin/categories/batch-update`,
    },

    /** Admin Coupon Management */
    COUPONS: {
      /** GET/DELETE - List coupons / Delete coupon */
      LIST: `${BASE_URL}/api/admin/coupons`,
      /** POST - Toggle coupon status */
      TOGGLE: (couponId: string) => `${BASE_URL}/api/admin/coupons/${couponId}/toggle`,
    },

    /** Admin Settings */
    SETTINGS: {
      /** GET/PUT/PATCH - Site settings */
      MAIN: `${BASE_URL}/api/admin/settings`,
      /** GET/POST/PATCH - Hero settings */
      HERO: `${BASE_URL}/api/admin/hero-settings`,
      /** GET/POST/PUT/DELETE - Hero slides */
      SLIDES: `${BASE_URL}/api/admin/hero-slides`,
      /** GET/PUT - Theme settings */
      THEME: `${BASE_URL}/api/admin/theme-settings`,
    },

    /** Admin Shipments */
    SHIPMENTS: {
      /** GET - List shipments */
      LIST: `${BASE_URL}/api/admin/shipments`,
      /** POST - Cancel shipment */
      CANCEL: (shipmentId: string) => `${BASE_URL}/api/admin/shipments/${shipmentId}/cancel`,
      /** GET - Track shipment */
      TRACK: (shipmentId: string) => `${BASE_URL}/api/admin/shipments/${shipmentId}/track`,
    },

    /** Admin Sales */
    SALES: {
      /** GET/POST/DELETE - Sales CRUD */
      MAIN: `${BASE_URL}/api/admin/sales`,
      /** GET/PUT/DELETE - Sale detail */
      DETAIL: (saleId: string) => `${BASE_URL}/api/admin/sales/${saleId}`,
      /** POST - Toggle sale status */
      TOGGLE: (saleId: string) => `${BASE_URL}/api/admin/sales/${saleId}/toggle`,
    },

    /** Admin Reviews */
    REVIEWS: {
      /** GET/PUT/DELETE - Review management */
      MAIN: `${BASE_URL}/api/admin/reviews`,
    },

    /** Admin Support */
    SUPPORT: {
      /** GET/POST - Support tickets */
      MAIN: `${BASE_URL}/api/admin/support`,
    },

    /** Admin Bulk Operations */
    BULK: {
      /** GET/POST - Bulk operations */
      MAIN: `${BASE_URL}/api/admin/bulk`,
      /** GET - Bulk operation status */
      STATUS: (operationId: string) => `${BASE_URL}/api/admin/bulk/${operationId}/status`,
    },

    /** Admin Export */
    EXPORT: {
      /** GET - Export data */
      MAIN: `${BASE_URL}/api/admin/export`,
    },

    /** Admin Migration */
    MIGRATION: {
      /** POST - Migrate data */
      MAIN: `${BASE_URL}/api/admin/migrate`,
    },

    /** Admin Upload */
    UPLOAD: {
      /** POST - Upload file */
      MAIN: `${BASE_URL}/api/admin/upload`,
    },
  },

  // ========================================
  // SELLER ROUTES
  // ========================================

  SELLER: {
    /** Seller Products */
    PRODUCTS: {
      /** GET/POST - List/create products */
      MAIN: `${BASE_URL}/api/seller/products`,
      /** GET - Leaf categories */
      CATEGORIES: `${BASE_URL}/api/seller/products/categories/leaf`,
      /** POST - Upload media */
      MEDIA: `${BASE_URL}/api/seller/products/media`,
      /** GET/PUT/DELETE - Product CRUD */
      DETAIL: (productId: string) => `${BASE_URL}/api/seller/products/${productId}`,
    },

    /** Seller Orders */
    ORDERS: {
      /** GET - List orders */
      LIST: `${BASE_URL}/api/seller/orders`,
      /** GET - Order details */
      DETAIL: (orderId: string) => `${BASE_URL}/api/seller/orders/${orderId}`,
      /** POST - Approve order */
      APPROVE: (orderId: string) => `${BASE_URL}/api/seller/orders/${orderId}/approve`,
      /** POST - Cancel order */
      CANCEL: (orderId: string) => `${BASE_URL}/api/seller/orders/${orderId}/cancel`,
      /** GET/POST - Generate invoice */
      INVOICE: (orderId: string) => `${BASE_URL}/api/seller/orders/${orderId}/invoice`,
      /** POST - Reject order */
      REJECT: (orderId: string) => `${BASE_URL}/api/seller/orders/${orderId}/reject`,
    },

    /** Seller Shipments */
    SHIPMENTS: {
      /** GET - List shipments */
      LIST: `${BASE_URL}/api/seller/shipments`,
      /** GET - Shipment details */
      DETAIL: (shipmentId: string) => `${BASE_URL}/api/seller/shipments/${shipmentId}`,
      /** POST - Cancel shipment */
      CANCEL: (shipmentId: string) => `${BASE_URL}/api/seller/shipments/${shipmentId}/cancel`,
      /** GET - Track shipment */
      TRACK: (shipmentId: string) => `${BASE_URL}/api/seller/shipments/${shipmentId}/track`,
      /** GET - Shipping label */
      LABEL: (shipmentId: string) => `${BASE_URL}/api/seller/shipments/${shipmentId}/label`,
      /** POST - Bulk manifest */
      BULK_MANIFEST: `${BASE_URL}/api/seller/shipments/bulk-manifest`,
    },

    /** Seller Coupons */
    COUPONS: {
      /** GET/POST - List/create coupons */
      MAIN: `${BASE_URL}/api/seller/coupons`,
      /** POST - Validate coupon */
      VALIDATE: `${BASE_URL}/api/seller/coupons/validate`,
      /** GET/PUT/DELETE - Coupon CRUD */
      DETAIL: (couponId: string) => `${BASE_URL}/api/seller/coupons/${couponId}`,
      /** POST - Toggle status */
      TOGGLE: (couponId: string) => `${BASE_URL}/api/seller/coupons/${couponId}/toggle`,
    },

    /** Seller Sales */
    SALES: {
      /** GET/POST - List/create sales */
      MAIN: `${BASE_URL}/api/seller/sales`,
      /** GET/PUT/DELETE - Sale CRUD */
      DETAIL: (saleId: string) => `${BASE_URL}/api/seller/sales/${saleId}`,
      /** POST - Toggle status */
      TOGGLE: (saleId: string) => `${BASE_URL}/api/seller/sales/${saleId}/toggle`,
    },

    /** Seller Alerts */
    ALERTS: {
      /** GET - List alerts */
      LIST: `${BASE_URL}/api/seller/alerts`,
      /** DELETE - Delete alert */
      DELETE: (alertId: string) => `${BASE_URL}/api/seller/alerts/${alertId}`,
      /** POST - Mark as read */
      MARK_READ: (alertId: string) => `${BASE_URL}/api/seller/alerts/${alertId}/mark-read`,
      /** POST - Bulk mark as read */
      BULK_MARK_READ: `${BASE_URL}/api/seller/alerts/bulk-mark-read`,
    },

    /** Seller Analytics */
    ANALYTICS: {
      /** GET - Dashboard overview */
      OVERVIEW: `${BASE_URL}/api/seller/analytics/overview`,
      /** GET - Export analytics */
      EXPORT: `${BASE_URL}/api/seller/analytics/export`,
    },

    /** Seller Shop */
    SHOP: {
      /** GET/POST - Shop profile */
      MAIN: `${BASE_URL}/api/seller/shop`,
    },
  },

  // ========================================
  // GAME ROUTES
  // ========================================

  GAME: {
    /** Arena Routes */
    ARENAS: {
      /** GET/POST - List/create arenas */
      LIST: `${BASE_URL}/api/arenas`,
      /** POST - Initialize default arena */
      INIT: `${BASE_URL}/api/arenas/init`,
      /** GET/PUT/DELETE - Arena CRUD */
      DETAIL: (arenaId: string) => `${BASE_URL}/api/arenas/${arenaId}`,
      /** POST - Set default arena */
      SET_DEFAULT: (arenaId: string) => `${BASE_URL}/api/arenas/${arenaId}/set-default`,
    },

    /** Beyblade Routes */
    BEYBLADES: {
      /** GET/POST - List/create beyblades */
      LIST: `${BASE_URL}/api/beyblades`,
      /** POST - Initialize default beyblades */
      INIT: `${BASE_URL}/api/beyblades/init`,
      /** POST - Upload image */
      UPLOAD_IMAGE: `${BASE_URL}/api/beyblades/upload-image`,
      /** GET/PUT/DELETE - Beyblade CRUD */
      DETAIL: (beybladeId: string) => `${BASE_URL}/api/beyblades/${beybladeId}`,
      /** GET - Get SVG */
      SVG: (filename: string) => `${BASE_URL}/api/beyblades/svg/${filename}`,
    },
  },

  // ========================================
  // SYSTEM ROUTES
  // ========================================

  SYSTEM: {
    /** Search */
    SEARCH: `${BASE_URL}/api/search`,

    /** Contact */
    CONTACT: `${BASE_URL}/api/contact`,

    /** Health Check */
    HEALTH: `${BASE_URL}/api/health`,

    /** Cookie Consent */
    CONSENT: `${BASE_URL}/api/consent`,
  },
} as const;

/**
 * Helper function to build query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Helper function to build URL with query params
 */
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params) return baseUrl;
  return `${baseUrl}${buildQueryString(params)}`;
}

/**
 * Type-safe API route builder
 */
export const api = {
  /** Build product list URL with filters */
  products: {
    list: (filters?: {
      category?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      isActive?: boolean;
      limit?: number;
      page?: number;
    }) => buildUrl(API_ROUTES.PRODUCTS.LIST, filters),
    
    detail: (slug: string) => API_ROUTES.PRODUCTS.DETAIL(slug),
  },

  /** Build category list URL */
  categories: {
    list: (format?: 'tree' | 'list') => 
      format ? `${API_ROUTES.CATEGORIES.LIST}?format=${format}` : API_ROUTES.CATEGORIES.LIST,
    
    detail: (slug: string) => API_ROUTES.CATEGORIES.DETAIL(slug),
  },

  /** Build order URLs */
  orders: {
    list: (filters?: {
      status?: string;
      limit?: number;
      page?: number;
    }) => buildUrl(API_ROUTES.ORDERS.LIST, filters),
    
    detail: (orderId: string) => API_ROUTES.ORDERS.DETAIL(orderId),
    cancel: (orderId: string) => API_ROUTES.ORDERS.CANCEL(orderId),
  },

  /** Build admin URLs */
  admin: {
    products: {
      list: (filters?: {
        seller?: string;
        category?: string;
        status?: string;
        search?: string;
        limit?: number;
        page?: number;
      }) => buildUrl(API_ROUTES.ADMIN.PRODUCTS.LIST, filters),
    },
    
    orders: {
      list: (filters?: {
        status?: string;
        seller?: string;
        limit?: number;
        page?: number;
      }) => buildUrl(API_ROUTES.ADMIN.ORDERS.LIST, filters),
    },
    
    users: {
      list: (filters?: {
        role?: string;
        limit?: number;
        page?: number;
      }) => buildUrl(API_ROUTES.ADMIN.USERS.LIST, filters),
    },
  },

  /** Build seller URLs */
  seller: {
    products: {
      list: (filters?: {
        status?: string;
        category?: string;
        search?: string;
        limit?: number;
        page?: number;
      }) => buildUrl(API_ROUTES.SELLER.PRODUCTS.MAIN, filters),
    },
    
    orders: {
      list: (filters?: {
        status?: string;
        limit?: number;
        page?: number;
      }) => buildUrl(API_ROUTES.SELLER.ORDERS.LIST, filters),
    },
  },
};

/**
 * Export types for TypeScript autocomplete
 */
export type ApiRoutes = typeof API_ROUTES;
export type ApiBuilder = typeof api;
