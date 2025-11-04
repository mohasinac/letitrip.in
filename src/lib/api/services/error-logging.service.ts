/**
 * Error Logging Service
 * Handles frontend error logging to the API
 */

import { apiClient } from "../client";

export interface ErrorLogEntry {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: any;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  componentStack?: string;
  additionalContext?: Record<string, any>;
}

export interface LogErrorOptions {
  errorInfo?: any;
  additionalContext?: Record<string, any>;
  source?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorLoggingService {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isClient = typeof window !== "undefined";

  /**
   * Log an error to the backend API
   */
  async logError(error: Error, options?: LogErrorOptions): Promise<void> {
    // Only log on client side
    if (!this.isClient) {
      return;
    }

    const logEntry: ErrorLogEntry = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: options?.errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      componentStack: options?.errorInfo?.componentStack,
      additionalContext: {
        ...options?.additionalContext,
        source: options?.source,
        severity: options?.severity || 'medium',
      },
    };

    // Always log to console in development
    if (this.isDevelopment) {
      console.group("🚨 Error Logging Service");
      console.error("Error:", error);
      if (options?.errorInfo) {
        console.error("Error Info:", options.errorInfo);
      }
      if (options?.additionalContext) {
        console.error("Additional Context:", options.additionalContext);
      }
      console.error("Full Log Entry:", logEntry);
      console.groupEnd();
    }

    try {
      // Send to API in both development and production
      await this.sendToAPI(logEntry);
    } catch (loggingError) {
      // Fail silently in production to avoid infinite loops
      if (this.isDevelopment) {
        console.error("Failed to log error to API:", loggingError);
      }
    }
  }

  /**
   * Log a component error (typically from Error Boundaries)
   */
  async logComponentError(
    error: Error,
    errorInfo: React.ErrorInfo,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    await this.logError(error, {
      errorInfo,
      additionalContext: {
        ...additionalContext,
        type: 'component_error',
      },
      source: 'ErrorBoundary',
      severity: 'high',
    });
  }

  /**
   * Log a performance issue
   */
  async logPerformanceIssue(
    operation: string,
    duration: number,
    threshold: number = 1000
  ): Promise<void> {
    if (duration > threshold) {
      const error = new Error(`Performance issue: ${operation} took ${duration}ms`);
      await this.logError(error, {
        additionalContext: {
          operation,
          duration,
          threshold,
          type: 'performance',
        },
        severity: duration > threshold * 2 ? 'high' : 'medium',
      });
    }
  }

  /**
   * Log a network error
   */
  async logNetworkError(
    url: string,
    error: Error,
    statusCode?: number,
    responseData?: any
  ): Promise<void> {
    await this.logError(error, {
      additionalContext: {
        url,
        statusCode,
        responseData,
        type: 'network_error',
      },
      source: 'Network',
      severity: statusCode && statusCode >= 500 ? 'high' : 'medium',
    });
  }

  /**
   * Log a user action error (e.g., form submission failures)
   */
  async logUserActionError(
    action: string,
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    await this.logError(error, {
      additionalContext: {
        action,
        ...context,
        type: 'user_action_error',
      },
      source: 'UserAction',
      severity: 'medium',
    });
  }

  /**
   * Send error log to the API endpoint
   */
  private async sendToAPI(logEntry: ErrorLogEntry): Promise<void> {
    try {
      await apiClient.post("/errors", logEntry);
    } catch (error) {
      // Fail silently to avoid infinite loops
      if (this.isDevelopment) {
        console.error("Failed to send error to API:", error);
      }
    }
  }

  /**
   * Batch log multiple errors (useful for offline scenarios)
   */
  async batchLogErrors(errors: Array<{ error: Error; options?: LogErrorOptions }>): Promise<void> {
    const promises = errors.map(({ error, options }) => 
      this.logError(error, options)
    );
    
    await Promise.allSettled(promises);
  }
}

// Export singleton instance
export const errorLoggingService = new ErrorLoggingService();

/**
 * Global error handlers setup
 * Call this in your root layout or app initialization
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    const error = new Error(event.message);
    error.stack = `${event.filename}:${event.lineno}:${event.colno}`;
    
    errorLoggingService.logError(error, {
      additionalContext: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: "unhandled_error",
      },
      source: "GlobalErrorHandler",
      severity: "high",
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    errorLoggingService.logError(error, {
      additionalContext: {
        reason: event.reason,
        type: "unhandled_rejection",
      },
      source: "GlobalErrorHandler",
      severity: "high",
    });
  });
}

/**
 * Utility function for timing operations with error logging
 */
export async function withPerformanceLogging<T>(
  operation: string,
  fn: () => T | Promise<T>,
  threshold?: number
): Promise<T> {
  const start = performance.now();

  try {
    const result = await Promise.resolve(fn());
    const duration = performance.now() - start;
    
    await errorLoggingService.logPerformanceIssue(operation, duration, threshold);
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    await errorLoggingService.logError(error as Error, {
      additionalContext: {
        operation,
        duration,
        type: "operation_error",
      },
      source: "PerformanceLogger",
      severity: "high",
    });
    
    throw error;
  }
}

/**
 * Higher-order component wrapper for error logging
 */
export function withErrorLogging<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await Promise.resolve(fn(...args));
    } catch (error) {
      await errorLoggingService.logError(error as Error, {
        additionalContext: {
          context,
          arguments: args,
        },
        source: context || "WrappedFunction",
        severity: "medium",
      });
      throw error;
    }
  }) as T;
}
