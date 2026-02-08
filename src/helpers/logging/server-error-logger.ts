/**
 * Server-Side Error Logging Utility
 *
 * Provides error logging utilities specifically for server-side contexts.
 * Use in API routes, server components, and server actions.
 *
 * IMPORTANT: Only import this file in server-side code (API routes, server components)
 * For client-side code, use error-logger.ts
 */

import { serverLogger } from "@/lib/server-logger";
import { AppError } from "@/lib/errors";
import { type NextRequest } from "next/server";

/**
 * Server error context information
 */
export interface ServerErrorContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  requestId?: string;
  [key: string]: any;
}

/**
 * Extract request metadata for logging
 */
export const extractRequestMetadata = (request: NextRequest) => {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent") || "unknown",
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown",
    referer: request.headers.get("referer") || "none",
  };
};

/**
 * Log server-side errors with full context
 */
export const logServerError = (
  message: string,
  error: unknown,
  context?: ServerErrorContext,
): void => {
  const errorData: Record<string, any> = {
    ...context,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof Error) {
    errorData.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  } else if (error instanceof AppError) {
    errorData.error = {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      data: error.data,
    };
  } else {
    errorData.error = error;
  }

  serverLogger.error(message, errorData);
};

/**
 * Log server-side warnings
 */
export const logServerWarning = (
  message: string,
  data?: ServerErrorContext,
): void => {
  serverLogger.warn(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log server-side info
 */
export const logServerInfo = (
  message: string,
  data?: ServerErrorContext,
): void => {
  serverLogger.info(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log server-side debug
 */
export const logServerDebug = (
  message: string,
  data?: ServerErrorContext,
): void => {
  serverLogger.debug(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log API route errors with automatic request metadata extraction
 */
export const logApiRouteError = (
  endpoint: string,
  error: unknown,
  request?: NextRequest,
  context?: ServerErrorContext,
): void => {
  const fullContext = {
    ...context,
    endpoint,
    ...(request && extractRequestMetadata(request)),
  };

  logServerError(`API Route Error: ${endpoint}`, error, fullContext);
};

/**
 * Log database operation errors
 */
export const logDatabaseError = (
  operation: string,
  collection: string,
  error: unknown,
  context?: ServerErrorContext,
): void => {
  logServerError(`Database Error: ${operation} on ${collection}`, error, {
    ...context,
    operation,
    collection,
    type: "database",
  });
};

/**
 * Log authentication errors on server
 */
export const logServerAuthError = (
  operation: string,
  error: unknown,
  context?: ServerErrorContext,
): void => {
  logServerError(`Authentication Error: ${operation}`, error, {
    ...context,
    operation,
    type: "authentication",
  });
};

/**
 * Log authorization errors on server
 */
export const logAuthorizationError = (
  userId: string,
  resource: string,
  action: string,
  context?: ServerErrorContext,
): void => {
  logServerWarning(
    `Authorization Failed: User ${userId} attempted ${action} on ${resource}`,
    {
      ...context,
      userId,
      resource,
      action,
      type: "authorization",
    },
  );
};

/**
 * Log email sending errors
 */
export const logEmailError = (
  recipient: string,
  error: unknown,
  context?: ServerErrorContext,
): void => {
  logServerError(`Email Send Failed to ${recipient}`, error, {
    ...context,
    recipient,
    type: "email",
  });
};

/**
 * Log file storage errors
 */
export const logStorageError = (
  operation: string,
  filePath: string,
  error: unknown,
  context?: ServerErrorContext,
): void => {
  logServerError(`Storage Error: ${operation} on ${filePath}`, error, {
    ...context,
    operation,
    filePath,
    type: "storage",
  });
};

/**
 * Log external API integration errors
 */
export const logExternalApiError = (
  serviceName: string,
  endpoint: string,
  error: unknown,
  context?: ServerErrorContext,
): void => {
  logServerError(`External API Error: ${serviceName} - ${endpoint}`, error, {
    ...context,
    serviceName,
    endpoint,
    type: "external-api",
  });
};

/**
 * Performance/slow query logging
 */
export const logSlowOperation = (
  operation: string,
  duration: number,
  threshold: number = 1000,
  context?: ServerErrorContext,
): void => {
  if (duration > threshold) {
    logServerWarning(`Slow Operation: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
      threshold,
      type: "performance",
    });
  }
};

/**
 * Security event logging
 */
export const logSecurityEvent = (
  event: string,
  severity: "info" | "warn" | "error",
  context?: ServerErrorContext,
): void => {
  const message = `Security Event: ${event}`;
  const fullContext = {
    ...context,
    event,
    type: "security",
  };

  switch (severity) {
    case "error":
      serverLogger.error(message, fullContext);
      break;
    case "warn":
      serverLogger.warn(message, fullContext);
      break;
    case "info":
      serverLogger.info(message, fullContext);
      break;
  }
};
