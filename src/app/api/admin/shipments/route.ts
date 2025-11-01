import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/shipments
 * List all shipments from all sellers with filtering and search
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query - fetch from shipments collection
    let firestoreQuery: any = db.collection("shipments");

    // Apply status filter
    if (status && status !== "all") {
      firestoreQuery = firestoreQuery.where("status", "==", status);
    }

    // Order by creation date
    firestoreQuery = firestoreQuery.orderBy("createdAt", "desc");

    const snapshot = await firestoreQuery.get();
    let shipments = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      shippedAt: doc.data().shippedAt?.toDate?.()?.toISOString() || doc.data().shippedAt,
      deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || doc.data().deliveredAt,
    }));

    // Apply search filter (client-side since Firestore doesn't support text search)
    if (search) {
      const searchLower = search.toLowerCase();
      shipments = shipments.filter(
        (shipment: any) =>
          shipment.trackingNumber?.toLowerCase().includes(searchLower) ||
          shipment.orderNumber?.toLowerCase().includes(searchLower) ||
          shipment.carrier?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch seller info for each shipment
    const shipmentsWithSeller = await Promise.all(
      shipments.map(async (shipment: any) => {
        if (shipment.sellerId) {
          try {
            const sellerDoc = await db.collection("users").doc(shipment.sellerId).get();
            const sellerData = sellerDoc.data();

            // Get shop info if available
            let shopName = "Unknown Shop";
            if (sellerData?.shopId) {
              const shopDoc = await db.collection("shops").doc(sellerData.shopId).get();
              shopName = shopDoc.data()?.name || "Unknown Shop";
            }

            return {
              ...shipment,
              sellerEmail: sellerData?.email || "Unknown",
              shopName,
            };
          } catch (error) {
            return {
              ...shipment,
              sellerEmail: "Unknown",
              shopName: "Unknown Shop",
            };
          }
        }
        return shipment;
      })
    );

    // Calculate stats
    const allShipmentsSnapshot = await db.collection("shipments").get();
    const allShipments = allShipmentsSnapshot.docs.map((doc) => doc.data());

    const stats = {
      total: allShipments.length,
      pending: allShipments.filter((s: any) => s.status === "pending").length,
      pickupScheduled: allShipments.filter((s: any) => s.status === "pickup_scheduled").length,
      inTransit: allShipments.filter((s: any) => s.status === "in_transit").length,
      delivered: allShipments.filter((s: any) => s.status === "delivered").length,
      failed: allShipments.filter((s: any) => s.status === "failed").length,
    };

    return NextResponse.json({
      success: true,
      data: shipmentsWithSeller,
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching admin shipments:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}
