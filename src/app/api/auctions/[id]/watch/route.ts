import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";

// POST /api/auctions/[id]/watch - toggle watch
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

    const key = `${user.id}_${id}`;
    const doc = await Collections.favorites().doc(key).get();
    if (doc.exists) {
      await Collections.favorites().doc(key).delete();
      return NextResponse.json({ success: true, watching: false });
    } else {
      await Collections.favorites().doc(key).set({
        user_id: user.id,
        auction_id: id,
        created_at: new Date().toISOString(),
        type: "auction_watch",
      });
      return NextResponse.json({ success: true, watching: true });
    }
  } catch (error) {
    console.error("Toggle watch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle watch" },
      { status: 500 },
    );
  }
}
