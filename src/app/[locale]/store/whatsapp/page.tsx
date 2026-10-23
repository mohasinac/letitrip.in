import { getSellerStoreAction } from "@/actions/seller.actions";
/*
 * 🛑 The DEFINING module, not the `@/components` barrel — and the
 * `lir/no-deep-barrel-import` warning on this line is the lint rule losing an
 * argument it cannot win.
 *
 * That rule says "import from the barrel"; `audit-component-barrel-import` is
 * strict-zero and says the opposite, because the barrel re-exports 29 modules
 * and every one of their import graphs is PARSED before tree-shaking removes
 * the unused ones — which is build memory, the constraint Root Cause #18 and
 * the 8 GB Hobby ceiling are about. A blocking audit outranks a warning.
 */
import { WhatsAppFeedPanel } from "@/components/store/WhatsAppFeedPanel";
/* `@/constants/seo`, not the `@/constants` barrel — see the note in
 * `src/app/whatsapp/[storeSlug]/feed.csv/route.ts`. This is a Server Component
 * and the barrel reaches `appkit/client` through `navigation.tsx`. */
import { SEO_CONFIG } from "@/constants/seo";

/**
 * /store/whatsapp — the seller's WhatsApp catalogue feed URL and how to use it.
 *
 * 🛑 This is NOT a revival of the page deleted in 910e68a4e. That one drove the
 * Meta Cloud API: it collected a per-store `wabaId`, `catalogId` and access
 * token, stored the token encrypted on the store document, and pushed products
 * through the Graph API. This page collects nothing and stores nothing — it
 * shows a public URL the seller pastes into their own Commerce Manager.
 *
 * The slug is resolved server-side rather than fetched by the panel so the URL
 * is correct on first paint. A seller copying a half-rendered address would
 * paste a broken one into Meta and see no error until the first scheduled fetch
 * failed, hours later.
 */
export default async function Page() {
  /*
   * NOT swallowed into a blank panel: with no slug the page renders a "set your
   * store URL first" prompt, which is honest when the store genuinely has no
   * slug and misleading when the read merely failed. The action's envelope is
   * unwrapped explicitly — `ActionResult` is always truthy, and treating it as
   * the payload is Root Cause #98, which blanked nine seller editors.
   */
  const storeRes = await getSellerStoreAction();
  const store: any =
    storeRes && typeof storeRes === "object" && "ok" in storeRes
      ? storeRes.ok
        ? (storeRes as { ok: true; data: any }).data
        : null
      : storeRes;

  return (
    <WhatsAppFeedPanel
      storeSlug={store?.storeSlug ?? null}
      siteOrigin={SEO_CONFIG.siteUrl}
    />
  );
}
