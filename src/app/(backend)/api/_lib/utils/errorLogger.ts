export interface ErrorLogEntry {
  error: Error;
  errorInfo?: any;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  componentStack?: string;
}

class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private apiEndpoint = "/api/errors"; // You can create this API route later

  async logError(
    error: Error,
    errorInfo?: any,
    additionalContext?: Record<string, any>,
  ): Promise<void> {
    const logEntry: ErrorLogEntry = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "",
      componentStack: errorInfo?.componentStack,
      ...additionalContext,
    };

    // Always log to console in development
    if (this.isDevelopment) {
      console.group("🚨 Error Logger");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Additional Context:", additionalContext);
      console.error("Full Log Entry:", logEntry);
      console.groupEnd();
    }

    try {
      // In production, send to your error tracking service
      if (!this.isDevelopment) {
        // Option 1: Send to your own API
        await this.sendToAPI(logEntry);

        // Option 2: Send to external services like Sentry, LogRocket, etc.
        // this.sendToSentry(logEntry);
        // this.sendToLogRocket(logEntry);
      }
    } catch (loggingError) {
      // Only log in development to avoid console spam in production
      if (this.isDevelopment) {
        console.error("Failed to log error:", loggingError);
      }
    }
  }

  private async sendToAPI(logEntry: ErrorLogEntry): Promise<void> {
    try {
      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Fail silently in production to avoid infinite loops
      if (this.isDevelopment) {
        console.error("Failed to send error to API:", error);
      }
    }
  }

  // Example integration with Sentry (uncomment if you use Sentry)
  // private sendToSentry(logEntry: ErrorLogEntry): void {
  //   if (typeof window !== "undefined" && window.Sentry) {
  //     window.Sentry.captureException(logEntry.error, {
  //       extra: {
  //         errorInfo: logEntry.errorInfo,
  //         timestamp: logEntry.timestamp,
  //         url: logEntry.url,
  //         componentStack: logEntry.componentStack,
  //       },
  //     });
  //   }
  // }

  // Log performance issues
  logPerformanceIssue(
    operation: string,
    duration: number,
    threshold: number = 1000,
  ): void {
    if (duration > threshold) {
      this.logError(
        new Error(`Performance issue: ${operation} took ${duration}ms`),
        undefined,
        { operation, duration, threshold, type: "performance" },
      );
    }
  }

  // Log user actions for analytics
  logUserAction(action: string, context?: Record<string, any>): void {
    // Send user actions to analytics in production
    // In development, this could be enhanced with additional logging
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Utility function for timing operations
export function withPerformanceLogging<T>(
  operation: string,
  fn: () => T | Promise<T>,
  threshold?: number,
): T | Promise<T> {
  const start = performance.now();

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        errorLogger.logPerformanceIssue(operation, duration, threshold);
      });
    } else {
      const duration = performance.now() - start;
      errorLogger.logPerformanceIssue(operation, duration, threshold);
      return result;
    }
  } catch (error) {
    const duration = performance.now() - start;
    errorLogger.logError(error as Error, undefined, {
      operation,
      duration,
      type: "operation_error",
    });
    throw error;
  }
}

// Global error handler for unhandled errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    errorLogger.logError(new Error(event.message), undefined, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: "unhandled_error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    errorLogger.logError(
      new Error(`Unhandled promise rejection: ${event.reason}`),
      undefined,
      {
        reason: event.reason,
        type: "unhandled_rejection",
      },
    );
  });
}
