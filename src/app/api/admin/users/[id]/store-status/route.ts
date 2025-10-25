import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { getAdminDb } from "@/lib/firebase/admin";
import { createStoreStatusNotification } from "@/lib/services/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { storeStatus } = await request.json();

    if (!["live", "maintenance", "offline"].includes(storeStatus)) {
      return NextResponse.json(
        { error: "Invalid store status. Must be 'live', 'maintenance', or 'offline'" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Check if user exists and is a seller or admin
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData?.role !== 'seller' && userData?.role !== 'admin') {
      return NextResponse.json(
        { error: "User is not a seller or admin" },
        { status: 400 }
      );
    }

    // Update store status in sellers collection
    await db.collection('sellers').doc(id).set({
      storeStatus,
      updatedAt: new Date(),
    }, { merge: true });

    // Get store name for notification
    const sellerDoc = await db.collection('sellers').doc(id).get();
    const sellerData = sellerDoc.exists ? sellerDoc.data() : {};
    const storeName = sellerData?.storeName;

    // Also update the store status in stores collection if it exists
    const storeSnapshot = await db.collection('stores').where('ownerId', '==', id).get();
    if (!storeSnapshot.empty) {
      const batch = db.batch();
      storeSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: storeStatus,
          updatedAt: new Date(),
        });
      });
      await batch.commit();
    }

    // Create notification for the seller
    await createStoreStatusNotification(id, storeStatus, storeName);

    return NextResponse.json({
      success: true,
      message: `Store status updated to ${storeStatus}`,
      storeStatus,
    });
  } catch (error) {
    console.error("Error updating store status:", error);
    return NextResponse.json(
      { error: "Failed to update store status" },
      { status: 500 }
    );
  }
}
