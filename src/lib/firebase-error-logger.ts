/**
 * @fileoverview TypeScript Module
 * @module src/lib/firebase-error-logger
 * @description This file contains functionality related to firebase-error-logger
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Firebase Error Logging (FREE tier alternative to Sentry)
 * Uses Firebase Analytics for error tracking
 */

import { analytics } from "@/app/api/lib/firebase/app";
import { logEvent } from "firebase/analytics";

/**
 * ErrorSeverity type
 * 
 * @typedef {Object} ErrorSeverity
 * @description Type definition for ErrorSeverity
 */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

/**
 * ErrorContext interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorContext
 */
interface ErrorContext {
  /** User Id */
  userId?: string;
  /** Url */
  url?: string;
  /** Component */
  component?: string;
  /** Action */
  action?: string;
  /** Metadata */
  metadata?: Record<string, any>;
  [key: string]: any; // Allow any additional context fields
}

/**
 * Log error to Firebase Analytics
 */
/**
 * Performs log error operation
 *
 * @param {Error | string} error - Error object
 * @param {ErrorContext} [context] - The context
 * @param {ErrorSeverity} [severity] - The severity
 *
 * @returns {Promise<any>} Promise resolving to logerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logError(error, context, severity);
 */

/**
 * Performs log error operation
 *
 * @returns {Promise<any>} Promise resolving to logerror result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * logError();
 */

export async function logError(
  /** Error */
  error: Error | string,
  /** Context */
  context: ErrorContext = {},
  /** Severity */
  severity: ErrorSeverity = "medium"
): Promise<void> {
  const errorMessage = typeof error === "string" ? error : error.message;
  const errorStack = typeof error === "string" ? undefined : error.stack;

  try {
    // Log to Firebase Analytics (FREE tier)
    if (analytics && typeof globalThis !== "undefined" && globalThis.document) {
      logEvent(analytics, "exception", {
        /** Description */
        description: errorMessage,
        /** Fatal */
        fatal: severity === "critical",
        ...context,
      });
    }

    // Console log in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Logger]", {
        /** Message */
        message: errorMessage,
        severity,
        context,
        /** Stack */
        stack: errorStack,
      });
    }

    // Console log critical errors in production (for server logs)
    if (
      process.env.NODE_ENV === "production" &&
      (severity === "critical" || severity === "high")
    ) {
      console.error("[CRITICAL ERROR]", {
        /** Message */
        message: errorMessage,
        severity,
        context,
        /** Stack */
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
/**
 * Performs log performance operation
 *
 * @param {string} metricName - Name of metric
 * @param {number} duration - The duration
 * @param {Record<string, any>} [metadata] - The metadata
 *
 * @returns {void} No return value
 *
 * @example
 * logPerformance("example", 123, metadata);
 */

/**
 * Performs log performance operation
 *
 * @returns {string} The logperformance result
 *
 * @example
 * logPerformance();
 */

export function logPerformance(
  /** Metric Name */
  metricName: string,
  /** Duration */
  duration: number,
  /** Metadata */
  metadata?: Record<string, any>
): void {
  try {
    if (analytics && typeof globalThis !== "undefined" && globalThis.document) {
      logEvent(analytics, "timing_complete", {
        /** Name */
        name: metricName,
        /** Value */
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
/**
 * Performs log user action operation
 *
 * @param {string} action - The action
 * @param {Record<string, any>} [metadata] - The metadata
 *
 * @returns {void} No return value
 *
 * @example
 * logUserAction("example", metadata);
 */

/**
 * Performs log user action operation
 *
 * @returns {string} The loguseraction result
 *
 * @example
 * logUserAction();
 */

export function logUserAction(
  /** Action */
  action: string,
  /** Metadata */
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
/**
 * Performs init error handlers operation
 *
 * @returns {void} No return value
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * initErrorHandlers();
 */

/**
 * Performs init error handlers operation
 *
 * @returns {void} No return value
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * initErrorHandlers();
 */

export function initErrorHandlers(): void {
  if (typeof globalThis === "undefined" || !globalThis.addEventListener) return;

  // Global error handler
  globalThis.addEventListener("error", (event) => {
    logError(
      (event as ErrorEvent).error || (event as ErrorEvent).message,
      {
        /** Url */
        url: globalThis.location?.href,
        /** Component */
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
        /** Url */
        url: globalThis.location?.href,
        /** Component */
        component: "promise",
      },
      "high"
    );
  });
}
