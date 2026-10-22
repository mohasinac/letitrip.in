import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import type { SellerProductDraft } from "@mohasinac/appkit/features/seller/components/SellerProductShell";
import { isListingType } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";

/**
 * `?listingType=` mirrors the admin create page. The seller's per-type listing
 * pages (`/store/art`, `/store/classified`, …) share one config factory with
 * admin's, so they link here with their own type — and `listingType` was
 * hardcoded `"standard"`, which would have created a row that vanished from
 * the list it was created on.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ listingType?: string }>;
}) {
  const { listingType } = await searchParams;
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    // Auto-save: create as draft but do NOT redirect — user is still editing.
    return createSellerProductAction({ ...draft, status: "draft" });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await createSellerProductAction({ ...draft, status: "published" });
    if (result.ok) redirect(String(ROUTES.STORE.PRODUCTS));
    return result;
  }

  return (
    <StoreCreateProductShell
      listingType={isListingType(listingType) ? listingType : "standard"}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
