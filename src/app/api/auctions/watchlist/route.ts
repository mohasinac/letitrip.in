import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

// GET /api/auctions/watchlist - authenticated user's watched auctions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const snap = await Collections.favorites()
      .where("user_id", "==", user.id)
      .where("type", "==", "auction_watch")
      .orderBy("created_at", "desc")
      .limit(100)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Watchlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load watchlist" },
      { status: 500 },
    );
  }
}
