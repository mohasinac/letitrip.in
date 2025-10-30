import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/database/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from "firebase/firestore";

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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    // Get query params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const isReadParam = searchParams.get("isRead");
    const limitParam = parseInt(searchParams.get("limit") || "50");

    // Build query
    let alertsQuery;
    const constraints: any[] = [orderBy("createdAt", "desc")];

    if (userRole !== "admin") {
      constraints.unshift(where("sellerId", "==", userId));
    }

    if (type !== "all") {
      constraints.push(where("type", "==", type));
    }

    if (isReadParam !== null) {
      constraints.push(where("isRead", "==", isReadParam === "true"));
    }

    constraints.push(firestoreLimit(limitParam));

    alertsQuery = query(collection(db, "seller_alerts"), ...constraints);

    const alertsSnap = await getDocs(alertsQuery);
    const alerts = alertsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    // Get stats
    let statsQuery;
    if (userRole === "admin") {
      statsQuery = query(collection(db, "seller_alerts"));
    } else {
      statsQuery = query(
        collection(db, "seller_alerts"),
        where("sellerId", "==", userId),
      );
    }

    const statsSnap = await getDocs(statsQuery);
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
