/**
 * GET  /api/store/whatsapp-subscription — is this store subscribed, and what does it cost.
 * PUT  /api/store/whatsapp-subscription — turn the subscription on or off.
 *
 * WHY: the platform owns ONE WhatsApp number and sends order updates to buyers
 *      on behalf of sellers who pay a monthly add-on. This route is the
 *      seller's whole interaction with that — a boolean.
 *
 * 🛑 It takes NO credentials, and that is the point. The route it replaces
 * (`/api/store/whatsapp-settings`, removed 2026-10-20) accepted a WABA id, a
 * catalogue id and a **System User access token** per seller, and stored that
 * token encrypted on the store document — where `mapDoc` then decrypted it on
 * every read. Nothing here can carry a Meta credential, so that whole class of
 * exposure is unreachable rather than guarded against.
 *
 * The price is read server-side from site settings and returned alongside the
 * state, so the seller UI never reads the settings document itself — those
 * fields live beside the platform's Meta token and must not reach a browser
 * (Root Cause #70).
 *
 * EXPORTS: GET, PUT
 *
 * @tag domain:whatsapp
 * @tag layer:route
 * @tag access:store
 * @tag sideEffects:firestore-write
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants/api-roles";

const putSchema = z.object({ subscribed: z.boolean() });

/** Fallback when an install predates `whatsappNotifyMonthlyFee`. */
const DEFAULT_MONTHLY_FEE = 199;

async function readContext(uid: string) {
  const [store, settings] = await Promise.all([
    storeRepository.findByOwnerId(uid),
    siteSettingsRepository.findById("global"),
  ]);
  return {
    store,
    monthlyFee:
      (settings?.commissions as { whatsappNotifyMonthlyFee?: number } | undefined)
        ?.whatsappNotifyMonthlyFee ?? DEFAULT_MONTHLY_FEE,
    /*
     * Whether the channel is on platform-wide. Surfaced so the seller UI can
     * say "subscribing changes nothing right now" rather than quietly taking
     * money for a channel that is switched off.
     */
    channelEnabled:
      (settings?.notificationChannels as { whatsapp?: { enabled?: boolean } } | undefined)
        ?.whatsapp?.enabled === true,
  };
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const { store, monthlyFee, channelEnabled } = await readContext(user!.uid);
      if (!store) return errorResponse("Store not found", 404);
      return successResponse({
        subscribed: store.whatsappNotifySubscribed === true,
        monthlyFee,
        channelEnabled,
      });
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: putSchema,
    handler: async ({ user, body }) => {
      const { store, monthlyFee, channelEnabled } = await readContext(user!.uid);
      if (!store) return errorResponse("Store not found", 404);

      /*
       * Writes the single field, never a spread of the submitted body. A
       * seller's subscription toggle must not be able to reach any other field
       * on their store document — Root Cause #76 is the record of what a
       * passthrough write costs.
       */
      await storeRepository.update(store.id, {
        whatsappNotifySubscribed: body!.subscribed,
      });

      return successResponse({
        subscribed: body!.subscribed,
        monthlyFee,
        channelEnabled,
      });
    },
  }),
);
