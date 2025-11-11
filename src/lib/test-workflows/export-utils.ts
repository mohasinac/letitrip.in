/**
 * Workflow Results Export Utilities
 *
 * Provides functions to export workflow results to JSON and CSV formats
 * with timestamps and performance metrics.
 */

import type { WorkflowResult } from "./helpers";

/**
 * Export workflow results to JSON format
 */
export function exportToJSON(
  results: WorkflowResult | WorkflowResult[],
  filename?: string
): void {
  const data = Array.isArray(results) ? results : [results];

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalWorkflows: data.length,
    summary: {
      totalPassed: data.reduce((sum, r) => sum + r.passed, 0),
      totalFailed: data.reduce((sum, r) => sum + r.failed, 0),
      totalSkipped: data.reduce((sum, r) => sum + r.skipped, 0),
      totalDuration: data.reduce((sum, r) => sum + r.duration, 0),
      successRate: calculateSuccessRate(data),
    },
    workflows: data,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `workflow-results-${Date.now()}.json`;
  downloadFile(url, filename || defaultFilename);

  URL.revokeObjectURL(url);
}

/**
 * Export workflow results to CSV format
 */
export function exportToCSV(
  results: WorkflowResult | WorkflowResult[],
  filename?: string
): void {
  const data = Array.isArray(results) ? results : [results];

  // CSV headers
  const headers = [
    "Workflow",
    "Total Steps",
    "Passed",
    "Failed",
    "Skipped",
    "Success Rate (%)",
    "Duration (s)",
    "Start Time",
    "End Time",
    "Errors",
  ];

  // CSV rows
  const rows = data.map((result) => {
    const successRate =
      result.totalSteps > 0
        ? ((result.passed / result.totalSteps) * 100).toFixed(2)
        : "0.00";

    const startTime = new Date(Date.now() - result.duration).toISOString();
    const endTime = new Date().toISOString();
    const duration = (result.duration / 1000).toFixed(2);

    const errors = result.errors.length > 0 ? result.errors.join("; ") : "None";

    return [
      `"Workflow ${data.indexOf(result) + 1}"`,
      result.totalSteps,
      result.passed,
      result.failed,
      result.skipped,
      successRate,
      duration,
      startTime,
      endTime,
      `"${errors.replace(/"/g, '""')}"`, // Escape quotes in CSV
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `workflow-results-${Date.now()}.csv`;
  downloadFile(url, filename || defaultFilename);

  URL.revokeObjectURL(url);
}

/**
 * Export detailed workflow steps to CSV
 */
export function exportStepsToCSV(
  results: WorkflowResult | WorkflowResult[],
  filename?: string
): void {
  const data = Array.isArray(results) ? results : [results];

  // CSV headers
  const headers = [
    "Workflow",
    "Step Number",
    "Step Name",
    "Status",
    "Duration (ms)",
    "Error",
  ];

  // CSV rows - flatten all steps from all workflows
  const rows: any[] = [];

  data.forEach((result, workflowIndex) => {
    result.steps.forEach((step, stepIndex) => {
      rows.push([
        `"Workflow ${workflowIndex + 1}"`,
        stepIndex + 1,
        `"${step.name}"`,
        step.status,
        step.duration || 0,
        `"${step.error ? step.error.replace(/"/g, '""') : ""}"`,
      ]);
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `workflow-steps-${Date.now()}.csv`;
  downloadFile(url, filename || defaultFilename);

  URL.revokeObjectURL(url);
}

/**
 * Export workflow comparison report
 */
export function exportComparisonReport(
  results: WorkflowResult[],
  filename?: string
): void {
  if (results.length < 2) {
    console.warn("Need at least 2 workflow results for comparison");
    return;
  }

  const report = {
    exportedAt: new Date().toISOString(),
    totalWorkflows: results.length,
    comparison: {
      averageDuration:
        results.reduce((sum, r) => sum + r.duration, 0) / results.length / 1000,
      bestPerformance: Math.min(...results.map((r) => r.duration)) / 1000,
      worstPerformance: Math.max(...results.map((r) => r.duration)) / 1000,
      averageSuccessRate: calculateSuccessRate(results),
      totalSteps: results.reduce((sum, r) => sum + r.totalSteps, 0),
      totalPassed: results.reduce((sum, r) => sum + r.passed, 0),
      totalFailed: results.reduce((sum, r) => sum + r.failed, 0),
      totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
    },
    workflows: results.map((result, index) => ({
      workflowNumber: index + 1,
      totalSteps: result.totalSteps,
      passed: result.passed,
      failed: result.failed,
      skipped: result.skipped,
      successRate:
        result.totalSteps > 0
          ? ((result.passed / result.totalSteps) * 100).toFixed(2)
          : "0.00",
      duration: (result.duration / 1000).toFixed(2),
      errors: result.errors,
    })),
  };

  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `workflow-comparison-${Date.now()}.json`;
  downloadFile(url, filename || defaultFilename);

  URL.revokeObjectURL(url);
}

/**
 * Calculate average success rate across workflows
 */
function calculateSuccessRate(results: WorkflowResult[]): string {
  const totalSteps = results.reduce((sum, r) => sum + r.totalSteps, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);

  return totalSteps > 0
    ? ((totalPassed / totalSteps) * 100).toFixed(2)
    : "0.00";
}

/**
 * Download file helper
 */
function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format workflow results for display
 */
export function formatResults(result: WorkflowResult): string {
  const successRate =
    result.totalSteps > 0
      ? ((result.passed / result.totalSteps) * 100).toFixed(2)
      : "0.00";

  const duration = (result.duration / 1000).toFixed(2);

  return `
Workflow Results:
  Total Steps: ${result.totalSteps}
  Passed: ${result.passed} ✅
  Failed: ${result.failed} ❌
  Skipped: ${result.skipped} ⏭️
  Success Rate: ${successRate}%
  Duration: ${duration}s
  ${
    result.errors.length > 0
      ? `\nErrors:\n  - ${result.errors.join("\n  - ")}`
      : ""
  }
  `.trim();
}

/**
 * Get workflow performance metrics
 */
export function getPerformanceMetrics(results: WorkflowResult[]): {
  totalRuns: number;
  averageDuration: number;
  averageSuccessRate: number;
  failureRate: number;
  totalErrors: number;
  slowestWorkflow: number;
  fastestWorkflow: number;
} {
  const totalRuns = results.length;
  const averageDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / totalRuns / 1000;
  const totalSteps = results.reduce((sum, r) => sum + r.totalSteps, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const averageSuccessRate =
    totalSteps > 0 ? (totalPassed / totalSteps) * 100 : 0;
  const failureRate = totalSteps > 0 ? (totalFailed / totalSteps) * 100 : 0;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const slowestWorkflow = Math.max(...results.map((r) => r.duration)) / 1000;
  const fastestWorkflow = Math.min(...results.map((r) => r.duration)) / 1000;

  return {
    totalRuns,
    averageDuration,
    averageSuccessRate,
    failureRate,
    totalErrors,
    slowestWorkflow,
    fastestWorkflow,
  };
}
