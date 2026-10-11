import { SellerAddressesView } from "@mohasinac/appkit/features/seller/components/SellerAddressesView";
import { API_ROUTES } from "@/constants";

export default function Page() {
  return <SellerAddressesView apiBase={API_ROUTES.STORE.ADDRESSES} />;
}
