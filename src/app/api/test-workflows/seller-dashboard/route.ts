import { NextRequest, NextResponse } from "next/server";
import { SellerDashboardAnalyticsWorkflow } from "@/lib/test-workflows/workflows/15-seller-dashboard";

export async function POST(request: NextRequest) {
  try {
    const workflow = new SellerDashboardAnalyticsWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Seller dashboard workflow failed:", error);

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
