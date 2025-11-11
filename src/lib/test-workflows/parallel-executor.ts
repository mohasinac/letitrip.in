/**
 * Parallel Workflow Executor
 *
 * Allows running multiple test workflows simultaneously with:
 * - Individual progress tracking per workflow
 * - Aggregated results and statistics
 * - Error isolation (one workflow failure doesn't stop others)
 * - Real-time status updates
 * - Performance metrics across all workflows
 *
 * @module test-workflows/parallel-executor
 */

import type { WorkflowResult } from "./helpers";

/**
 * Status of a workflow in parallel execution
 */
export interface ParallelWorkflowStatus {
  workflowId: string;
  workflowName: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number; // 0-100
  currentStep: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  result?: WorkflowResult;
  error?: string;
}

/**
 * Aggregated results from parallel execution
 */
export interface ParallelExecutionResult {
  totalWorkflows: number;
  completed: number;
  failed: number;
  totalDuration: number;
  workflows: ParallelWorkflowStatus[];
  aggregateStats: {
    totalSteps: number;
    passedSteps: number;
    failedSteps: number;
    skippedSteps: number;
    successRate: number;
    averageDuration: number;
    fastestWorkflow: string;
    slowestWorkflow: string;
  };
}

/**
 * Workflow executor function type
 */
export type WorkflowExecutor = () => Promise<WorkflowResult | any>;

/**
 * Parallel Workflow Executor Class
 */
export class ParallelWorkflowExecutor {
  private workflows: Map<string, { name: string; executor: WorkflowExecutor }> =
    new Map();
  private statusMap: Map<string, ParallelWorkflowStatus> = new Map();
  private statusCallback?: (statuses: ParallelWorkflowStatus[]) => void;

  /**
   * Add a workflow to the execution queue
   */
  addWorkflow(id: string, name: string, executor: WorkflowExecutor): void {
    this.workflows.set(id, { name, executor });
    this.statusMap.set(id, {
      workflowId: id,
      workflowName: name,
      status: "pending",
      progress: 0,
      currentStep: "Waiting to start...",
    });
  }

  /**
   * Set callback for status updates
   */
  onStatusUpdate(callback: (statuses: ParallelWorkflowStatus[]) => void): void {
    this.statusCallback = callback;
  }

  /**
   * Update status for a workflow and notify listeners
   */
  private updateStatus(
    id: string,
    updates: Partial<ParallelWorkflowStatus>
  ): void {
    const current = this.statusMap.get(id);
    if (current) {
      this.statusMap.set(id, { ...current, ...updates });
      if (this.statusCallback) {
        this.statusCallback(Array.from(this.statusMap.values()));
      }
    }
  }

  /**
   * Execute all workflows in parallel
   */
  async executeAll(): Promise<ParallelExecutionResult> {
    const startTime = Date.now();

    console.log("\n" + "=".repeat(70));
    console.log("🚀 PARALLEL WORKFLOW EXECUTION");
    console.log("=".repeat(70));
    console.log(`📋 Total Workflows: ${this.workflows.size}`);
    console.log(`⏱️  Start Time: ${new Date().toLocaleTimeString()}`);
    console.log("=".repeat(70) + "\n");

    // Execute all workflows in parallel
    const promises = Array.from(this.workflows.entries()).map(
      async ([id, { name, executor }]) => {
        try {
          // Mark as running
          this.updateStatus(id, {
            status: "running",
            startTime: Date.now(),
            currentStep: "Starting workflow...",
          });

          console.log(`\n🔄 Starting: ${name} (${id})`);

          // Execute the workflow
          const result = await executor();

          // Calculate progress from result (handle different result formats)
          const totalSteps = result.totalSteps || result.total || 0;
          const passedSteps = result.passed || 0;
          const progress =
            totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0;

          // Mark as completed
          const endTime = Date.now();
          this.updateStatus(id, {
            status: "completed",
            progress: 100,
            currentStep: "Completed",
            endTime,
            duration: endTime - (this.statusMap.get(id)?.startTime || endTime),
            result: {
              ...result,
              totalSteps,
              passed: passedSteps,
            },
          });

          console.log(
            `✅ Completed: ${name} - ${passedSteps}/${totalSteps} steps passed`
          );

          return { id, result, error: null };
        } catch (error: any) {
          // Mark as failed
          const endTime = Date.now();
          this.updateStatus(id, {
            status: "failed",
            progress: 0,
            currentStep: "Failed",
            endTime,
            duration: endTime - (this.statusMap.get(id)?.startTime || endTime),
            error: error.message,
          });

          console.error(`❌ Failed: ${name} - ${error.message}`);

          return { id, result: null, error: error.message };
        }
      }
    );

    // Wait for all workflows to complete
    const results = await Promise.allSettled(promises);

    const totalDuration = Date.now() - startTime;

    // Aggregate results
    const aggregateResult = this.aggregateResults(results, totalDuration);

    console.log("\n" + "=".repeat(70));
    console.log("📊 PARALLEL EXECUTION SUMMARY");
    console.log("=".repeat(70));
    console.log(
      `✅ Completed: ${aggregateResult.completed}/${aggregateResult.totalWorkflows}`
    );
    console.log(
      `❌ Failed: ${aggregateResult.failed}/${aggregateResult.totalWorkflows}`
    );
    console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(
      `📈 Success Rate: ${aggregateResult.aggregateStats.successRate.toFixed(
        1
      )}%`
    );
    console.log(
      `⚡ Average Duration: ${(
        aggregateResult.aggregateStats.averageDuration / 1000
      ).toFixed(2)}s`
    );
    console.log(
      `🏆 Fastest: ${aggregateResult.aggregateStats.fastestWorkflow}`
    );
    console.log(
      `🐌 Slowest: ${aggregateResult.aggregateStats.slowestWorkflow}`
    );
    console.log("=".repeat(70) + "\n");

    return aggregateResult;
  }

  /**
   * Aggregate results from all workflows
   */
  private aggregateResults(
    results: PromiseSettledResult<any>[],
    totalDuration: number
  ): ParallelExecutionResult {
    const statuses = Array.from(this.statusMap.values());
    const completed = statuses.filter((s) => s.status === "completed").length;
    const failed = statuses.filter((s) => s.status === "failed").length;

    // Calculate aggregate statistics
    let totalSteps = 0;
    let passedSteps = 0;
    let failedSteps = 0;
    let skippedSteps = 0;
    let fastestWorkflow = "";
    let slowestWorkflow = "";
    let fastestTime = Infinity;
    let slowestTime = 0;

    statuses.forEach((status) => {
      if (status.result) {
        totalSteps += status.result.totalSteps;
        passedSteps += status.result.passed;
        failedSteps += status.result.failed;
        skippedSteps += status.result.skipped || 0;
      }

      if (status.duration) {
        if (status.duration < fastestTime) {
          fastestTime = status.duration;
          fastestWorkflow = status.workflowName;
        }
        if (status.duration > slowestTime) {
          slowestTime = status.duration;
          slowestWorkflow = status.workflowName;
        }
      }
    });

    const successRate = totalSteps > 0 ? (passedSteps / totalSteps) * 100 : 0;
    const completedWorkflows = statuses.filter((s) => s.duration);
    const averageDuration =
      completedWorkflows.length > 0
        ? completedWorkflows.reduce((sum, s) => sum + (s.duration || 0), 0) /
          completedWorkflows.length
        : 0;

    return {
      totalWorkflows: this.workflows.size,
      completed,
      failed,
      totalDuration,
      workflows: statuses,
      aggregateStats: {
        totalSteps,
        passedSteps,
        failedSteps,
        skippedSteps,
        successRate,
        averageDuration,
        fastestWorkflow: fastestWorkflow || "N/A",
        slowestWorkflow: slowestWorkflow || "N/A",
      },
    };
  }

  /**
   * Get current status of all workflows
   */
  getStatuses(): ParallelWorkflowStatus[] {
    return Array.from(this.statusMap.values());
  }

  /**
   * Clear all workflows and reset state
   */
  clear(): void {
    this.workflows.clear();
    this.statusMap.clear();
  }

  /**
   * Export parallel execution results to JSON
   */
  exportToJSON(result: ParallelExecutionResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Export parallel execution results to CSV summary
   */
  exportToCSV(result: ParallelExecutionResult): string {
    const headers = [
      "Workflow ID",
      "Workflow Name",
      "Status",
      "Duration (ms)",
      "Total Steps",
      "Passed Steps",
      "Failed Steps",
      "Success Rate (%)",
    ];

    const rows = result.workflows.map((w) => [
      w.workflowId,
      w.workflowName,
      w.status,
      w.duration || 0,
      w.result?.totalSteps || 0,
      w.result?.passed || 0,
      w.result?.failed || 0,
      w.result && w.result.totalSteps > 0
        ? ((w.result.passed / w.result.totalSteps) * 100).toFixed(1)
        : "0.0",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
      "", // Empty line
      "SUMMARY",
      `Total Workflows,${result.totalWorkflows}`,
      `Completed,${result.completed}`,
      `Failed,${result.failed}`,
      `Total Duration (ms),${result.totalDuration}`,
      `Average Duration (ms),${result.aggregateStats.averageDuration.toFixed(
        0
      )}`,
      `Overall Success Rate (%),${result.aggregateStats.successRate.toFixed(
        1
      )}`,
      `Fastest Workflow,${result.aggregateStats.fastestWorkflow}`,
      `Slowest Workflow,${result.aggregateStats.slowestWorkflow}`,
    ];

    return csv.join("\n");
  }
}

/**
 * Helper function to create and execute parallel workflows
 */
export async function executeWorkflowsInParallel(
  workflows: Array<{ id: string; name: string; executor: WorkflowExecutor }>,
  onStatusUpdate?: (statuses: ParallelWorkflowStatus[]) => void
): Promise<ParallelExecutionResult> {
  const executor = new ParallelWorkflowExecutor();

  // Add all workflows
  workflows.forEach(({ id, name, executor: exec }) => {
    executor.addWorkflow(id, name, exec);
  });

  // Set status callback if provided
  if (onStatusUpdate) {
    executor.onStatusUpdate(onStatusUpdate);
  }

  // Execute all workflows
  return executor.executeAll();
}

/**
 * Helper to run a subset of workflows by IDs
 */
export async function executeSelectedWorkflows(
  workflowIds: string[],
  allWorkflows: Map<string, { name: string; executor: WorkflowExecutor }>,
  onStatusUpdate?: (statuses: ParallelWorkflowStatus[]) => void
): Promise<ParallelExecutionResult> {
  const selected = workflowIds
    .map((id) => {
      const workflow = allWorkflows.get(id);
      return workflow ? { id, ...workflow } : null;
    })
    .filter(
      (w): w is { id: string; name: string; executor: WorkflowExecutor } =>
        w !== null
    );

  return executeWorkflowsInParallel(selected, onStatusUpdate);
}
