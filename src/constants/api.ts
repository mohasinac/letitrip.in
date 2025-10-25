// API endpoint constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    CATEGORIES: '/api/products/categories',
    SEARCH: '/api/products/search',
  },
  ORDERS: {
    LIST: '/api/orders',
    DETAIL: (id: string) => `/api/orders/${id}`,
    CREATE: '/api/orders',
    UPDATE: (id: string) => `/api/orders/${id}`,
  },
  SELLER: {
    DASHBOARD: '/api/seller/dashboard',
    PRODUCTS: '/api/seller/products',
    ORDERS: '/api/seller/orders',
    ANALYTICS: '/api/seller/analytics',
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    PRODUCTS: '/api/admin/products',
    ORDERS: '/api/admin/orders',
    ANALYTICS: '/api/admin/analytics',
  }
} as const;

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;
