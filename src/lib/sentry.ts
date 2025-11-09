/**
 * Sentry Error Monitoring Integration
 * Production error tracking and performance monitoring
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry for error tracking
 * Call this in instrumentation.ts or _app.tsx
 */
export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("⚠️ SENTRY_DSN not configured. Error monitoring disabled.");
    return;
  }

  const environment = process.env.NODE_ENV || "development";
  const release = process.env.NEXT_PUBLIC_APP_VERSION || "unknown";

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment,
    release: `justforview@${release}`,

    // Adjust sample rates for production
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    profilesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Ignore common non-critical errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",

      // Random browser errors
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",

      // Network errors
      "NetworkError",
      "Network request failed",
      "Failed to fetch",

      // User cancellations
      "AbortError",
      "The user aborted a request",
    ],

    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive query parameters
      if (event.request?.url) {
        const url = new URL(event.request.url);
        ["password", "token", "key", "secret"].forEach((param) => {
          url.searchParams.delete(param);
        });
        event.request.url = url.toString();
      }

      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
        delete event.request.headers["x-api-key"];
      }

      // Remove sensitive data from error messages
      if (event.exception?.values) {
        event.exception.values = event.exception.values.map((exception) => {
          if (exception.value) {
            exception.value = exception.value
              .replace(/password=[\w\d]+/gi, "password=***")
              .replace(/token=[\w\d]+/gi, "token=***")
              .replace(/key=[\w\d]+/gi, "key=***");
          }
          return exception;
        });
      }

      return event;
    },

    // Add breadcrumbs for better debugging
    beforeBreadcrumb(breadcrumb) {
      // Don't log fetch requests to external analytics
      if (breadcrumb.category === "fetch" && breadcrumb.data?.url) {
        const url = breadcrumb.data.url;
        if (url.includes("google-analytics") || url.includes("facebook.com")) {
          return null;
        }
      }

      return breadcrumb;
    },

    // Replay sample rates
    replaysSessionSampleRate: environment === "production" ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log("✅ Sentry initialized");
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: {
    level?: Sentry.SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: {
      id?: string;
      email?: string;
      username?: string;
    };
  },
) {
  Sentry.withScope((scope) => {
    if (context?.level) {
      scope.setLevel(context.level);
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.user) {
      scope.setUser(context.user);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture message (for non-exception events)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  },
) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureMessage(message);
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category?: string,
  level?: Sentry.SeverityLevel,
) {
  Sentry.addBreadcrumb({
    message,
    data,
    category: category || "custom",
    level: level || "info",
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a span for performance monitoring
 */
export function startSpan(
  name: string,
  op: string,
  data?: Record<string, any>,
) {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: data,
    },
    () => {},
  );
}

/**
 * API route error handler wrapper
 */
export function withSentryErrorHandler<
  T extends (...args: any[]) => Promise<any>,
>(
  handler: T,
  context?: {
    route?: string;
    method?: string;
  },
): T {
  return (async (...args: Parameters<T>) => {
    try {
      const result = await handler(...args);
      return result;
    } catch (error) {
      // Capture error with context
      captureException(error as Error, {
        level: "error",
        tags: {
          route: context?.route || "unknown",
          method: context?.method || "unknown",
        },
      });

      throw error;
    }
  }) as T;
}

/**
 * React error boundary component
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Example usage in API route:
 *
 * ```typescript
 * import { withSentryErrorHandler, captureException } from '@/lib/sentry';
 *
 * export const GET = withSentryErrorHandler(
 *   async (req: NextRequest) => {
 *     try {
 *       // Your code here
 *     } catch (error) {
 *       captureException(error, {
 *         level: 'error',
 *         tags: { endpoint: '/api/products' },
 *         extra: { filters: req.query },
 *       });
 *       throw error;
 *     }
 *   },
 *   { route: '/api/products', method: 'GET' }
 * );
 * ```
 *
 * Example usage in components:
 *
 * ```tsx
 * import { SentryErrorBoundary, captureException } from '@/lib/sentry';
 *
 * export default function MyApp({ Component, pageProps }) {
 *   return (
 *     <SentryErrorBoundary fallback={<ErrorPage />}>
 *       <Component {...pageProps} />
 *     </SentryErrorBoundary>
 *   );
 * }
 * ```
 */
