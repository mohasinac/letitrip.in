/**
 * Firebase Error Logging (FREE tier alternative to Sentry)
 * Uses Firebase Analytics for error tracking
 */

import { analytics } from "@/app/api/lib/firebase/app";
import { logEvent } from "firebase/analytics";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface ErrorContext {
  userId?: string;
  url?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Log error to Firebase Analytics
 */
export async function logError(
  error: Error | string,
  context: ErrorContext = {},
  severity: ErrorSeverity = "medium",
): Promise<void> {
  const errorMessage = typeof error === "string" ? error : error.message;
  const errorStack = typeof error === "string" ? undefined : error.stack;

  try {
    // Log to Firebase Analytics (FREE tier)
    if (analytics && typeof globalThis !== "undefined" && globalThis.document) {
      logEvent(analytics, "exception", {
        description: errorMessage,
        fatal: severity === "critical",
        ...context,
      });
    }

    // Console log in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Logger]", {
        message: errorMessage,
        severity,
        context,
        stack: errorStack,
      });
    }

    // Console log critical errors in production (for server logs)
    if (
      process.env.NODE_ENV === "production" &&
      (severity === "critical" || severity === "high")
    ) {
      console.error("[CRITICAL ERROR]", {
        message: errorMessage,
        severity,
        context,
        stack: errorStack,
      });
    }
  } catch (loggingError) {
    // Fail silently to avoid infinite loops
    console.error("Failed to log error:", loggingError);
  }
}

/**
 * Log performance metrics to Firebase Analytics
 */
export function logPerformance(
  metricName: string,
  duration: number,
  metadata?: Record<string, any>,
): void {
  try {
    if (analytics && typeof globalThis !== "undefined" && globalThis.document) {
      logEvent(analytics, "timing_complete", {
        name: metricName,
        value: duration,
        ...metadata,
      });
    }
  } catch (error) {
    console.error("Failed to log performance:", error);
  }
}

/**
 * Log user action to Firebase Analytics
 */
export function logUserAction(
  action: string,
  metadata?: Record<string, any>,
): void {
  try {
    if (analytics && typeof globalThis !== "undefined" && globalThis.document) {
      logEvent(analytics, "user_action", {
        action,
        ...metadata,
      });
    }
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
}

/**
 * Initialize global error handlers
 */
export function initErrorHandlers(): void {
  if (typeof globalThis === "undefined" || !globalThis.addEventListener) return;

  // Global error handler
  globalThis.addEventListener("error", (event) => {
    logError(
      (event as ErrorEvent).error || (event as ErrorEvent).message,
      {
        url: globalThis.location?.href,
        component: "global",
      },
      "high",
    );
  });

  // Unhandled promise rejection handler
  globalThis.addEventListener("unhandledrejection", (event) => {
    logError(
      (event as PromiseRejectionEvent).reason instanceof Error ? (event as PromiseRejectionEvent).reason : String((event as PromiseRejectionEvent).reason),
      {
        url: globalThis.location?.href,
        component: "promise",
      },
      "high",
    );
  });
}
