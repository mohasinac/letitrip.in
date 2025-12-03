import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";

/**
 * POST /api/shops/[slug]/follow - Follow a shop
 * DELETE /api/shops/[slug]/follow - Unfollow a shop
 */

// Helper to get current user (temporary - replace with actual auth)
async function getCurrentUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;

  const db = getFirestoreAdmin();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return null;

  return { id: userDoc.id, ...userDoc.data() };
}

// POST - Follow shop
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const db = getFirestoreAdmin();

    // Get shop by slug
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopDoc = shopsSnapshot.docs[0];
    const shopId = shopDoc.id;

    // Check if already following
    const followDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .get();

    if (followDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Already following this shop" },
        { status: 400 },
      );
    }

    // Add to user's following
    await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .set({
        shop_id: shopId,
        shop_slug: slug,
        followed_at: new Date().toISOString(),
      });

    // Increment shop's follower count
    await db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .update({
        follower_count: (shopDoc.data()?.follower_count || 0) + 1,
      });

    return NextResponse.json({
      success: true,
      message: "Shop followed successfully",
    });
  } catch (error) {
    console.error("[POST /api/shops/[slug]/follow] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Unfollow shop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const db = getFirestoreAdmin();

    // Get shop by slug
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopDoc = shopsSnapshot.docs[0];
    const shopId = shopDoc.id;

    // Check if following
    const followDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .get();

    if (!followDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Not following this shop" },
        { status: 400 },
      );
    }

    // Remove from user's following
    await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .delete();

    // Decrement shop's follower count
    const currentCount = shopDoc.data()?.follower_count || 0;
    await db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .update({
        follower_count: Math.max(0, currentCount - 1),
      });

    return NextResponse.json({
      success: true,
      message: "Shop unfollowed successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/shops/[slug]/follow] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET - Check if following
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ isFollowing: false });
    }

    const db = getFirestoreAdmin();

    // Get shop by slug
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopId = shopsSnapshot.docs[0].id;

    // Check if following
    const followDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(user.id)
      .collection(SUBCOLLECTIONS.SHOP_FOLLOWING)
      .doc(shopId)
      .get();

    return NextResponse.json({ isFollowing: followDoc.exists });
  } catch (error) {
    console.error("[GET /api/shops/[slug]/follow] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
