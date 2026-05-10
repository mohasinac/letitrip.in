import { SellerWhatsAppSettingsView } from "@mohasinac/appkit";
import { getSellerStoreAction } from "@/actions/seller.actions";

export default async function Page() {
  const store = await getSellerStoreAction().catch(() => null);
  const capabilities = (store as any)?.capabilities as string[] | undefined;
  const hasCapability = capabilities?.includes("whatsapp_catalog_sync") ?? false;

  return <SellerWhatsAppSettingsView hasCapability={hasCapability} />;
}
