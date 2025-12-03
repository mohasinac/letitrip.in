import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";

/**
 * GET /api/shops/following - Get list of shops the user follows
 */

// Helper to get current user
async function getCurrentUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;

  const db = getFirestoreAdmin();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return null;

  return { id: userDoc.id, ...userDoc.data() };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const db = getFirestoreAdmin();

    // Get user's following list
    const followingSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .get();

    if (followingSnapshot.empty) {
      return NextResponse.json({
        success: true,
        shops: [],
        count: 0,
      });
    }

    // Get shop IDs
    const shopIds = followingSnapshot.docs.map((doc) => doc.data().shop_id);

    // Fetch shop details
    const shops: any[] = [];

    // Firestore 'in' query limited to 10 items, so batch if needed
    for (let i = 0; i < shopIds.length; i += 10) {
      const batch = shopIds.slice(i, i + 10);
      const shopsSnapshot = await db
        .collection(COLLECTIONS.SHOPS)
        .where("__name__", "in", batch)
        .get();

      shopsSnapshot.docs.forEach((doc) => {
        const followData = followingSnapshot.docs
          .find((f) => f.data().shop_id === doc.id)
          ?.data();

        shops.push({
          id: doc.id,
          ...doc.data(),
          followed_at: followData?.followed_at,
        });
      });
    }

    // Sort by followed_at (most recent first)
    shops.sort((a, b) => {
      const dateA = new Date(a.followed_at || 0).getTime();
      const dateB = new Date(b.followed_at || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      shops,
      count: shops.length,
    });
  } catch (error) {
    console.error("[GET /api/shops/following] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
