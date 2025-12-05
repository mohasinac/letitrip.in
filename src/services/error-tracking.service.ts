/**
 * @fileoverview Service Module
 * @module src/services/error-tracking.service
 * @description This file contains service functions for error-tracking operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Error Tracking Service
 *
 * Provides centralized error tracking, monitoring, and reporting capabilities.
 * Integrates with ErrorLogger and can be extended to third-party services like Sentry.
 *
 * Features:
 * - Error aggregation and deduplication
 * - Error rate monitoring
 * - User impact tracking
 * - Performance monitoring integration
 * - Export capabilities for analysis
 */

import {
  ErrorLogger,
  ErrorSeverity,
  type LoggedError,
} from "@/lib/error-logger";

// ============================================================================
// Types
// ============================================================================

/**
 * ErrorStats interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorStats
 */
export interface ErrorStats {
  /** Total Errors */
  totalErrors: number;
  /** Errors By Severity */
  errorsBySeverity: Record<ErrorSeverity, number>;
  /** Errors By Component */
  errorsByComponent: Record<string, number>;
  /** ErrorRate */
  errorRate: number; // errors per minute
  /** Affected Users */
  affectedUsers: Set<string>;
  /** Top Errors */
  topErrors: ErrorSummary[];
  /** Time Range */
  timeRange: {
    /** Start */
    start: Date;
    /** End */
    end: Date;
  };
}

/**
 * ErrorSummary interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorSummary
 */
export interface ErrorSummary {
  /** Message */
  message: string;
  /** Count */
  count: number;
  /** Last Occurrence */
  lastOccurrence: Date;
  /** First Occurrence */
  firstOccurrence: Date;
  /** Severity */
  severity: ErrorSeverity;
  /** Affected Components */
  affectedComponents: string[];
  /** Affected Users */
  affectedUsers: string[];
  /** Stack Trace */
  stackTrace?: string;
}

/**
 * ErrorTrend interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorTrend
 */
export interface ErrorTrend {
  /** Timestamp */
  timestamp: Date;
  /** Count */
  count: number;
  /** Severity */
  severity: ErrorSeverity;
}

/**
 * ErrorFilter interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorFilter
 */
export interface ErrorFilter {
  /** Severity */
  severity?: ErrorSeverity[];
  /** Component */
  component?: string[];
  /** User Id */
  userId?: string;
  /** Start Date */
  startDate?: Date;
  /** End Date */
  endDate?: Date;
  /** Limit */
  limit?: number;
}

/**
 * ErrorAlert interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorAlert
 */
export interface ErrorAlert {
  /** Id */
  id: string;
  /** Type */
  type: "rate" | "severity" | "user-impact";
  /** Threshold */
  threshold: number;
  /** Current Value */
  currentValue: number;
  /** Message */
  message: string;
  /** Timestamp */
  timestamp: Date;
  /** Metadata */
  metadata?: Record<string, any>;
}

// ============================================================================
// Error Tracking Service
// ============================================================================

/**
 * ErrorTrackingService class
 * 
 * @class
 * @description Description of ErrorTrackingService class functionality
 */
class ErrorTrackingService {
  private errorMap: Map<string, ErrorSummary> = new Map();
  private errorTrends: ErrorTrend[] = [];
  private alerts: ErrorAlert[] = [];

  private readonly MAX_TRENDS = 1000;
  private readonly MAX_ALERTS = 50;

  // Alert thresholds
  private readonly ERROR_RATE_THRESHOLD = 10; // errors per minute
  private readonly CRITICAL_ERROR_THRESHOLD = 1; // any critical error triggers alert
  private readonly USER_IMPACT_THRESHOLD = 5; // unique users affected

  /**
   * Track an error and update statistics
   */
  trackError(error: LoggedError): void {
    const errorKey = this.getErrorKey(error);
    const now = new Date();

    // Update or create error summary
    const existing = this.errorMap.get(errorKey);
    if (existing) {
      existing.count++;
      existing.lastOccurrence = now;
      if (
        error.context.component &&
        !existing.affectedComponents.includes(error.context.component)
      ) {
        existing.affectedComponents.push(error.context.component);
      }
      if (
        error.context.userId &&
        !existing.affectedUsers.includes(error.context.userId)
      ) {
        existing.affectedUsers.push(error.context.userId);
      }
    } else {
      this.errorMap.set(errorKey, {
        /** Message */
        message: error.message,
        /** Count */
        count: 1,
        /** Last Occurrence */
        lastOccurrence: now,
        /** First Occurrence */
        firstOccurrence: now,
        /** Severity */
        severity: error.severity,
        /** Affected Components */
        affectedComponents: error.context.component
          ? [error.context.component]
          : [],
        /** Affected Users */
        affectedUsers: error.context.userId ? [error.context.userId] : [],
        /** Stack Trace */
        stackTrace: error.stack,
      });
    }

    // Add to trends
    this.errorTrends.push({
      /** Timestamp */
      timestamp: now,
      /** Count */
      count: 1,
      /** Severity */
      severity: error.severity,
    });

    // Trim old trends
    if (this.errorTrends.length > this.MAX_TRENDS) {
      this.errorTrends = this.errorTrends.slice(-this.MAX_TRENDS);
    }

    // Check for alert conditions
    this.checkAlerts();
  }

  /**
   * Get error statistics for a time range
   */
  getStats(startDate?: Date, endDate?: Date): ErrorStats {
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 3600000); // Last hour by default
    const end = endDate || now;

    /**
 * Performs relevant trends operation
 *
 * @param {any} (t - The (t
 *
 * @returns {any} The relevanttrends result
 *
 */
const relevantTrends = this.errorTrends.filter(
      (t) => t.timestamp >= start && t.timestamp <= end,
    );

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [Er/**
 * Performs affected users operation
 *
 * @returns {any} The affectedusers result
 *
 */
rorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    const errorsByComponent: Record<string, number> = {};
    const affectedUsers = new Set<string>();

    // Aggregate statistics
    relevantTrends.forEach((trend) => {
      errorsBySeverity[trend.severity] += trend.count;
    });

    this.errorMap.forEach((summary) => {
      // Only include errors in time range
      if (summary.lastOccurrence >= start && summary.lastOccurrence <= end) {
        summary.affectedComponents.forEach((component) => {
          errorsByComponent[component] =
            (errorsByComponent[component] || 0) + summary.count;
        });
        summary.affectedUsers.forEach((userId) => affectedUsers.add(userId));
      }
    });

    // Calculate error rate (errors per minute)
    /**
     * Performs time range minutes operation
     *
     * @param {any} [end.getTime() - start.getTime()) / 60000;
    const errorRate] - The end.get time() - start.get time()) / 60000;
    const error rate
     * @param {any} t - The t
     *
     * @returns {any} The timerangeminutes result
     */

    /**
     * Performs time range minutes operation
     *
     * @param {any} [end.getTime() - start.getTime()) / 60000;
    const errorRate] - The end.get time() -/**
 * Performs error rate operation
 *
 * @param {any} (sum - The (sum
 * @param {any} t - The t
 *
 * @returns {any} The errorrate result
 *
 */
 start.get time()) / 60000;
    const error rate
     * @param {any} t - The t
     *
     * @returns {any} The timerangeminutes result
     */

    const timeRangeMinutes = (end.getTime() - start.getTime()) / 60000;
    const errorRate =
      relevantTrends.reduce((sum, t) => sum + t.count, 0) / timeRangeMinutes;

    // Get top errors
    const topErrors = Array.from(this.errorMap.values())
      .filter((e) => e.lastOccurrence >= start && e.lastOccurrence <= end)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      /** Total Errors */
      totalErrors: relevantTrends.reduce((sum, t) => sum + t.count, 0),
      errorsBySeverity,
      errorsByComponent,
      errorRate,
      affectedUsers,
      topErrors,
      /** Time Range */
      timeRange: { start, end },
    };
  }

  /**
   * Get filtered errors
   */
  getErrors(filter: ErrorFilter = {}): ErrorSummary[] {
    let errors = Array.from(this.errorMap.values());

    // Apply filters
    if (filter.severity && filter.severity.length > 0) {
      errors = errors.filter((e) => filter.severity!.includes(e.severity));
    }

    if (filter.component && filter.component.length > 0) {
      errors = errors.filter((e) =>
        e.affectedComponents.some((c) => filter.component!.includes(c)),
      );
    }

    if (filter.userId) {
      errors = errors.filter((e) => e.affectedUsers.includes(filter.userId!));
    }

    if (filter.startDate) {
      errors = errors.filter((e) => e.lastOccurrence >= filter.startDate!);
    }

    if (filter.endDate) {
      errors = errors.filter((e) => e.lastOccurrence <= filter.endDate!);
    }

    // Sort by count (most frequent first)
    errors.sort((a, b) => b.count - a.count);

    // Apply limit
    if (filter.limit) {
      errors = errors.slice(0, filter.limit);
    }

    return errors;
  }

/**
 * Performs buckets operation
 *
 * @returns {any} The buckets result
 *
 */
  /**
   * Get error trends over time
   */
  getTrends(
    /** Interval */
    interval: "minute" | "hour" | "day" = "hour",
    limit = 24,
  ): ErrorTrend[] {
    const intervalMsMap = {
      /** Minute */
      minute: 60000,
      /** Hour */
      hour: 3600000,
      /** Day */
      day: 86400000,
    };
    const intervalMs = intervalMsMap[interval];
    const buckets: Map<number, ErrorTrend> = new Map();

    this.errorTrends.forEach((trend) => {
      const bucketKey =
        Math.floor(trend.timestamp.getTime() / intervalMs) * intervalMs;
      const existing = buckets.get(bucketKey);

      if (existing) {
        existing.count += trend.count;
      } else {
        buckets.set(bucketKey, {
          /** Timestamp */
          timestamp: new Date(bucketKey),
          /** Count */
          count: trend.count,
          /** Severity */
          severity: trend.severity,
        });
      }
    });

    return Array.from(buckets.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get active alerts
   */
  getAlerts(): ErrorAlert[] {
    return [...this.alerts].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanMinutes = 60): void {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60000);
    this.alerts = this.al/**
 * Performs rows operation
 *
 * @param {any} (e - The (e
 *
 * @returns {any} The rows result
 *
 */
erts.filter((alert) => alert.timestamp >= cutoff);
  }

  /**
   * Export error data for analysis
   */
  exportData(format: "json" | "csv" = "json"): string {
    const errors = this.getErrors({ limit: 1000 });

    if (format === "csv") {
      const headers = [
        "Message",
        "Count",
        "Severity",
        "First Occurrence",
        "Last Occurrence",
        "Affected Components",
        "Affected Users",
      ];

      const rows = errors.map((e) => [
        `"${e.message.replace(/"/g, '""')}"`,
        e.count,
        e.severity,
        e.firstOccurrence.toISOString(),
        e.lastOccurrence.toISOString(),
        `"${e.affectedComponents.join(", ")}"`,
        e.affectedUsers.length,
      ]);

      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    // JSON format
    return JSON.stringify(
      {
        /** Export Date */
        exportDate: new Date().toISOString(),
        /** Total Errors */
        totalErrors: errors.reduce((sum, e) => sum + e.count, 0),
        /** Unique Errors */
        uniqueErrors: errors.length,
        /** Errors */
        errors: errors.map((e) => ({
          ...e,
          /** First Occurrence */
          firstOccurrence: e.firstOccurrence.toISOString(),
          /** Last Occurrence */
          lastOccurrence: e.lastOccurrence.toISOString(),
        })),
        /** Stats */
        stats: this.getStats(),
      },
      null,
      2,
    );
  }

  /**
   * Clear all /**
 * Performs recent errors operation
 *
 * @param {any} (t - The (t
 *
 * @returns {any} The recenterrors result
 *
 */
tracked errors (use with caution)
   */
  clear(): void {
    this.errorMap.clear();
    this.errorTrends = [];
    this.alerts = [];
  }

  /**
   * Get a deduplication key for an error
   */
  private getErrorKey(error: LoggedError): string {
    // Use message + component for deduplication
    const component = error.context.component || "unknown";
    return `${component}:${error.message}`;
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts(): void {
    const now = new Date();
    const recentWindow = 60000; // 1 minute
    const recentErrors = this.errorTrends.filter(
   /**
 * Performs critical errors operation
 *
 * @param {any} (t - The (t
 *
 * @returns {any} The criticalerrors result
 *
 */
   (t) => now.getTime() - t.timestamp.getTime() < recentWindow,
    );

    // Check error rate
    const errorCount = recentErrors.reduce((sum, t) => sum + t.count, 0);
    if (errorCount > this.ERROR_RATE_THRESHOLD) {
      this.addAlert({
        /** Id */
        id: `rate-${Date.now()}`,
        /** Type */
        type: "rate",
        /** Threshold */
        threshold: this.ERROR_RATE_THRESHOLD,
        /** Current Value */
        currentValue: errorCount,
        /** Message */
        message: `High error rate detected: $/**
 * Performs affected users operation
 *
 * @returns {any} The affectedusers result
 *
 */
{errorCount} errors in the last minute`,
        /** Timestamp */
        timestamp: now,
      });
    }

    // Check critical errors
    const criticalErrors = recentErrors.filter(
      (t) => t.severity === ErrorSeverity.CRITICAL,
    );
    if (criticalErrors.length >= this.CRITICAL_ERROR_THRESHOLD) {
      this.addAlert({
        /** Id */
        id: `critical-${Date.now()}`,
        /** Type */
        type: "severity",
        /** Threshold */
        threshold: this.CRITICAL_ERROR_THRESHOLD,
        /** Current Value */
        currentValue: criticalErrors.length,
        /** Message */
        message: `Critical error detected: ${criticalErrors.length} critical errors in the last minute`,
        /** Timestamp */
        timestamp: now,
      });
    }

    // Check user impact
    const affectedUsers = new Set<string>();
    this.errorMap.forEach((summary) => {
      if (now.getTime() - /**
 * Performs similar alert operation
 *
 * @param {any} (a - The (a
 *
 * @returns {any} The similaralert result
 *
 */
summary.lastOccurrence.getTime() < recentWindow) {
        summary.affectedUsers.forEach((userId) => affectedUsers.add(userId));
      }
    });

    if (affectedUsers.size >= this.USER_IMPACT_THRESHOLD) {
      this.addAlert({
        /** Id */
        id: `users-${Date.now()}`,
        /** Type */
        type: "user-impact",
        /** Threshold */
        threshold: this.USER_IMPACT_THRESHOLD,
        /** Current Value */
        currentValue: affectedUsers.size,
        /** Message */
        message: `Multiple users affected: ${affectedUsers.size} unique users experiencing errors`,
        /** Timestamp */
        timestamp: now,
        /** Metadata */
        metadata: { userCount: affectedUsers.size },
      });
    }
  }

  /**
   * Add an alert (with deduplication)
   */
  private addAlert(alert: ErrorAlert): void {
    // Check if similar alert exists in last 5 minutes
    const similarAlert = this.alerts.find(
      (a) =>
        a.type === alert.type && Date.now() - a.timestamp.getTime() < 300000, // 5 minutes
    );

    if (!similarAlert) {
      this.alerts.push(alert);

      // Trim old alerts
      if (this.alerts.length > this.MAX_ALERTS) {
        this.alerts = this.alerts.slice(-this.MAX_ALERTS);
      }

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.warn(`[ERROR ALERT] ${alert.message}`);
      }
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const errorTrackingService = new ErrorTrackingService();

// ============================================================================
// Integration with ErrorLogger
// ============================================================================

/**
 * Initialize error tracking integration
 * Call this once at app startup
 */
/**
 * Performs initialize error tracking operation
 *
 * @returns {void} No return value
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * initializeErrorTracking();
 */

/**
 * Performs initialize error tracking operation
 *
 * @returns {void} No return value
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * initializeErrorTracking();
 */

export function initializeErrorTracking(): void {
  // Hook into ErrorLogger to automatically track errors
  const originalLog = ErrorLogger.log.bind(ErrorLogger);

  ErrorLogger.log = function (error, context, severity) {
    // Call original log
    originalLog(error, context, severity);

    // Track in error tracking service
    const loggedError = {
      /** Message */
      message: typeof error === "string" ? error : error.message,
      /** Severity */
      severity: severity || ErrorSeverity.MEDIUM,
      /** Context */
      context: context || {},
      /** Timestamp */
      timestamp: new Date(),
      /** Stack */
      stack: typeof error === "string" ? undefined : error.stack,
    };

    errorTrackingService.trackError(loggedError);
  };

  // Set up p/**
 * Performs lines operation
 *
 * @param {any} ${stats.timeRange.start.toLocaleString( - The ${stats.timerange.start.tolocalestring(
 *
 * @returns {any} The lines result
 *
 */
eriodic cleanup
  setInterval(() => {
    errorTrackingService.clearOldAlerts(60);
  }, 300000); // Every 5 minutes

  if (process.env.NODE_ENV === "development") {
    console.log("[Error Tracking] Initialized");
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a human-readable error summary
 */
/**
 * Retrieves error summary text
 *
 * @param {ErrorStats} stats - The stats
 *
 * @returns {string} The errorsummarytext result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getErrorSummaryText(stats);
 */

/**
 * Retrieves error summary text
 *
 * @param {ErrorStats} stats - The stats
 *
 * @returns {string} The errorsummarytext result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getErrorSummaryText(stats);
 */

export function getErrorSummaryText(stats: ErrorStats): string {
  const lines = [
    `Error Summary (${stats.timeRange.start.toLocaleString()} - ${stats.timeRange.end.toLocaleString()})`,
    `Total Errors: ${stats.totalErrors}`,
    `Error Rate: ${stats.errorRate.toFixed(2)} errors/minute`,
    `Affected Users: ${stats.affectedUsers.size}`,
    "",
    "By Severity:",
    `  Critical: ${stats/**
 * Performs recent critical alerts operation
 *
 * @param {any} (a - The (a
 *
 * @returns {any} The recentcriticalalerts result
 *
 */
.errorsBySeverity[ErrorSeverity.CRITICAL]}`,
    `  High: ${stats.errorsBySeverity[ErrorSeverity.HIGH]}`,
    `  Medium: ${stats.errorsBySeverity[ErrorSeverity.MEDIUM]}`,
    `  Low: ${stats.errorsBySeverity[ErrorSeverity.LOW]}`,
    "",
    "Top Errors:",
  ];

  stats.topErrors.slice(0, 5).forEach((error, i) => {
    lines.push(
      `  ${i + 1}. [${error.severity}] ${error.message} (${error.count}x)`,
    );
  });

  return lines.join("\n");
}

/**
 * Check if error tracking is healthy
 */
/**
 * Checks if error tracking healthy
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isErrorTrackingHealthy();
 */

/**
 * Checks if error tracking healthy
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isErrorTrackingHealthy();
 */

export function isErrorTrackingHealthy(): boolean {
  const stats = errorTrackingService.getStats();
  const alerts = errorTrackingService.getAlerts();

  // Healthy if:
  // - Error rate is below threshold
  // - No critical alerts in last 5 minutes
  const recentCriticalAlerts = alerts.filter(
    (a) => a.type === "severity" && Date.now() - a.timestamp.getTime() < 300000,
  );

  return stats.errorRate < 10 && recentCriticalAlerts.length === 0;
}

// ============================================================================
// Export
// ============================================================================

export { ErrorTrackingService };
export default errorTrackingService;
