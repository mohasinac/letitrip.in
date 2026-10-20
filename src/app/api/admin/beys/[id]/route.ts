import { withProviders } from "@/providers.config";
import { z } from "zod";
import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { BEYS_COLLECTION } from "@mohasinac/appkit/features/beys/schemas/firestore";
import { applyAdminEdit } from "@mohasinac/appkit/features/parts/schemas/admin-edit";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
/* Defining module, not the `@/constants` barrel — see the parts route. */
import { ROLES_BACK_OFFICE } from "@/constants/api-roles";

const MSG_NOT_FOUND = "Beyblade not found.";

/**
 * Correct one row of the GENERATED bey database.
 *
 * Mirrors `/api/admin/parts/[id]` — same no-POST reasoning, same field-level
 * reseed protection. See that file's header; what differs is which fields a
 * human may own.
 *
 * ── 🛑 WHAT IS DELIBERATELY NOT EDITABLE HERE ─────────────────────────────
 *
 *   `id` / `slug`      — `id === slug`, and the slug is shared with the
 *                        category leaf (`category-{slug}`). Renaming would
 *                        break that pairing, which is the whole reason a
 *                        reference page and a commerce shelf point at the same
 *                        thing.
 *   `composition`      — the build, resolved by a committed join that reaches
 *                        88.9% of 7,688 links. Hand-editing one entry makes
 *                        every derived figure below disagree with it.
 *   `ratingsFromParts`
 *   `weightGFromParts` — DERIVED from the composition, each carrying its own
 *   `*Coverage`          coverage record so a partial sum is distinguishable
 *                        from a complete one. A hand-typed derived value is a
 *                        number with a coverage claim attached that is no
 *                        longer true.
 *   `modes`            — owned by `scripts/lib/bey-modes-authored.mjs`, where
 *                        each entry carries `confirmed` and its source. An
 *                        unconfirmed mode typed into the admin UI is exactly
 *                        what that file exists to prevent reaching a page.
 *   `categoryId`       — resolved and then VERIFIED against the emitted leaves.
 *                        A hand-set value can point at a leaf that does not
 *                        exist, and the page would render a dead link.
 *
 * `weightG` IS editable: it is the mass as the source STATES it, which is a
 * fact that can simply be wrong. The summed figure beside it is not.
 */
const updateBeySchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().nullable().optional(),
  spinDirection: z.string().nullable().optional(),
  system: z.string().nullable().optional(),
  series: z.string().nullable().optional(),
  weightG: z.number().nonnegative().nullable().optional(),
  aka: z.array(z.string()).optional(),
  productCodes: z.array(z.string()).optional(),
  jpName: z.string().nullable().optional(),
  romaji: z.string().nullable().optional(),
  seoDescription: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:beys:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const snap = await getAdminDb().collection(BEYS_COLLECTION).doc(id).get();
      if (!snap.exists) return errorResponse(MSG_NOT_FOUND, 404);
      return successResponse({ id: snap.id, ...snap.data() });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateBeySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:beys:write",
    schema: updateBeySchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const ref = getAdminDb().collection(BEYS_COLLECTION).doc(id);
      const snap = await ref.get();
      if (!snap.exists) return errorResponse(MSG_NOT_FOUND, 404);

      const patch = applyAdminEdit(
        { adminEditedFields: snap.get("adminEditedFields") as string[] | undefined },
        body as Record<string, unknown>,
        user!.uid,
      );
      await ref.set({ ...patch, updatedAt: new Date() }, { merge: true });

      const after = await ref.get();
      return successResponse({ id: after.id, ...after.data() }, "Beyblade updated.");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:beys:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const ref = getAdminDb().collection(BEYS_COLLECTION).doc(id);
      const snap = await ref.get();
      if (!snap.exists) return errorResponse(MSG_NOT_FOUND, 404);

      /*
       * 🛑 No cascade into `beyProducts`. A product references beys through
       * `assortmentBeyIds`, and `getProductsContainingBey` is an
       * `array-contains` that simply returns nothing for a deleted id — so the
       * product keeps its own `assortment[]` entries, which carry the NAME
       * beside the id for exactly this reason. Rewriting every product's array
       * to remove one id would be a write per product to repair a link that
       * already degrades gracefully.
       *
       * The category leaf is likewise left alone: it is taxonomy with its own
       * listings, and it existing without a reference row is the normal state
       * for the 108 beys that never resolved to a leaf in the first place.
       */
      await ref.delete();
      return successResponse(
        { id },
        "Beyblade removed from the live database. It is still in the committed seed, " +
          "so a reseed will restore it — remove it from the generator to drop it for good.",
      );
    },
  }),
);
