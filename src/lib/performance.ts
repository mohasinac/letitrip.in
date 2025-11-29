/**
 * Performance Monitoring Utility
 *
 * Provides comprehensive performance tracking for:
 * - API endpoint response times
 * - Database query durations
 * - External API calls
 * - Component render times
 * - Page load metrics
 * - Custom performance marks
 *
 * Features:
 * - Automatic metric collection
 * - Percentile calculations (p50, p90, p95, p99)
 * - Performance budgets and alerts
 * - Historical trending
 * - Export capabilities
 *
 * Usage:
 * ```typescript
 * import { PerformanceMonitor } from '@/lib/performance';
 *
 * // Track API call
 * const timer = PerformanceMonitor.startTimer('api.products.list');
 * const products = await fetchProducts();
 * timer.end();
 *
 * // Track with context
 * await PerformanceMonitor.track('database.query', async () => {
 *   return await db.collection('products').get();
 * }, { query: 'products', filters: 'active' });
 *
 * // Get metrics
 * const metrics = PerformanceMonitor.getMetrics('api.products.list');
 * console.log(metrics.p95); // 95th percentile
 * ```
 */

import { ErrorLogger } from "@/lib/error-logger";

// ============================================================================
// Types
// ============================================================================

export interface PerformanceEntry {
  name: string;
  duration: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  name: string;
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  total: number;
  lastUpdated: number;
}

export interface PerformanceBudget {
  name: string;
  threshold: number; // milliseconds
  enabled: boolean;
  onExceed?: (entry: PerformanceEntry) => void;
}

export interface PerformanceReport {
  period: string;
  metrics: Record<string, PerformanceMetrics>;
  violations: PerformanceViolation[];
  summary: {
    totalMeasurements: number;
    slowestOperations: Array<{ name: string; duration: number }>;
    budgetViolations: number;
  };
}

export interface PerformanceViolation {
  name: string;
  duration: number;
  budget: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface TimerHandle {
  end: (context?: Record<string, unknown>) => number;
  elapsed: () => number;
}

// ============================================================================
// Performance Monitor Class
// ============================================================================

class PerformanceMonitorClass {
  private entries: Map<string, PerformanceEntry[]> = new Map();
  private budgets: Map<string, PerformanceBudget> = new Map();
  private violations: PerformanceViolation[] = [];
  private readonly maxEntriesPerMetric = 1000; // Keep last 1000 entries
  private readonly violationLimit = 100; // Keep last 100 violations

  /**
   * Start a performance timer
   */
  startTimer(name: string): TimerHandle {
    const startTime = performance.now();

    return {
      end: (context?: Record<string, unknown>): number => {
        const duration = performance.now() - startTime;
        this.record(name, duration, context);
        return duration;
      },
      elapsed: (): number => {
        return performance.now() - startTime;
      },
    };
  }

  /**
   * Track an async operation
   */
  async track<T>(
    name: string,
    operation: () => Promise<T>,
    context?: Record<string, unknown>,
  ): Promise<T> {
    const timer = this.startTimer(name);
    try {
      const result = await operation();
      timer.end(context);
      return result;
    } catch (error) {
      timer.end({ ...context, error: true });
      throw error;
    }
  }

  /**
   * Track a synchronous operation
   */
  trackSync<T>(
    name: string,
    operation: () => T,
    context?: Record<string, unknown>,
  ): T {
    const timer = this.startTimer(name);
    try {
      const result = operation();
      timer.end(context);
      return result;
    } catch (error) {
      timer.end({ ...context, error: true });
      throw error;
    }
  }

  /**
   * Record a performance entry
   */
  record(
    name: string,
    duration: number,
    context?: Record<string, unknown>,
  ): void {
    const entry: PerformanceEntry = {
      name,
      duration,
      timestamp: Date.now(),
      context,
    };

    // Store entry
    if (!this.entries.has(name)) {
      this.entries.set(name, []);
    }

    const entries = this.entries.get(name)!;
    entries.push(entry);

    // Limit entries per metric
    if (entries.length > this.maxEntriesPerMetric) {
      entries.shift();
    }

    // Check budget
    this.checkBudget(entry);

    // Log slow operations
    if (duration > 1000) {
      ErrorLogger.warn(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`,
        {
          metadata: { name, duration, ...context },
        },
      );
    }
  }

  /**
   * Check performance budget
   */
  private checkBudget(entry: PerformanceEntry): void {
    const budget = this.budgets.get(entry.name);
    if (!budget || !budget.enabled) return;

    if (entry.duration > budget.threshold) {
      const violation: PerformanceViolation = {
        name: entry.name,
        duration: entry.duration,
        budget: budget.threshold,
        timestamp: entry.timestamp,
        context: entry.context,
      };

      this.violations.push(violation);

      // Limit violations
      if (this.violations.length > this.violationLimit) {
        this.violations.shift();
      }

      // Call custom handler
      if (budget.onExceed) {
        budget.onExceed(entry);
      }

      // Log violation
      ErrorLogger.warn(
        `Performance budget exceeded: ${
          entry.name
        } took ${entry.duration.toFixed(2)}ms (budget: ${budget.threshold}ms)`,
        {
          metadata: violation,
        },
      );
    }
  }

  /**
   * Set performance budget for a metric
   */
  setBudget(
    name: string,
    threshold: number,
    onExceed?: (entry: PerformanceEntry) => void,
  ): void {
    this.budgets.set(name, {
      name,
      threshold,
      enabled: true,
      onExceed,
    });
  }

  /**
   * Remove performance budget
   */
  removeBudget(name: string): void {
    this.budgets.delete(name);
  }

  /**
   * Enable/disable budget
   */
  toggleBudget(name: string, enabled: boolean): void {
    const budget = this.budgets.get(name);
    if (budget) {
      budget.enabled = enabled;
    }
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get metrics for a specific metric name
   */
  getMetrics(name: string): PerformanceMetrics | null {
    const entries = this.entries.get(name);
    if (!entries || entries.length === 0) return null;

    const durations = entries.map((e) => e.duration);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      name,
      count: entries.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      mean: sum / entries.length,
      median: this.calculatePercentile(durations, 50),
      p50: this.calculatePercentile(durations, 50),
      p90: this.calculatePercentile(durations, 90),
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99),
      total: sum,
      lastUpdated: entries[entries.length - 1].timestamp,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, PerformanceMetrics> {
    const allMetrics: Record<string, PerformanceMetrics> = {};

    for (const name of this.entries.keys()) {
      const metrics = this.getMetrics(name);
      if (metrics) {
        allMetrics[name] = metrics;
      }
    }

    return allMetrics;
  }

  /**
   * Get recent violations
   */
  getViolations(limit = 50): PerformanceViolation[] {
    return this.violations.slice(-limit);
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const metrics = this.getAllMetrics();
    const violations = this.getViolations();

    // Find slowest operations
    const slowestOperations = Object.values(metrics)
      .map((m) => ({ name: m.name, duration: m.p95 }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      period: new Date().toISOString(),
      metrics,
      violations,
      summary: {
        totalMeasurements: Object.values(metrics).reduce(
          (sum, m) => sum + m.count,
          0,
        ),
        slowestOperations,
        budgetViolations: violations.length,
      },
    };
  }

  /**
   * Export metrics to JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  /**
   * Export metrics to CSV
   */
  exportCSV(): string {
    const metrics = this.getAllMetrics();
    const rows: string[] = ["Name,Count,Min,Max,Mean,Median,P90,P95,P99"];

    for (const m of Object.values(metrics)) {
      rows.push(
        `${m.name},${m.count},${m.min.toFixed(2)},${m.max.toFixed(
          2,
        )},${m.mean.toFixed(2)},${m.median.toFixed(2)},${m.p90.toFixed(
          2,
        )},${m.p95.toFixed(2)},${m.p99.toFixed(2)}`,
      );
    }

    return rows.join("\n");
  }

  /**
   * Clear all metrics
   */
  clear(name?: string): void {
    if (name) {
      this.entries.delete(name);
    } else {
      this.entries.clear();
      this.violations = [];
    }
  }

  /**
   * Clear old entries (older than specified age)
   */
  clearOld(ageMs: number): void {
    const cutoff = Date.now() - ageMs;

    for (const [name, entries] of this.entries.entries()) {
      const filtered = entries.filter((e) => e.timestamp > cutoff);
      if (filtered.length === 0) {
        this.entries.delete(name);
      } else {
        this.entries.set(name, filtered);
      }
    }

    this.violations = this.violations.filter((v) => v.timestamp > cutoff);
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalMetrics: number;
    totalMeasurements: number;
    totalViolations: number;
    activeBudgets: number;
  } {
    const metrics = this.getAllMetrics();
    const totalMeasurements = Object.values(metrics).reduce(
      (sum, m) => sum + m.count,
      0,
    );

    return {
      totalMetrics: this.entries.size,
      totalMeasurements,
      totalViolations: this.violations.length,
      activeBudgets: Array.from(this.budgets.values()).filter((b) => b.enabled)
        .length,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const PerformanceMonitor = new PerformanceMonitorClass();

// ============================================================================
// Preset Budgets
// ============================================================================

/**
 * Set default performance budgets
 */
export function setDefaultBudgets(): void {
  // API endpoints
  PerformanceMonitor.setBudget("api.products.list", 500);
  PerformanceMonitor.setBudget("api.products.get", 300);
  PerformanceMonitor.setBudget("api.auctions.list", 500);
  PerformanceMonitor.setBudget("api.categories.list", 300);
  PerformanceMonitor.setBudget("api.search", 1000);

  // Database queries
  PerformanceMonitor.setBudget("db.query", 500);
  PerformanceMonitor.setBudget("db.batch", 1000);
  PerformanceMonitor.setBudget("db.transaction", 2000);

  // External APIs
  PerformanceMonitor.setBudget("external.api", 2000);
  PerformanceMonitor.setBudget("external.firebase", 1000);

  // Component renders (client-side)
  PerformanceMonitor.setBudget("render.page", 100);
  PerformanceMonitor.setBudget("render.component", 50);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Measure function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  return PerformanceMonitor.track(name, fn, context);
}

/**
 * Measure synchronous function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  context?: Record<string, unknown>,
): T {
  return PerformanceMonitor.trackSync(name, fn, context);
}

/**
 * Create a performance decorator for class methods
 */
export function Measure(name?: string) {
  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `method.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      return await PerformanceMonitor.track(metricName, async () => {
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

// ============================================================================
// Auto-cleanup
// ============================================================================

// Clear old entries every hour (older than 24 hours)
if (typeof window === "undefined") {
  // Server-side only
  setInterval(
    () => {
      const twentyFourHours = 24 * 60 * 60 * 1000;
      PerformanceMonitor.clearOld(twentyFourHours);
      ErrorLogger.info("Cleared old performance entries");
    },
    60 * 60 * 1000,
  );
}

// ============================================================================
// Export
// ============================================================================

export default PerformanceMonitor;
