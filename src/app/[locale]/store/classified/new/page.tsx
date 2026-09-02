import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    // Auto-save: create as draft but do NOT redirect — user is still editing.
    return createSellerProductAction({
      ...draft,
      listingType: "classified",
      status: "draft",
    });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    const result = await createSellerProductAction({
      ...draft,
      listingType: "classified",
      status: "published",
    });
    if (result.ok) redirect(String(ROUTES.STORE.CLASSIFIED));
    return result;
  }

  return (
    <StoreCreateProductShell
      listingType="classified"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
