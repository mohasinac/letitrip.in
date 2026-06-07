import { UserOffersPanel } from "@mohasinac/appkit/client";
import { Div } from "@mohasinac/appkit";
import {
  acceptCounterOfferAction,
  withdrawOfferAction,
  checkoutOfferAction,
} from "@/actions/offer.actions";

const __P = {
  p4: "p-4",
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
