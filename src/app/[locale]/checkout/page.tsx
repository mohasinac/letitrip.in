import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { CheckoutRouteClient } from "@/components";
import { ROUTES, siteSettingsRepository, ADMIN_CHECKOUT_BYPASS_FLAG_KEY, isAdminUser } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
import { getFlag } from "@/lib/features";

export default async function Page() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect(`${String(ROUTES.AUTH.LOGIN)}?redirect=/checkout`);
  }

  // Admin bypass is available only when the user is admin AND the feature flag
  // is explicitly enabled in siteSettings. Computed server-side so the client
  // never needs a role check or an extra API call.
  let adminBypassEnabled = false;
  if (isAdminUser(user)) {
    const settings = await siteSettingsRepository.getSingleton();
    const flags = settings?.featureFlags as Record<string, JsonValue> | undefined;
    adminBypassEnabled = flags?.[ADMIN_CHECKOUT_BYPASS_FLAG_KEY] === true;
  }

  const showRazorpay = getFlag("RAZORPAY");
  const showCod = getFlag("COD");
  const showCoupons = getFlag("COUPONS");
  // Cash/UPI manual payment is always active in P-1. Disabled only if both
  // Razorpay and COD are enabled (future patches where we have online payments).
  const showCashOption = !(showRazorpay && showCod);

  return (
    <Suspense>
      <CheckoutRouteClient
        adminBypassEnabled={adminBypassEnabled}
        showCashOption={showCashOption}
        showRazorpay={showRazorpay}
        showCod={showCod}
        showCoupons={showCoupons}
      />
    </Suspense>
  );
}
