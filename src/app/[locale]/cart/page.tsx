import { Suspense } from "react";
import { siteSettingsRepository, toBuyerFacingFees } from "@mohasinac/appkit";
import { CartRouteClient } from "@/components";

/**
 * The commissions block is read here rather than client-side so the add-on
 * checkboxes know which add-ons are enabled and what they cost on first paint —
 * the same pattern the checkout page uses. One singleton read.
 *
 * It is PROJECTED through `toBuyerFacingFees` before crossing into the client
 * component. `CartRouteClient`'s prop type was always narrow, but a wider
 * object satisfies it structurally, so passing `settings.commissions` whole
 * used to serialise all 25 fields — gateway rates, payout holds, seller
 * shipping, listing fees — into the cart page's HTML.
 */
export default async function Page() {
  const settings = await siteSettingsRepository.getSingleton();

  return (
    <Suspense>
      <CartRouteClient commissions={toBuyerFacingFees(settings?.commissions)} />
    </Suspense>
  );
}
