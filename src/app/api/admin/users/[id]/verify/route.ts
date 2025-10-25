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

    const { verified } = await request.json();
    
    // In production, update user verification status in database
    // For now, just return success
    return NextResponse.json({ success: true, message: "Verification status updated" });
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
