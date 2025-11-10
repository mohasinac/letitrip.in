import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";

// PATCH /api/auctions/[id]/feature - admin only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== "admin")
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    const { id } = await params;
    const body = await request.json();
    const update: any = {
      is_featured: !!body.isFeatured,
      featured_priority: body.featuredPriority ?? 0,
      updated_at: new Date().toISOString(),
    };
    await Collections.auctions().doc(id).update(update);
    const updated = await Collections.auctions().doc(id).get();
    return NextResponse.json({
      success: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    console.error("Feature auction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update feature flag" },
      { status: 500 },
    );
  }
}
