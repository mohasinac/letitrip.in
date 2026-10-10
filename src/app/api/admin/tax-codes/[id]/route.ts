import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  taxCodesRepository,
  categoriesRepository,
  taxCodeUpdateSchema,
  type TaxCodeUpdatePayload,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

const NOT_FOUND = "Tax code not found";

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
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await taxCodesRepository.findById(id);
      if (!doc) return errorResponse(NOT_FOUND, 404);
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<TaxCodeUpdatePayload>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    schema: taxCodeUpdateSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await taxCodesRepository.findById(id);
      if (!existing) return errorResponse(NOT_FOUND, 404);
      try {
        const updated = await taxCodesRepository.update(id, body!);
        return successResponse(updated, "Tax code updated");
      } catch (err) {
        const e = normalizeError(err);
        return errorResponse(e.message, 400);
      }
    },
  }),
);

/**
 * 🛑 DELETE REFUSES while any category still points here.
 *
 * `CategoryProductDefaults.taxCodeId` is a plain string with no referential
 * integrity, so deleting a referenced code leaves a dangling pointer that
 * `findResolvable` answers with `null` — and the correct response to `null` is
 * "leave the product's gstRate alone", which means every subsequent listing
 * under that category silently derives NO TAX. A dangling tax reference does
 * not error; it under-charges, quietly, until someone reads an invoice.
 *
 * So: a 409 naming the categories, and `isActive: false` as the way to retire
 * a code. An inactive code is already skipped by `findResolvable` and absent
 * from the picker, which is what "stop using this" actually needs — deletion
 * only matters for a row created by mistake, and that row has no referrers.
 */
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await taxCodesRepository.findById(id);
      if (!existing) return errorResponse(NOT_FOUND, 404);

      const referrers = await categoriesRepository.findByTaxCodeId(id);
      if (referrers.length > 0) {
        const names = referrers
          .slice(0, 5)
          .map((c) => c.name)
          .join(", ");
        const more =
          referrers.length > 5 ? ` and ${referrers.length - 5} more` : "";
        return errorResponse(
          `${referrers.length} categor${referrers.length === 1 ? "y" : "ies"} still use this tax code (${names}${more}). ` +
            `Repoint them first, or set the code inactive instead of deleting it.`,
          409,
        );
      }

      await taxCodesRepository.delete(id);
      return successResponse({ id }, "Tax code deleted");
    },
  }),
);
