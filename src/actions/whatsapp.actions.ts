"use server";

/**
 * WhatsApp subscription — the seller's one decision, as a server action.
 *
 * 🛑 `"use server"` because `/store/whatsapp` is a Server Component passing
 * this down to a Client Component as a prop. A function crossing that boundary
 * must be an RPC marker, not an ordinary import.
 *
 * Takes a boolean and nothing else. The route it stands in for
 * (`/api/store/whatsapp-settings`, removed 2026-10-20) accepted a WABA id, a
 * catalogue id and a System User **access token** per seller; the platform now
 * owns one number, so there is no credential for a seller to supply and none
 * this action could accidentally persist.
 *
 * EXPORTS: toggleWhatsAppSubscriptionAction
 *
 * @tag domain:whatsapp
 * @tag layer:action
 * @tag access:store
 * @tag sideEffects:firestore-write
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";

const schema = z.object({ subscribed: z.boolean() });

export async function toggleWhatsAppSubscriptionAction(next: boolean): Promise<void> {
  const parsed = schema.safeParse({ subscribed: next });
  if (!parsed.success) throw new ValidationError("Invalid subscription value");

  const user = await requireAuthUser();

  /*
   * Resolved from the SESSION, never from an argument. The action takes only a
   * boolean, so there is no storeId a caller could substitute to flip another
   * seller's subscription — the ownership check is structural rather than a
   * guard that could be forgotten.
   */
  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store) throw new AuthorizationError("No store found for this account");

  try {
    await storeRepository.update(store.id, {
      whatsappNotifySubscribed: parsed.data.subscribed,
    });
  } catch (err) {
    const normalized = normalizeError(err);
    serverLogger.error("whatsapp-subscription: write failed", {
      storeId: store.id,
      error: normalized.message,
    });
    /*
     * Rethrown, not swallowed. The view flips optimistically and reverts on a
     * rejected promise — swallowing here would leave the toggle showing "on"
     * for a seller who is not subscribed, and the first they would hear of it
     * is a buyer asking why no updates arrived.
     */
    throw err;
  }
}
