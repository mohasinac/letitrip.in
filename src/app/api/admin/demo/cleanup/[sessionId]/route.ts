import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * Cleanup Demo Session Data
 * DELETE /api/admin/demo/cleanup/[sessionId]
 *
 * Deletes all resources associated with a specific demo session
 */

type RouteParams = Promise<{ sessionId: string }>;

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams },
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    let totalDeleted = 0;

    // Collections that may have session-tagged demo data
    const collections = [
      "categories",
      "users",
      "shops",
      "products",
      "auctions",
      "bids",
      "orders",
      "order_items",
      "payments",
      "shipments",
      "reviews",
      "coupons",
      "returns",
      "tickets",
      "payouts",
      "addresses",
      "hero_slides",
      "media",
      "blog_posts",
      "blog_categories",
      "blog_tags",
      "favorites",
      "carts",
      "cart_items",
      "conversations",
      "messages",
      "notifications",
    ];

    for (const collectionName of collections) {
      try {
        // Query for documents with this sessionId
        const snapshot = await db
          .collection(collectionName)
          .where("demoSessionId", "==", sessionId)
          .get();

        if (!snapshot.empty) {
          const batchSize = 500;
          const docRefs = snapshot.docs.map((doc) => doc.ref);

          for (let i = 0; i < docRefs.length; i += batchSize) {
            const batch = db.batch();
            const batchRefs = docRefs.slice(i, i + batchSize);
            batchRefs.forEach((ref) => {
              batch.delete(ref);
              totalDeleted++;
            });
            await batch.commit();
          }
        }
      } catch (err) {
        console.error(`Error cleaning ${collectionName}:`, err);
        // Continue with other collections
      }
    }

    // Also delete the session record itself if it exists
    try {
      const sessionDoc = await db.collection("demo_sessions").doc(sessionId).get();
      if (sessionDoc.exists) {
        await sessionDoc.ref.delete();
        totalDeleted++;
      }
    } catch (err) {
      console.error("Error deleting session record:", err);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      deleted: totalDeleted,
      message: `Demo session ${sessionId} cleaned up successfully (${totalDeleted} documents deleted)`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cleanup session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
