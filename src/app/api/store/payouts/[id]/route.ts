import { withProviders } from "@/providers.config";
import { z } from "zod";
import { payoutRepository } from "@mohasinac/appkit/features/payments/repository/payout.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";

/**
 * Seller Single Payout API
 *
 * GET   /api/store/payouts/[id] — Fetch one payout owned by the authenticated seller's store.
 * PATCH /api/store/payouts/[id] — Update the seller-owned sellerReminderFlag only; every other
 *   field is admin-managed via /api/admin/payouts/[id] (adminUpdatePayout).
 */

async function loadOwnedPayout(uid: string, id: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) return { store: null, payout: null };
  const payout = await payoutRepository.findById(id);
  if (!payout || payout.storeId !== store.id) return { store, payout: null };
  return { store, payout };
}

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const { payout } = await loadOwnedPayout(user!.uid, id);
      if (!payout) return errorResponse("Payout not found", 404);
      /*
       * 🛑 REVEALED, and revealed is right here. `PayoutRepository.mapDoc`
       * does not decrypt, so this returned an `enc:v1:` blob for
       * `sellerEmail` — to the seller, about themselves. The owner of a
       * record reading their own contact detail as ciphertext is the
       * clearest form of this bug: nothing is leaked, the page is simply
       * broken.
       *
       * `revealPayout`, not `maskedPayout`, because `loadOwnedPayout` has
       * already refused anything whose `storeId` is not this seller's store.
       * A masked variant here would hide a seller's own payout email from
       * them.
       */
      return successResponse(payoutRepository.revealPayout(payout));
    },
  }),
);
export const GET = __GET__g;

const updateSellerPayoutSchema = z.object({
  sellerReminderFlag: z.boolean(),
});

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updateSellerPayoutSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: updateSellerPayoutSchema,
    handler: async ({ user, params, body }) => {
      const id = (params as { id: string }).id;
      const { payout } = await loadOwnedPayout(user!.uid, id);
      if (!payout) return errorResponse("Payout not found", 404);
      await payoutRepository.update(id, { sellerReminderFlag: body!.sellerReminderFlag });
      return successResponse({ id, sellerReminderFlag: body!.sellerReminderFlag }, "Reminder updated");
    },
  }),
);
export const PATCH = __PATCH__g;
