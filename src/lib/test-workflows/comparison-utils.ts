/**
 * Workflow Comparison and Analytics
 *
 * Provides utilities for comparing workflow runs, tracking performance over time,
 * and identifying bottlenecks in workflow execution.
 */

import type { WorkflowResult } from "./helpers";

export interface WorkflowRun {
  id: string;
  workflowName: string;
  result: WorkflowResult;
  timestamp: string;
  metadata?: {
    user?: string;
    environment?: string;
    version?: string;
  };
}

export interface ComparisonMetrics {
  workflowName: string;
  totalRuns: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  averageSuccessRate: number;
  totalFailures: number;
  commonErrors: { error: string; count: number }[];
  performanceTrend: "improving" | "stable" | "degrading" | "insufficient_data";
  bottleneckSteps: {
    stepName: string;
    averageDuration: number;
    failureRate: number;
  }[];
}

/**
 * Compare multiple workflow runs
 */
export function compareWorkflows(runs: WorkflowRun[]): ComparisonMetrics[] {
  if (runs.length === 0) {
    return [];
  }

  // Group runs by workflow name
  const groupedRuns = runs.reduce((acc, run) => {
    if (!acc[run.workflowName]) {
      acc[run.workflowName] = [];
    }
    acc[run.workflowName].push(run);
    return acc;
  }, {} as Record<string, WorkflowRun[]>);

  // Analyze each workflow
  return Object.entries(groupedRuns).map(([workflowName, workflowRuns]) => {
    return analyzeWorkflowPerformance(workflowName, workflowRuns);
  });
}

/**
 * Analyze performance of a single workflow across multiple runs
 */
function analyzeWorkflowPerformance(
  workflowName: string,
  runs: WorkflowRun[]
): ComparisonMetrics {
  const durations = runs.map((r) => r.result.duration);
  const successRates = runs.map((r) =>
    r.result.totalSteps > 0 ? (r.result.passed / r.result.totalSteps) * 100 : 0
  );

  // Calculate averages
  const averageDuration =
    durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const averageSuccessRate =
    successRates.reduce((a, b) => a + b, 0) / successRates.length;
  const totalFailures = runs.reduce((sum, r) => sum + r.result.failed, 0);

  // Find common errors
  const errorCounts: Record<string, number> = {};
  runs.forEach((run) => {
    run.result.errors.forEach((error) => {
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });
  });

  const commonErrors = Object.entries(errorCounts)
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Determine performance trend (compare first half to second half)
  const performanceTrend = calculatePerformanceTrend(runs);

  // Identify bottleneck steps
  const bottleneckSteps = identifyBottlenecks(runs);

  return {
    workflowName,
    totalRuns: runs.length,
    averageDuration,
    minDuration,
    maxDuration,
    averageSuccessRate,
    totalFailures,
    commonErrors,
    performanceTrend,
    bottleneckSteps,
  };
}

/**
 * Calculate performance trend over time
 */
function calculatePerformanceTrend(
  runs: WorkflowRun[]
): "improving" | "stable" | "degrading" | "insufficient_data" {
  if (runs.length < 4) {
    return "insufficient_data";
  }

  // Sort by timestamp
  const sortedRuns = [...runs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const midpoint = Math.floor(sortedRuns.length / 2);
  const firstHalf = sortedRuns.slice(0, midpoint);
  const secondHalf = sortedRuns.slice(midpoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, r) => sum + r.result.duration, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, r) => sum + r.result.duration, 0) /
    secondHalf.length;

  const improvement = ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100;

  if (improvement > 10) return "improving";
  if (improvement < -10) return "degrading";
  return "stable";
}

/**
 * Identify bottleneck steps across multiple runs
 */
function identifyBottlenecks(
  runs: WorkflowRun[]
): { stepName: string; averageDuration: number; failureRate: number }[] {
  const stepMetrics: Record<
    string,
    { durations: number[]; failures: number; total: number }
  > = {};

  runs.forEach((run) => {
    run.result.steps.forEach((step) => {
      if (!stepMetrics[step.name]) {
        stepMetrics[step.name] = { durations: [], failures: 0, total: 0 };
      }
      stepMetrics[step.name].total++;
      if (step.duration) {
        stepMetrics[step.name].durations.push(step.duration);
      }
      if (step.status === "failed") {
        stepMetrics[step.name].failures++;
      }
    });
  });

  // Calculate averages and identify bottlenecks
  const bottlenecks = Object.entries(stepMetrics)
    .map(([stepName, metrics]) => {
      const averageDuration =
        metrics.durations.length > 0
          ? metrics.durations.reduce((a, b) => a + b, 0) /
            metrics.durations.length
          : 0;
      const failureRate = (metrics.failures / metrics.total) * 100;

      return { stepName, averageDuration, failureRate };
    })
    .filter((step) => step.averageDuration > 1000 || step.failureRate > 5) // Slow steps (>1s) or high failure rate (>5%)
    .sort((a, b) => b.averageDuration - a.averageDuration)
    .slice(0, 10);

  return bottlenecks;
}

/**
 * Track success rates over time
 */
export function trackSuccessRates(runs: WorkflowRun[]): {
  timestamps: string[];
  successRates: number[];
  averageRate: number;
  trend: "up" | "down" | "stable";
} {
  const sortedRuns = [...runs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const timestamps = sortedRuns.map((r) => r.timestamp);
  const successRates = sortedRuns.map((r) =>
    r.result.totalSteps > 0 ? (r.result.passed / r.result.totalSteps) * 100 : 0
  );

  const averageRate =
    successRates.reduce((a, b) => a + b, 0) / successRates.length;

  // Calculate trend using linear regression
  const trend = calculateSuccessRateTrend(successRates);

  return {
    timestamps,
    successRates,
    averageRate,
    trend,
  };
}

/**
 * Calculate success rate trend
 */
function calculateSuccessRateTrend(rates: number[]): "up" | "down" | "stable" {
  if (rates.length < 3) return "stable";

  // Simple linear regression
  const n = rates.length;
  const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
  const sumY = rates.reduce((a, b) => a + b, 0);
  const sumXY = rates.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (slope > 1) return "up";
  if (slope < -1) return "down";
  return "stable";
}

/**
 * Generate comparison report
 */
export function generateComparisonReport(runs: WorkflowRun[]): {
  summary: {
    totalWorkflows: number;
    totalRuns: number;
    overallSuccessRate: number;
    averageDuration: number;
  };
  byWorkflow: ComparisonMetrics[];
  recommendations: string[];
} {
  const metrics = compareWorkflows(runs);

  const totalRuns = runs.length;
  const totalSteps = runs.reduce((sum, r) => sum + r.result.totalSteps, 0);
  const totalPassed = runs.reduce((sum, r) => sum + r.result.passed, 0);
  const overallSuccessRate =
    totalSteps > 0 ? (totalPassed / totalSteps) * 100 : 0;
  const averageDuration =
    runs.reduce((sum, r) => sum + r.result.duration, 0) / totalRuns;

  // Generate recommendations
  const recommendations = generateRecommendations(metrics);

  return {
    summary: {
      totalWorkflows: new Set(runs.map((r) => r.workflowName)).size,
      totalRuns,
      overallSuccessRate,
      averageDuration,
    },
    byWorkflow: metrics,
    recommendations,
  };
}

/**
 * Generate recommendations based on metrics
 */
function generateRecommendations(metrics: ComparisonMetrics[]): string[] {
  const recommendations: string[] = [];

  metrics.forEach((metric) => {
    // Slow workflows
    if (metric.averageDuration > 30000) {
      recommendations.push(
        `⚠️ ${metric.workflowName}: Average duration is ${(
          metric.averageDuration / 1000
        ).toFixed(1)}s. Consider optimizing slow steps.`
      );
    }

    // Low success rate
    if (metric.averageSuccessRate < 80) {
      recommendations.push(
        `❌ ${
          metric.workflowName
        }: Success rate is only ${metric.averageSuccessRate.toFixed(
          1
        )}%. Review common errors and add error handling.`
      );
    }

    // Degrading performance
    if (metric.performanceTrend === "degrading") {
      recommendations.push(
        `📉 ${metric.workflowName}: Performance is degrading over time. Investigate recent changes.`
      );
    }

    // High failure rate on specific steps
    metric.bottleneckSteps.forEach((step) => {
      if (step.failureRate > 10) {
        recommendations.push(
          `🔴 ${metric.workflowName} - "${
            step.stepName
          }": High failure rate (${step.failureRate.toFixed(
            1
          )}%). Add retries or improve error handling.`
        );
      }
    });

    // Common errors
    if (metric.commonErrors.length > 0 && metric.commonErrors[0].count > 3) {
      recommendations.push(
        `🐛 ${metric.workflowName}: Recurring error "${metric.commonErrors[0].error}" (${metric.commonErrors[0].count} occurrences). Fix root cause.`
      );
    }
  });

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      "✅ All workflows are performing well. Keep monitoring!"
    );
  }

  return recommendations;
}

/**
 * Store workflow run (local storage)
 */
export function storeWorkflowRun(run: WorkflowRun): void {
  if (typeof window === "undefined") return;

  const key = "workflow_runs";
  const existing = localStorage.getItem(key);
  const runs: WorkflowRun[] = existing ? JSON.parse(existing) : [];

  runs.push(run);

  // Keep only last 100 runs
  if (runs.length > 100) {
    runs.shift();
  }

  localStorage.setItem(key, JSON.stringify(runs));
}

/**
 * Load workflow runs (local storage)
 */
export function loadWorkflowRuns(): WorkflowRun[] {
  if (typeof window === "undefined") return [];

  const key = "workflow_runs";
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
}

/**
 * Clear workflow history
 */
export function clearWorkflowHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("workflow_runs");
}
