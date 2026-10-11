import { SellerBidsView } from "@mohasinac/appkit/features/seller/components/SellerBidsView";
import { API_ROUTES } from "@/constants";

export default function Page() {
  return <SellerBidsView endpoint={API_ROUTES.STORE.BIDS} />;
}
