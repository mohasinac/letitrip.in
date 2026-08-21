import { Suspense } from "react";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { CartRouteClient } from "@/components";

/**
 * The commissions block is read here rather than client-side so the add-on
 * checkboxes know which add-ons are enabled and what they cost on first paint —
 * the same pattern the checkout page uses. One singleton read.
 */
export default async function Page() {
  const settings = await siteSettingsRepository.getSingleton();

  return (
    <Suspense>
      <CartRouteClient commissions={settings?.commissions ?? null} />
    </Suspense>
  );
}
