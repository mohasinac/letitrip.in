import { getSellerStoreAction } from "@/actions/seller.actions";
import { PrintCenterView } from "@mohasinac/appkit/client";
import { safeRead } from "@mohasinac/appkit/server";

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
  // An admin need not own a store at all, so `store={null}` is the normal case
  // here — the store card is the only thing that depends on this read.
  const result = await safeRead(() => getSellerStoreAction(), {
    route: "/admin/print-center",
    key: "stores.getSellerStoreAction",
    fallback: null,
  });
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