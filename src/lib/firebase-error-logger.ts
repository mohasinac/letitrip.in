/**
 * Firebase Error Logging (FREE tier alternative to Sentry)
 * Uses Firebase Analytics + Discord webhooks for error tracking
 */

import { analytics } from "@/app/api/lib/firebase/app";
import { logEvent } from "firebase/analytics";
import { notifyError } from "./discord-notifier";

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
  userId?: string;
  url?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Log error to Firebase Analytics and Discord
 */
export async function logError(
  error: Error | string,
  context: ErrorContext = {},
  severity: ErrorSeverity = 'medium'
): Promise<void> {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  try {
    // Log to Firebase Analytics (FREE tier)
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, 'exception', {
        description: errorMessage,
        fatal: severity === 'critical',
        ...context,
      });
    }

    // Log to Discord for critical/high severity errors
    if (severity === 'critical' || severity === 'high') {
      await notifyError(
        typeof error === 'string' ? new Error(error) : error,
        { ...context, severity }
      );
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Logger]', {
        message: errorMessage,
        severity,
        context,
        stack: errorStack,
      });
    }
  } catch (loggingError) {
    // Fail silently to avoid infinite loops
    console.error('Failed to log error:', loggingError);
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
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, 'timing_complete', {
        name: metricName,
        value: duration,
        ...metadata,
      });
    }
  } catch (error) {
    console.error('Failed to log performance:', error);
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
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, 'user_action', {
        action,
        ...metadata,
      });
    }
  } catch (error) {
    console.error('Failed to log user action:', error);
  }
}

/**
 * Initialize global error handlers
 */
export function initErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Global error handler
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, {
      url: window.location.href,
      component: 'global',
    }, 'high');
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      {
        url: window.location.href,
        component: 'promise',
      },
      'high'
    );
  });
}
