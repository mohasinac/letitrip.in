import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/categories/homepage
export async function GET() {
  try {
    const snap = await Collections.categories()
      .where("show_on_homepage", "==", true)
      .orderBy("sort_order", "asc")
      .limit(100)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Homepage categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load homepage categories" },
      { status: 500 },
    );
  }
}
