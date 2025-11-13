import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";

/**
 * POST - Execute test workflow with managed data
 *
 * Flow:
 * 1. Generate test data (if needed)
 * 2. Load test data context
 * 3. Execute workflow(s)
 * 4. Cleanup data (if requested)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, workflowIds, config, cleanupBefore, cleanupAfter } = body;

    const results: any = {
      action,
      timestamp: new Date().toISOString(),
      steps: [],
    };

    // Step 1: Cleanup before (if requested)
    if (cleanupBefore) {
      const cleanupRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test-data/cleanup`,
        {
          method: "POST",
        }
      );
      const cleanupData = await cleanupRes.json();
      results.steps.push({
        step: "cleanup_before",
        success: cleanupData.success,
        data: cleanupData,
      });
    }

    // Step 2: Generate data (if action is 'generate' or 'generateAndRun')
    if (action === "generate" || action === "generateAndRun") {
      const generateRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test-data/generate-complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }
      );
      const generateData = await generateRes.json();
      results.steps.push({
        step: "generate_data",
        success: generateData.success,
        data: generateData,
      });

      if (!generateData.success) {
        return NextResponse.json({
          success: false,
          error: "Failed to generate test data",
          results,
        });
      }
    }

    // Step 3: Load test data context
    const contextRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/test-data/context`
    );
    const contextData = await contextRes.json();
    results.steps.push({
      step: "load_context",
      success: contextData.success,
      data: {
        totalItems: contextData.context?.metadata?.totalItems || 0,
        users: contextData.context?.users?.all?.length || 0,
        shops: contextData.context?.shops?.all?.length || 0,
        products: contextData.context?.products?.all?.length || 0,
      },
    });

    if (!contextData.success) {
      return NextResponse.json({
        success: false,
        error: "Failed to load test data context",
        results,
      });
    }

    results.context = contextData.context;

    // Step 4: Execute workflows (if action is 'run' or 'generateAndRun')
    if (action === "run" || action === "generateAndRun") {
      const workflowResults = [];

      for (const workflowId of workflowIds || []) {
        try {
          // Execute workflow (placeholder - actual implementation needed)
          const workflowRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/test-workflows/${workflowId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                context: contextData.context,
                config,
              }),
            }
          );

          const workflowData = await workflowRes.json();
          workflowResults.push({
            workflowId,
            success: workflowData.success,
            result: workflowData,
          });
        } catch (error: any) {
          workflowResults.push({
            workflowId,
            success: false,
            error: error.message,
          });
        }
      }

      results.steps.push({
        step: "execute_workflows",
        success: workflowResults.every((r: any) => r.success),
        data: workflowResults,
      });
    }

    // Step 5: Cleanup after (if requested)
    if (cleanupAfter) {
      const cleanupRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test-data/cleanup`,
        {
          method: "POST",
        }
      );
      const cleanupData = await cleanupRes.json();
      results.steps.push({
        step: "cleanup_after",
        success: cleanupData.success,
        data: cleanupData,
      });
    }

    const allStepsSuccess = results.steps.every((s: any) => s.success);

    return NextResponse.json({
      success: allStepsSuccess,
      results,
      message: allStepsSuccess
        ? "Workflow execution completed successfully"
        : "Workflow execution completed with errors",
    });
  } catch (error: any) {
    console.error("Error executing workflow manager:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get workflow manager status
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current test data stats
    const statusRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/test-data/status`
    );
    const statusData = await statusRes.json();

    // Get context
    const contextRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/test-data/context`
    );
    const contextData = await contextRes.json();

    return NextResponse.json({
      success: true,
      status: statusData,
      context: contextData.context,
      hasTestData: (contextData.context?.metadata?.totalItems || 0) > 0,
    });
  } catch (error: any) {
    console.error("Error getting workflow manager status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
