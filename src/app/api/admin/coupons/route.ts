import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

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

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Fetch all seller coupons
    let query = db.collection("coupons").orderBy("createdAt", "desc");

    // Apply status filter
    if (status && status !== "all") {
      if (status === "expired") {
        query = query.where("expiresAt", "<=", new Date().toISOString()) as any;
      } else {
        query = query.where("isActive", "==", status === "active") as any;
      }
    }

    const snapshot = await query.get();
    let coupons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filter (client-side since Firestore doesn't support text search)
    if (search) {
      const searchLower = search.toLowerCase();
      coupons = coupons.filter(
        (coupon: any) =>
          coupon.code?.toLowerCase().includes(searchLower) ||
          coupon.name?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch seller info for each coupon
    const couponsWithSeller = await Promise.all(
      coupons.map(async (coupon: any) => {
        if (coupon.sellerId) {
          try {
            const sellerDoc = await db.collection("users").doc(coupon.sellerId).get();
            const sellerData = sellerDoc.data();
            
            // Get shop info if available
            let shopName = "Unknown Shop";
            if (sellerData?.shopId) {
              const shopDoc = await db.collection("shops").doc(sellerData.shopId).get();
              shopName = shopDoc.data()?.name || "Unknown Shop";
            }

            return {
              ...coupon,
              sellerEmail: sellerData?.email || "Unknown",
              shopName,
            };
          } catch (error) {
            return {
              ...coupon,
              sellerEmail: "Unknown",
              shopName: "Unknown Shop",
            };
          }
        }
        return coupon;
      })
    );

    return NextResponse.json({ coupons: couponsWithSeller });
  } catch (error: any) {
    console.error("Error fetching admin coupons:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch coupons" }, { status: 500 });
  }
}

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

    // Get coupon ID from request body
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    // Delete the coupon
    await db.collection("coupons").doc(id).delete();

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}
