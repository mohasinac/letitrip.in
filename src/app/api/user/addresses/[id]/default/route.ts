/**
 * Set Default Address API
 *
 * Set an address as default, unsetting any previous default.
 *
 * @route PUT /api/user/addresses/[id]/default - Set default address (requires auth, ownership)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  collection,
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
 * PUT - Set address as default
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { id } = await context.params;

    // Get address
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

    // Unset any existing default address of the same type
    const existingDefaultQuery = query(
      collection(db, "addresses"),
      where("userId", "==", userId),
      where("type", "==", addressData.type),
      where("isDefault", "==", true),
    );

    const existingDefaultDocs = await getDocs(existingDefaultQuery);

    for (const doc of existingDefaultDocs.docs) {
      if (doc.id !== id) {
        await updateDoc(doc.ref, {
          isDefault: false,
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Set this address as default
    await updateDoc(addressRef, {
      isDefault: true,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Default address updated",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error setting default address:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to set default address",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
