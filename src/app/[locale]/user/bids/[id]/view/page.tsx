import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { ACCOUNT_ENDPOINTS, ROUTES } from "@mohasinac/appkit";

export const metadata = { title: "Bid" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="buyer"
      endpoint={ACCOUNT_ENDPOINTS.BID_BY_ID}
      backHref={String(ROUTES.USER.BIDS)}
      backLabel="Back to my bids"
    />
  );
}
