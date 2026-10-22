import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { CheckoutRouteClient } from "@/components/routing/CheckoutRouteClient";
import { unitOfWork } from "@mohasinac/appkit/core/unit-of-work";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import {
  ADMIN_CHECKOUT_BYPASS_FLAG_KEY,
  COD_MAX_ORDER_VALUE_FALLBACK,
} from "@mohasinac/appkit/features/admin/schemas/firestore";
import { isAdminUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { checkEmiEligibility, toBuyerEmiSettings, toBuyerFacingFees } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";

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

  /*
   * Which payment methods to offer. These read the admin-toggleable settings
   * that already existed alongside the env flags they replace — the env copy
   * was a second source of truth for "is the gateway live" that no admin
   * could see, and `providers.config.ts` was already deciding provider
   * registration from the Firestore one.
   *
   * 🛑 ONE online gateway, resolved in the SAME ORDER as
   * `providers.config.ts` (Razorpay first). Two independent booleans would
   * let the UI offer PhonePe while the server had registered Razorpay — the
   * browser would then load the wrong SDK and the payment would die at the
   * gateway with a key/order mismatch. The server still re-states which
   * gateway it used in the create-order response, and the client branches on
   * THAT; this prop only decides whether the button appears and which mark
   * it carries.
   */
  const onlineGateway: "razorpay" | "phonepe" | null =
    settings?.payment?.razorpayEnabled === true
      ? "razorpay"
      : settings?.payment?.phonepeEnabled === true
        ? "phonepe"
        : null;
  const showCod = settings?.payment?.codEnabled === true;
  /*
   * The cart total above which COD is refused. Read on the SERVER from the raw
   * settings document — `toPublicSiteSettings` deliberately emits only
   * `otpCheckoutThreshold` from the payment block, so the client cannot read
   * this for itself and is handed the number instead.
   *
   * `?? COD_MAX_ORDER_VALUE_FALLBACK` rather than "no cap when unset": an
   * install whose settings document predates this field has never made a
   * decision about it, and the safe reading of silence on a cash-at-the-door
   * limit is the default cap, not unlimited. An admin who genuinely wants no
   * cap sets a large number; `0` refuses COD at any value.
   */
  const codMaxOrderValue =
    typeof settings?.payment?.codMaxOrderValue === "number"
      ? settings.payment.codMaxOrderValue
      : COD_MAX_ORDER_VALUE_FALLBACK;
  // Coupons were gated on FEATURE_COUPONS, which was `true` everywhere and had
  // no admin-facing equivalent. Always offered; an empty coupon list is its own
  // answer.
  const showCoupons = true;
  // Cash/UPI manual payment is always active in P-1. Disabled only once a real
  // online gateway AND COD are both available.
  const showCashOption = !(onlineGateway && showCod);

  return (
    <Suspense>
      <CheckoutRouteClient
        adminBypassEnabled={adminBypassEnabled}
        showCashOption={showCashOption}
        onlineGateway={onlineGateway}
        showCod={showCod}
        codMaxOrderValue={codMaxOrderValue}
        showCoupons={showCoupons}
        showEmi={showEmi}
        emiSettings={toBuyerEmiSettings(emiSettings)}
        codSettings={toBuyerFacingFees(settings?.commissions)}
      />
    </Suspense>
  );
}
