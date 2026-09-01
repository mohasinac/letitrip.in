import { SellerBundlesView } from "@mohasinac/appkit/client";
import { ROUTES } from "@mohasinac/appkit";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export const metadata = { title: "Bundles — Store" };

export default function Page() {
  return (
    <SellerBundlesView
      editHrefTemplate={String(ROUTES.STORE.BUNDLES_EDIT("{id}"))}
      newHref={String(ROUTES.STORE.BUNDLES_NEW)}
    />
  );
}
