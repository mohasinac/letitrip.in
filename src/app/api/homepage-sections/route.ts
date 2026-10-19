import { NextResponse } from "next/server";
import { withProviders } from "@/providers.config";
import { resolveNextSectionOrder } from "@mohasinac/appkit/features/homepage/actions/homepage-section-actions";
import { homepageSectionsRepository } from "@mohasinac/appkit/features/homepage/repository/homepage-sections.repository";
import { homepageSectionCreateSchema } from "@mohasinac/appkit/features/homepage/schemas/index";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { isAdminUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * 🛑 GET used to delegate to a generic-starter-kit stub
 * (`features/homepage/api/route.ts`, deleted 2026-10-19) that read via a
 * SEPARATE, identically-named `HomepageSectionsRepository` class wrapping a
 * generic `db` provider, filtering on `isVisible==true` — a field that does
 * not exist on a real `HomepageSectionDocument` (the real field is
 * `enabled`). So every unauthenticated call to this endpoint returned an
 * empty list with a 200, silently. See the deletion note in
 * `features/homepage/types/index.ts` for the full history.
 *
 * Rewritten to call the REAL repository directly — the same one
 * `MarketplaceHomepageView` reads server-side. Kept mounted at this URL for
 * the same reason the POST handler below was already kept: removing a live
 * API route is an outward-facing change, and `includeDisabled` is genuinely a
 * capability the admin editor's OWN list call (`GET /api/admin/sections`)
 * does not expose in this exact shape.
 */
export const GET = withProviders(async (request: Request) => {
  try {
    const url = new URL(request.url);
    const wantsDisabled = url.searchParams.get("includeDisabled") === "true";

    // `includeDisabled` admits draft/paused section documents — gate it, the
    // way the old stub's own bespoke cookie-parsing `getRoleFromSession`
    // helper did, just through the project's real session reader instead.
    if (wantsDisabled) {
      const sessionUser = await getServerSessionUser();
      if (!sessionUser || !isAdminUser(sessionUser)) {
        return NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 },
        );
      }
    }
    const includeDisabled = wantsDisabled;
    const sections = includeDisabled
      ? [
          ...(await homepageSectionsRepository.getEnabledSections()),
          ...(await homepageSectionsRepository.getDisabledSections()),
        ].sort((a, b) => a.order - b.order)
      : await homepageSectionsRepository.getEnabledSections();

    const res = NextResponse.json({ success: true, data: sections });
    res.headers.set(
      "Cache-Control",
      includeDisabled
        ? "private, no-cache"
        : "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
    );
    return res;
  } catch (error) {
    void normalizeError(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage sections" },
      { status: 500 },
    );
  }
});

/**
 * 🛑 A SECOND create path for `homepageSections`.
 *
 * `POST /api/admin/sections` is the one the admin editor actually calls
 * (`ADMIN_ENDPOINTS.SECTIONS`); this one is reachable only by URL —
 * `HOMEPAGE_ENDPOINTS.SECTIONS` is referenced solely as a GET path for cache
 * invalidation, and nothing in either tree POSTs to it.
 *
 * It was the weaker of the two in both respects: it spread the raw body into
 * Firestore with no schema, and it carried no `permission` alongside its role
 * check while its twin requires `admin:sections:write`. Both are closed here
 * rather than the handler being deleted, because removing a live API route is
 * an outward-facing change and this one has no caller worth the risk either
 * way. It now shares the twin's schema, so the two cannot drift.
 */
export const POST = withProviders(
  createRouteHandler<(typeof homepageSectionCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:sections:write",
    schema: homepageSectionCreateSchema,
    handler: async ({ body }) => {
      // `order` is REQUIRED on the create input. The old untyped `{...body}`
      // spread happily wrote a section with none at all — the type is what
      // surfaced that. Both create routes resolve it the same way, through one
      // shared helper.
      const section = await homepageSectionsRepository.create({
        ...body!,
        order: body!.order ?? (await resolveNextSectionOrder()),
      });
      return successResponse(section, "Homepage section created", 201);
    },
  }),
);
