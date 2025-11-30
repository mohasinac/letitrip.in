import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * Get Demo Session Summary
 * GET /api/admin/demo/summary/[sessionId]
 *
 * Returns a summary of all resources created in a demo session
 */

type RouteParams = Promise<{ sessionId: string }>;

interface CollectionSummary {
  collection: string;
  count: number;
  ids: string[];
}

export async function GET(
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
    const summary: CollectionSummary[] = [];
    let totalCount = 0;

    // Collections to summarize
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
        const snapshot = await db
          .collection(collectionName)
          .where("demoSessionId", "==", sessionId)
          .get();

        if (!snapshot.empty) {
          const ids = snapshot.docs.map((doc) => doc.id);
          summary.push({
            collection: collectionName,
            count: snapshot.size,
            ids,
          });
          totalCount += snapshot.size;
        }
      } catch (err) {
        console.error(`Error summarizing ${collectionName}:`, err);
        // Continue with other collections
      }
    }

    // Get session metadata if exists
    let sessionMeta = null;
    try {
      const sessionDoc = await db.collection("demo_sessions").doc(sessionId).get();
      if (sessionDoc.exists) {
        sessionMeta = sessionDoc.data();
      }
    } catch (err) {
      console.error("Error getting session metadata:", err);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      totalResources: totalCount,
      collections: summary,
      session: sessionMeta,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Summary error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
