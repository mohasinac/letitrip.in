import { SellerOffersPanel } from "@mohasinac/appkit/client";
import { respondToOfferAction } from "@/actions/offer.actions";
import type { SellerOfferAction } from "@mohasinac/appkit";

async function handleRespond(input: SellerOfferAction): Promise<void> {
  "use server";
  const result = await respondToOfferAction(input);
  if (!result.ok) throw new Error(result.error);
}

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <SellerOffersPanel onRespond={handleRespond} />
    </div>
  );
}
