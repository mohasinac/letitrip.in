/**
 * @fileoverview TypeScript Module
 * @module src/lib/error-redirects
 * @description This file contains functionality related to error-redirects
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Error Redirect Utilities
 * Helper functions to generate meaningful error page URLs with context
 */

/**
 * Error Reason type definition
 * @typedef {ErrorReason}
 */
export type ErrorReason =
  // 404 Not Found
  | "product-not-found"
  | "shop-not-found"
  | "auction-not-found"
  | "category-not-found"
  | "user-not-found"
  | "order-not-found"
  // 401 Unauthorized
  | "not-logged-in"
  | "session-expired"
  | "invalid-token"
  // 403 Forbidden
  | "insufficient-permissions"
  | "wrong-role"
  | "account-suspended"
  | "email-not-verified";

/**
 * ErrorRedirectParams interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorRedirectParams
 */
interface ErrorRedirectParams {
  /** Reason */
  reason?: ErrorReason;
  /** Resource */
  resource?: string;
  /** Required Role */
  requiredRole?: string;
  /** Current Role */
  currentRole?: string;
  /** Details */
  details?: string;
  /** Error */
  error?: Error | unknown;
}

/**
 * Generate a 404 Not Found URL with context
 */
/**
 * Performs not found url operation
 *
 * @param {ErrorRedirectParams} params - The params
 *
 * @returns {string} The notfoundurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * notFoundUrl(params);
 */

/**
 * Performs not found url operation
 *
 * @param {ErrorRedirectParams} params - The params
 *
 * @returns {string} The notfoundurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * notFoundUrl(params);
 */

export function notFoundUrl(params: ErrorRedirectParams): string {
  const searchParams = new URLSearchParams();

  if (params.reason) searchParams.set("reason", params.reason);
  if (params.resource) searchParams.set("resource", params.resource);

  // Build details string
  const detailsParts: string[] = [];
  if (params.resource) detailsParts.push(`Resource: ${params.resource}`);
  if (params.error instanceof Error) {
    detailsParts.push(`Error: ${params.error.message}`);
    if (params.error.stack) {
      detailsParts.push(
        `Stack: ${params.error.stack.split("\n").slice(0, 3).join("\n")}`,
      );
    }
  } else if (params.error) {
    detailsParts.push(`Error: ${String(params.error)}`);
  }
  if (params.details) detailsParts.push(params.details);
  detailsParts.push(`Timestamp: ${new Date().toISOString()}`);

  const fullDetails = detailsParts.join("\n");
  if (fullDetails) {
    searchParams.set("details", encodeURIComponent(fullDetails));
  }

  return `/not-found?${searchParams.toString()}`;
}

/**
 * Generate a 401 Unauthorized URL with context
 */
/**
 * Performs unauthorized url operation
 *
 * @param {ErrorRedirectParams} params - The params
 *
 * @returns {string} The unauthorizedurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * unauthorizedUrl(params);
 */

/**
 * Performs unauthorized url operation
 *
 * @param {ErrorRedirectParams} params - The params
 *
 * @returns {string} The unauthorizedurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * unauthorizedUrl(params);
 */

export function unauthorizedUrl(params: ErrorRedirectParams): string {
  const searchParams = new URLSearchParams();

  if (params.reason) searchParams.set("reason", params.reason);
  if (params.resource) searchParams.set("resource", params.resource);
  if (params.requiredRole) searchParams.set("role", params.requiredRole);

  // Build details string
  const detailsParts: string[] = [];
  if (params.resource) detailsParts.push(`Resource: ${params.resource}`);
  if (params.requiredRole)
    detailsParts.push(`Required Role: ${params.requiredRole}`);
  if (params.error instanceof Error) {
    detailsParts.push(`Error: ${params.error.message}`);
  }
  if (params.details) detailsParts.push(params.details);
  detailsParts.push(`Timestamp: ${new Date().toISOString()}`);

  const fullDetails = detailsParts.join("\n");
  if (fullDetails) {
    searchParams.set("details", encodeURIComponent(fullDetails));
  }

  return `/unauthorized?${searchParams.toString()}`;
}

/**
 * Generate a 403 Forbidden URL with context
 */
/**
 * Performs forbidden url operation
 *
 * @param {ErrorRedirectParams} params - The params
 *
 * @returns {string} The forbiddenurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * forbiddenUrl(params);
 */

/**
 * Performs forbidden url operation
 *
 * @param {ErrorRedirectParams} params - The params
 *
 * @returns {string} The forbiddenurl result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * forbiddenUrl(params);
 */

export function forbiddenUrl(params: ErrorRedirectParams): string {
  const searchParams = new URLSearchParams();

  if (params.reason) searchParams.set("reason", params.reason);
  if (params.resource) searchParams.set("resource", params.resource);
  if (params.requiredRole) searchParams.set("role", params.requiredRole);
  if (params.currentRole) searchParams.set("current", params.currentRole);

  // Build details string
  const detailsParts: string[] = [];
  if (params.resource) detailsParts.push(`Resource: ${params.resource}`);
  if (params.requiredRole)
    detailsParts.push(`Required Role: ${params.requiredRole}`);
  if (params.currentRole)
    detailsParts.push(`Current Role: ${params.currentRole}`);
  if (params.error instanceof Error) {
    detailsParts.push(`Error: ${params.error.message}`);
  }
  if (params.details) detailsParts.push(params.details);
  detailsParts.push(`Timestamp: ${new Date().toISOString()}`);

  const fullDetails = detailsParts.join("\n");
  if (fullDetails) {
    searchParams.set("details", encodeURIComponent(fullDetails));
  }

  return `/forbidden?${searchParams.toString()}`;
}

/**
 * Quick helper for common 404 scenarios
 */
export const notFound = {
  /** Product */
  product: (slug: string, error?: Error) =>
    notFoundUrl({
      /** Reason */
      reason: "product-not-found",
      /** Resource */
      resource: slug,
      error,
    }),
  /** Shop */
  shop: (slug: string, error?: Error) =>
    notFoundUrl({
      /** Reason */
      reason: "shop-not-found",
      /** Resource */
      resource: slug,
      error,
    }),
  /** Auction */
  auction: (slug: string, error?: Error) =>
    notFoundUrl({
      /** Reason */
      reason: "auction-not-found",
      /** Resource */
      resource: slug,
      error,
    }),
  /** Category */
  category: (slug: string, error?: Error) =>
    notFoundUrl({
      /** Reason */
      reason: "category-not-found",
      /** Resource */
      resource: slug,
      error,
    }),
  /** Order */
  order: (orderId: string, error?: Error) =>
    notFoundUrl({
      /** Reason */
      reason: "order-not-found",
      /** Resource */
      resource: orderId,
      error,
    }),
};

/**
 * Quick helper for common 401 scenarios
 */
export const unauthorized = {
  /** Not Logged In */
  notLoggedIn: (resource?: string) =>
    unauthorizedUrl({
      /** Reason */
      reason: "not-logged-in",
      resource,
    }),
  /** Session Expired */
  sessionExpired: (resource?: string) =>
    unauthorizedUrl({
      /** Reason */
      reason: "session-expired",
      resource,
    }),
  /** Invalid Token */
  invalidToken: (resource?: string, error?: Error) =>
    unauthorizedUrl({
      /** Reason */
      reason: "invalid-token",
      resource,
      error,
    }),
};

/**
 * Quick helper for common 403 scenarios
 */
export const forbidden = {
  /** Wrong Role */
  wrongRole: (requiredRole: string, currentRole?: string, resource?: string) =>
    forbiddenUrl({
      /** Reason */
      reason: "wrong-role",
      requiredRole,
      currentRole,
      resource,
    }),
  /** Insufficient Permissions */
  insufficientPermissions: (requiredRole?: string, resource?: string) =>
    forbiddenUrl({
      /** Reason */
      reason: "insufficient-permissions",
      requiredRole,
      resource,
    }),
  /** Account Suspended */
  accountSuspended: (details?: string) =>
    forbiddenUrl({
      /** Reason */
      reason: "account-suspended",
      details,
    }),
  /** Email Not Verified */
  emailNotVerified: (resource?: string) =>
    forbiddenUrl({
      /** Reason */
      reason: "email-not-verified",
      resource,
    }),
};
