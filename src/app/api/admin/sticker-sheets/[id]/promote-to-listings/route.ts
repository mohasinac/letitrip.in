import { withProviders } from "@/providers.config";
/**
 * Promote a traced sheet into real marketplace listings.
 *
 * POST /api/admin/sticker-sheets/{id}/promote-to-listings
 *
 * 🛑 DISTINCT FROM `POST /api/admin/sticker-sheets/{id}/runs/{runId}/promote`,
 * and the names being this close is the hazard worth a docblock:
 *   · `.../runs/{runId}/promote` → run → SHEET. Renders the full-resolution
 *     part PNGs and the export files, sets `activeRunId`. Still inside the
 *     tracer; run once per run you accept.
 *   · THIS route            → sheet → MARKETPLACE. Creates one parent product
 *     for the whole sheet plus one child per unique cut, in one group. Run
 *     once per sheet, after the above.
 *
 * Calling this first is refused with a message naming the fix, because
 * `SheetPart.assetPath` is only written by the other one's `mode: "full"`
 * shard path.
 *
 * Returns JSON ids only — no bytes, like every route in this feature
 * (`audit-sticker-trace-egress`).
 */
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { promoteStickerSheetToListings } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

/*
 * Declared locally, matching every sibling route under this folder rather than
 * `@/validation/request-schemas` — and passed as an IDENTIFIER, not a registry
 * key. `route-schema-registry` was retired 2026-10-17 precisely because 170
 * routes pass a schema directly and zero passed a key.
 *
 * 🛑 `.int().positive()` on neither price: money here is DECIMAL RUPEES since
 * the 2026-05 paise→rupees migration, so `.int()` would reject ₹149.50 — the
 * exact defect `audit-money-units`'s INT_ON_MONEY_FIELD rule exists to block.
 * `.nonnegative()` rather than `.positive()` so a free part is expressible; a
 * zero-priced sticker is a giveaway, not a validation error.
 */
const promoteSchema = z.object({
  storeId: z.string().min(1, "Pick the store these listings belong to."),
  partPrice: z.number().nonnegative("A part price cannot be negative."),
  sheetPrice: z.number().nonnegative("A sheet price cannot be negative."),
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    /*
     * A schema identifier passed DIRECTLY, not a registry key string — that is
     * the convention the corpus chose (170 routes pass a schema, zero pass a
     * key) and `route-schema-registry` was retired for it on 2026-10-17.
     */
    schema: promoteSchema,
    handler: async ({ params, body, user }) => {
      const sheetId = (params as { id: string }).id;
      const input = body as {
        storeId: string;
        partPrice: number;
        sheetPrice: number;
      };

      const result = await promoteStickerSheetToListings({
        sheetId,
        storeId: input.storeId,
        partPrice: input.partPrice,
        sheetPrice: input.sheetPrice,
        /*
         * The acting admin, for the `mediaAssets` row's `uploadedBy`. Taken
         * from the verified session and never from the body — a client-supplied
         * uid would attribute every part image to whoever the caller named.
         */
        actorUid: user!.uid,
      });

      return successResponse(
        result,
        `Created 1 sheet listing and ${result.childIds.length} sticker listing${
          result.childIds.length === 1 ? "" : "s"
        }` +
          (result.skippedDuplicates > 0
            ? `, skipping ${result.skippedDuplicates} confirmed duplicate${
                result.skippedDuplicates === 1 ? "" : "s"
              }.`
            : "."),
      );
    },
  }),
);
