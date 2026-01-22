/**
 * Admin Auction Approval API
 *
 * Approve or reject auctions.
 *
 * @route PUT /api/admin/auctions/[id]/approve - Approve/reject auction (requires admin)
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
 * PUT - Approve or reject auction
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

    // Get auction by slug
    const auctionQuery = query(
      collection(db, "auctions"),
      where("slug", "==", id),
    );
    const auctionSnapshot = await getDocs(auctionQuery);

    if (auctionSnapshot.empty) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const auctionDoc = auctionSnapshot.docs[0];

    // Update auction status
    const updateData: any = {
      status: action === "approve" ? "active" : "rejected",
      updatedAt: serverTimestamp(),
    };

    if (action === "approve") {
      updateData.approvedAt = serverTimestamp();
    } else if (reason) {
      updateData.rejectionReason = reason;
    }

    await updateDoc(auctionDoc.ref, updateData);

    return NextResponse.json(
      {
        success: true,
        message: `Auction ${action}d successfully`,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error approving auction:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to approve auction",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
