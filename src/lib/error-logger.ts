/**
 * @fileoverview TypeScript Module
 * @module src/lib/error-logger
 * @description This file contains functionality related to error-logger
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Centralized Error Logger
 * Provides consistent error logging across the application
 * Integrates with Firebase Analytics and can be extended for other services
 */

import { logError as firebaseLogError } from "@/lib/firebase-error-logger";

/**
 * Error Severity enumeration
 * @enum
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * ErrorContext interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorContext
 */
export interface ErrorContext {
  /** Component */
  component?: string;
  /** Action */
  action?: string;
  /** User Id */
  userId?: string;
  /** Url */
  url?: string;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * LoggedError interface
 * 
 * @interface
 * @description Defines the structure and contract for LoggedError
 */
export interface LoggedError {
  /** Message */
  message: string;
  /** Severity */
  severity: ErrorSeverity;
  /** Context */
  context: ErrorContext;
  /** Timestamp */
  timestamp: Date;
  /** Stack */
  stack?: string;
}

/**
 * ErrorLoggerClass class
 * 
 * @class
 * @description Description of ErrorLoggerClass class functionality
 */
class ErrorLoggerClass {
  private errors: LoggedError[] = [];
  private maxStoredErrors = 100;

  /**
   * Log an error with context
   */
  log(
    /** Error */
    error: Error | string,
    /** Context */
    context: ErrorContext = {},
    /** Severity */
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): void {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack = typeof error === "string" ? undefined : error.stack;

    const loggedError: LoggedError = {
      /** Message */
      message: errorMessage,
      severity,
      context,
      /** Timestamp */
      timestamp: new Date(),
      /** Stack */
      stack: errorStack,
    };

    // Store in memory (for debugging)
    this.errors.push(loggedError);
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      const prefix = this.getSeverityPrefix(severity);

      // Use appropriate console method based on severity
      if (
        severity === ErrorSeverity.CRITICAL ||
        severity === ErrorSeverity.HIGH
      ) {
        console.error(`${prefix} [${context.component || "Unknown"}]`, {
          /** Message */
          message: errorMessage,
          context,
          /** Stack */
          stack: errorStack,
        });
      } else if (severity === ErrorSeverity.MEDIUM) {
        console.warn(`${prefix} [${context.component || "Unknown"}]`, {
          /** Message */
          message: errorMessage,
          context,
        });
      } else {
        // LOW severity - use info
        console.info(`${prefix} [${context.component || "Unknown"}]`, {
          /** Message */
          message: errorMessage,
          context,
        });
      }
    }

    // Always log critical and high severity errors
    if (
      severity === ErrorSeverity.CRITICAL ||
      severity === ErrorSeverity.HIGH
    ) {
      console.error("[ERROR]", {
        /** Message */
        message: errorMessage,
        severity,
        context,
        timestamp: loggedError.timestamp.toISOString(), // Safe: timestamp is always Date in LoggedError
      });
    }

    // Log to Firebase Analytics
    try {
      firebaseLogError(error as Error, context, severity);
    } catch (firebaseError) {
      // Fail silently to avoid infinite loops
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to log to Firebase:", firebaseError);
      }
    }
  }

  /**
   * Log info message (non-error)
   */
  info(message: string, context: ErrorContext = {}): void {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[INFO] [${context.component || "Unknown"}]`,
        message,
        context
      );
    }
  }

  /**
   * Log warning
   */
  warn(message: string, context: ErrorContext = {}): void {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[WARN] [${context.component || "Unknown"}]`,
        message,
        context
      );
    }
  }

  /**
   * Log API error
   */
  logAPIError(
    /** Endpoint */
    endpoint: string,
    /** Error */
    error: Error | string,
    /** Status Code */
    statusCode?: number
  ): void {
    this.log(
      error,
      {
        /** Component */
        component: "API",
        /** Action */
        action: endpoint,
        /** Metadata */
        metadata: { statusCode },
      },
      statusCode && statusCode >= 500
        ? ErrorSeverity.HIGH
        : ErrorSeverity.MEDIUM
    );
  }

  /**
   * Log service error
   */
  logServiceError(
    /** Service */
    service: string,
    /** Method */
    method: string,
    /** Error */
    error: Error | string
  ): void {
    this.log(
      error,
      {
        /** Component */
        component: `${service}Service`,
        /** Action */
        action: method,
      },
      ErrorSeverity.MEDIUM
    );
  }

  /**
   * Log component error
   */
  logComponentError(
    /** Component */
    component: string,
    /** Action */
    action: string,
    /** Error */
    error: Error | string
  ): void {
    this.log(
      error,
      {
        component,
        action,
      },
      ErrorSeverity.LOW
    );
  }

  /**
   * Log validation error
   */
  logValidationError(
    /** Field */
    field: string,
    /** Message */
    message: string,
    /** Context */
    context: ErrorContext = {}
  ): void {
    this.log(
      `Validation failed for ${field}: ${message}`,
      {
        ...context,
        /** Component */
        component: context.component || "Validation",
        /** Metadata */
        metadata: { field, ...context.metadata },
      },
      ErrorSeverity.LOW
    );
  }

  /**
   * Log authentication error
   */
  logAuthError(error: Error | string, context: ErrorContext = {}): void {
    this.log(
      error,
      {
        ...context,
        /** Component */
        component: "Auth",
      },
      ErrorSeverity.HIGH
    );
  }

  /**
   * Log performance issue
   */
  logPerformanceIssue(
    /** Operation */
    operation: string,
    /** Duration */
    duration: number,
    /** Threshold */
    threshold: number,
    /** Context */
    context: ErrorContext = {}
  ): void {
    if (duration > threshold) {
      this.warn(
        `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
        {
          ...context,
          /** Component */
          component: context.component || "Performance",
          /** Metadata */
          metadata: { operation, duration, threshold, ...context.metadata },
        }
      );
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): LoggedError[] {
    return this.errors.slice(-count);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): LoggedError[] {
    return this.errors.filter((e) => e.severity === severity);
  }

  /**
   * Clear stored errors
   */
  clear(): void {
    this.errors = [];
  }

  /**
   * Get severity prefix for console output
   */
  private getSeverityPrefix(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "🔴 CRITICAL";
      case ErrorSeverity.HIGH:
        return "🟠 HIGH";
      case ErrorSeverity.MEDIUM:
        return "🟡 MEDIUM";
      case ErrorSeverity.LOW:
        return "🟢 LOW";
      /** Default */
      default:
        return "ℹ️";
    }
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }
}

// Export singleton instance
/**
 * E
 * @constant
 */
export const ErrorLogger = new ErrorLoggerClass();

// Export helper functions for common use cases
/**
 * Performs log error operation
 *
 * @param {Error | string} error - Error object
 * @param {ErrorContext} [context] - The context
 * @param {ErrorSeverity} [severity] - The severity
 *
 * @returns {any} The logerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logError(error, context, severity);
 */

/**
 * Performs log error operation
 *
 * @returns {any} The logerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logError();
 */

export const logError = (
  /** Error */
  error: Error | string,
  /** Context */
  context?: ErrorContext,
  /** Severity */
  severity?: ErrorSeverity
) => ErrorLogger.log(error, context, severity);

/**
 * Performs log a p i error operation
 *
 * @param {string} endpoint - The endpoint
 * @param {Error | string} error - Error object
 * @param {number} [statusCode] - The status code
 *
 * @returns {string} The logapierror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logAPIError("example", error, 123);
 */

/**
 * Performs log a p i error operation
 *
 * @returns {string} The logapierror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logAPIError();
 */

export const logAPIError = (
  /** Endpoint */
  endpoint: string,
  /** Error */
  error: Error | string,
  /** Status Code */
  statusCode?: number
) => ErrorLogger.logAPIError(endpoint, error, statusCode);

/**
 * Performs log service error operation
 *
 * @param {string} service - The service
 * @param {string} method - The method
 * @param {Error | string} error - Error object
 *
 * @returns {string} The logserviceerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logServiceError("example", "example", error);
 */

/**
 * Performs log service error operation
 *
 * @returns {string} The logserviceerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logServiceError();
 */

export const logServiceError = (
  /** Service */
  service: string,
  /** Method */
  method: string,
  /** Error */
  error: Error | string
) => ErrorLogger.logServiceError(service, method, error);

/**
 * Performs log component error operation
 *
 * @param {string} component - The component
 * @param {string} action - The action
 * @param {Error | string} error - Error object
 *
 * @returns {string} The logcomponenterror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logComponentError("example", "example", error);
 */

/**
 * Performs log component error operation
 *
 * @returns {string} The logcomponenterror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logComponentError();
 */

export const logComponentError = (
  /** Component */
  component: string,
  /** Action */
  action: string,
  /** Error */
  error: Error | string
) => ErrorLogger.logComponentError(component, action, error);

/**
 * Performs log validation error operation
 *
 * @param {string} field - The field
 * @param {string} message - The message
 * @param {ErrorContext} [context] - The context
 *
 * @returns {string} The logvalidationerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logValidationError("example", "example", context);
 */

/**
 * Performs log validation error operation
 *
 * @returns {string} The logvalidationerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logValidationError();
 */

export const logValidationError = (
  /** Field */
  field: string,
  /** Message */
  message: string,
  /** Context */
  context?: ErrorContext
) => ErrorLogger.logValidationError(field, message, context);

/**
 * Performs log auth error operation
 *
 * @param {Error | string} error - Error object
 * @param {ErrorContext} [context] - The context
 *
 * @returns {string} The logautherror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logAuthError(error, context);
 */

/**
 * Performs log auth error operation
 *
 * @param {Error | string} error - Error object
 * @param {ErrorContext} [context] - The context
 *
 * @returns {any} The logautherror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logAuthError(error, context);
 */

export const logAuthError = (error: Error | string, context?: ErrorContext) =>
  ErrorLogger.logAuthError(error, context);

/**
 * Performs log performance issue operation
 *
 * @returns {string} The logperformanceissue result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logPerformanceIssue();
 */

/**
 * Performs log performance issue operation
 *
 * @returns {string} The logperformanceissue result
 *
 * @example
 * logPerformanceIssue();
 */

export const logPerformanceIssue = (
  /** Operation */
  operation: string,
  /** Duration */
  duration: number,
  /** Threshold */
  threshold: number,
  /** Context */
  context?: ErrorContext
) => ErrorLogger.logPerformanceIssue(operation, duration, threshold, context);
