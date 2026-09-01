import { SellerWhatsAppSettingsView } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";
import { getSellerStoreAction } from "@/actions/seller.actions";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


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
