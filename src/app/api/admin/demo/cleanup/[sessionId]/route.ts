import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Collections to clean up
    const collections = [
      "categories",
      "users",
      "shops",
      "products",
      "auctions",
      "bids",
      "orders",
      "orderItems",
      "payments",
      "shipments",
      "reviews",
    ];

    let totalDeleted = 0;

    for (const collectionName of collections) {
      const snapshot = await db
        .collection(collectionName)
        .where("demoSession", "==", sessionId)
        .get();

      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          totalDeleted++;
        });
        await batch.commit();
      }
    }

    return NextResponse.json({
      success: true,
      deleted: totalDeleted,
      sessionId,
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
