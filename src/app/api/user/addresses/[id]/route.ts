/**
 * Individual Address API Routes
 *
 * Handle individual address operations (update, delete, set default).
 * Requires authentication and ownership verification.
 *
 * @route PUT /api/user/addresses/[id] - Update address
 * @route DELETE /api/user/addresses/[id] - Delete address
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
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
 * PUT - Update address (requires authentication & ownership)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { id } = await context.params;

    const body = await request.json();

    // Get address to verify ownership
    const addressRef = doc(db, "addresses", id);
    const addressDoc = await getDoc(addressRef);

    if (!addressDoc.exists()) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const addressData = addressDoc.data();

    // Verify ownership
    if (addressData.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If setting as default, unset other defaults
    if (body.isDefault === true) {
      const existingDefaultQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true),
      );
      const existingDefaults = await getDocs(existingDefaultQuery);

      const updatePromises = existingDefaults.docs.map((doc) =>
        updateDoc(doc.ref, { isDefault: false }),
      );
      await Promise.all(updatePromises);
    }

    // Build update object
    const updates: any = {
      ...body,
      userId, // Ensure userId cannot be changed
      updatedAt: serverTimestamp(),
    };

    // Update address
    await updateDoc(addressRef, updates);

    // Get updated address
    const updatedDoc = await getDoc(addressRef);

    return NextResponse.json(
      {
        success: true,
        message: "Address updated",
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating address:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to update address",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Remove address (requires authentication & ownership)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { id } = await context.params;

    // Get address to verify ownership
    const addressRef = doc(db, "addresses", id);
    const addressDoc = await getDoc(addressRef);

    if (!addressDoc.exists()) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const addressData = addressDoc.data();

    // Verify ownership
    if (addressData.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete address
    await deleteDoc(addressRef);

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting address:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete address",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
