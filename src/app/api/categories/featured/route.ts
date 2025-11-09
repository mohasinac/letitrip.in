import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/categories/featured
export async function GET() {
  try {
    const snap = await Collections.categories()
      .where("is_featured", "==", true)
      .limit(100)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Featured categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load featured categories" },
      { status: 500 },
    );
  }
}
