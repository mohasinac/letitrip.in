import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Validate Shop Slug Uniqueness
 * GET /api/shops/validate-slug?slug=awesome-shop&exclude_id=xxx
 *
 * Slugs are globally unique across all shops
 */
export async function GET(request: NextRequest) {
  let slug: string | null = null;
  try {
    const { searchParams } = new URL(request.url);
    slug = searchParams.get("slug");
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

    // Check if slug exists
    const query = Collections.shops().where("slug", "==", slug);
    const snapshot = await query.get();

    // If editing, exclude current shop
    const exists = snapshot.docs.some((doc) => doc.id !== excludeId);

    return NextResponse.json({
      success: true,
      available: !exists,
      slug,
    });
  } catch (error) {
    logError(error as Error, { component: "API.shops.validateSlug", metadata: { slug } });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate slug",
      },
      { status: 500 },
    );
  }
}
