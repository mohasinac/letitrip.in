import { NextRequest, NextResponse } from "next/server";
import { AdminBlogManagementWorkflow } from "@/lib/test-workflows/workflows/18-admin-blog";

export async function POST(request: NextRequest) {
  try {
    const workflow = new AdminBlogManagementWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Admin blog workflow failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
