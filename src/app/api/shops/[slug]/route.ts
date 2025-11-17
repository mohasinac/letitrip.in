import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * Individual Shop API - /api/shops/[slug] with Firebase Integration
 * Unified endpoint with role-based access control
 *
 * GET: Retrieve shop by slug
 *   - Guest/User: Only verified, non-banned shops
 *   - Seller: Own shops + verified public shops
 *   - Admin: All shops
 *
 * PATCH: Update shop
 *   - Seller: Can update own shop (except verification/featured/banned flags)
 *   - Admin: Can update any shop including status flags
 *
 * DELETE: Delete shop
 *   - Seller: Can delete own shop
 *   - Admin: Can delete any shop
 */

// GET /api/shops/[slug] - Retrieve shop by slug with role-based access control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const user = await getUserFromRequest(request);
    const role = (user?.role || "guest") as
      | "guest"
      | "user"
      | "seller"
      | "admin";
    const userId = user?.uid;

    // Fetch shop by slug from Firestore
    const shopSnapshot = await Collections.shops()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (shopSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }
    const shopDoc = shopSnapshot.docs[0];
    const data: any = shopDoc.data();
    const shop: any = {
      id: shopDoc.id,
      ...data,
      // Add camelCase aliases
      ownerId: data.owner_id,
      isVerified: data.is_verified,
      featured: data.is_featured,
      isBanned: data.is_banned,
      showOnHomepage: data.show_on_homepage,
      totalProducts: data.total_products || data.product_count || 0,
      reviewCount: data.review_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Role-based access control
    const isOwner = Boolean(userId && shop.owner_id === userId);

    if (role === "guest" || role === "user") {
      // Guest/User: Only verified, non-banned shops
      if (!shop.is_verified || shop.is_banned) {
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 }
        );
      }
    } else if (role === "seller") {
      // Seller: Own shops + verified public shops
      if (!isOwner && (!shop.is_verified || shop.is_banned)) {
        return NextResponse.json(
          { success: false, error: "Shop not found" },
          { status: 404 }
        );
      }
    }
    // Admin: Can access all shops (no additional check)

    return NextResponse.json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("[GET /api/shops/[slug]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/shops/[slug] - Update shop by slug (internal ID resolved first)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const role = user.role as "seller" | "admin" | "user" | "guest";
    const userId = user.uid;
    const body = await request.json();

    // Resolve slug → shop document
    const shopSnapshot = await Collections.shops()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (shopSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }
    const shopDoc = shopSnapshot.docs[0];
    const shop: any = { id: shopDoc.id, ...shopDoc.data() };

    const isOwner = shop.owner_id === userId;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const allowedFields = [
      "name",
      "slug",
      "description",
      "logo",
      "banner",
      "email",
      "phone",
      "location",
      "website",
    ] as string[];
    if (isAdmin) {
      allowedFields.push(
        "is_verified",
        "is_featured",
        "is_banned",
        "show_on_homepage"
      );
    }

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in (body || {})) updates[field] = body[field];
    }

    if (updates.slug && updates.slug !== shop.slug) {
      const existingShopSnapshot = await Collections.shops()
        .where("slug", "==", updates.slug)
        .limit(1)
        .get();
      if (!existingShopSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Slug already in use" },
          { status: 400 }
        );
      }
    }

    await Collections.shops()
      .doc(shop.id)
      .update({
        ...updates,
        updated_at: new Date(),
      });

    const updated = await Collections.shops().doc(shop.id).get();
    return NextResponse.json({
      success: true,
      shop: { id: updated.id, ...updated.data() },
      message: "Shop updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/shops/[slug]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/shops/[slug] - Delete shop by slug (resolve internal ID)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const role = user.role as "seller" | "admin" | "user" | "guest";
    const userId = user.uid;

    const shopSnapshot = await Collections.shops()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (shopSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }
    const shopDoc = shopSnapshot.docs[0];
    const shop: any = { id: shopDoc.id, ...shopDoc.data() };

    const isOwner = shop.owner_id === userId;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Guard rails: prevent deletion if active products or pending orders exist
    const productsSnapshot = await Collections.products()
      .where("shop_id", "==", shop.id)
      .where("status", "==", "active")
      .limit(1)
      .get();
    if (!productsSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete shop with active products. Deactivate or remove products first.",
        },
        { status: 400 }
      );
    }

    const ordersSnapshot = (await Collections.orders()
      .where("shop_id", "==", shop.id)
      .where("status", "in", [
        "pending",
        "confirmed",
        "processing",
        "shipped",
      ])) as any;
    const ordersSnap = await ordersSnapshot.limit(1).get();
    if (!ordersSnap.empty) {
      return NextResponse.json(
        { success: false, error: "Cannot delete shop with pending orders." },
        { status: 400 }
      );
    }

    await Collections.shops().doc(shop.id).delete();

    return NextResponse.json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/shops/[slug]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
