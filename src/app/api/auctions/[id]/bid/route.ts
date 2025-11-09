import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";
import { placeBid } from "@/app/api/lib/firebase/transactions";

// GET bids list, POST place bid
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const snap = await Collections.bids()
      .where("auction_id", "==", id)
      .orderBy("created_at", "desc")
      .limit(limit)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit },
    });
  } catch (error) {
    console.error("List bids error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list bids" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const { id } = await params;
    const body = await request.json();
    const bidAmount = Number(body.bidAmount);
    if (!Number.isFinite(bidAmount))
      return NextResponse.json(
        { success: false, error: "Invalid bid amount" },
        { status: 400 },
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
      { status: 400 },
    );
  }
}
