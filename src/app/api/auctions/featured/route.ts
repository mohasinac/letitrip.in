import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/auctions/featured
export async function GET() {
  try {
    const snap = await Collections.auctions()
      .where("is_featured", "==", true)
      .orderBy("featured_priority", "desc")
      .limit(50)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Featured auctions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load featured auctions" },
      { status: 500 },
    );
  }
}
