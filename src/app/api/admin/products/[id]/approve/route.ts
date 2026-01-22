/**
 * Admin Product Approval API
 *
 * Approve or reject products.
 *
 * @route PUT /api/admin/products/[id]/approve - Approve/reject product (requires admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Approve or reject product
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;

    const body = await request.json();
    const { action, reason } = body;

    // Validate action
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: approve, reject" },
        { status: 400 },
      );
    }

    // Get product by slug
    const productQuery = query(
      collection(db, "products"),
      where("slug", "==", id),
    );
    const productSnapshot = await getDocs(productQuery);

    if (productSnapshot.empty) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productDoc = productSnapshot.docs[0];

    // Update product status
    const updateData: any = {
      status: action === "approve" ? "published" : "rejected",
      updatedAt: serverTimestamp(),
    };

    if (action === "approve") {
      updateData.approvedAt = serverTimestamp();
    } else if (reason) {
      updateData.rejectionReason = reason;
    }

    await updateDoc(productDoc.ref, updateData);

    return NextResponse.json(
      {
        success: true,
        message: `Product ${action}d successfully`,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error approving product:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to approve product",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
