import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { NextResponse } from "next/server";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { toPublicGroupMembers } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit";

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
    /*
     * 🛑 Staff see DRAFTS; the public does not.
     *
     * `GroupSettingsPanel` reads this endpoint to populate its member table and
     * its shared-stock editor — so with the public scope only, an admin editing
     * a group was editing a PUBLIC PROJECTION: a draft child was simply absent
     * from the panel, which reads as "that child is not in the group" and
     * invites re-adding it. The parent, meanwhile, is created as a draft by
     * `promoteStickerSheetToListings`, so a freshly promoted sheet would show
     * an empty group to the person who just made it.
     *
     * One endpoint with an auth-aware scope rather than a second admin route:
     * the projection is identical (`toPublicGroupMembers` is an allow-list and
     * carries no path or seller-identity field), so the only thing that differs
     * is WHICH ROWS, and splitting the route would mean two readers of one
     * question drifting apart.
     *
     * 🛑 The session read makes this route dynamic, which is why the
     * `Cache-Control` below becomes `private, no-store` for staff — a shared
     * edge cache holding a draft-inclusive payload would serve it to everyone.
     */
    const viewer = await getServerSessionUser();
    const isStaff = isAdminUser(viewer) || isSellerUser(viewer);
    const items = isStaff
      ? await productRepository.findAllByGroupId(groupId)
      : await productRepository.findGroupMembersForPublic(groupId);
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
    response.headers.set(
      "Cache-Control",
      isStaff ? "private, no-store" : PUBLIC_LISTING_CACHE_CONTROL,
    );
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
