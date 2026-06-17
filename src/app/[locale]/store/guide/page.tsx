import { StoreGuideHubView } from "@mohasinac/appkit";
import { getSellerStoreAction } from "@/actions/seller.actions";

export const metadata = {
  title: "Seller Guide | LetItRip",
  description: "Everything you need to know about selling on LetItRip — listings, orders, finance, settings, capabilities, and support.",
};

export default async function Page() {
  const result = await getSellerStoreAction().catch(() => null);
  const store = result && typeof result === "object" && "ok" in result
    // audit-unknown-ok: callback entry point — accepts arbitrary payload value
    ? (result.ok ? (result as { ok: true; data: unknown }).data : null)
    // audit-unknown-ok: TS structural escape
    : (result as unknown);
  return <StoreGuideHubView store={store as any} />;
}
