import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/sales
 * List all sales from all sellers with filtering and search
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

    // Build query - fetch from seller_sales collection
    let firestoreQuery: any = db.collection("seller_sales");

    // Apply status filter
    if (status && status !== "all") {
      firestoreQuery = firestoreQuery.where("status", "==", status);
    }

    // Order by creation date
    firestoreQuery = firestoreQuery.orderBy("createdAt", "desc");

    const snapshot = await firestoreQuery.get();
    let sales = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      startDate: doc.data().startDate?.toDate?.()?.toISOString() || doc.data().startDate,
      endDate: doc.data().endDate?.toDate?.()?.toISOString() || doc.data().endDate,
    }));

    // Apply search filter (client-side)
    if (search) {
      const searchLower = search.toLowerCase();
      sales = sales.filter(
        (sale: any) =>
          sale.name?.toLowerCase().includes(searchLower) ||
          sale.description?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch seller info for each sale
    const salesWithSeller = await Promise.all(
      sales.map(async (sale: any) => {
        if (sale.sellerId) {
          try {
            const sellerDoc = await db.collection("users").doc(sale.sellerId).get();
            const sellerData = sellerDoc.data();

            // Get shop info if available
            let shopName = "Unknown Shop";
            if (sellerData?.shopId) {
              const shopDoc = await db.collection("shops").doc(sellerData.shopId).get();
              shopName = shopDoc.data()?.name || "Unknown Shop";
            }

            return {
              ...sale,
              sellerEmail: sellerData?.email || "Unknown",
              shopName,
            };
          } catch (error) {
            return {
              ...sale,
              sellerEmail: "Unknown",
              shopName: "Unknown Shop",
            };
          }
        }
        return sale;
      })
    );

    return NextResponse.json({
      success: true,
      data: salesWithSeller,
    });
  } catch (error: any) {
    console.error("Error fetching admin sales:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sales (body: {id})
 * Delete a sale
 */
export async function DELETE(request: NextRequest) {
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

    // Get sale ID from request body
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Sale ID is required" },
        { status: 400 }
      );
    }

    // Delete the sale
    await db.collection("seller_sales").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete sale" },
      { status: 500 }
    );
  }
}
