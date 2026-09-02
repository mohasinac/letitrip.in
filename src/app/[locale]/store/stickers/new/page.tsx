import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components";
import { buildPrintMetaPayload } from "@/lib/print-meta";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    return createSellerProductAction({
      ...buildPrintMetaPayload(draft),
      listingType: "stickers",
      status: "draft",
    });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await createSellerProductAction({
      ...buildPrintMetaPayload(draft),
      listingType: "stickers",
      status: "published",
    });
    if (result.ok) redirect(String(ROUTES.STORE.STICKERS));
    return result;
  }

  return (
    <StoreCreateProductShell
      listingType="stickers"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
