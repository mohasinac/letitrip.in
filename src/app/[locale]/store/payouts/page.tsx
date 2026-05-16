"use client";
import { SellerPayoutsView, SellerPayoutRequestView } from "@mohasinac/appkit/client";
import { Stack } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

export default function Page() {
  return (
    <Stack gap="lg" className="p-4 sm:p-6">
      <SellerPayoutRequestView
        payoutsApiBase={API_ROUTES.STORE.PAYOUTS}
        payoutSettingsApiBase={API_ROUTES.STORE.PAYOUT_SETTINGS}
        requestApiBase={API_ROUTES.STORE.PAYOUTS_REQUEST}
      />
      <SellerPayoutsView />
    </Stack>
  );
}
