import { NextRequest, NextResponse } from "next/server";
import { AdminReturnsManagementWorkflow } from "@/lib/test-workflows/workflows/20-admin-returns";

export async function POST(request: NextRequest) {
  try {
    const workflow = new AdminReturnsManagementWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Workflow execution failed:", error);
    return NextResponse.json(
      { error: error.message || "Workflow execution failed" },
      { status: 500 }
    );
  }
}
