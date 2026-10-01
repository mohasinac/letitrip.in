import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { ROUTES } from "@mohasinac/appkit";

export const metadata = { title: "Bid — Admin" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="admin"
      backHref={String(ROUTES.ADMIN.BIDS)}
      backLabel="Back to bids"
    />
  );
}
