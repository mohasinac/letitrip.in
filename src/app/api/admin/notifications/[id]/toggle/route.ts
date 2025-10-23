import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
