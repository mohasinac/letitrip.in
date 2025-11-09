import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { resolveShopSlug } from "@/lib/shop-slug-resolver";

/**
 * Validate Coupon Code Uniqueness
 * GET /api/coupons/validate-code?code=SAVE20&shop_slug=awesome-shop&exclude_id=xxx
 *
 * Codes are unique per shop (same code allowed in different shops)
 * Accepts shop_slug parameter and resolves to shop_id internally
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const shopSlug = searchParams.get("shop_slug");
    const excludeId = searchParams.get("exclude_id"); // For edit mode

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: "Code parameter is required",
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

    // Normalize code (uppercase, no spaces)
    const normalizedCode = code.trim().toUpperCase();

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

    // Check if code exists in this shop
    const query = Collections.coupons()
      .where("code", "==", normalizedCode)
      .where("shop_id", "==", shopId);

    const snapshot = await query.get();

    // If editing, exclude current coupon
    const exists = snapshot.docs.some((doc) => doc.id !== excludeId);

    return NextResponse.json({
      success: true,
      available: !exists,
      code: normalizedCode,
      shop_slug: shopSlug,
      shop_id: shopId,
    });
  } catch (error) {
    console.error("Error validating coupon code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate code",
      },
      { status: 500 },
    );
  }
}
