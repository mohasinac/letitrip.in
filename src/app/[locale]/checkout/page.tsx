import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { CheckoutRouteClient } from "@/components";
import {
  ROUTES,
  siteSettingsRepository,
  storeRepository,
  unitOfWork,
  ADMIN_CHECKOUT_BYPASS_FLAG_KEY,
  isAdminUser,
  checkEmiEligibility,
} from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
import { getFlag } from "@/lib/features";

export default async function Page() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect(`${String(ROUTES.AUTH.LOGIN)}?redirect=/checkout`);
  }

  const settings = await siteSettingsRepository.getSingleton();

  // Admin bypass is available only when the user is admin AND the feature flag
  // is explicitly enabled in siteSettings. Computed server-side so the client
  // never needs a role check or an extra API call.
  let adminBypassEnabled = false;
  if (isAdminUser(user)) {
    const flags = settings?.featureFlags as Record<string, JsonValue> | undefined;
    adminBypassEnabled = flags?.[ADMIN_CHECKOUT_BYPASS_FLAG_KEY] === true;
  }

  // EMI visibility is controlled entirely by runtime flags — the site-wide
  // admin toggle (siteSettings.emi.enabled) AND each seller's own opt-in
  // (StoreDocument.emiEnabled), the same two gates createCheckoutOrderAction
  // enforces at order time. No build-time feature flag for EMI.
  const emiSettings = settings?.emi ?? null;
  let showEmi = false;
  if (emiSettings?.enabled) {
    const cart = await unitOfWork.carts.findByUserId(user.uid);
    const groupTotals = new Map<string, number>();
    for (const item of cart?.items ?? []) {
      groupTotals.set(item.storeId, (groupTotals.get(item.storeId) ?? 0) + item.price * item.quantity);
    }
    if (groupTotals.size > 0) {
      const stores = await Promise.all(
        [...groupTotals.keys()].map((storeId) => storeRepository.findById(storeId)),
      );
      showEmi = stores.some((store, i) => {
        const storeId = [...groupTotals.keys()][i];
        return checkEmiEligibility(groupTotals.get(storeId)!, store?.emiEnabled === true, emiSettings).eligible;
      });
    }
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
        showEmi={showEmi}
        emiSettings={emiSettings}
      />
    </Suspense>
  );
}
