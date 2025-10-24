import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In production, increment helpful count in database
    // For now, just return success
    return NextResponse.json({ success: true, message: "Review marked as helpful" });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
