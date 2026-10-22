import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import type { SellerProductDraft } from "@mohasinac/appkit/features/seller/components/SellerProductShell";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";
import { buildPrintMetaPayload } from "@/lib/print-meta";

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
