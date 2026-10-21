import { withProviders } from "@/providers.config";
/**
 * Inventory boxes — GET list, POST create.
 *
 * The registry of physical AC60/AC30 boxes. A box exists here because somebody
 * labelled a real box, so there is no seed data and an empty list on a fresh
 * install is correct.
 */
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  successResponse,
  errorResponse,
} from "@mohasinac/appkit/next/api/api-response";
import { storageBoxesRepository } from "@mohasinac/appkit/features/inventory/repository/storage-boxes.repository";
import { BoxTypeValues } from "@mohasinac/appkit/features/inventory/schemas/firestore";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

/*
 * 🛑 `.strict()`, so an unknown key is a 400 rather than silently dropped.
 *
 * `z.object()` STRIPS what it does not declare, which is how a field can be
 * accepted, parsed, answered 200 and never written (Root Cause #76b — the
 * admin grouped-listings route returned 200 and wrote nothing). On a NEW
 * route that is cheap to get right from the start.
 */
const createBoxSchema = z
  .object({
    /*
     * `AC60-03`. Uppercased and trimmed by the repository, which also derives
     * the id from it — so two requests for `ac60-03` and `AC60-03` reach the
     * same document rather than making two registry rows for one box.
     */
    code: z.string().min(2).max(32),
    boxType: z.enum(BoxTypeValues),
    location: z.string().max(200).optional(),
    capacityNote: z.string().max(200).optional(),
  })
  .strict();

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      /*
       * Capped at 50 per Rule #6 — every list endpoint paginates, and an
       * unbounded read here would scale with the number of boxes owned.
       */
      const pageSize = Math.min(
        50,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 25),
      );
      const result = await storageBoxesRepository.listForAdmin({
        filters: url.searchParams.get("filters") ?? undefined,
        /*
         * Default sort is `ordinal`, not `code`. A string sort puts AC60-10
         * before AC60-2, which is the kind of ordering that makes an operator
         * distrust the whole screen — `ordinal` is denormalised on write
         * precisely so this is one field.
         */
        sorts: url.searchParams.get("sorts") ?? "ordinal",
        page,
        pageSize,
      });
      return successResponse(result);
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createBoxSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:write",
    schema: createBoxSchema,
    handler: async ({ body }) => {
      try {
        const box = await storageBoxesRepository.createBox(body!);
        return successResponse(box, `Box ${box.code} registered`);
      } catch (err) {
        const e = normalizeError(err);
        /*
         * A duplicate code is a 409, not a 500. The repository REFUSES rather
         * than overwriting, because an operator labelling a new box who types
         * a code already in use has made a mistake that silently merging two
         * boxes would hide — and the merge would be unrecoverable, since the
         * placements of both would then point at one id.
         *
         * 409 rather than 400 for the same reason the lottery slot-removal
         * conflict is: the request is well-formed and the operator is not
         * confused, the world already contains that box.
         */
        if (e.message.includes("already exists")) {
          return errorResponse(e.message, 409);
        }
        return errorResponse(e.message, 400);
      }
    },
  }),
);
