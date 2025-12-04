import { Collections } from "@/app/api/lib/firebase/collections";
import { placeBid } from "@/app/api/lib/firebase/transactions";
import { withIPTracking } from "@/app/api/middleware/ip-tracker";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/session";

// GET bids list
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startAfter = searchParams.get("startAfter");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    let query = Collections.bids()
      .where("auction_id", "==", id)
      .orderBy("created_at", sortOrder);

    // Apply cursor pagination
    if (startAfter) {
      const startDoc = await Collections.bids().doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch limit + 1 to check if there's a next page
    query = query.limit(limit + 1);
    const snap = await query.get();
    const docs = snap.docs;

    // Check if there's a next page
    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    const data = resultDocs.map((d) => ({ id: d.id, ...d.data() }));
    const nextCursor =
      hasNextPage && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("List bids error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list bids" },
      { status: 500 }
    );
  }
}

async function placeBidHandler(
  request: Request,
  context?: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request as NextRequest);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    if (!context?.params) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }
    const { id } = await context.params;
    const body = await request.json();
    // Accept both 'amount' (from service) and 'bidAmount' (legacy) for backwards compatibility
    const bidAmount = Number(body.amount ?? body.bidAmount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0)
      return NextResponse.json(
        { success: false, error: "Invalid bid amount" },
        { status: 400 }
      );

    const bidId = await placeBid(id, user.id, bidAmount);
    const bidDoc = await Collections.bids().doc(bidId).get();

    return NextResponse.json({
      success: true,
      data: { id: bidDoc.id, ...bidDoc.data() },
    });
  } catch (error) {
    console.error("Place bid error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to place bid",
      },
      { status: 400 }
    );
  }
}

// Export with IP tracking and rate limiting (max 20 bids per 15 minutes)
export const POST = withIPTracking(placeBidHandler, {
  action: "bid_placed",
  checkRateLimit: true,
  maxAttempts: 20,
  windowMinutes: 15,
});
