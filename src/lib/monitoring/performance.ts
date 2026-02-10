/**
 * Firebase Performance Monitoring Integration
 *
 * Tracks page load times, API response times, and custom performance metrics
 */

import { getPerformance, trace, PerformanceTrace } from "firebase/performance";
import { app } from "@/lib/firebase/config";
import { logger } from "@/classes";

// Initialize Firebase Performance
let performance: ReturnType<typeof getPerformance> | null = null;

if (typeof window !== "undefined") {
  performance = getPerformance(app);
}

/**
 * Start a custom performance trace
 *
 * @example
 * const trace = startTrace('user_login');
 * // ... perform operation
 * stopTrace(trace);
 */
export const startTrace = (traceName: string): PerformanceTrace | null => {
  if (!performance) return null;

  try {
    const t = trace(performance, traceName);
    t.start();
    return t;
  } catch (error) {
    logger.error(`Failed to start trace ${traceName}`, { error });
    return null;
  }
};

/**
 * Stop a performance trace and record the duration
 */
export const stopTrace = (t: PerformanceTrace | null): void => {
  if (!t) return;

  try {
    t.stop();
  } catch (error) {
    logger.error("Failed to stop trace", { error });
  }
};

/**
 * Add custom attributes to a trace
 *
 * @example
 * addTraceAttribute(trace, 'user_role', 'admin');
 * addTraceAttribute(trace, 'product_count', '25');
 */
export const addTraceAttribute = (
  t: PerformanceTrace | null,
  attribute: string,
  value: string,
): void => {
  if (!t) return;

  try {
    t.putAttribute(attribute, value);
  } catch (error) {
    logger.error(`Failed to add attribute ${attribute}`, { error });
  }
};

/**
 * Add custom metrics to a trace
 *
 * @example
 * addTraceMetric(trace, 'items_loaded', 100);
 * addTraceMetric(trace, 'api_calls', 3);
 */
export const addTraceMetric = (
  t: PerformanceTrace | null,
  metricName: string,
  value: number,
): void => {
  if (!t) return;

  try {
    t.putMetric(metricName, value);
  } catch (error) {
    logger.error(`Failed to add metric ${metricName}`, { error });
  }
};

/**
 * Increment a metric on a trace
 *
 * @example
 * incrementTraceMetric(trace, 'cache_hits');
 */
export const incrementTraceMetric = (
  t: PerformanceTrace | null,
  metricName: string,
): void => {
  if (!t) return;

  try {
    t.incrementMetric(metricName);
  } catch (error) {
    logger.error(`Failed to increment metric ${metricName}`, { error });
  }
};

/**
 * Measure an async operation's performance
 *
 * @example
 * const data = await measureAsync('fetch_products', async () => {
 *   return await fetch('/api/products');
 * });
 */
export const measureAsync = async <T>(
  traceName: string,
  operation: () => Promise<T>,
  attributes?: Record<string, string>,
): Promise<T> => {
  const t = startTrace(traceName);

  if (attributes && t) {
    Object.entries(attributes).forEach(([key, value]) => {
      addTraceAttribute(t, key, value);
    });
  }

  try {
    const result = await operation();
    stopTrace(t);
    return result;
  } catch (error) {
    stopTrace(t);
    throw error;
  }
};

/**
 * Measure a synchronous operation's performance
 *
 * @example
 * const result = measureSync('calculate_total', () => {
 *   return items.reduce((sum, item) => sum + item.price, 0);
 * });
 */
export const measureSync = <T>(
  traceName: string,
  operation: () => T,
  attributes?: Record<string, string>,
): T => {
  const t = startTrace(traceName);

  if (attributes && t) {
    Object.entries(attributes).forEach(([key, value]) => {
      addTraceAttribute(t, key, value);
    });
  }

  try {
    const result = operation();
    stopTrace(t);
    return result;
  } catch (error) {
    stopTrace(t);
    throw error;
  }
};

/**
 * Track page load performance
 * Call this in page components to track specific page loads
 */
export const trackPageLoad = (pageName: string): void => {
  if (typeof window === "undefined") return;

  const t = startTrace(`page_load_${pageName}`);

  // Stop trace when page is fully loaded
  if (document.readyState === "complete") {
    stopTrace(t);
  } else {
    window.addEventListener("load", () => {
      stopTrace(t);
    });
  }
};

/**
 * Track API request performance
 *
 * @example
 * await trackApiRequest('/api/products', 'GET', async () => {
 *   return await apiClient.get('/api/products');
 * });
 */
export const trackApiRequest = async <T>(
  endpoint: string,
  method: string,
  request: () => Promise<T>,
): Promise<T> => {
  const traceName = `api_${method.toLowerCase()}_${endpoint.replace(/\//g, "_")}`;
  const t = startTrace(traceName);

  addTraceAttribute(t, "endpoint", endpoint);
  addTraceAttribute(t, "method", method);

  const startTime = Date.now();

  try {
    const result = await request();
    const duration = Date.now() - startTime;

    addTraceMetric(t, "duration_ms", duration);
    addTraceAttribute(t, "status", "success");

    stopTrace(t);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    addTraceMetric(t, "duration_ms", duration);
    addTraceAttribute(t, "status", "error");

    stopTrace(t);
    throw error;
  }
};

/**
 * Track component render performance
 * Use in useEffect to measure component lifecycle
 *
 * @example
 * useEffect(() => {
 *   const cleanup = trackComponentRender('ProductList');
 *   return cleanup;
 * }, []);
 */
export const trackComponentRender = (componentName: string): (() => void) => {
  const t = startTrace(`component_render_${componentName}`);

  return () => {
    stopTrace(t);
  };
};

/**
 * Common performance traces for the application
 */
export const PERFORMANCE_TRACES = {
  // Authentication
  USER_LOGIN: "user_login",
  USER_REGISTER: "user_register",
  USER_LOGOUT: "user_logout",

  // Product Operations
  PRODUCT_LOAD: "product_load",
  PRODUCT_SEARCH: "product_search",
  PRODUCT_CREATE: "product_create",

  // Order Operations
  ORDER_CREATE: "order_create",
  ORDER_CHECKOUT: "order_checkout",
  ORDER_LOAD: "order_load",

  // Admin Operations
  ADMIN_USERS_LOAD: "admin_users_load",
  ADMIN_PRODUCTS_LOAD: "admin_products_load",
  ADMIN_DASHBOARD_LOAD: "admin_dashboard_load",

  // Cache Operations
  CACHE_HIT: "cache_hit",
  CACHE_MISS: "cache_miss",

  // Image Operations
  IMAGE_UPLOAD: "image_upload",
  IMAGE_CROP: "image_crop",
} as const;

export type PerformanceTraceType =
  (typeof PERFORMANCE_TRACES)[keyof typeof PERFORMANCE_TRACES];
