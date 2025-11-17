/**
 * Error Redirect Utilities
 * Helper functions to generate meaningful error page URLs with context
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

interface ErrorRedirectParams {
  reason?: ErrorReason;
  resource?: string;
  requiredRole?: string;
  currentRole?: string;
  details?: string;
  error?: Error | unknown;
}

/**
 * Generate a 404 Not Found URL with context
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
        `Stack: ${params.error.stack.split("\n").slice(0, 3).join("\n")}`
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
  product: (slug: string, error?: Error) =>
    notFoundUrl({
      reason: "product-not-found",
      resource: slug,
      error,
    }),
  shop: (slug: string, error?: Error) =>
    notFoundUrl({
      reason: "shop-not-found",
      resource: slug,
      error,
    }),
  auction: (slug: string, error?: Error) =>
    notFoundUrl({
      reason: "auction-not-found",
      resource: slug,
      error,
    }),
  category: (slug: string, error?: Error) =>
    notFoundUrl({
      reason: "category-not-found",
      resource: slug,
      error,
    }),
  order: (orderId: string, error?: Error) =>
    notFoundUrl({
      reason: "order-not-found",
      resource: orderId,
      error,
    }),
};

/**
 * Quick helper for common 401 scenarios
 */
export const unauthorized = {
  notLoggedIn: (resource?: string) =>
    unauthorizedUrl({
      reason: "not-logged-in",
      resource,
    }),
  sessionExpired: (resource?: string) =>
    unauthorizedUrl({
      reason: "session-expired",
      resource,
    }),
  invalidToken: (resource?: string, error?: Error) =>
    unauthorizedUrl({
      reason: "invalid-token",
      resource,
      error,
    }),
};

/**
 * Quick helper for common 403 scenarios
 */
export const forbidden = {
  wrongRole: (requiredRole: string, currentRole?: string, resource?: string) =>
    forbiddenUrl({
      reason: "wrong-role",
      requiredRole,
      currentRole,
      resource,
    }),
  insufficientPermissions: (requiredRole?: string, resource?: string) =>
    forbiddenUrl({
      reason: "insufficient-permissions",
      requiredRole,
      resource,
    }),
  accountSuspended: (details?: string) =>
    forbiddenUrl({
      reason: "account-suspended",
      details,
    }),
  emailNotVerified: (resource?: string) =>
    forbiddenUrl({
      reason: "email-not-verified",
      resource,
    }),
};
