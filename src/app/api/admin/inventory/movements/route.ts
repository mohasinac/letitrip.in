import { withProviders } from "@/providers.config";
/**
 * The move ledger — READ ONLY.
 *
 * 🛑 THERE IS NO POST, PATCH OR DELETE HERE, and that is the design rather
 * than an unfinished route. A movement is created as a side effect of a
 * placement operation, inside the same transaction, because a ledger row
 * written separately is one that can be missing — and
 * `InventoryMovementsRepository` overrides `update`/`delete` to throw so
 * history cannot be rewritten.
 *
 * A movement that should not have happened is corrected with an `adjust`
 * through `POST /api/admin/inventory/placements`, which appends a new row
 * explaining it. That is what makes this collection usable as evidence:
 * every row is something that was done, and nothing has been tidied.
 *
 * `audit-inventory-ledger-append-only` blocks a write from reappearing here.
 */
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { inventoryMovementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-movements.repository";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const productId = url.searchParams.get("productId")?.trim();
      const boxId = url.searchParams.get("boxId")?.trim();
      const shipmentId = url.searchParams.get("shipmentId")?.trim();

      /*
       * A scoped read goes through the repository's own bounded helpers, each
       * of which pairs one equality with `orderBy(occurredAt desc)` and has a
       * declared composite index.
       */
      if (productId) {
        return successResponse({
          items: await inventoryMovementsRepository.listByProduct(productId),
        });
      }
      if (boxId) {
        return successResponse({
          items: await inventoryMovementsRepository.listByBox(boxId),
        });
      }
      if (shipmentId) {
        return successResponse({
          items: await inventoryMovementsRepository.listByShipment(shipmentId),
        });
      }

      /*
       * The unscoped ledger, paginated. Capped at 50 per Rule #6 — this
       * collection only grows, so it is the one read here that would become
       * unbounded over time.
       */
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 25),
      );
      const result = await inventoryMovementsRepository.listForAdmin({
        filters: url.searchParams.get("filters") ?? undefined,
        sorts: url.searchParams.get("sorts") ?? "-occurredAt",
        page,
        pageSize,
      });
      return successResponse(result);
    },
  }),
);

/*
 * 🛑 Deliberately absent: POST / PATCH / DELETE. See the file header. If you
 * came here to add one, the operation you want is an `adjust` movement
 * through the placements route — it appends rather than edits, and it
 * requires a reason.
 */
