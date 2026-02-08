/**
 * Centralized Error Logging Utility
 *
 * Provides unified error logging utilities for both client and server contexts.
 * Automatically detects environment and uses appropriate logger.
 */

import { logger } from "@/classes";
import { AppError } from "@/lib/errors";

/**
 * Error context information for better debugging
 */
export interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  [key: string]: any;
}

/**
 * Client-side error logging with automatic file writing
 * Use this in React components, client hooks, and browser-only code
 */
export const logClientError = (
  message: string,
  error: unknown,
  context?: ErrorContext,
): void => {
  const errorData: Record<string, any> = {
    ...context,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    url: typeof window !== "undefined" ? window.location.href : "unknown",
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

  // Log using client logger with file logging enabled
  logger.error(message, errorData);
};

/**
 * Client-side warning logging
 */
export const logClientWarning = (
  message: string,
  data?: ErrorContext,
): void => {
  logger.warn(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Client-side info logging
 */
export const logClientInfo = (message: string, data?: ErrorContext): void => {
  logger.info(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Client-side debug logging
 */
export const logClientDebug = (message: string, data?: ErrorContext): void => {
  logger.debug(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log API errors from client-side fetch calls
 * Automatically extracts relevant information from Response objects
 */
export const logApiError = async (
  endpoint: string,
  response: Response,
  context?: ErrorContext,
): Promise<void> => {
  let responseBody: any;
  try {
    responseBody = await response.clone().json();
  } catch {
    responseBody = await response.clone().text();
  }

  logClientError(`API Error: ${endpoint}`, new Error(response.statusText), {
    ...context,
    endpoint,
    status: response.status,
    statusText: response.statusText,
    responseBody,
  });
};

/**
 * Log form validation errors
 */
export const logValidationError = (
  formName: string,
  errors: Record<string, any>,
  context?: ErrorContext,
): void => {
  logClientWarning(`Form validation failed: ${formName}`, {
    ...context,
    formName,
    validationErrors: errors,
  });
};

/**
 * Log navigation/routing errors
 */
export const logNavigationError = (
  route: string,
  error: unknown,
  context?: ErrorContext,
): void => {
  logClientError(`Navigation error to ${route}`, error, {
    ...context,
    route,
    type: "navigation",
  });
};

/**
 * Log authentication errors
 */
export const logAuthError = (
  operation: string,
  error: unknown,
  context?: ErrorContext,
): void => {
  logClientError(`Authentication error: ${operation}`, error, {
    ...context,
    operation,
    type: "authentication",
  });
};

/**
 * Log file upload errors
 */
export const logUploadError = (
  fileName: string,
  error: unknown,
  context?: ErrorContext,
): void => {
  logClientError(`File upload failed: ${fileName}`, error, {
    ...context,
    fileName,
    type: "upload",
  });
};

/**
 * Log payment/transaction errors
 */
export const logPaymentError = (
  transactionId: string,
  error: unknown,
  context?: ErrorContext,
): void => {
  logClientError(`Payment error: ${transactionId}`, error, {
    ...context,
    transactionId,
    type: "payment",
  });
};

/**
 * Log general application errors with categorization
 */
export const logApplicationError = (
  category: string,
  message: string,
  error: unknown,
  context?: ErrorContext,
): void => {
  logClientError(`[${category}] ${message}`, error, {
    ...context,
    category,
  });
};

/**
 * Initialize client logger with production settings
 * Call this in your root layout or app initialization
 */
export const initializeClientLogger = (): void => {
  // Enable file logging for errors in production
  logger.error.bind(logger); // Ensure binding is correct

  // Set up global error handlers
  if (typeof window !== "undefined") {
    // Catch unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      logClientError("Unhandled Promise Rejection", event.reason, {
        type: "unhandled-rejection",
      });
    });

    // Catch global errors
    window.addEventListener("error", (event) => {
      logClientError("Global Error", event.error || event.message, {
        type: "global-error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }
};
