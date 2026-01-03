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
  [key: string]: any; // Allow any additional context fields
}

/**
 * Log error to Firebase Analytics
 */
export async function logError(
  error: Error | string | unknown,
  context: ErrorContext = {},
  severity: ErrorSeverity = "medium"
): Promise<void> {
  let errorMessage = "Unknown error";
  let errorStack: string | undefined;

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message || "Unknown error";
    errorStack = error.stack;
  } else if (error && typeof error === "object") {
    errorMessage = (error as any).message || JSON.stringify(error);
    errorStack = (error as any).stack;
  }

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
  metadata?: Record<string, any>
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
  metadata?: Record<string, any>
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
      "high"
    );
  });

  // Unhandled promise rejection handler
  globalThis.addEventListener("unhandledrejection", (event) => {
    logError(
      (event as PromiseRejectionEvent).reason instanceof Error
        ? (event as PromiseRejectionEvent).reason
        : String((event as PromiseRejectionEvent).reason),
      {
        url: globalThis.location?.href,
        component: "promise",
      },
      "high"
    );
  });
}
