import { StoreGuideHubView } from "@mohasinac/appkit";
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


export const metadata = {
  title: "Seller Guide | LetItRip",
  description: "Everything you need to know about selling on LetItRip — listings, orders, finance, settings, capabilities, and support.",
};

export default async function Page() {
  // Read-only reference content — the store only tailors which sections are
  // shown, and the guide is still worth reading without it.
  const result = await safeRead(() => getSellerStoreAction(), {
    route: "/store/guide",
    key: "stores.getSellerStoreAction",
    fallback: null,
  });
  const store = result && typeof result === "object" && "ok" in result
    ? (result.ok ? (result as { ok: true; data: unknown }).data : null)
    : (result as unknown);
  return <StoreGuideHubView store={store as any} />;
}
