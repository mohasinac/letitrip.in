import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "@/i18n/navigation";
import { StoreCreateProductShell } from "@/components";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    // Auto-save: create as draft but do NOT redirect — user is still editing.
    await createSellerProductAction({ ...draft, status: "draft" });
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, status: "published" });
    redirect(String(ROUTES.STORE.PRODUCTS));
  }

  return (
    <StoreCreateProductShell
      listingType="standard"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
