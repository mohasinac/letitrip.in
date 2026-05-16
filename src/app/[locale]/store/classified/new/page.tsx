import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "classified",
      status: "draft",
    });
    redirect(String(ROUTES.STORE.CLASSIFIED));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({
      ...draft,
      listingType: "classified",
      status: "published",
    });
    redirect(String(ROUTES.STORE.CLASSIFIED));
  }

  return (
    <StoreCreateProductShell
      listingType="classified"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
