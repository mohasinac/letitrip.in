import { UserOffersPanel } from "@mohasinac/appkit/client";
import { Div } from "@mohasinac/appkit";
import {
  acceptCounterOfferAction,
  withdrawOfferAction,
  checkoutOfferAction,
} from "@/actions/offer.actions";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


const __P = {
  p4: "p-[var(--appkit-space-4)]",
} as const;

async function handleAcceptCounter(offerId: string): Promise<void> {
  "use server";
  const result = await acceptCounterOfferAction({ offerId });
  if (!result.ok) throw new Error(result.error);
}

async function handleWithdraw(offerId: string): Promise<void> {
  "use server";
  const result = await withdrawOfferAction({ offerId });
  if (!result.ok) throw new Error(result.error);
}

async function handleCheckout(offerId: string): Promise<void> {
  "use server";
  const result = await checkoutOfferAction(offerId);
  if (!result.ok) throw new Error(result.error);
}

export default function Page() {
  return (
    <Div className={`max-w-2xl mx-auto ${__P.p4}`}>
      <UserOffersPanel
        onAcceptCounter={handleAcceptCounter}
        onWithdraw={handleWithdraw}
        onCheckout={handleCheckout}
      />
    </Div>
  );
}
