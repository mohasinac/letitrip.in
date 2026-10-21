import { withProviders } from "@/providers.config";
/**
 * One box — GET it with its contents, PATCH its status or location.
 *
 * 🛑 NO DELETE, and that is deliberate rather than unfinished. A box's
 * movements are permanent and append-only, and a ledger row pointing at a box
 * that no longer exists cannot be read back — "where did this go" would
 * answer with an id and nothing else. `status: "retired"` is the end state; a
 * retired box keeps its history and stops appearing in the active list.
 */
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  successResponse,
  errorResponse,
} from "@mohasinac/appkit/next/api/api-response";
import { storageBoxesRepository } from "@mohasinac/appkit/features/inventory/repository/storage-boxes.repository";
import { inventoryPlacementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-placements.repository";
import { inventoryMovementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-movements.repository";
import { BoxStatusValues } from "@mohasinac/appkit/features/inventory/schemas/firestore";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

const NOT_FOUND = "Box not found";

const patchBoxSchema = z
  .object({
    status: z.enum(BoxStatusValues).optional(),
    location: z.string().max(200).optional(),
    capacityNote: z.string().max(200).optional(),
  })
  .strict();

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const box = await storageBoxesRepository.findById(id);
      if (!box) return errorResponse(NOT_FOUND, 404);

      /*
       * Contents and history in parallel — a box page is useless without
       * both, and they are independent reads.
       *
       * 🛑 `rollup` on the document is ADVISORY (a scheduled job writes it),
       * so this returns the real placements rather than the cached counts. A
       * box page is exactly where a stale number would be noticed and
       * distrusted.
       */
      const [placements, movements] = await Promise.all([
        inventoryPlacementsRepository.listByBox(id),
        inventoryMovementsRepository.listByBox(id, 50),
      ]);

      return successResponse({
        box,
        placements,
        movements,
        /*
         * Computed from what was just read, not from `rollup`. Two numbers
         * from two sources on one screen is how a cache gets believed over
         * the truth.
         */
        totals: {
          distinctProducts: placements.length,
          totalUnits: placements.reduce((n, p) => n + p.quantity, 0),
        },
      });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof patchBoxSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:write",
    schema: patchBoxSchema,
    handler: async ({ params, body }) => {
      const id = (params as { id: string }).id;
      const existing = await storageBoxesRepository.findById(id);
      if (!existing) return errorResponse(NOT_FOUND, 404);

      /*
       * 🛑 `code` is NOT patchable, and it is absent from the schema rather
       * than ignored. The id is derived from the code, so a rename would have
       * to move the document — and every placement and movement row points at
       * the old id. Relabelling a physical box means registering the new code
       * and moving its contents, which the ledger then records.
       */
      try {
        const next = await storageBoxesRepository.update(id, {
          ...body!,
          updatedAt: new Date(),
        });
        return successResponse(next, "Box updated");
      } catch (err) {
        return errorResponse(normalizeError(err).message, 400);
      }
    },
  }),
);
