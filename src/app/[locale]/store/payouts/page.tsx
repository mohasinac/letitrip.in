import {
  SellerPayoutsView,
  SellerPayoutRequestView,
  SellerPayoutMethodsView,
  SellerPayoutSettingsView,
  PageTabs,
  PAYOUTS_TABS,
} from "@mohasinac/appkit/client";
import { Stack } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

const __P = {
  p4: "p-[var(--appkit-space-4)]",
  p6: "p-[var(--appkit-space-6)]",
} as const;

/**
 * "Get paid" — one task, three views of it: what I am owed, where it goes, and
 * on what schedule. `/store/payout-methods` and `/store/payout-settings` are
 * now redirect shells onto `?tab=`.
 */
export default function Page() {
  return (
    <Stack gap="lg" className={`${__P.p4} sm:${__P.p6}`}>
      <PageTabs
        tabs={PAYOUTS_TABS}
        panels={{
          payouts: (
            <Stack gap="lg">
              <SellerPayoutRequestView
                payoutsApiBase={API_ROUTES.STORE.PAYOUTS}
                payoutSettingsApiBase={API_ROUTES.STORE.PAYOUT_SETTINGS}
                requestApiBase={API_ROUTES.STORE.PAYOUTS_REQUEST}
              />
              <SellerPayoutsView />
            </Stack>
          ),
          methods: <SellerPayoutMethodsView />,
          settings: <SellerPayoutSettingsView apiBase={API_ROUTES.STORE.PAYOUT_SETTINGS} />,
        }}
      />
    </Stack>
  );
}
