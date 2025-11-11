import { NextRequest, NextResponse } from "next/server";
import { UserProfileManagementWorkflow } from "@/lib/test-workflows/workflows/12-user-profile";

export async function POST(request: NextRequest) {
  try {
    const workflow = new UserProfileManagementWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("User profile workflow failed:", error);

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
