import { NextRequest, NextResponse } from "next/server";
import { BiddingHistoryWatchlistWorkflow } from "@/lib/test-workflows/workflows/14-bidding-history";

export async function POST(request: NextRequest) {
  try {
    const workflow = new BiddingHistoryWatchlistWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Bidding history workflow failed:", error);

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
