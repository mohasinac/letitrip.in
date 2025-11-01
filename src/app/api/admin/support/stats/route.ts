import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/support/stats
 * Get support ticket statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || "user";

    // Only admins can access
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const db = getAdminDb();

    // Get all tickets
    const allTicketsSnapshot = await db.collection("support_tickets").get();
    const tickets = allTicketsSnapshot.docs.map((doc: any) => doc.data());

    // Calculate stats
    const stats = {
      total: tickets.length,
      open: tickets.filter((t: any) => t.status === "open").length,
      inProgress: tickets.filter((t: any) => t.status === "in_progress").length,
      resolved: tickets.filter((t: any) => t.status === "resolved").length,
      closed: tickets.filter((t: any) => t.status === "closed").length,
      avgResponseTime: "2.5 hours", // TODO: Calculate from actual data
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    console.error("Error fetching support stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch support stats",
      },
      { status: 500 }
    );
  }
}
