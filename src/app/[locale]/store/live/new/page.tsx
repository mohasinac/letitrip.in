import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import type { SellerProductDraft } from "@mohasinac/appkit/features/seller/components/SellerProductShell";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    // Auto-save: create as draft but do NOT redirect — user is still editing.
    return createSellerProductAction({
      ...draft,
      listingType: "live",
      status: "draft",
    });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await createSellerProductAction({
      ...draft,
      listingType: "live",
      status: "published",
    });
    if (result.ok) redirect(String(ROUTES.STORE.LIVE_ITEMS));
    return result;
  }

  return (
    <StoreCreateProductShell
      listingType="live"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
