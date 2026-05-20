import { StoreGuideHubView } from "@mohasinac/appkit";
import { getSellerStoreAction } from "@/actions/seller.actions";

export const metadata = {
  title: "Seller Guide | LetItRip",
  description: "Everything you need to know about selling on LetItRip — listings, orders, finance, settings, capabilities, and support.",
};

export default async function Page() {
  const store = await getSellerStoreAction().catch(() => null);

  return <StoreGuideHubView store={store} />;
}
