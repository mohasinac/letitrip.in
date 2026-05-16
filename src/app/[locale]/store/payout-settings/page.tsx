import { SellerPayoutSettingsView } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

export default function Page() {
  return <SellerPayoutSettingsView apiBase={API_ROUTES.STORE.PAYOUT_SETTINGS} />;
}
