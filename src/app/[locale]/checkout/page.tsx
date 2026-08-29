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
  toBuyerEmiSettings,
  toBuyerFacingFees,
} from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";

export default async function Page() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect(`${String(ROUTES.AUTH.LOGIN)}?redirect=/checkout`);
  }

  const settings = await siteSettingsRepository.getSingleton();

  // Admin bypass needs BOTH: the caller is an admin, and the setting is
  // explicitly on. Computed server-side so the client never needs a role check
  // or an extra API call.
  //
  // The setting moved from `featureFlags` to `payment` on 2026-08-29 rather
  // than becoming purely a permission. Admins bypass every permission check
  // (`isEffectiveAdminUser`), so a permission alone would have switched this on
  // for every admin the moment it shipped — the opposite of what a checkout
  // bypass wants. The permission gates WHO on the route; this gates WHETHER.
  let adminBypassEnabled = false;
  if (isAdminUser(user)) {
    const paymentSettings = settings?.payment as Record<string, JsonValue> | undefined;
    adminBypassEnabled = paymentSettings?.[ADMIN_CHECKOUT_BYPASS_FLAG_KEY] === true;
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

  // Which payment methods to offer. These read the admin-toggleable settings
  // that already existed alongside the env flags they replace — the env copy
  // was a second source of truth for "is Razorpay live" that no admin could
  // see, and `providers.config.ts` was already deciding provider registration
  // from the Firestore one.
  const showRazorpay = settings?.payment?.razorpayEnabled === true;
  const showCod = settings?.payment?.codEnabled === true;
  // Coupons were gated on FEATURE_COUPONS, which was `true` everywhere and had
  // no admin-facing equivalent. Always offered; an empty coupon list is its own
  // answer.
  const showCoupons = true;
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
        emiSettings={toBuyerEmiSettings(emiSettings)}
        codSettings={toBuyerFacingFees(settings?.commissions)}
      />
    </Suspense>
  );
}
