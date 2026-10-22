import { NextResponse } from "next/server";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { INTEGRATIONS, readIntegrationStates } from "@mohasinac/appkit/server";
import type { IntegrationId } from "@mohasinac/appkit/server";

/**
 * Route guards for the admin integration switches.
 *
 * ## One enable/disable mechanism; the authoritative field differs per integration
 *
 * This is the generalisation of `withOnlinePaymentEnabled`, which was the only
 * integration that had a route guard at all. Everything that decides "is this
 * integration on" now resolves through ONE expression —
 * `readIntegrationStates()` — so the admin page, the nav filter and the guard
 * cannot disagree.
 *
 * Each integration keeps its own authoritative field ("the main"), because they
 * are genuinely different fields with genuinely different defaults:
 *
 *   payments  -> `payment.razorpayEnabled` OR `payment.phonepeEnabled`  (default OFF)
 *   email     -> `messaging.emailEnabled`                               (default ON)
 *   shipping  -> `shipping.provider === "shiprocket"`                   (default manual)
 *   support   -> `support.enabled`                                      (default ON)
 *
 * 🛑 So the thing that is shared is the LOGIC, not the field. A uniform
 * `?? false` over a single flag name would have read three of the four wrong,
 * and the one it read wrong in the dangerous direction is payments: an OR
 * across both gateways, which a single-field guard would have reported as off
 * while six money routes stayed open.
 *
 * ## 🛑 Not every integration gets a route guard, and that is declared
 *
 * `IntegrationDescriptor.routeGuard` says `"gated"` or `"none"` per
 * integration, with `routeGuardNote` giving the reason. Two are gated
 * (payments, support); two are not, and must not be:
 *
 * - **email** is OUTBOUND. There is no inbound route to close — `guardSend`
 *   enforces the flag at the single place that sends.
 * - **shipping** off means `provider: "manual"`, which is a WORKING path.
 *   404ing `/api/shipping/quote` would break the self-ship flow that switching
 *   the integration off is specifically selecting.
 *
 * Calling this helper for either of those is a programming error, so it throws
 * rather than quietly guarding something that should stay open.
 *
 * ## Fail direction is per integration, and that is the point
 *
 * `failClosed` comes off the descriptor. A single uniform direction would be
 * wrong for one of them whichever one was picked: a Firestore blip must not
 * open a money route (payments → closed), and must not take support away
 * (support → open, matching `guardSend`'s choice on the same read).
 *
 * ## 404, not 403
 *
 * A disabled integration should look absent rather than forbidden — 403 tells
 * a caller the route exists and they are merely not allowed, which invites a
 * retry. `withOnlinePaymentEnabled` already chose 404 and this matches it.
 */

/** Resolve one integration's on/off state, with its own fail direction. */
export async function isIntegrationEnabled(id: IntegrationId): Promise<boolean> {
  const descriptor = INTEGRATIONS[id];
  try {
    const settings = await siteSettingsRepository.getSingleton();
    return readIntegrationStates(settings)[id].enabled;
  } catch (err) {
    void normalizeError(err);
    // `failClosed: true` -> an unreadable settings document means OFF.
    return !descriptor.failClosed;
  }
}

/**
 * Wrap a route handler so it 404s while its integration is switched off.
 *
 * `exempt` lets one handler opt a request out — used by
 * `/api/support/tickets` for `unban_request`, which is the formal appeal
 * channel and already bypasses the soft-ban guard and the ticket cap. 🛑 An
 * integration toggle must not be able to close a channel a soft ban is
 * explicitly forbidden from closing.
 */
export function withIntegrationEnabled<A extends unknown[]>(
  id: IntegrationId,
  handler: (...args: A) => unknown,
): (...args: A) => Promise<unknown> {
  const descriptor = INTEGRATIONS[id];
  if (descriptor.routeGuard !== "gated") {
    /*
     * Thrown at module scope on import, so it is a build/boot failure rather
     * than a runtime surprise. Guarding an ungated integration is not a
     * harmless extra safety net — for shipping it would 404 the fallback the
     * switch falls back TO.
     */
    throw new Error(
      `withIntegrationEnabled("${id}") is not permitted: ${descriptor.routeGuardNote}`,
    );
  }
  return async (...args: A) => {
    if (!(await isIntegrationEnabled(id))) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return handler(...args);
  };
}
