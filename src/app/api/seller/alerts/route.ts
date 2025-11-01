import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Get seller alerts
 * GET /api/seller/alerts?type=all|new_order|pending_approval|low_stock&isRead=true|false&limit=50
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.uid;
    const userRole = (decoded as any).role || "user";

    // Get query params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const isReadParam = searchParams.get("isRead");
    const limitParam = parseInt(searchParams.get("limit") || "50");

    // Build query using Admin SDK
    const db = getAdminDb();
    let alertsQuery = db.collection("seller_alerts").orderBy("createdAt", "desc");

    if (userRole !== "admin") {
      alertsQuery = alertsQuery.where("sellerId", "==", userId);
    }

    if (type !== "all") {
      alertsQuery = alertsQuery.where("type", "==", type);
    }

    if (isReadParam !== null) {
      alertsQuery = alertsQuery.where("isRead", "==", isReadParam === "true");
    }

    alertsQuery = alertsQuery.limit(limitParam);

    const alertsSnap = await alertsQuery.get();
    const alerts = alertsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    // Get stats using Admin SDK
    const statsQuery = userRole !== "admin" 
      ? db.collection("seller_alerts").where("sellerId", "==", userId)
      : db.collection("seller_alerts");

    const statsSnap = await statsQuery.get();
    let totalAlerts = 0;
    let unreadAlerts = 0;
    let newOrders = 0;
    let lowStock = 0;

    statsSnap.docs.forEach((doc) => {
      const data = doc.data();
      totalAlerts++;
      if (!data.isRead) unreadAlerts++;
      if (data.type === "new_order") newOrders++;
      if (data.type === "low_stock") lowStock++;
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      stats: {
        totalAlerts,
        unreadAlerts,
        newOrders,
        lowStock,
      },
    });
  } catch (error: any) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch alerts",
      },
      { status: 500 },
    );
  }
}
