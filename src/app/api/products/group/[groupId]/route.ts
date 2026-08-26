import { normalizeError } from "@mohasinac/appkit";
import { NextResponse } from "next/server";
import { productRepository, toPublicGroupMembers } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";

/** Matches the Cache-Control used by other public product listing routes. */
const PUBLIC_LISTING_CACHE_CONTROL =
  "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

interface RouteContext {
  params: Promise<{ groupId: string }>;
}

/**
 * Public listing of every member (parent + linked children) of a grouped
 * listing, keyed by the group's `groupId` (the parent's slug). Used by
 * GroupSettingsPanel's `loadChildren()` and any public "other listings in
 * this group" display on the product detail page.
 */
async function _GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { groupId } = await context.params;
  if (!groupId) {
    return NextResponse.json(
      { success: false, error: "groupId is required" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const items = await productRepository.findByGroupId(groupId);
    const response = NextResponse.json({
      success: true,
      data: {
        // Allow-list projection, not `sanitizeProductsForPublic` (a delete-list
        // of four seller-identity keys that published every other field of
        // ProductDocument). The member picker also needs stock/store/sold
        // state, so the payload had to change anyway — see § "Public Data
        // Projections".
        items: toPublicGroupMembers(items),
        total: items.length,
      },
    });
    response.headers.set("Cache-Control", PUBLIC_LISTING_CACHE_CONTROL);
    return response;
  } catch (error) {
    void normalizeError(error);
    logError("products", "GET /api/products/group/[groupId] failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch group listings" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = withProviders(_GET);
