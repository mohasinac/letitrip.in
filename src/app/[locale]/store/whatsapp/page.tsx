import { SellerWhatsAppSettingsView } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";
import { getSellerStoreAction } from "@/actions/seller.actions";

export default async function Page() {
  // Degrades to the capability-absent view rather than erroring — but it must
  // be recorded, or a seller who HAS the capability is told they do not, with
  // nothing anywhere to explain why.
  const store = await safeRead(() => getSellerStoreAction(), {
    route: "/store/whatsapp",
    key: "stores.getSellerStoreAction",
    fallback: null,
  });
  const capabilities = (store as any)?.capabilities as string[] | undefined;
  const hasCapability = capabilities?.includes("whatsapp_catalog_sync") ?? false;

  return <SellerWhatsAppSettingsView hasCapability={hasCapability} />;
}
