import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { resolveShopSlug } from "@/lib/shop-slug-resolver";

/**
 * Validate Product Slug Uniqueness
 * GET /api/products/validate-slug?slug=awesome-laptop&shop_slug=awesome-shop&exclude_id=xxx
 *
 * Slugs are unique per shop (same slug allowed in different shops)
 * Accepts shop_slug parameter and resolves to shop_id internally
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const shopSlug = searchParams.get("shop_slug");
    const excludeId = searchParams.get("exclude_id"); // For edit mode

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug parameter is required",
        },
        { status: 400 },
      );
    }

    if (!shopSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop slug parameter is required",
        },
        { status: 400 },
      );
    }

    // Resolve shop slug to shop ID
    const shopId = await resolveShopSlug(shopSlug);

    if (!shopId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop not found",
        },
        { status: 404 },
      );
    }

    // Check if slug exists in this shop
    const query = Collections.products()
      .where("slug", "==", slug)
      .where("shop_id", "==", shopId);

    const snapshot = await query.get();

    // If editing, exclude current product
    const exists = snapshot.docs.some((doc) => doc.id !== excludeId);

    return NextResponse.json({
      success: true,
      available: !exists,
      slug,
      shop_slug: shopSlug,
      shop_id: shopId,
    });
  } catch (error) {
    console.error("Error validating product slug:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate slug",
      },
      { status: 500 },
    );
  }
}
