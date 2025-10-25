// Business logic constants
export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  USER: 'user',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

export const LIMITS = {
  MAX_PRODUCT_IMAGES: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
  MIN_PASSWORD_LENGTH: 8,
  MIN_PHONE_LENGTH: 10, // Indian mobile numbers
  MAX_PHONE_LENGTH: 10,
  MIN_PIN_CODE_LENGTH: 6, // Indian PIN codes
  MAX_PIN_CODE_LENGTH: 6,
} as const;

export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  NAME: 'Indian Rupee',
  LOCALE: 'en-IN',
} as const;

export const TIMEZONE = {
  DEFAULT: 'Asia/Kolkata',
  NAME: 'India Standard Time',
  OFFSET: '+05:30',
} as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar Islands'
] as const;
