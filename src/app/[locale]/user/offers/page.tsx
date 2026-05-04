import { UserOffersPanel } from "@mohasinac/appkit/client";
import {
  acceptCounterOfferAction,
  withdrawOfferAction,
  checkoutOfferAction,
} from "@/actions/offer.actions";

async function handleAcceptCounter(offerId: string): Promise<void> {
  "use server";
  await acceptCounterOfferAction({ offerId });
}

async function handleWithdraw(offerId: string): Promise<void> {
  "use server";
  await withdrawOfferAction({ offerId });
}

async function handleCheckout(offerId: string): Promise<void> {
  "use server";
  await checkoutOfferAction(offerId);
}

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <UserOffersPanel
        onAcceptCounter={handleAcceptCounter}
        onWithdraw={handleWithdraw}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
