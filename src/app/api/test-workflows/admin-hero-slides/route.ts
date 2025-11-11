import { NextRequest, NextResponse } from "next/server";
import { AdminHeroSlidesWorkflow } from "@/lib/test-workflows/workflows/19-admin-hero-slides";

export async function POST(request: NextRequest) {
  try {
    const workflow = new AdminHeroSlidesWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Admin hero slides workflow failed:", error);

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
