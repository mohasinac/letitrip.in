/**
 * Test script for parallel workflow execution
 *
 * Usage: node scripts/test-parallel-workflows.js
 */

async function testParallelWorkflows() {
  console.log("🧪 Testing Parallel Workflow Execution\n");

  // Test 1: List available workflows
  console.log("📋 Test 1: List available workflows");
  try {
    const listResponse = await fetch(
      "http://localhost:3000/api/test-workflows/parallel"
    );
    const listData = await listResponse.json();
    console.log(`✅ Found ${listData.totalWorkflows} workflows`);
    console.log(
      `   Workflows: ${listData.workflows
        .map((w) => w.id)
        .slice(0, 5)
        .join(", ")}...`
    );
  } catch (error) {
    console.error("❌ Failed to list workflows:", error.message);
  }

  console.log("");

  // Test 2: Execute 3 workflows in parallel
  console.log("🚀 Test 2: Execute 3 workflows in parallel");
  try {
    const executeResponse = await fetch(
      "http://localhost:3000/api/test-workflows/parallel",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowIds: ["user-profile", "wishlist-favorites", "seller-coupons"],
        }),
      }
    );

    const result = await executeResponse.json();

    if (result.error) {
      console.error("❌ Execution failed:", result.error);
      return;
    }

    console.log(`✅ Parallel execution completed`);
    console.log(`   Total Workflows: ${result.totalWorkflows}`);
    console.log(`   Completed: ${result.completed}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(
      `   Total Duration: ${(result.totalDuration / 1000).toFixed(2)}s`
    );
    console.log(
      `   Success Rate: ${result.aggregateStats.successRate.toFixed(1)}%`
    );
    console.log(`   Fastest: ${result.aggregateStats.fastestWorkflow}`);
    console.log(`   Slowest: ${result.aggregateStats.slowestWorkflow}`);

    console.log("\n📊 Individual Results:");
    result.workflows.forEach((w) => {
      const icon = w.status === "completed" ? "✅" : "❌";
      const duration = w.duration
        ? `${(w.duration / 1000).toFixed(2)}s`
        : "N/A";
      const steps = w.result
        ? `${w.result.passed}/${w.result.totalSteps}`
        : "N/A";
      console.log(
        `   ${icon} ${w.workflowName} - ${duration} - ${steps} steps`
      );
    });
  } catch (error) {
    console.error("❌ Failed to execute workflows:", error.message);
  }

  console.log("\n✨ Tests completed!\n");
}

// Run tests
testParallelWorkflows().catch(console.error);
