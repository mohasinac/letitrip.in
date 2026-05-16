import { ROUTES } from "@mohasinac/appkit";
import type { SellerProductDraft } from "@mohasinac/appkit";
import { createSellerProductAction } from "@/actions/seller.actions";
import { redirect } from "next/navigation";
import { StoreCreateProductShell } from "@/components/store/SellerProductFormShell";

export default function Page() {
  async function handleSave(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, listingType: "pre-order", status: "draft" });
    redirect(String(ROUTES.STORE.PRE_ORDERS));
  }

  async function handlePublish(draft: SellerProductDraft) {
    "use server";
    await createSellerProductAction({ ...draft, listingType: "pre-order", status: "published" });
    redirect(String(ROUTES.STORE.PRE_ORDERS));
  }

  return (
    <StoreCreateProductShell
      listingType="pre-order"
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}
