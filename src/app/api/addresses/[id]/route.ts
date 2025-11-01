import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";

const ADDRESSES_COLLECTION = "addresses";

/**
 * PUT /api/addresses/[id] - Update an address
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addressId = params.id;
    const body = await request.json();

    const db = getAdminDb();
    const addressRef = db.collection(ADDRESSES_COLLECTION).doc(addressId);
    const addressDoc = await addressRef.get();

    if (!addressDoc.exists) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (addressDoc.data()?.userId !== user.uid) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const batch = db.batch();

    // If this is being set as default, unset other defaults
    if (body.isDefault) {
      const addressesRef = db.collection(ADDRESSES_COLLECTION);
      const snapshot = await addressesRef
        .where("userId", "==", user.uid)
        .where("isDefault", "==", true)
        .get();

      snapshot.docs.forEach(doc => {
        if (doc.id !== addressId) {
          batch.update(doc.ref, { isDefault: false });
        }
      });
    }

    // Update the address
    batch.update(addressRef, {
      ...body,
      updatedAt: new Date(),
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addresses/[id] - Delete an address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addressId = params.id;
    const db = getAdminDb();
    const addressRef = db.collection(ADDRESSES_COLLECTION).doc(addressId);
    const addressDoc = await addressRef.get();

    if (!addressDoc.exists) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (addressDoc.data()?.userId !== user.uid) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await addressRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
