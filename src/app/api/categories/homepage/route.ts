import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/categories/homepage
export async function GET() {
  try {
    // First get all categories where show_on_homepage is true
    const snap = await Collections.categories()
      .where("show_on_homepage", "==", true)
      .limit(100)
      .get();
    
    // Sort in memory to avoid composite index requirement
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Homepage categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load homepage categories" },
      { status: 500 },
    );
  }
}
