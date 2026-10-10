import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  taxCodesRepository,
  taxCodeCreateSchema,
  type TaxCodeCreatePayload,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * GET  /api/admin/tax-codes — every active code, for the list and the picker.
 * POST /api/admin/tax-codes — create one.
 *
 * Admin-only throughout. A wrong GST rate here propagates: the category points
 * at the code, `deriveTaxonomy` writes the rate onto every product derived from
 * that category, and the order item snapshots it onto an invoice. Nothing in
 * that chain re-validates, and the invoice is the first place a human might
 * notice.
 */

/*
 * 🛑 ROLES_ADMIN_ONLY on READ as well as write, and the reason is worth stating
 * because the first draft had `ROLES_ADMIN_MOD` here — copied from
 * /api/admin/features without asking whether a moderator has any business in
 * it.
 *
 * `audit-permission-role-mismatch` caught it: a `permission` field alongside a
 * roles array containing anything but admin/employee is a GUARANTEED 403,
 * because getServerPermissions() only resolves permissions for "employee". So
 * the route would have read as "admins and moderators" and denied every
 * moderator — permissive-looking, closed in practice.
 *
 * Admin-only is also the correct answer on its own terms: a moderator
 * moderates content and has no reason to read HSN codes, and both real callers
 * (this section's list page, and the category editor's picker) are admin
 * surfaces already.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      /*
       * `?all=true` is for the admin list, which must show inactive rows so
       * they can be reactivated. The DEFAULT is active-only, because the other
       * caller is the category editor's picker, and offering an inactive code
       * there would let an admin point a category at a code that
       * `findResolvable` then refuses — a selection that saves and derives
       * nothing.
       */
      const includeInactive = url.searchParams.get("all") === "true";
      /*
       * audit-listing-delegation-ok: not a Sieve list route. Both reads are
       * single-equality or bare, explicitly `.limit(200)`-bounded, over a
       * five-row fixed catalogue with no pagination, no filters and no sort
       * model. The audit's reasoning — "the query runs inside Vercel against
       * the 10s ceiling with every read billed to the request" — is what makes
       * delegation right for a 50-row page of products; here it would spend a
       * Cloud Function invocation to avoid five Firestore reads, which is
       * strictly more expensive on the budget this project is over on.
       */
      const items = includeInactive
        ? await taxCodesRepository.listAllBounded()
        : await taxCodesRepository.listActive();
      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<TaxCodeCreatePayload>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    schema: taxCodeCreateSchema,
    handler: async ({ body }) => {
      try {
        const doc = await taxCodesRepository.create(body!);
        return successResponse(doc, "Tax code created");
      } catch (err) {
        const e = normalizeError(err);
        /*
         * A duplicate HSN is a 409, not a 400: the request is well-formed and
         * the admin is not confused — the row already exists and the correct
         * next action is to edit it. Telling them "bad request" would send
         * them hunting a typo that is not there.
         */
        const isConflict = /already exists/i.test(e.message);
        return errorResponse(e.message, isConflict ? 409 : 400);
      }
    },
  }),
);
