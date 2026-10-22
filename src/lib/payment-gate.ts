import { withIntegrationEnabled } from "@/lib/integration-gate";

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
 *
 * ## 🛑 Now a thin alias over the shared integration guard
 *
 * The OR expression above used to live here, hand-written, and it was the ONLY
 * place that knew it. When the admin integrations page was built it reproduced
 * that expression — and got it wrong, reading `razorpayEnabled` alone. With
 * PhonePe on and Razorpay off the page would have reported "payments OFF"
 * while all six of these routes stayed open and took money, and an admin
 * reading that row would have believed they had stopped payments.
 *
 * So the expression moved to `readIntegrationStates()` and both resolve
 * through it. Everything this docstring says still holds, because the shared
 * guard reads `IntegrationDescriptor.failClosed` — which is `true` for
 * payments, for exactly the reason stated above — and answers 404, as this
 * did.
 *
 * Kept as a named wrapper rather than replacing the six call sites with
 * `withIntegrationEnabled("payments")`: this name says *why* those routes are
 * gated, the six call sites do not change, and the reasoning above stays
 * attached to the thing it explains.
 */
export function withOnlinePaymentEnabled(handler: (...args: any[]) => any) {
  return withIntegrationEnabled("payments", handler);
}
