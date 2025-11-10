import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

// GET /api/auctions/won - authenticated user's won auctions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    // Assuming auctions store highest_bidder_id and status 'ended'
    const snap = await Collections.auctions()
      .where("status", "==", "ended")
      .where("highest_bidder_id", "==", user.id)
      .orderBy("updated_at", "desc")
      .limit(50)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Won auctions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load won auctions" },
      { status: 500 },
    );
  }
}
