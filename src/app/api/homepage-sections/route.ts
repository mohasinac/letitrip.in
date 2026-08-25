import { withProviders } from "@/providers.config";
import {
  homepageGET,
  homepageSectionCreateSchema,
  homepageSectionsRepository,
  resolveNextSectionOrder,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(homepageGET);

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
