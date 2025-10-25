import { NextRequest, NextResponse } from "next/server";
import { cleanupSeededData, cleanupAllData } from "@/lib/firebase/cleanup";

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await verifyAdminAuth(request);
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { action } = await request.json();
    
    let result;
    if (action === "seeded") {
      result = await cleanupSeededData();
    } else if (action === "all") {
      result = await cleanupAllData();
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'seeded' or 'all'" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${action} data`,
      details: result
    });
  } catch (error) {
    console.error("Cleanup Firebase data error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup Firebase data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
