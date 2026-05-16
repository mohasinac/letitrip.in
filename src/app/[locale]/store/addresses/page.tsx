import { SellerAddressesView } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants";

export default function Page() {
  return <SellerAddressesView apiBase={API_ROUTES.STORE.ADDRESSES} />;
}
