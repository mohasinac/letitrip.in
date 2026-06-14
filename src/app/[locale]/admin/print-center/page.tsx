import { getSellerStoreAction } from "@/actions/seller.actions";
import { PrintCenterView } from "@mohasinac/appkit/client";

export default async function Page() {
  const result = await getSellerStoreAction().catch(() => null);
  const store = result && "ok" in result && result.ok ? result.data : null;

  const storeForCard = store
    ? {
        id: (store as any).id ?? "",
        storeName: store.storeName ?? "",
        storeDescription: store.storeDescription,
        storeLogoURL: store.storeLogoURL,
        storeCategory: (store as any).storeCategory,
      }
    : null;

  return (
    <PrintCenterView
      store={storeForCard}
      publicBaseUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://letitrip.in"}
      isAdmin
      brandName="LetItRip"
    />
  );
}