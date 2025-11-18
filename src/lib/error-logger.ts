/**
 * Centralized Error Logger
 * Provides consistent error logging across the application
 * Integrates with Firebase Analytics and can be extended for other services
 */

import { logError as firebaseLogError } from "@/lib/firebase-error-logger";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface LoggedError {
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: Date;
  stack?: string;
}

class ErrorLoggerClass {
  private errors: LoggedError[] = [];
  private maxStoredErrors = 100;

  /**
   * Log an error with context
   */
  log(
    error: Error | string,
    context: ErrorContext = {},
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): void {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack = typeof error === "string" ? undefined : error.stack;

    const loggedError: LoggedError = {
      message: errorMessage,
      severity,
      context,
      timestamp: new Date(),
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
      console.error(`${prefix} [${context.component || "Unknown"}]`, {
        message: errorMessage,
        context,
        stack: errorStack,
      });
    }

    // Always log critical and high severity errors
    if (
      severity === ErrorSeverity.CRITICAL ||
      severity === ErrorSeverity.HIGH
    ) {
      console.error("[ERROR]", {
        message: errorMessage,
        severity,
        context,
        timestamp: loggedError.timestamp.toISOString(),
      });
    }

    // Log to Firebase Analytics
    try {
      firebaseLogError(error, context, severity);
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
    endpoint: string,
    error: Error | string,
    statusCode?: number
  ): void {
    this.log(
      error,
      {
        component: "API",
        action: endpoint,
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
    service: string,
    method: string,
    error: Error | string
  ): void {
    this.log(
      error,
      {
        component: `${service}Service`,
        action: method,
      },
      ErrorSeverity.MEDIUM
    );
  }

  /**
   * Log component error
   */
  logComponentError(
    component: string,
    action: string,
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
    field: string,
    message: string,
    context: ErrorContext = {}
  ): void {
    this.log(
      `Validation failed for ${field}: ${message}`,
      {
        ...context,
        component: context.component || "Validation",
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
        component: "Auth",
      },
      ErrorSeverity.HIGH
    );
  }

  /**
   * Log performance issue
   */
  logPerformanceIssue(
    operation: string,
    duration: number,
    threshold: number,
    context: ErrorContext = {}
  ): void {
    if (duration > threshold) {
      this.warn(
        `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
        {
          ...context,
          component: context.component || "Performance",
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
export const ErrorLogger = new ErrorLoggerClass();

// Export helper functions for common use cases
export const logError = (
  error: Error | string,
  context?: ErrorContext,
  severity?: ErrorSeverity
) => ErrorLogger.log(error, context, severity);

export const logAPIError = (
  endpoint: string,
  error: Error | string,
  statusCode?: number
) => ErrorLogger.logAPIError(endpoint, error, statusCode);

export const logServiceError = (
  service: string,
  method: string,
  error: Error | string
) => ErrorLogger.logServiceError(service, method, error);

export const logComponentError = (
  component: string,
  action: string,
  error: Error | string
) => ErrorLogger.logComponentError(component, action, error);

export const logValidationError = (
  field: string,
  message: string,
  context?: ErrorContext
) => ErrorLogger.logValidationError(field, message, context);

export const logAuthError = (error: Error | string, context?: ErrorContext) =>
  ErrorLogger.logAuthError(error, context);

export const logPerformanceIssue = (
  operation: string,
  duration: number,
  threshold: number,
  context?: ErrorContext
) => ErrorLogger.logPerformanceIssue(operation, duration, threshold, context);
