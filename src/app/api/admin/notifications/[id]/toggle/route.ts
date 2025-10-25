import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isActive } = await request.json();
    
    // In production, update notification active status in database
    return NextResponse.json({ success: true, message: "Notification status updated" });
  } catch (error) {
    console.error("Error toggling notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
