import { NextRequest, NextResponse } from "next/server";
import { WishlistFavoritesWorkflow } from "@/lib/test-workflows/workflows/13-wishlist-favorites";

export async function POST(request: NextRequest) {
  try {
    const workflow = new WishlistFavoritesWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Wishlist favorites workflow failed:", error);

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
