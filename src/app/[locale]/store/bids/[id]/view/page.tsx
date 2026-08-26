import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { SELLER_ENDPOINTS, ROUTES } from "@mohasinac/appkit";

export const metadata = { title: "Bid — Store" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="seller"
      endpoint={SELLER_ENDPOINTS.BID_BY_ID}
      backHref={String(ROUTES.STORE.BIDS)}
      backLabel="Back to bids"
    />
  );
}
