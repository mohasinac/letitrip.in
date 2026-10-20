import { withProviders } from "@/providers.config";
import { z } from "zod";
import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { PART_GLOSSARY_COLLECTION } from "@mohasinac/appkit/features/parts/schemas/firestore";
import { applyAdminEdit } from "@mohasinac/appkit/features/parts/schemas/admin-edit";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
/*
 * 🛑 From the DEFINING module, not the `@/constants` barrel. That barrel
 * re-exports `navigation.tsx`, which imports `@mohasinac/appkit/client`, so
 * touching it from a route instantiates appkit a SECOND time under the client
 * condition with its own empty provider registry — measured 2026-10-20 as a
 * 401 on every valid session for `/api/payment/create-order`.
 */
import { ROLES_BACK_OFFICE } from "@/constants/api-roles";

const MSG_NOT_FOUND = "Part not found.";

/**
 * Correct one row of the GENERATED part glossary.
 *
 * ── 🛑 WHY THERE IS NO POST ───────────────────────────────────────────────
 *
 * `partGlossary` is built by committed generators from a crawled corpus and
 * reproduces from `appkit/src/seed/` alone. A row created by hand would have
 * no source, would vanish on the next regeneration, and would make the claim
 * "this dataset rebuilds from the repo" false. The two operations a wrong
 * extraction actually needs are CORRECT and REMOVE, and adding a part is a
 * change to the generator.
 *
 * ── 🛑 WHY THE FIELD LIST IS SMALL AND DELIBERATE ─────────────────────────
 *
 * `z.object()` STRIPS unknown keys, so a field absent from this schema makes
 * the editor a silent no-op: a 200, a success toast and no write. That is
 * Root Cause #76b, and the admin grouped-listings route shipped exactly it.
 * So every field here is one an admin is meant to be able to fix, and nothing
 * is here "just in case".
 *
 * Specifically EXCLUDED, and each for a reason:
 *   `id` / `slot`     — the id is `${slot}--${code}`, so changing either
 *                       renames the document. That is a move, not an edit, and
 *                       a move would orphan every `composition[].partId` and
 *                       every `PART_CATEGORY_TO_GLOSSARY_ID` entry pointing at it.
 *   `usedBy`          — derived from the bey compositions. Hand-editing it
 *                       makes the "used by N models" count disagree with the
 *                       models that actually list the part.
 *   `searchTxt`       — the collection deliberately has none
 *                       (`INDEX_ARTIFACT_ONLY`), and declaring it here would
 *                       invite writing one.
 *   `adminEdited*`    — owned by `applyAdminEdit`. A caller setting its own
 *                       protection set could freeze fields it never edited.
 */
const updatePartSchema = z.object({
  name: z.string().min(1).optional(),
  classification: z.string().min(1).optional(),
  code: z.string().nullable().optional(),
  weightG: z.number().nonnegative().nullable().optional(),
  aliases: z.array(z.string()).optional(),
  seoDescription: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  jpName: z.string().nullable().optional(),
  /*
   * The two fields this session found most often wrong in the source corpus,
   * which is why they are editable at all: an inverted mechanism and a
   * misexpanded abbreviation both land here.
   */
  role: z.string().nullable().optional(),
  integratedRoles: z.array(z.string()).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:parts:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const snap = await getAdminDb().collection(PART_GLOSSARY_COLLECTION).doc(id).get();
      if (!snap.exists) return errorResponse(MSG_NOT_FOUND, 404);
      return successResponse({ id: snap.id, ...snap.data() });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updatePartSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:parts:write",
    schema: updatePartSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const ref = getAdminDb().collection(PART_GLOSSARY_COLLECTION).doc(id);
      const snap = await ref.get();
      if (!snap.exists) return errorResponse(MSG_NOT_FOUND, 404);

      /*
       * 🛑 `applyAdminEdit` is what makes the correction SURVIVE A RESEED.
       *
       * `appkit-seed load` is a merge-write, so without this the next reseed
       * silently restores the wrong value — and `appkit-seed status` would
       * still report the collection in sync, because it counts ids and the id
       * did not change. The protection is field-level: it records only the
       * keys this request changed, so the row keeps receiving every other
       * improvement the generator makes.
       */
      const patch = applyAdminEdit(
        { adminEditedFields: snap.get("adminEditedFields") as string[] | undefined },
        body as Record<string, unknown>,
        user!.uid,
      );
      await ref.set({ ...patch, updatedAt: new Date() }, { merge: true });

      const after = await ref.get();
      return successResponse({ id: after.id, ...after.data() }, "Part updated.");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:parts:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const ref = getAdminDb().collection(PART_GLOSSARY_COLLECTION).doc(id);
      const snap = await ref.get();
      if (!snap.exists) return errorResponse(MSG_NOT_FOUND, 404);

      /*
       * 🛑 A DELETE DOES NOT STICK, and saying so is the honest thing to do.
       *
       * The row is in a committed seed file, so the next `appkit-seed load`
       * recreates it. Deleting is therefore useful for taking a bad row out of
       * the live site NOW, and the durable fix is to remove it from the
       * generator — which is exactly what the response says rather than
       * implying the removal is permanent.
       *
       * No cascade. `composition[].partId` references are denormalised with
       * `partName` beside them precisely so an unresolved part renders as a
       * named slot rather than a hole (see `BeyCompositionEntry`), so a
       * deleted part degrades those rows instead of breaking them.
       */
      await ref.delete();
      return successResponse(
        { id },
        "Part removed from the live database. It is still in the committed seed, " +
          "so a reseed will restore it — remove it from the generator to drop it for good.",
      );
    },
  }),
);
