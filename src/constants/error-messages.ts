/**
 * Error & Status Messages Constants
 *
 * Centralized error messages, success messages, and status text
 * used across the application for consistency.
 */

// ============================================================================
// GENERAL MESSAGES
// ============================================================================

export const GENERAL_MESSAGES = {
  SUCCESS: "Operation completed successfully",
  ERROR: "An error occurred. Please try again.",
  LOADING: "Loading...",
  SAVING: "Saving changes...",
  DELETING: "Deleting...",
  UPDATING: "Updating...",
  PROCESSING: "Processing...",
} as const;

// ============================================================================
// AUTHENTICATION ERRORS
// ============================================================================

export const AUTH_ERRORS = {
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Access forbidden",
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_MISSING: "Missing authentication token",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  NOT_AUTHENTICATED: "You must be logged in to perform this action",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_DISABLED: "This account has been disabled",
  ACCOUNT_NOT_VERIFIED: "Please verify your email address first",
} as const;

// ============================================================================
// USER & PROFILE ERRORS
// ============================================================================

export const USER_ERRORS = {
  USER_NOT_FOUND: "User not found",
  EMAIL_REQUIRED: "Email is required",
  NAME_REQUIRED: "Name is required",
  PASSWORD_REQUIRED: "Password is required",
  INVALID_EMAIL_FORMAT: "Invalid email format",
  EMAIL_IN_USE: "Email already in use",
  PHONE_REQUIRED: "Phone number is required",
  INVALID_PHONE_FORMAT: "Invalid phone number format",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORD_TOO_WEAK: "Password must contain uppercase, lowercase, and numbers",
  PASSWORDS_NOT_MATCH: "Passwords do not match",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
  PROFILE_UPDATE_SUCCESS: "Profile updated successfully",
  PASSWORD_CHANGE_SUCCESS: "Password changed successfully",
} as const;

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: "This field is required",
  INVALID_FORMAT: "Invalid format",
  MIN_LENGTH: "This field must be at least {0} characters",
  MAX_LENGTH: "This field must not exceed {0} characters",
  MIN_VALUE: "This value must be at least {0}",
  MAX_VALUE: "This value must not exceed {0}",
  INVALID_URL: "Please enter a valid URL",
  INVALID_NUMBER: "Please enter a valid number",
  INVALID_DATE: "Please enter a valid date",
  AGREE_TO_TERMS: "You must agree to the terms and conditions",
} as const;

// ============================================================================
// AUCTION & BIDDING ERRORS
// ============================================================================

export const AUCTION_ERRORS = {
  AUCTION_NOT_FOUND: "Auction not found",
  AUCTION_ENDED: "This auction has ended",
  AUCTION_NOT_STARTED: "This auction has not started yet",
  AUCTION_CANCELED: "This auction has been canceled",
  INVALID_BID_AMOUNT: "Invalid bid amount",
  BID_BELOW_STARTING: "Bid must be at least the starting bid",
  BID_BELOW_CURRENT: "Bid must be higher than the current bid",
  BID_NOT_ALLOWED: "You are not allowed to bid on this auction",
  RESERVE_NOT_MET: "Reserve price has not been met",
  AUCTION_CREATE_SUCCESS: "Auction created successfully",
  AUCTION_UPDATE_SUCCESS: "Auction updated successfully",
  AUCTION_DELETE_SUCCESS: "Auction deleted successfully",
  AUCTION_ALREADY_EXISTS: "Auction with this slug already exists",
} as const;

// ============================================================================
// PRODUCT ERRORS
// ============================================================================

export const PRODUCT_ERRORS = {
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_OUT_OF_STOCK: "Product is out of stock",
  INVALID_QUANTITY: "Invalid quantity",
  QUANTITY_EXCEEDS_STOCK: "Quantity exceeds available stock",
  PRODUCT_CREATE_SUCCESS: "Product created successfully",
  PRODUCT_UPDATE_SUCCESS: "Product updated successfully",
  PRODUCT_DELETE_SUCCESS: "Product deleted successfully",
  DUPLICATE_SKU: "A product with this SKU already exists",
} as const;

// ============================================================================
// ORDER & PAYMENT ERRORS
// ============================================================================

export const ORDER_ERRORS = {
  ORDER_NOT_FOUND: "Order not found",
  PAYMENT_FAILED: "Payment failed. Please try again.",
  INVALID_PAYMENT_METHOD: "Invalid payment method",
  PAYMENT_AMOUNT_INVALID: "Invalid payment amount",
  ORDER_ALREADY_PLACED: "This order has already been placed",
  ORDER_CANNOT_CANCEL: "This order cannot be canceled",
  ORDER_CANNOT_REFUND: "This order cannot be refunded",
  INSUFFICIENT_BALANCE: "Insufficient account balance",
  ORDER_CREATE_SUCCESS: "Order placed successfully",
  PAYMENT_SUCCESS: "Payment successful",
  REFUND_INITIATED: "Refund has been initiated",
} as const;

// ============================================================================
// SHOP ERRORS
// ============================================================================

export const SHOP_ERRORS = {
  SHOP_NOT_FOUND: "Shop not found",
  SHOP_DISABLED: "This shop is currently disabled",
  SHOP_BANNED: "This shop has been banned",
  SHOP_ALREADY_EXISTS: "You already have a shop",
  INSUFFICIENT_SELLER_RATING: "Your seller rating is too low",
  SHOP_CREATE_SUCCESS: "Shop created successfully",
  SHOP_UPDATE_SUCCESS: "Shop updated successfully",
  NOT_SHOP_OWNER: "You do not own this shop",
} as const;

// ============================================================================
// REVIEW & RATING ERRORS
// ============================================================================

export const REVIEW_ERRORS = {
  REVIEW_NOT_FOUND: "Review not found",
  INVALID_RATING: "Rating must be between 1 and 5",
  REVIEW_ALREADY_EXISTS: "You have already reviewed this item",
  CANNOT_REVIEW_OWN_PRODUCT: "You cannot review your own product",
  REVIEW_CREATE_SUCCESS: "Review posted successfully",
  REVIEW_DELETE_SUCCESS: "Review deleted successfully",
  REVIEW_FLAGGED: "Thank you for the report. We'll review it shortly.",
} as const;

// ============================================================================
// SHIPPING & DELIVERY ERRORS
// ============================================================================

export const SHIPPING_ERRORS = {
  INVALID_ADDRESS: "Invalid shipping address",
  DELIVERY_NOT_AVAILABLE: "Delivery is not available to this location",
  SHIPPING_NOT_FOUND: "Shipping information not found",
  TRACKING_NOT_AVAILABLE: "Tracking information is not available yet",
  ADDRESS_REQUIRED: "Shipping address is required",
  INVALID_POSTAL_CODE: "Invalid postal code",
  CITY_REQUIRED: "City is required",
  STATE_REQUIRED: "State is required",
} as const;

// ============================================================================
// CATEGORY ERRORS
// ============================================================================

export const CATEGORY_ERRORS = {
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_IN_USE: "This category is in use and cannot be deleted",
  CATEGORY_CREATE_SUCCESS: "Category created successfully",
  CATEGORY_UPDATE_SUCCESS: "Category updated successfully",
  CATEGORY_DELETE_SUCCESS: "Category deleted successfully",
  DUPLICATE_CATEGORY_NAME: "A category with this name already exists",
} as const;

// ============================================================================
// FILE & UPLOAD ERRORS
// ============================================================================

export const FILE_ERRORS = {
  FILE_NOT_FOUND: "File not found",
  FILE_UPLOAD_FAILED: "File upload failed. Please try again.",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  INVALID_FILE_TYPE: "Invalid file type",
  INVALID_FILE_FORMAT: "Invalid file format",
  FILE_DELETED_SUCCESS: "File deleted successfully",
  FILE_UPLOAD_SUCCESS: "File uploaded successfully",
  TOO_MANY_FILES: "Too many files. Maximum is {0}",
} as const;

// ============================================================================
// API & NETWORK ERRORS
// ============================================================================

export const API_ERRORS = {
  MISSING_REQUIRED_PARAMETERS: "Missing required parameters",
  INVALID_REQUEST: "Invalid request format",
  INTERNAL_SERVER_ERROR: "Internal server error",
  SERVICE_UNAVAILABLE: "Service is temporarily unavailable",
  REQUEST_TIMEOUT: "Request timed out. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  API_RATE_LIMIT: "Too many requests. Please try again later.",
  INVALID_API_KEY: "Invalid API key",
  API_VERSION_DEPRECATED: "This API version is no longer supported",
} as const;

// ============================================================================
// PERMISSION & ACCESS ERRORS
// ============================================================================

export const PERMISSION_ERRORS = {
  INSUFFICIENT_PERMISSIONS: "You do not have permission to perform this action",
  ADMIN_ONLY: "This action is only available to administrators",
  SELLER_ONLY: "This action is only available to sellers",
  CANNOT_MODIFY_OTHER_USER: "You cannot modify another user's data",
  CANNOT_DELETE_ACCOUNT: "You cannot delete this account",
} as const;

// ============================================================================
// NOTIFICATION & MESSAGING ERRORS
// ============================================================================

export const NOTIFICATION_ERRORS = {
  MESSAGE_SEND_FAILED: "Failed to send message",
  MESSAGE_SEND_SUCCESS: "Message sent successfully",
  EMAIL_SEND_FAILED: "Failed to send email",
  EMAIL_SEND_SUCCESS: "Email sent successfully",
  SMS_SEND_FAILED: "Failed to send SMS",
  SMS_SEND_SUCCESS: "SMS sent successfully",
  NOTIFICATION_READ_SUCCESS: "Notification marked as read",
  INVALID_PHONE_NUMBER: "Invalid phone number",
  INVALID_EMAIL_ADDRESS: "Invalid email address",
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: "Changes saved successfully",
  DELETE_SUCCESS: "Item deleted successfully",
  CREATE_SUCCESS: "Item created successfully",
  UPDATE_SUCCESS: "Item updated successfully",
  ACTION_SUCCESS: "Action completed successfully",
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "You have been logged out",
  SIGNUP_SUCCESS: "Account created successfully",
  EMAIL_SENT: "Email sent successfully",
  COPIED_TO_CLIPBOARD: "Copied to clipboard",
  SHARE_SUCCESS: "Shared successfully",
} as const;

// ============================================================================
// CONFIRMATION MESSAGES
// ============================================================================

export const CONFIRMATION_MESSAGES = {
  CONFIRM_DELETE: "Are you sure you want to delete this item?",
  CONFIRM_CANCEL_ORDER: "Are you sure you want to cancel this order?",
  CONFIRM_LOGOUT: "Are you sure you want to log out?",
  CONFIRM_LEAVE_PAGE:
    "You have unsaved changes. Are you sure you want to leave?",
  CONFIRM_ACTION: "Are you sure you want to continue?",
} as const;

// ============================================================================
// WARNING MESSAGES
// ============================================================================

export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: "You have unsaved changes",
  NETWORK_SLOW: "Your connection is slow",
  QUOTA_EXCEEDED: "You have exceeded your quota",
  STORAGE_FULL: "Your storage is full",
  SESSION_TIMEOUT_WARNING: "Your session will expire soon",
  BROWSER_COMPATIBILITY: "This feature may not work properly in your browser",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format error message with parameters
 * @param message Message with {0}, {1} placeholders
 * @param params Values to replace placeholders
 * @returns Formatted message
 */
export function formatMessage(message: string, ...params: any[]): string {
  return message.replace(/{(\d+)}/g, (match, index) => {
    return params[parseInt(index)] ?? match;
  });
}

/**
 * Get user-friendly error message
 * @param error Error object or string
 * @returns User-friendly message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  return GENERAL_MESSAGES.ERROR;
}
