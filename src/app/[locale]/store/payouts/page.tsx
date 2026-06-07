"use client";
import { SellerPayoutsView, SellerPayoutRequestView } from "@mohasinac/appkit/client";
import { Stack } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

const __P = {
  p4: "p-4",
  p6: "p-6",
} as const;

export default function Page() {
  return (
    <Stack gap="lg" className={`${__P.p4} sm:${__P.p6}`}>
      <SellerPayoutRequestView
        payoutsApiBase={API_ROUTES.STORE.PAYOUTS}
        payoutSettingsApiBase={API_ROUTES.STORE.PAYOUT_SETTINGS}
        requestApiBase={API_ROUTES.STORE.PAYOUTS_REQUEST}
      />
      <SellerPayoutsView />
    </Stack>
  );
}
