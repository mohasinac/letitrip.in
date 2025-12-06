/**
 * @fileoverview Toast Helper Utilities
 * @module src/lib/toast-helper
 * @description Standardized toast notifications with common patterns
 *
 * @created 2025-12-06
 * @pattern Helper Utility
 */

import { toast } from "sonner";

/**
 * Standard success messages for common operations
 */
export const TOAST_MESSAGES = {
  // CRUD Operations
  CREATED: (entity: string) => `${entity} created successfully`,
  UPDATED: (entity: string) => `${entity} updated successfully`,
  DELETED: (entity: string) => `${entity} deleted successfully`,
  SAVED: (entity: string) => `${entity} saved successfully`,

  // Common Actions
  ADDED_TO_CART: "Added to cart",
  REMOVED_FROM_CART: "Removed from cart",
  ADDED_TO_WISHLIST: "Added to wishlist",
  REMOVED_FROM_WISHLIST: "Removed from wishlist",
  COPIED: "Copied to clipboard",
  SENT: "Sent successfully",
  UPLOADED: "Uploaded successfully",
  DOWNLOADED: "Downloaded successfully",

  // Errors
  FAILED: (action: string) => `Failed to ${action}`,
  NOT_FOUND: (entity: string) => `${entity} not found`,
  INVALID_DATA: "Invalid data provided",
  NETWORK_ERROR: "Network error. Please try again",
  SERVER_ERROR: "Server error. Please try again later",
  UNAUTHORIZED: "You don't have permission to do this",

  // Validation
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
  TOO_SHORT: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  TOO_LONG: (field: string, max: number) =>
    `${field} must be less than ${max} characters`,
} as const;

/**
 * Show success toast with standard message
 */
export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

/**
 * Show error toast with standard message
 */
export function toastError(message: string, description?: string) {
  toast.error(message, { description });
}

/**
 * Show loading toast (returns ID for dismissal)
 */
export function toastLoading(message: string = "Loading...") {
  return toast.loading(message);
}

/**
 * Dismiss a specific toast
 */
export function toastDismiss(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Promise toast - automatically shows loading/success/error
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) {
  return toast.promise(promise, messages);
}

/**
 * CRUD operation toast helpers
 */
export const toastCrud = {
  created: (entity: string) => toastSuccess(TOAST_MESSAGES.CREATED(entity)),
  updated: (entity: string) => toastSuccess(TOAST_MESSAGES.UPDATED(entity)),
  deleted: (entity: string) => toastSuccess(TOAST_MESSAGES.DELETED(entity)),
  saved: (entity: string) => toastSuccess(TOAST_MESSAGES.SAVED(entity)),

  failedToCreate: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`create ${entity}`)),
  failedToUpdate: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`update ${entity}`)),
  failedToDelete: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`delete ${entity}`)),
  failedToLoad: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`load ${entity}`)),
};

/**
 * Common action toast helpers
 */
export const toastAction = {
  addedToCart: () => toastSuccess(TOAST_MESSAGES.ADDED_TO_CART),
  removedFromCart: () => toastSuccess(TOAST_MESSAGES.REMOVED_FROM_CART),
  addedToWishlist: () => toastSuccess(TOAST_MESSAGES.ADDED_TO_WISHLIST),
  removedFromWishlist: () => toastSuccess(TOAST_MESSAGES.REMOVED_FROM_WISHLIST),
  copied: (item?: string) =>
    toastSuccess(item ? `${item} copied to clipboard` : TOAST_MESSAGES.COPIED),
  sent: () => toastSuccess(TOAST_MESSAGES.SENT),
  uploaded: () => toastSuccess(TOAST_MESSAGES.UPLOADED),
  downloaded: () => toastSuccess(TOAST_MESSAGES.DOWNLOADED),
};

/**
 * Error toast helpers
 */
export const toastErr = {
  notFound: (entity: string) => toastError(TOAST_MESSAGES.NOT_FOUND(entity)),
  invalidData: () => toastError(TOAST_MESSAGES.INVALID_DATA),
  networkError: () => toastError(TOAST_MESSAGES.NETWORK_ERROR),
  serverError: () => toastError(TOAST_MESSAGES.SERVER_ERROR),
  unauthorized: () => toastError(TOAST_MESSAGES.UNAUTHORIZED),

  requiredField: (field: string) =>
    toastError(TOAST_MESSAGES.REQUIRED_FIELD(field)),
  invalidFormat: (field: string) =>
    toastError(TOAST_MESSAGES.INVALID_FORMAT(field)),
  tooShort: (field: string, min: number) =>
    toastError(TOAST_MESSAGES.TOO_SHORT(field, min)),
  tooLong: (field: string, max: number) =>
    toastError(TOAST_MESSAGES.TOO_LONG(field, max)),

  // Additional helpers
  createFailed: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`create ${entity.toLowerCase()}`)),
  updateFailed: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`update ${entity.toLowerCase()}`)),
  deleteFailed: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`delete ${entity.toLowerCase()}`)),
  loadFailed: (entity: string) =>
    toastError(TOAST_MESSAGES.FAILED(`load ${entity.toLowerCase()}`)),
  notConfigured: (feature: string) =>
    toastError(`${feature} is not configured`),
  custom: (message: string) => toastError(message),
};
