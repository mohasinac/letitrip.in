import { NextResponse } from "next/server";
import { siteSettingsRepository } from "@mohasinac/appkit";

/**
 * 404 a Razorpay route unless `siteSettings.payment.razorpayEnabled` is on.
 *
 * Replaces `withFeatureGuard("RAZORPAY", …)`. The env flag system was deleted
 * on 2026-08-29, and this is the one guard from it that could not simply be
 * unplugged: six payment routes — including the webhook — had NO gate of their
 * own, so `FEATURE_RAZORPAY=false` was the only thing keeping them closed.
 *
 * Moved rather than removed because Razorpay already has a canonical, admin
 * -toggleable control that `providers.config.ts` reads to decide whether to
 * register the provider at all. Two sources of truth for "is Razorpay live"
 * — one in the environment, one in Firestore — is exactly the split this wave
 * exists to remove, and the env one was the copy no admin could see.
 *
 * A settings read per request is acceptable here: these handlers already make
 * several, and `getSingleton` is request-cached by BaseRepository.
 *
 * Fails CLOSED. A settings read that throws leaves payment routes shut, which
 * is the safe direction for money — the opposite of the fail-open rule that
 * governs display-only settings reads elsewhere.
 */
export function withRazorpayEnabled(handler: (...args: any[]) => any) {
  return async (...args: any[]) => {
    const settings = await siteSettingsRepository.getSingleton();
    if (settings?.payment?.razorpayEnabled !== true) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return handler(...args);
  };
}
