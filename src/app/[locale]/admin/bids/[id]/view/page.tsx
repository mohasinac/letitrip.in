import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { ADMIN_ENDPOINTS, ROUTES } from "@mohasinac/appkit";

export const metadata = { title: "Bid — Admin" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="admin"
      endpoint={ADMIN_ENDPOINTS.BID_BY_ID}
      backHref={String(ROUTES.ADMIN.BIDS)}
      backLabel="Back to bids"
    />
  );
}
