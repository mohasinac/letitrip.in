import { NextResponse } from "next/server";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";

/**
 * 404 an online-gateway route unless an online gateway is switched on —
 * `siteSettings.payment.razorpayEnabled` OR `.phonepeEnabled`.
 *
 * Replaces `withFeatureGuard("RAZORPAY", …)`. The env flag system was deleted
 * on 2026-08-29, and this is the one guard from it that could not simply be
 * unplugged: six payment routes — including the webhook — had NO gate of their
 * own, so `FEATURE_RAZORPAY=false` was the only thing keeping them closed.
 *
 * Moved rather than removed because each gateway already has a canonical,
 * admin-toggleable control that `providers.config.ts` reads to decide whether
 * to register the provider at all. Two sources of truth for "is the gateway
 * live" — one in the environment, one in Firestore — is exactly the split
 * that wave existed to remove, and the env one was the copy no admin could
 * see.
 *
 * 🛑 This is deliberately an OR across both gateways rather than one gate per
 * provider. These routes are provider-agnostic: they call
 * `getProviders().payment`, which is whichever single gateway
 * `providers.config.ts` registered. A per-provider gate would have to
 * duplicate that same resolution order to stay in agreement with it, and the
 * copy that drifted would either 404 a working gateway or open a route onto
 * `ManualPaymentProvider`, whose `createOrder` is not a gateway call at all.
 * One question — "is an online gateway live at all" — asked once.
 *
 * A settings read per request is acceptable here: these handlers already make
 * several, and `getSingleton` is request-cached by BaseRepository.
 *
 * Fails CLOSED. A settings read that throws leaves payment routes shut, which
 * is the safe direction for money — the opposite of the fail-open rule that
 * governs display-only settings reads elsewhere.
 */
export function withOnlinePaymentEnabled(handler: (...args: any[]) => any) {
  return async (...args: any[]) => {
    const settings = await siteSettingsRepository.getSingleton();
    const online =
      settings?.payment?.razorpayEnabled === true || settings?.payment?.phonepeEnabled === true;
    if (!online) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return handler(...args);
  };
}
