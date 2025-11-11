/**
 * Phase 3: Master Test Runner
 *
 * Executes all 5 test workflows sequentially and generates comprehensive report
 *
 * Usage:
 *   npm run test:workflows
 *   or
 *   ts-node tests/run-workflows.ts
 */

import { ProductPurchaseWorkflow } from "../src/lib/test-workflows/workflows/01-product-purchase";
import { AuctionBiddingWorkflow } from "../src/lib/test-workflows/workflows/02-auction-bidding";
import { OrderFulfillmentWorkflow } from "../src/lib/test-workflows/workflows/03-order-fulfillment";
import { SupportTicketWorkflow } from "../src/lib/test-workflows/workflows/04-support-tickets";
import { ReviewsRatingsWorkflow } from "../src/lib/test-workflows/workflows/05-reviews-ratings";

interface WorkflowSummary {
  name: string;
  status: "success" | "failed" | "partial" | "skipped";
  passed: number;
  failed: number;
  duration: number;
  error?: string;
}

class WorkflowTestRunner {
  private results: WorkflowSummary[] = [];

  async runAllWorkflows(): Promise<void> {
    console.log("\n" + "=".repeat(70));
    console.log("🚀 PHASE 3: TEST WORKFLOWS - MASTER RUNNER");
    console.log("=".repeat(70));
    console.log("\nExecuting 5 end-to-end workflow tests...\n");

    const startTime = Date.now();

    // Workflow 1: Product Purchase
    await this.runWorkflow("Product Purchase Flow", async () => {
      const workflow = new ProductPurchaseWorkflow();
      return await workflow.run();
    });

    // Workflow 2: Auction Bidding
    await this.runWorkflow("Auction Bidding Flow", async () => {
      const workflow = new AuctionBiddingWorkflow();
      return await workflow.run();
    });

    // Workflow 3: Order Fulfillment
    await this.runWorkflow("Order Fulfillment Flow", async () => {
      const workflow = new OrderFulfillmentWorkflow();
      return await workflow.run();
    });

    // Workflow 4: Support Tickets
    await this.runWorkflow("Support Ticket Flow", async () => {
      const workflow = new SupportTicketWorkflow();
      return await workflow.run();
    });

    // Workflow 5: Reviews & Ratings
    await this.runWorkflow("Reviews & Ratings Flow", async () => {
      const workflow = new ReviewsRatingsWorkflow();
      return await workflow.run();
    });

    const totalDuration = Date.now() - startTime;

    // Print final report
    this.printFinalReport(totalDuration);
  }

  private async runWorkflow(
    name: string,
    executor: () => Promise<any>
  ): Promise<void> {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`▶️  Starting: ${name}`);
    console.log(`${"─".repeat(70)}`);

    const startTime = Date.now();

    try {
      const result = await executor();
      const duration = Date.now() - startTime;

      this.results.push({
        name,
        status: result.finalStatus || "success",
        passed: result.passed || 0,
        failed: result.failed || 0,
        duration,
      });

      console.log(`\n✅ ${name} completed in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;

      this.results.push({
        name,
        status: "failed",
        passed: 0,
        failed: 1,
        duration,
        error: error.message,
      });

      console.error(`\n❌ ${name} failed: ${error.message}`);
    }
  }

  private printFinalReport(totalDuration: number): void {
    console.log("\n\n" + "=".repeat(70));
    console.log("📊 FINAL WORKFLOW TEST REPORT");
    console.log("=".repeat(70));

    const totalWorkflows = this.results.length;
    const successCount = this.results.filter(
      (r) => r.status === "success"
    ).length;
    const failedCount = this.results.filter(
      (r) => r.status === "failed"
    ).length;
    const partialCount = this.results.filter(
      (r) => r.status === "partial"
    ).length;

    console.log(`\n📈 Summary:`);
    console.log(`   Total Workflows: ${totalWorkflows}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   ⚠️  Partial: ${partialCount}`);
    console.log(`   ⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

    console.log(`\n📋 Workflow Details:\n`);

    this.results.forEach((result, index) => {
      const statusIcon =
        result.status === "success"
          ? "✅"
          : result.status === "partial"
          ? "⚠️"
          : "❌";
      console.log(`   ${index + 1}. ${statusIcon} ${result.name}`);
      console.log(
        `      Steps: ${result.passed} passed, ${result.failed} failed`
      );
      console.log(`      Duration: ${result.duration}ms`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
      console.log();
    });

    // Calculate pass rate
    const totalSteps = this.results.reduce(
      (sum, r) => sum + r.passed + r.failed,
      0
    );
    const passedSteps = this.results.reduce((sum, r) => sum + r.passed, 0);
    const passRate =
      totalSteps > 0 ? ((passedSteps / totalSteps) * 100).toFixed(1) : "0";

    console.log(`\n🎯 Overall Pass Rate: ${passRate}%`);
    console.log(`   Total Steps Executed: ${totalSteps}`);
    console.log(`   Passed: ${passedSteps}`);
    console.log(`   Failed: ${totalSteps - passedSteps}`);

    // Recommendations
    console.log(`\n💡 Recommendations:`);

    if (failedCount === 0) {
      console.log(`   ✨ All workflows passed! System is production-ready.`);
      console.log(`   🚀 Consider deploying to staging environment.`);
    } else if (failedCount > 0 && failedCount < totalWorkflows) {
      console.log(`   ⚠️  Some workflows failed. Review failed steps.`);
      console.log(`   🔧 Fix critical issues before deployment.`);
    } else {
      console.log(`   🚨 Major issues detected. Full review required.`);
      console.log(`   🛑 Do not deploy until all workflows pass.`);
    }

    console.log("\n" + "=".repeat(70));
    console.log(`\n✅ Phase 3 Test Workflows Complete!`);
    console.log(`📁 Detailed logs available in: tests/workflows/\n`);
  }
}

// Main execution
if (require.main === module) {
  const runner = new WorkflowTestRunner();

  runner
    .runAllWorkflows()
    .then(() => {
      console.log("All workflows completed successfully!\n");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error running workflows:", error);
      process.exit(1);
    });
}

export { WorkflowTestRunner };
