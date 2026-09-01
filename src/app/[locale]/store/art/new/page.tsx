import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components";
import { buildPrintMetaPayload } from "@/lib/print-meta";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    return createSellerProductAction({
      ...buildPrintMetaPayload(draft),
      listingType: "art",
      status: "draft",
    });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await createSellerProductAction({
      ...buildPrintMetaPayload(draft),
      listingType: "art",
      status: "published",
    });
    if (result.ok) redirect(String(ROUTES.STORE.ART));
    return result;
  }

  return (
    <StoreCreateProductShell
      listingType="art"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
