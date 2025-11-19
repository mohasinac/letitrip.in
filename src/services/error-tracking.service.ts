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

export interface ErrorStats {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByComponent: Record<string, number>;
  errorRate: number; // errors per minute
  affectedUsers: Set<string>;
  topErrors: ErrorSummary[];
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface ErrorSummary {
  message: string;
  count: number;
  lastOccurrence: Date;
  firstOccurrence: Date;
  severity: ErrorSeverity;
  affectedComponents: string[];
  affectedUsers: string[];
  stackTrace?: string;
}

export interface ErrorTrend {
  timestamp: Date;
  count: number;
  severity: ErrorSeverity;
}

export interface ErrorFilter {
  severity?: ErrorSeverity[];
  component?: string[];
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface ErrorAlert {
  id: string;
  type: "rate" | "severity" | "user-impact";
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// Error Tracking Service
// ============================================================================

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
        message: error.message,
        count: 1,
        lastOccurrence: now,
        firstOccurrence: now,
        severity: error.severity,
        affectedComponents: error.context.component
          ? [error.context.component]
          : [],
        affectedUsers: error.context.userId ? [error.context.userId] : [],
        stackTrace: error.stack,
      });
    }

    // Add to trends
    this.errorTrends.push({
      timestamp: now,
      count: 1,
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

    const relevantTrends = this.errorTrends.filter(
      (t) => t.timestamp >= start && t.timestamp <= end
    );

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
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
    const timeRangeMinutes = (end.getTime() - start.getTime()) / 60000;
    const errorRate =
      relevantTrends.reduce((sum, t) => sum + t.count, 0) / timeRangeMinutes;

    // Get top errors
    const topErrors = Array.from(this.errorMap.values())
      .filter((e) => e.lastOccurrence >= start && e.lastOccurrence <= end)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: relevantTrends.reduce((sum, t) => sum + t.count, 0),
      errorsBySeverity,
      errorsByComponent,
      errorRate,
      affectedUsers,
      topErrors,
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
        e.affectedComponents.some((c) => filter.component!.includes(c))
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
   * Get error trends over time
   */
  getTrends(
    interval: "minute" | "hour" | "day" = "hour",
    limit = 24
  ): ErrorTrend[] {
    const intervalMs =
      interval === "minute" ? 60000 : interval === "hour" ? 3600000 : 86400000;
    const buckets: Map<number, ErrorTrend> = new Map();

    this.errorTrends.forEach((trend) => {
      const bucketKey =
        Math.floor(trend.timestamp.getTime() / intervalMs) * intervalMs;
      const existing = buckets.get(bucketKey);

      if (existing) {
        existing.count += trend.count;
      } else {
        buckets.set(bucketKey, {
          timestamp: new Date(bucketKey),
          count: trend.count,
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
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanMinutes = 60): void {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60000);
    this.alerts = this.alerts.filter((alert) => alert.timestamp >= cutoff);
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
        exportDate: new Date().toISOString(),
        totalErrors: errors.reduce((sum, e) => sum + e.count, 0),
        uniqueErrors: errors.length,
        errors: errors.map((e) => ({
          ...e,
          firstOccurrence: e.firstOccurrence.toISOString(),
          lastOccurrence: e.lastOccurrence.toISOString(),
        })),
        stats: this.getStats(),
      },
      null,
      2
    );
  }

  /**
   * Clear all tracked errors (use with caution)
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
      (t) => now.getTime() - t.timestamp.getTime() < recentWindow
    );

    // Check error rate
    const errorCount = recentErrors.reduce((sum, t) => sum + t.count, 0);
    if (errorCount > this.ERROR_RATE_THRESHOLD) {
      this.addAlert({
        id: `rate-${Date.now()}`,
        type: "rate",
        threshold: this.ERROR_RATE_THRESHOLD,
        currentValue: errorCount,
        message: `High error rate detected: ${errorCount} errors in the last minute`,
        timestamp: now,
      });
    }

    // Check critical errors
    const criticalErrors = recentErrors.filter(
      (t) => t.severity === ErrorSeverity.CRITICAL
    );
    if (criticalErrors.length >= this.CRITICAL_ERROR_THRESHOLD) {
      this.addAlert({
        id: `critical-${Date.now()}`,
        type: "severity",
        threshold: this.CRITICAL_ERROR_THRESHOLD,
        currentValue: criticalErrors.length,
        message: `Critical error detected: ${criticalErrors.length} critical errors in the last minute`,
        timestamp: now,
      });
    }

    // Check user impact
    const affectedUsers = new Set<string>();
    this.errorMap.forEach((summary) => {
      if (now.getTime() - summary.lastOccurrence.getTime() < recentWindow) {
        summary.affectedUsers.forEach((userId) => affectedUsers.add(userId));
      }
    });

    if (affectedUsers.size >= this.USER_IMPACT_THRESHOLD) {
      this.addAlert({
        id: `users-${Date.now()}`,
        type: "user-impact",
        threshold: this.USER_IMPACT_THRESHOLD,
        currentValue: affectedUsers.size,
        message: `Multiple users affected: ${affectedUsers.size} unique users experiencing errors`,
        timestamp: now,
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
        a.type === alert.type && Date.now() - a.timestamp.getTime() < 300000 // 5 minutes
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
export function initializeErrorTracking(): void {
  // Hook into ErrorLogger to automatically track errors
  const originalLog = ErrorLogger.log.bind(ErrorLogger);

  ErrorLogger.log = function (error, context, severity) {
    // Call original log
    originalLog(error, context, severity);

    // Track in error tracking service
    const loggedError = {
      message: typeof error === "string" ? error : error.message,
      severity: severity || ErrorSeverity.MEDIUM,
      context: context || {},
      timestamp: new Date(),
      stack: typeof error === "string" ? undefined : error.stack,
    };

    errorTrackingService.trackError(loggedError);
  };

  // Set up periodic cleanup
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
export function getErrorSummaryText(stats: ErrorStats): string {
  const lines = [
    `Error Summary (${stats.timeRange.start.toLocaleString()} - ${stats.timeRange.end.toLocaleString()})`,
    `Total Errors: ${stats.totalErrors}`,
    `Error Rate: ${stats.errorRate.toFixed(2)} errors/minute`,
    `Affected Users: ${stats.affectedUsers.size}`,
    "",
    "By Severity:",
    `  Critical: ${stats.errorsBySeverity[ErrorSeverity.CRITICAL]}`,
    `  High: ${stats.errorsBySeverity[ErrorSeverity.HIGH]}`,
    `  Medium: ${stats.errorsBySeverity[ErrorSeverity.MEDIUM]}`,
    `  Low: ${stats.errorsBySeverity[ErrorSeverity.LOW]}`,
    "",
    "Top Errors:",
  ];

  stats.topErrors.slice(0, 5).forEach((error, i) => {
    lines.push(
      `  ${i + 1}. [${error.severity}] ${error.message} (${error.count}x)`
    );
  });

  return lines.join("\n");
}

/**
 * Check if error tracking is healthy
 */
export function isErrorTrackingHealthy(): boolean {
  const stats = errorTrackingService.getStats();
  const alerts = errorTrackingService.getAlerts();

  // Healthy if:
  // - Error rate is below threshold
  // - No critical alerts in last 5 minutes
  const recentCriticalAlerts = alerts.filter(
    (a) => a.type === "severity" && Date.now() - a.timestamp.getTime() < 300000
  );

  return stats.errorRate < 10 && recentCriticalAlerts.length === 0;
}

// ============================================================================
// Export
// ============================================================================

export { ErrorTrackingService };
export default errorTrackingService;
