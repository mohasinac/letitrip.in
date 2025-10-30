import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/seller/sales/[id]
 * Get a specific sale by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();

    const { id } = params;

    // Get sale document
    const docRef = adminDb.collection("seller_sales").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Sale not found" },
        { status: 404 },
      );
    }

    const saleData = doc.data();

    // Verify ownership (unless admin)
    if (role !== "admin" && saleData?.sellerId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Not your sale" },
        { status: 403 },
      );
    }

    // Convert Firestore timestamps to dates
    const sale = {
      id: doc.id,
      ...saleData,
      startDate: saleData?.startDate?.toDate?.() || saleData?.startDate,
      endDate: saleData?.endDate?.toDate?.() || saleData?.endDate,
      createdAt: saleData?.createdAt?.toDate?.() || saleData?.createdAt,
      updatedAt: saleData?.updatedAt?.toDate?.() || saleData?.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error: any) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sale" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/seller/sales/[id]
 * Update a specific sale
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can update
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();

    const { id } = params;
    const body = await request.json();

    // Get existing sale
    const docRef = adminDb.collection("seller_sales").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Sale not found" },
        { status: 404 },
      );
    }

    const existingSale = doc.data();

    // Verify ownership (unless admin)
    if (role !== "admin" && existingSale?.sellerId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Not your sale" },
        { status: 403 },
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.discountType !== undefined) {
      if (!["percentage", "fixed"].includes(body.discountType)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid discount type. Must be 'percentage' or 'fixed'",
          },
          { status: 400 },
        );
      }
      updateData.discountType = body.discountType;
    }
    if (body.discountValue !== undefined) {
      updateData.discountValue = parseFloat(body.discountValue);
    }
    if (body.applyTo !== undefined) {
      if (
        !["all", "specific_products", "specific_categories"].includes(
          body.applyTo,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid applyTo value. Must be 'all', 'specific_products', or 'specific_categories'",
          },
          { status: 400 },
        );
      }
      updateData.applyTo = body.applyTo;
    }
    if (body.applicableProducts !== undefined) {
      updateData.applicableProducts = body.applicableProducts;
    }
    if (body.applicableCategories !== undefined) {
      updateData.applicableCategories = body.applicableCategories;
    }
    if (body.enableFreeShipping !== undefined) {
      updateData.enableFreeShipping = body.enableFreeShipping;
    }
    if (body.isPermanent !== undefined) {
      updateData.isPermanent = body.isPermanent;
    }
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate
        ? Timestamp.fromDate(new Date(body.startDate))
        : Timestamp.now();
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate
        ? Timestamp.fromDate(new Date(body.endDate))
        : null;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    // Update sale in Firestore
    await docRef.update(updateData);

    // Get updated sale
    const updatedDoc = await docRef.get();
    const updatedSale = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      startDate: updatedDoc.data()?.startDate?.toDate?.(),
      endDate: updatedDoc.data()?.endDate?.toDate?.(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      data: updatedSale,
      message: "Sale updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update sale" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/seller/sales/[id]
 * Delete a specific sale
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can delete
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();

    const { id } = params;

    // Get sale document
    const docRef = adminDb.collection("seller_sales").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Sale not found" },
        { status: 404 },
      );
    }

    const saleData = doc.data();

    // Verify ownership (unless admin)
    if (role !== "admin" && saleData?.sellerId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Not your sale" },
        { status: 403 },
      );
    }

    // Delete the sale
    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete sale" },
      { status: 500 },
    );
  }
}
