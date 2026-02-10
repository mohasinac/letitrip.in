/**
 * Error Tracking and Reporting
 *
 * Centralizes error logging to Firebase Crashlytics and custom error reporting
 */

import { Logger } from "@/classes";

const logger = Logger.getInstance({ enableFileLogging: true });

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  API = "api",
  DATABASE = "database",
  VALIDATION = "validation",
  NETWORK = "network",
  PERMISSION = "permission",
  UI = "ui",
  UNKNOWN = "unknown",
}

/**
 * Error context information
 */
export interface ErrorContext {
  userId?: string;
  userRole?: string;
  page?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Tracked error information
 */
export interface TrackedError {
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: ErrorContext;
  timestamp: string;
}

/**
 * Track an error with context
 *
 * @example
 * trackError(error, {
 *   category: ErrorCategory.API,
 *   severity: ErrorSeverity.HIGH,
 *   context: {
 *     page: '/products',
 *     action: 'fetch_products'
 *   }
 * });
 */
export const trackError = (
  error: Error | unknown,
  options: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    context?: ErrorContext;
  } = {},
): void => {
  const {
    category = ErrorCategory.UNKNOWN,
    severity = ErrorSeverity.MEDIUM,
    context = {},
  } = options;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const trackedError: TrackedError = {
    message: errorMessage,
    stack: errorStack,
    category,
    severity,
    context,
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    logger.error(`[${severity.toUpperCase()}] ${category}: ${errorMessage}`, {
      stack: errorStack,
      context: Object.keys(context).length > 0 ? context : undefined,
    });
  }

  // Log to file system via Logger
  logger.error(`${category}: ${errorMessage}`, {
    ...trackedError,
    stack: errorStack,
  });

  // In production, this would also send to Crashlytics
  // TODO: Implement Firebase Crashlytics integration when SDK is added
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    // Firebase Crashlytics would be initialized here
    // crashlytics().recordError(error);
    // crashlytics().setAttributes({
    //   category,
    //   severity,
    //   ...context
    // });
  }
};

/**
 * Track API errors specifically
 *
 * @example
 * try {
 *   await fetch('/api/products');
 * } catch (error) {
 *   trackApiError(error, {
 *     endpoint: '/api/products',
 *     method: 'GET',
 *     statusCode: 500
 *   });
 * }
 */
export const trackApiError = (
  error: Error | unknown,
  details: {
    endpoint: string;
    method: string;
    statusCode?: number;
    responseBody?: unknown;
  },
): void => {
  trackError(error, {
    category: ErrorCategory.API,
    severity:
      details.statusCode && details.statusCode >= 500
        ? ErrorSeverity.HIGH
        : ErrorSeverity.MEDIUM,
    context: {
      metadata: details,
    },
  });
};

/**
 * Track authentication errors
 *
 * @example
 * trackAuthError(error, {
 *   action: 'login',
 *   provider: 'email'
 * });
 */
export const trackAuthError = (
  error: Error | unknown,
  details: {
    action: "login" | "register" | "logout" | "verify" | "reset_password";
    provider?: "email" | "google" | "apple";
  },
): void => {
  trackError(error, {
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    context: {
      action: details.action,
      metadata: { provider: details.provider },
    },
  });
};

/**
 * Track validation errors
 *
 * @example
 * trackValidationError('Invalid email format', {
 *   field: 'email',
 *   value: 'invalid@'
 * });
 */
export const trackValidationError = (
  message: string,
  details: {
    field: string;
    value?: unknown;
    rule?: string;
  },
): void => {
  trackError(new Error(message), {
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    context: {
      metadata: details,
    },
  });
};

/**
 * Track database errors
 *
 * @example
 * trackDatabaseError(error, {
 *   operation: 'create',
 *   collection: 'products'
 * });
 */
export const trackDatabaseError = (
  error: Error | unknown,
  details: {
    operation: "create" | "read" | "update" | "delete" | "query";
    collection: string;
    documentId?: string;
  },
): void => {
  trackError(error, {
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    context: {
      metadata: details,
    },
  });
};

/**
 * Track UI component errors
 *
 * @example
 * trackComponentError(error, {
 *   component: 'ProductCard',
 *   props: { productId: '123' }
 * });
 */
export const trackComponentError = (
  error: Error | unknown,
  details: {
    component: string;
    props?: Record<string, unknown>;
  },
): void => {
  trackError(error, {
    category: ErrorCategory.UI,
    severity: ErrorSeverity.MEDIUM,
    context: {
      component: details.component,
      metadata: { props: details.props },
    },
  });
};

/**
 * Track permission/authorization errors
 *
 * @example
 * trackPermissionError('User lacks admin access', {
 *   requiredRole: 'admin',
 *   userRole: 'user',
 *   resource: 'users'
 * });
 */
export const trackPermissionError = (
  message: string,
  details: {
    requiredRole?: string;
    userRole?: string;
    resource?: string;
  },
): void => {
  trackError(new Error(message), {
    category: ErrorCategory.PERMISSION,
    severity: ErrorSeverity.HIGH,
    context: {
      metadata: details,
    },
  });
};

/**
 * Set user context for error tracking
 * Call this when user logs in
 *
 * @example
 * setErrorTrackingUser({
 *   userId: '123',
 *   userRole: 'seller',
 *   email: 'user@example.com'
 * });
 */
export const setErrorTrackingUser = (user: {
  userId: string;
  userRole: string;
  email?: string;
}): void => {
  // Store in global context for future error reports
  if (typeof window !== "undefined") {
    (window as any).__errorTrackingUser = user;
  }

  // TODO: Set user in Crashlytics when SDK is added
  // crashlytics().setUserId(user.userId);
  // crashlytics().setAttributes({
  //   role: user.userRole,
  //   email: user.email
  // });
};

/**
 * Clear user context (on logout)
 */
export const clearErrorTrackingUser = (): void => {
  if (typeof window !== "undefined") {
    delete (window as any).__errorTrackingUser;
  }

  // TODO: Clear user in Crashlytics when SDK is added
  // crashlytics().setUserId('');
};

/**
 * Get current error tracking user context
 */
const getErrorTrackingUser = (): ErrorContext | undefined => {
  if (typeof window === "undefined") return undefined;
  return (window as any).__errorTrackingUser;
};

/**
 * Create an error handler for async operations
 *
 * @example
 * const handleAsync = withErrorTracking(ErrorCategory.API, ErrorSeverity.HIGH);
 * await handleAsync(async () => {
 *   return await fetch('/api/products');
 * });
 */
export const withErrorTracking = <T>(
  category: ErrorCategory,
  severity: ErrorSeverity,
  context?: ErrorContext,
) => {
  return async (operation: () => Promise<T>): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      trackError(error, {
        category,
        severity,
        context: {
          ...context,
          ...getErrorTrackingUser(),
        },
      });
      throw error;
    }
  };
};

/**
 * Global error handler setup
 * Call this once in the app initialization
 */
export const setupGlobalErrorHandler = (): void => {
  if (typeof window === "undefined") return;

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    trackError(event.reason, {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      context: {
        page: window.location.pathname,
        ...getErrorTrackingUser(),
      },
    });
  });

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    trackError(event.error, {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.CRITICAL,
      context: {
        page: window.location.pathname,
        ...getErrorTrackingUser(),
      },
    });
  });
};
