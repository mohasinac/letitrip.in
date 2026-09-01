import { SellerOffersView } from "@mohasinac/appkit";
import { respondToOfferAction } from "@/actions/offer.actions";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


/**
 * Until 2026-08-21 this page rendered `<SellerOffersView />` with no props at
 * all. The view renders each row action only when its handler is present, so
 * the menu was empty and a seller had NO way to accept, decline or counter an
 * offer anywhere in the product — `respondToOfferAction` had zero non-test
 * callers. This is the Root Cause #8 slot-shell shape: a fully-built view
 * rendered without the props that make it do anything.
 */

async function handleAccept(offerId: string): Promise<void> {
  "use server";
  const result = await respondToOfferAction({ offerId, action: "accept" });
  if (!result.ok) throw new Error(result.error);
}

async function handleReject(offerId: string): Promise<void> {
  "use server";
  const result = await respondToOfferAction({ offerId, action: "decline" });
  if (!result.ok) throw new Error(result.error);
}

async function handleCounter(
  offerId: string,
  counterAmount: number,
  sellerNote?: string,
): Promise<void> {
  "use server";
  const result = await respondToOfferAction({
    offerId,
    action: "counter",
    counterAmount,
    sellerNote,
  });
  if (!result.ok) throw new Error(result.error);
}

export default function Page() {
  return (
    <SellerOffersView
      onAcceptOffer={handleAccept}
      onRejectOffer={handleReject}
      onCounterOffer={handleCounter}
    />
  );
}
