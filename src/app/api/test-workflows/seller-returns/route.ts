import { NextRequest, NextResponse } from "next/server";
import { SellerReturnsManagementWorkflow } from "@/lib/test-workflows/workflows/16-seller-returns";

export async function POST(request: NextRequest) {
  try {
    const workflow = new SellerReturnsManagementWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Seller returns workflow failed:", error);

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
