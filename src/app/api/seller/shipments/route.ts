import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Get all shipments for seller
 * GET /api/seller/shipments?status=all|pending|in_transit|delivered
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
    
    console.log("Shipments API - User ID:", userId, "Role:", userRole);

    // Get admin Firestore instance (bypasses security rules)
    const db = getAdminDb();

    // Get query params
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "all";

    // Build query
    let shipmentsQuery;
    if (userRole === "admin") {
      if (statusFilter !== "all") {
        shipmentsQuery = db
          .collection("shipments")
          .where("status", "==", statusFilter)
          .orderBy("createdAt", "desc");
      } else {
        shipmentsQuery = db
          .collection("shipments")
          .orderBy("createdAt", "desc");
      }
    } else {
      if (statusFilter !== "all") {
        shipmentsQuery = db
          .collection("shipments")
          .where("sellerId", "==", userId)
          .where("status", "==", statusFilter)
          .orderBy("createdAt", "desc");
      } else {
        shipmentsQuery = db
          .collection("shipments")
          .where("sellerId", "==", userId)
          .orderBy("createdAt", "desc");
      }
    }

    const shipmentsSnap = await shipmentsQuery.get();
    const shipments = shipmentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      shippedAt: doc.data().shippedAt?.toDate?.()?.toISOString() || null,
      deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || null,
    }));

    // Calculate stats
    let statsQuery;
    if (userRole === "admin") {
      statsQuery = db.collection("shipments");
    } else {
      statsQuery = db
        .collection("shipments")
        .where("sellerId", "==", userId);
    }

    const statsSnap = await statsQuery.get();
    let total = 0;
    let pending = 0;
    let pickup_scheduled = 0;
    let in_transit = 0;
    let out_for_delivery = 0;
    let delivered = 0;
    let failed = 0;

    statsSnap.docs.forEach((doc) => {
      const data = doc.data();
      total++;
      switch (data.status) {
        case "pending":
          pending++;
          break;
        case "pickup_scheduled":
          pickup_scheduled++;
          break;
        case "in_transit":
          in_transit++;
          break;
        case "out_for_delivery":
          out_for_delivery++;
          break;
        case "delivered":
          delivered++;
          break;
        case "failed":
        case "returned":
          failed++;
          break;
      }
    });

    return NextResponse.json({
      success: true,
      data: shipments,
      stats: {
        total,
        pending,
        pickup_scheduled,
        in_transit,
        out_for_delivery,
        delivered,
        failed,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch shipments",
      },
      { status: 500 },
    );
  }
}
